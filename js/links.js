// ========== 内部超链接系统 ==========

console.log('🔗 链接系统开始加载...');

// 链接数据（按书籍存储）
var linkData = {
    anchors: [],      // 锚点列表 { id, chapterId, name, position }
    references: []    // 引用列表 { fromChapterId, toChapterId, text }
};

// ========== 数据操作 ==========

function getLinkData() {
    var bookId = currentBookId || 'global';
    var key = 'openwrite_links_' + bookId;
    var saved = localStorage.getItem(key);
    if (saved) {
        try {
            var data = JSON.parse(saved);
            linkData.anchors = data.anchors || [];
            linkData.references = data.references || [];
            return;
        } catch(e) {}
    }
    linkData.anchors = [];
    linkData.references = [];
    saveLinkData();
}

function saveLinkData() {
    var bookId = currentBookId || 'global';
    var key = 'openwrite_links_' + bookId;
    var data = {
        anchors: linkData.anchors,
        references: linkData.references
    };
    localStorage.setItem(key, JSON.stringify(data));
}

// ========== 解析编辑器中的链接 ==========

function parseLinksInEditor() {
    var editor = document.getElementById('editor');
    if (!editor) return;
    
    var content = editor.innerHTML;
    // 匹配 [[文本]] 格式的链接
    var linkRegex = /\[\[([^\]]+)\]\]/g;
    var matches = content.match(linkRegex);
    
    if (!matches) {
        // 没有链接，但需要确保已有的链接样式不被破坏
        return;
    }
    
    // 获取当前书籍的所有章节
    var book = getCurrentBook();
    var chapters = [];
    if (book && book.volumes) {
        for (var v = 0; v < book.volumes.length; v++) {
            var vol = book.volumes[v];
            if (vol.chapters) {
                for (var c = 0; c < vol.chapters.length; c++) {
                    chapters.push({
                        id: vol.chapters[c].id,
                        title: vol.chapters[c].title,
                        volumeName: vol.name,
                        fullPath: vol.name + ' → ' + vol.chapters[c].title
                    });
                }
            }
        }
    }
    
    // 获取词典词条
    var dictEntries = [];
    if (typeof dictionaryData !== 'undefined' && dictionaryData.entries) {
        dictEntries = dictionaryData.entries;
    }
    
    // 替换链接为可点击的 HTML
    var newContent = content;
    var linkMatches = content.matchAll(/\[\[([^\]]+)\]\]/g);
    var replacements = [];
    
    for (var match of linkMatches) {
        var fullMatch = match[0];
        var linkText = match[1].trim();
        var replacement = '';
        
        // 检查是否是章节链接
        var foundChapter = chapters.find(function(c) { 
            return c.title === linkText; 
        });
        if (foundChapter) {
            replacement = '<span class="internal-link chapter-link" data-chapter-id="' + foundChapter.id + '" title="跳转到: ' + foundChapter.fullPath + '" style="color:#007aff;cursor:pointer;text-decoration:underline;text-decoration-style:dashed;border-bottom:1px dashed #007aff;padding:0 2px;border-radius:2px;transition:background 0.2s;">📖 ' + linkText + '</span>';
        }
        
        // 检查是否是词典链接
        if (!replacement) {
            var foundDict = dictEntries.find(function(e) { 
                return e.word === linkText; 
            });
            if (foundDict) {
                replacement = '<span class="internal-link dict-link" data-dict-id="' + foundDict.id + '" title="词典: ' + foundDict.meaning + '" style="color:#9b784e;cursor:pointer;text-decoration:underline;text-decoration-style:dashed;border-bottom:1px dashed #9b784e;padding:0 2px;border-radius:2px;transition:background 0.2s;">📚 ' + linkText + '</span>';
            }
        }
        
        // 检查是否是锚点链接
        if (!replacement && linkText.startsWith('#')) {
            var anchorName = linkText.substring(1);
            replacement = '<span class="internal-link anchor-link" data-anchor="' + anchorName + '" title="锚点: ' + anchorName + '" style="color:#e67e22;cursor:pointer;text-decoration:underline;text-decoration-style:dashed;border-bottom:1px dashed #e67e22;padding:0 2px;border-radius:2px;transition:background 0.2s;">📍 ' + anchorName + '</span>';
        }
        
        // 如果没找到匹配，显示为普通文本
        if (!replacement) {
            replacement = '<span class="internal-link unknown-link" style="color:#888;cursor:default;padding:0 2px;">' + linkText + '</span>';
        }
        
        replacements.push({
            original: fullMatch,
            replacement: replacement
        });
    }
    
    // 执行替换
    for (var i = 0; i < replacements.length; i++) {
        newContent = newContent.replace(replacements[i].original, replacements[i].replacement);
    }
    
    if (newContent !== content) {
        editor.innerHTML = newContent;
    }
}

// ========== 链接点击处理 ==========

function handleLinkClick(e) {
    var target = e.target;
    if (!target.classList || !target.classList.contains('internal-link')) return;
    
    // 章节链接
    if (target.classList.contains('chapter-link')) {
        var chapterId = parseInt(target.getAttribute('data-chapter-id'));
        if (chapterId) {
            var book = getCurrentBook();
            if (book && book.volumes) {
                for (var v = 0; v < book.volumes.length; v++) {
                    var vol = book.volumes[v];
                    if (vol.chapters) {
                        for (var c = 0; c < vol.chapters.length; c++) {
                            if (vol.chapters[c].id === chapterId) {
                                currentVolumeId = vol.id;
                                currentChapterId = chapterId;
                                renderVolumeList();
                                renderCurrentChapter();
                                updateWordCount();
                                showToast('📖 跳转到: ' + vol.chapters[c].title);
                                return;
                            }
                        }
                    }
                }
            }
            alert('找不到该章节');
        }
        return;
    }
    
    // 词典链接
    if (target.classList.contains('dict-link')) {
        var dictId = target.getAttribute('data-dict-id');
        if (dictId && typeof openDictionarySidebar === 'function') {
            var panel = document.getElementById('floatingToolPanel');
            if (!panel || panel.getAttribute('data-tool') !== 'dictionary') {
                openDictionarySidebar('dictionary');
                setTimeout(function() {
                    if (typeof selectDictionaryEntry === 'function') {
                        selectDictionaryEntry(dictId);
                        showToast('📚 已打开词典词条');
                    }
                }, 300);
            } else {
                if (typeof selectDictionaryEntry === 'function') {
                    selectDictionaryEntry(dictId);
                    showToast('📚 已选中词条');
                }
            }
        }
        return;
    }
    
    // 锚点链接
    if (target.classList.contains('anchor-link')) {
        var anchorName = target.getAttribute('data-anchor');
        if (anchorName) {
            var editor = document.getElementById('editor');
            if (editor) {
                var markers = editor.querySelectorAll('.anchor-marker[data-anchor="' + anchorName + '"]');
                if (markers.length > 0) {
                    markers[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
                    markers[0].style.background = 'rgba(255,193,7,0.4)';
                    setTimeout(function() {
                        markers[0].style.background = 'rgba(255,193,7,0.15)';
                    }, 2000);
                    showToast('📍 已跳转到锚点: ' + anchorName);
                } else {
                    alert('找不到锚点: ' + anchorName);
                }
            }
        }
        return;
    }
}

// ========== 插入链接对话框 ==========

function openInsertLinkDialog() {
    var selection = window.getSelection();
    var selectedText = selection.toString().trim();
    
    var book = getCurrentBook();
    var chapters = [];
    if (book && book.volumes) {
        for (var v = 0; v < book.volumes.length; v++) {
            var vol = book.volumes[v];
            if (vol.chapters) {
                for (var c = 0; c < vol.chapters.length; c++) {
                    chapters.push({
                        id: vol.chapters[c].id,
                        title: vol.chapters[c].title,
                        volumeName: vol.name
                    });
                }
            }
        }
    }
    
    var dictEntries = [];
    if (typeof dictionaryData !== 'undefined' && dictionaryData.entries) {
        dictEntries = dictionaryData.entries;
    }
    
    // 生成选项 HTML 的函数
    function getChapterOptions() {
        var html = '';
        for (var i = 0; i < chapters.length; i++) {
            var c = chapters[i];
            html += '<option value="chapter_' + c.id + '">' + c.volumeName + ' → ' + c.title + '</option>';
        }
        return html;
    }
    
    function getDictOptions() {
        var html = '';
        for (var i = 0; i < dictEntries.length; i++) {
            var e = dictEntries[i];
            html += '<option value="dict_' + e.id + '">📚 ' + e.word + ' (' + e.category + ')</option>';
        }
        return html;
    }
    
    var dialog = document.createElement('div');
    dialog.id = 'insertLinkDialog';
    dialog.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);width:420px;max-height:80vh;background:var(--panel-bg, rgba(255,255,255,0.98));backdrop-filter:blur(20px);border-radius:16px;box-shadow:0 20px 60px rgba(0,0,0,0.3);z-index:100000;overflow:hidden;';
    
    var hasTargets = chapters.length > 0 || dictEntries.length > 0;
    var defaultOptions = hasTargets ? getChapterOptions() + getDictOptions() : '<option value="">暂无可用目标</option>';
    
    var html = `
        <div style="padding:16px 20px;border-bottom:1px solid var(--border-color, rgba(0,0,0,0.08));display:flex;justify-content:space-between;align-items:center;">
            <span style="font-weight:600;font-size:16px;">🔗 插入超链接</span>
            <button onclick="this.closest('#insertLinkDialog').remove()" style="background:none;border:none;font-size:20px;cursor:pointer;opacity:0.5;">✕</button>
        </div>
        <div style="padding:20px;">
            <div style="margin-bottom:12px;">
                <label style="display:block;font-size:13px;font-weight:500;margin-bottom:4px;color:var(--text-color, #666);">链接文本</label>
                <input type="text" id="linkTextInput" value="' + (selectedText || '') + '" placeholder="输入链接显示文字..." style="width:100%;padding:8px 12px;border:1px solid var(--border-color, #ddd);border-radius:6px;font-size:13px;background:var(--input-bg, #f8f8f8);color:var(--text-color, #333);">
            </div>
            <div style="margin-bottom:12px;">
                <label style="display:block;font-size:13px;font-weight:500;margin-bottom:4px;color:var(--text-color, #666);">链接类型</label>
                <select id="linkTypeSelect" style="width:100%;padding:8px 12px;border:1px solid var(--border-color, #ddd);border-radius:6px;font-size:13px;background:var(--input-bg, #f8f8f8);color:var(--text-color, #333);">
                    <option value="chapter">📖 章节</option>
                    <option value="dictionary">📚 词典词条</option>
                    <option value="anchor">📍 锚点</option>
                </select>
            </div>
            <div style="margin-bottom:16px;" id="linkTargetContainer">
                <label style="display:block;font-size:13px;font-weight:500;margin-bottom:4px;color:var(--text-color, #666);">目标</label>
                <select id="linkTargetSelect" style="width:100%;padding:8px 12px;border:1px solid var(--border-color, #ddd);border-radius:6px;font-size:13px;background:var(--input-bg, #f8f8f8);color:var(--text-color, #333);">
                    ' + defaultOptions + '
                </select>
            </div>
            <div style="display:flex;gap:8px;justify-content:flex-end;">
                <button onclick="this.closest('#insertLinkDialog').remove()" style="padding:8px 20px;background:#6c757d;color:white;border:none;border-radius:6px;cursor:pointer;">取消</button>
                <button id="insertLinkConfirmBtn" style="padding:8px 20px;background:#9b784e;color:white;border:none;border-radius:6px;cursor:pointer;">插入</button>
            </div>
            <div style="margin-top:12px;padding:8px 12px;background:rgba(155,120,78,0.06);border-radius:6px;font-size:12px;color:#888;">
                💡 格式: <code style="background:rgba(0,0,0,0.05);padding:1px 6px;border-radius:3px;">[[链接文本]]</code> 在编辑器中会被自动识别为超链接
            </div>
        </div>
    `;
    
    dialog.innerHTML = html;
    document.body.appendChild(dialog);
    
    // 切换链接类型时更新目标列表
    document.getElementById('linkTypeSelect').onchange = function() {
        var type = this.value;
        var select = document.getElementById('linkTargetSelect');
        
        if (type === 'chapter') {
            select.innerHTML = getChapterOptions();
            if (chapters.length === 0) {
                select.innerHTML = '<option value="">暂无章节</option>';
            }
        } else if (type === 'dictionary') {
            select.innerHTML = getDictOptions();
            if (dictEntries.length === 0) {
                select.innerHTML = '<option value="">暂无词典词条</option>';
            }
        } else {
            select.innerHTML = '<option value="anchor_new">📍 新建锚点</option>';
        }
    };
    
    // 确认插入
    document.getElementById('insertLinkConfirmBtn').onclick = function() {
        var text = document.getElementById('linkTextInput').value.trim();
        if (!text) { alert('请输入链接文字'); return; }
        
        var type = document.getElementById('linkTypeSelect').value;
        var target = document.getElementById('linkTargetSelect').value;
        
        var linkText = text;
        if (type === 'chapter') {
            var chapterId = target.replace('chapter_', '');
            var chapter = null;
            for (var i = 0; i < chapters.length; i++) {
                if (chapters[i].id == chapterId) {
                    chapter = chapters[i];
                    break;
                }
            }
            if (chapter) {
                linkText = chapter.title;
            }
        } else if (type === 'dictionary') {
            var dictId = target.replace('dict_', '');
            var entry = null;
            for (var i = 0; i < dictEntries.length; i++) {
                if (dictEntries[i].id === dictId) {
                    entry = dictEntries[i];
                    break;
                }
            }
            if (entry) {
                linkText = entry.word;
            }
        } else if (type === 'anchor') {
            if (target === 'anchor_new') {
                var anchorName = prompt('请输入锚点名称：');
                if (!anchorName || !anchorName.trim()) return;
                linkText = '#' + anchorName.trim();
            }
        }
        
        // 插入到编辑器
        var editor = document.getElementById('editor');
        if (editor) {
            var sel = window.getSelection();
            if (sel.rangeCount > 0) {
                var range = sel.getRangeAt(0);
                var linkNode = document.createTextNode('[[' + linkText + ']]');
                range.deleteContents();
                range.insertNode(linkNode);
                range.setStartAfter(linkNode);
                range.collapse(true);
                sel.removeAllRanges();
                sel.addRange(range);
            } else {
                editor.appendChild(document.createTextNode('[[' + linkText + ']]'));
            }
            
            if (typeof saveCurrentChapter === 'function') {
                saveCurrentChapter();
            }
            setTimeout(parseLinksInEditor, 100);
        }
        
        dialog.remove();
        showToast('✅ 已插入链接: [[' + linkText + ']]');
    };
}

// ========== Toast 提示 ==========

function showToast(message) {
    var existing = document.getElementById('linkToast');
    if (existing) existing.remove();
    var toast = document.createElement('div');
    toast.id = 'linkToast';
    toast.style.cssText = 'position:fixed;bottom:100px;left:50%;transform:translateX(-50%);background:rgba(0,0,0,0.8);color:white;padding:8px 20px;border-radius:20px;font-size:14px;z-index:99999;pointer-events:none;backdrop-filter:blur(10px);';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(function() {
        toast.style.opacity = '0';
        setTimeout(function() { if (toast.parentNode) toast.remove(); }, 300);
    }, 1500);
}

// ========== 添加锚点 ==========

function addAnchor() {
    var name = prompt('请输入锚点名称（用于标识位置）：');
    if (!name || !name.trim()) return;
    
    var editor = document.getElementById('editor');
    if (!editor) { alert('请先打开一个章节'); return; }
    
    var selection = window.getSelection();
    if (selection.rangeCount > 0) {
        var range = selection.getRangeAt(0);
        var anchorSpan = document.createElement('span');
        anchorSpan.className = 'anchor-marker';
        anchorSpan.setAttribute('data-anchor', name.trim());
        anchorSpan.style.cssText = 'background:rgba(255,193,7,0.15);border-radius:4px;padding:1px 6px;border-left:3px solid #ffc107;font-size:12px;color:#e67e22;display:inline-block;margin:0 2px;';
        anchorSpan.textContent = '📍 ' + name.trim();
        range.insertNode(anchorSpan);
        
        var space = document.createTextNode(' ');
        range.setStartAfter(anchorSpan);
        range.insertNode(space);
        
        linkData.anchors.push({
            id: Date.now(),
            name: name.trim(),
            chapterId: currentChapterId,
            createdAt: new Date().toISOString()
        });
        saveLinkData();
        
        if (typeof saveCurrentChapter === 'function') {
            saveCurrentChapter();
        }
        showToast('✅ 已添加锚点: ' + name.trim());
    }
}

// ========== 初始化链接系统 ==========

function initLinkSystem() {
    getLinkData();
    
    var editor = document.getElementById('editor');
    if (editor) {
        var observer = new MutationObserver(function() {
            clearTimeout(linkParseTimer);
            linkParseTimer = setTimeout(parseLinksInEditor, 500);
        });
        observer.observe(editor, { childList: true, subtree: true, characterData: true });
        setTimeout(parseLinksInEditor, 500);
    }
    
    document.addEventListener('click', handleLinkClick);
    console.log('🔗 链接系统已初始化');
}

var linkParseTimer = null;

// ========== 工具栏按钮绑定 ==========

function addLinkToolbarButton() {
    var toolbar = document.getElementById('mainToolbar');
    if (!toolbar) return;
    if (document.querySelector('.toolbar-btn[data-action="insertLink"]')) return;
    
    var sidebarBtn = toolbar.querySelector('[data-action="sidebar"]');
    
    // 链接按钮
    var linkBtn = document.createElement('button');
    linkBtn.className = 'toolbar-btn';
    linkBtn.setAttribute('data-action', 'insertLink');
    linkBtn.setAttribute('draggable', 'true');
    linkBtn.innerHTML = '<img src="icons/hyperlink.svg" width="16" height="16" style="vertical-align:middle; margin-right:4px;" alt="链接">链接';
    linkBtn.onclick = function() {
        var activePage = document.querySelector('.page.active');
        if (activePage && activePage.getAttribute('data-page') && activePage.getAttribute('data-page').indexOf('book_') === 0) {
            openInsertLinkDialog();
        } else {
            alert('请先打开一本书籍');
        }
    };
    
    // 锚点按钮
    var anchorBtn = document.createElement('button');
    anchorBtn.className = 'toolbar-btn';
    anchorBtn.setAttribute('data-action', 'addAnchor');
    anchorBtn.setAttribute('draggable', 'true');
    anchorBtn.innerHTML = '<img src="icons/anchor.svg" width="16" height="16" style="vertical-align:middle; margin-right:4px;" alt="锚点">锚点';
    anchorBtn.onclick = function() {
        var activePage = document.querySelector('.page.active');
        if (activePage && activePage.getAttribute('data-page') && activePage.getAttribute('data-page').indexOf('book_') === 0) {
            addAnchor();
        } else {
            alert('请先打开一本书籍');
        }
    };
    
    if (sidebarBtn) {
        toolbar.insertBefore(linkBtn, sidebarBtn);
        toolbar.insertBefore(anchorBtn, sidebarBtn);
    } else {
        toolbar.appendChild(linkBtn);
        toolbar.appendChild(anchorBtn);
    }
    
    updateToolbarDragIndices();
    console.log('🔗 链接按钮已添加到工具栏');
}

function updateToolbarDragIndices() {
    var toolbar = document.getElementById('mainToolbar');
    if (!toolbar) return;
    var buttons = toolbar.querySelectorAll('.toolbar-btn');
    for (var i = 0; i < buttons.length; i++) {
        buttons[i].setAttribute('data-drag-index', i);
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(function() {
        initLinkSystem();
        addLinkToolbarButton();
    }, 1000);
});

// 导出
window.openInsertLinkDialog = openInsertLinkDialog;
window.addAnchor = addAnchor;
window.parseLinksInEditor = parseLinksInEditor;
window.linkData = linkData;

console.log('🔗 链接系统加载完成');

// ========== 超链接帮助 ==========

function showLinkHelp() {
    var existing = document.getElementById('linkHelpPanel');
    if (existing) {
        existing.remove();
        return;
    }
    
    var panel = document.createElement('div');
    panel.id = 'linkHelpPanel';
    panel.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);width:560px;max-height:80vh;overflow-y:auto;background:var(--panel-bg, rgba(255,255,255,0.98));backdrop-filter:blur(20px);border-radius:16px;box-shadow:0 20px 60px rgba(0,0,0,0.3);z-index:100000;padding:24px;';
    
    panel.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
            <h2 style="margin:0;font-size:20px;">🔗 超链接使用说明</h2>
            <button onclick="this.closest('#linkHelpPanel').remove()" style="background:none;border:none;font-size:24px;cursor:pointer;opacity:0.5;">✕</button>
        </div>
        
        <div style="font-size:14px;line-height:1.8;color:var(--text-color, #333);">
            <h3 style="font-size:15px;color:#9b784e;margin:12px 0 6px 0;">📖 基本格式</h3>
            <p style="background:rgba(0,0,0,0.04);padding:8px 12px;border-radius:6px;font-family:monospace;font-size:13px;">
                [[链接目标]]
            </p>
            
            <h3 style="font-size:15px;color:#9b784e;margin:12px 0 6px 0;">📌 三种链接类型</h3>
            <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin:6px 0;">
                <div style="background:rgba(0,122,255,0.08);padding:10px;border-radius:8px;text-align:center;">
                    <div style="font-size:20px;">📖</div>
                    <div style="font-weight:600;color:#007aff;">章节链接</div>
                    <div style="font-size:12px;color:#888;">[[第一章]]</div>
                </div>
                <div style="background:rgba(155,120,78,0.08);padding:10px;border-radius:8px;text-align:center;">
                    <div style="font-size:20px;">📚</div>
                    <div style="font-weight:600;color:#9b784e;">词典链接</div>
                    <div style="font-size:12px;color:#888;">[[御剑境]]</div>
                </div>
                <div style="background:rgba(230,126,34,0.08);padding:10px;border-radius:8px;text-align:center;">
                    <div style="font-size:20px;">📍</div>
                    <div style="font-weight:600;color:#e67e22;">锚点链接</div>
                    <div style="font-size:12px;color:#888;">[[#伏笔1]]</div>
                </div>
            </div>
            
            <h3 style="font-size:15px;color:#9b784e;margin:12px 0 6px 0;">📍 锚点使用</h3>
            <div style="background:rgba(0,0,0,0.03);padding:10px 14px;border-radius:8px;font-size:13px;">
                <div><strong>添加锚点：</strong>点击工具栏 <span style="background:rgba(0,0,0,0.06);padding:1px 8px;border-radius:4px;">📍 锚点</span> 按钮</div>
                <div><strong>跳转锚点：</strong>输入 <code style="background:rgba(0,0,0,0.06);padding:1px 6px;border-radius:3px;">[[#锚点名称]]</code></div>
                <div><strong>标记显示：</strong>📍 锚点名称（黄色背景）</div>
            </div>
            
            <h3 style="font-size:15px;color:#9b784e;margin:12px 0 6px 0;">⌨️ 快捷键</h3>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px 20px;font-size:13px;">
                <span><kbd style="background:rgba(0,0,0,0.06);padding:1px 8px;border-radius:4px;">Ctrl+Shift+L</kbd> 插入链接</span>
                <span><kbd style="background:rgba(0,0,0,0.06);padding:1px 8px;border-radius:4px;">Ctrl+Shift+A</kbd> 添加锚点</span>
            </div>
            
            <h3 style="font-size:15px;color:#9b784e;margin:12px 0 6px 0;">💡 示例</h3>
            <div style="background:rgba(0,0,0,0.03);padding:10px 14px;border-radius:8px;font-size:13px;font-family:monospace;white-space:pre-wrap;">
主角在[[第一章]]中登场，修炼的是[[御剑境]]功法。
关于功法的详细设定，参考[[#功法设定]]。
            </div>
            
            <div style="margin-top:12px;padding:8px 12px;background:rgba(155,120,78,0.08);border-radius:6px;font-size:12px;color:#888;">
                💡 提示：链接仅在当前书籍内有效，点击链接可跳转
            </div>
        </div>
    `;
    
    document.body.appendChild(panel);
    
    // 点击外部关闭
    panel.addEventListener('click', function(e) {
        if (e.target === panel) {
            panel.remove();
        }
    });
}

// 添加快捷键 Ctrl+Shift+H 打开帮助
document.addEventListener('keydown', function(e) {
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'H') {
        e.preventDefault();
        showLinkHelp();
    }
});

// 导出帮助函数
window.showLinkHelp = showLinkHelp;