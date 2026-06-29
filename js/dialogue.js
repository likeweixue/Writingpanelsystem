// ========== 对话高亮工具 ==========

console.log('💬 dialogue.js 开始加载...');

var dialogueData = {
    characters: [],      // { id, name, color, enabled }
    globalEnabled: true,
    nextId: 1
};

// 默认高亮颜色列表
var defaultColors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#FF8A5C', '#A29BFE', '#FD79A8', '#00B894'];

// ========== 数据操作 ==========

function getDialogueData() {
    var bookId = currentBookId || 'global';
    var key = 'openwrite_dialogue_' + bookId;
    var saved = localStorage.getItem(key);
    if (saved) {
        try {
            var data = JSON.parse(saved);
            dialogueData.characters = data.characters || [];
            dialogueData.globalEnabled = data.globalEnabled !== undefined ? data.globalEnabled : true;
            dialogueData.nextId = data.nextId || 1;
            return;
        } catch(e) {}
    }
    // 默认示例数据
    dialogueData.characters = [
        { id: 1, name: '主角', color: '#FF6B6B', enabled: true },
        { id: 2, name: '女主角', color: '#4ECDC4', enabled: true },
    ];
    dialogueData.globalEnabled = true;
    dialogueData.nextId = 100;
    saveDialogueData();
}

function saveDialogueData() {
    var bookId = currentBookId || 'global';
    var key = 'openwrite_dialogue_' + bookId;
    var data = {
        characters: dialogueData.characters,
        globalEnabled: dialogueData.globalEnabled,
        nextId: dialogueData.nextId
    };
    localStorage.setItem(key, JSON.stringify(data));
}

function getDialogueCharacter(id) {
    return dialogueData.characters.find(function(c) { return c.id === id; });
}

// ========== 打开/关闭面板 ==========

function openDialogueSidebar(tool) {
    console.log('💬 打开对话高亮面板');
    
    var sidebar = document.querySelector('.sidebar-menu');
    if (sidebar) { sidebar.style.display = 'none'; }
    
    var existingPanel = document.getElementById('floatingToolPanel');
    if (existingPanel) {
        var panelTool = existingPanel.getAttribute('data-tool');
        if (panelTool === 'dialogue') {
            // 如果已经是对话面板，关闭它
            closeDialogueFloatingPanel();
            return;
        } else {
            existingPanel.remove();
        }
    }
    
    var rightSidebar = document.getElementById('rightSidebar');
    if (rightSidebar) {
        rightSidebar.classList.remove('collapsed');
        rightSidebar.style.display = 'flex';
        rightSidebar.style.width = '48px';
        rightSidebar.style.minWidth = '48px';
        localStorage.setItem('rightSidebar_collapsed', 'false');
    }
    
    var detailMain = document.querySelector('.detail-main');
    if (!detailMain) return;
    
    var panel = document.createElement('div');
    panel.id = 'floatingToolPanel';
    panel.setAttribute('data-tool', 'dialogue');
    panel.style.cssText = 'width:380px;min-width:320px;max-width:480px;height:100%;background:var(--panel-bg, rgba(255,255,255,0.98));backdrop-filter:blur(12px);border-left:1px solid var(--border-color, rgba(0,0,0,0.08));border-right:1px solid var(--border-color, rgba(0,0,0,0.08));display:flex;flex-direction:column;flex-shrink:0;overflow:hidden;z-index:10;transition:width 0.2s ease;box-shadow:-2px 0 12px rgba(0,0,0,0.08);';
    
    var editor = document.querySelector('.detail-editor');
    if (editor && editor.nextSibling) {
        detailMain.insertBefore(panel, editor.nextSibling);
    } else {
        detailMain.appendChild(panel);
    }
    
    getDialogueData();
    renderDialoguePanel();
    bindDialogueEvents();
    
    // 高亮工具项
    setTimeout(function() {
        var toolItems = document.querySelectorAll('.sidebar-tool-item');
        toolItems.forEach(function(item) {
            if (item.getAttribute('data-tool') === 'dialogue') {
                item.style.background = 'rgba(0,122,255,0.15)';
                item.style.borderRadius = '8px';
                item.style.color = '#007aff';
            }
        });
    }, 200);
}

function closeDialogueFloatingPanel() {
    var panel = document.getElementById('floatingToolPanel');
    if (panel) { panel.remove(); }
    var rightSidebar = document.getElementById('rightSidebar');
    if (rightSidebar) {
        rightSidebar.style.width = '48px';
        rightSidebar.style.minWidth = '48px';
    }
    var toolItems = document.querySelectorAll('.sidebar-tool-item');
    toolItems.forEach(function(item) {
        if (item.getAttribute('data-tool') === 'dialogue') {
            item.style.background = '';
            item.style.borderRadius = '';
            item.style.color = '';
        }
    });
}

// ========== 渲染面板 ==========

function renderDialoguePanel() {
    var panel = document.getElementById('floatingToolPanel');
    if (!panel) return;
    
    var html = `
        <div style="display:flex;flex-direction:column;height:100%;width:100%;">
            <!-- 头部 -->
            <div style="display:flex;justify-content:space-between;align-items:center;padding:12px 16px;border-bottom:1px solid var(--border-color, rgba(0,0,0,0.08));flex-shrink:0;">
                <span style="font-weight:600;font-size:15px;">💬 对话高亮</span>
                <div style="display:flex;gap:8px;align-items:center;">
                    <label style="display:flex;align-items:center;gap:6px;font-size:12px;cursor:pointer;">
                        <span>启用</span>
                        <input type="checkbox" id="dialogueGlobalToggle" ${dialogueData.globalEnabled ? 'checked' : ''} style="width:16px;height:16px;cursor:pointer;">
                    </label>
                    <button id="dialogueCloseBtn" style="background:none;border:none;cursor:pointer;font-size:18px;opacity:0.5;">✕</button>
                </div>
            </div>
            
            <!-- 添加角色区域 -->
            <div style="padding:10px 16px;border-bottom:1px solid var(--border-color, rgba(0,0,0,0.06));flex-shrink:0;display:flex;gap:8px;">
                <input type="text" id="dialogueNewName" placeholder="输入角色名..." style="flex:1;padding:6px 10px;border:1px solid var(--border-color, #ddd);border-radius:6px;font-size:13px;background:var(--input-bg, #f8f8f8);color:var(--text-color, #333);outline:none;">
                <button id="dialogueAddBtn" style="padding:6px 14px;background:#28a745;color:white;border:none;border-radius:6px;cursor:pointer;font-size:13px;">➕ 添加</button>
            </div>
            
            <!-- 角色列表 -->
            <div id="dialogueCharacterList" style="flex:1;overflow-y:auto;padding:8px 12px;">
                ${renderCharacterItems()}
            </div>
            
            <!-- 底部 -->
            <div style="padding:8px 16px;border-top:1px solid var(--border-color, rgba(0,0,0,0.06));flex-shrink:0;display:flex;justify-content:space-between;font-size:11px;color:#888;">
                <span>💡 双击角色可重命名</span>
                <button id="dialogueClearAllBtn" style="background:none;border:none;color:#dc3545;cursor:pointer;font-size:11px;">🗑 清空全部</button>
            </div>
        </div>
    `;
    
    panel.innerHTML = html;
}

function renderCharacterItems() {
    if (dialogueData.characters.length === 0) {
        return '<div style="text-align:center;color:#888;padding:20px;font-size:13px;">暂无角色，添加角色后对话将自动高亮</div>';
    }
    
    var html = '';
    var colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#FF8A5C', '#A29BFE', '#FD79A8', '#00B894'];
    
    for (var i = 0; i < dialogueData.characters.length; i++) {
        var char = dialogueData.characters[i];
        var color = char.color || colors[i % colors.length];
        var isEnabled = char.enabled !== false;
        
        html += `
            <div class="dialogue-char-item" data-id="${char.id}" style="display:flex;align-items:center;gap:10px;padding:8px 10px;margin:4px 0;border-radius:8px;background:${isEnabled ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.03)'};border:1px solid var(--border-color, rgba(0,0,0,0.05));transition:all 0.2s;">
                <input type="color" value="${color}" class="dialogue-color-picker" data-id="${char.id}" style="width:28px;height:28px;padding:2px;border:none;border-radius:50%;cursor:pointer;background:transparent;flex-shrink:0;">
                <span style="flex:1;font-size:14px;font-weight:500;color:var(--text-color, #333);${!isEnabled ? 'opacity:0.5;text-decoration:line-through;' : ''}">${escapeHtml(char.name)}</span>
                <label style="display:flex;align-items:center;cursor:pointer;flex-shrink:0;">
                    <input type="checkbox" class="dialogue-char-toggle" data-id="${char.id}" ${isEnabled ? 'checked' : ''} style="width:16px;height:16px;cursor:pointer;">
                </label>
                <button class="dialogue-char-delete" data-id="${char.id}" style="background:none;border:none;color:#dc3545;cursor:pointer;font-size:14px;opacity:0.4;padding:0 4px;flex-shrink:0;">✕</button>
            </div>
        `;
    }
    return html;
}

// ========== 绑定事件 ==========

function bindDialogueEvents() {
    // 关闭按钮
    var closeBtn = document.getElementById('dialogueCloseBtn');
    if (closeBtn) {
        closeBtn.onclick = function() {
            closeDialogueFloatingPanel();
        };
    }
    
    // 全局开关
    var globalToggle = document.getElementById('dialogueGlobalToggle');
    if (globalToggle) {
        globalToggle.onchange = function() {
            dialogueData.globalEnabled = this.checked;
            saveDialogueData();
            if (dialogueData.globalEnabled) {
                applyDialogueHighlights();
                showDialogueToast('✅ 对话高亮已开启');
            } else {
                removeDialogueHighlights();
                showDialogueToast('💬 对话高亮已关闭');
            }
        };
    }
    
    // 添加角色
    var addBtn = document.getElementById('dialogueAddBtn');
    var nameInput = document.getElementById('dialogueNewName');
    if (addBtn && nameInput) {
        addBtn.onclick = function() {
            var name = nameInput.value.trim();
            if (!name) { showDialogueToast('⚠️ 请输入角色名'); return; }
            // 检查是否已存在
            var exists = dialogueData.characters.some(function(c) { return c.name === name; });
            if (exists) { showDialogueToast('⚠️ 角色 "' + name + '" 已存在'); return; }
            
            var colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#FF8A5C', '#A29BFE', '#FD79A8', '#00B894'];
            var newChar = {
                id: dialogueData.nextId++,
                name: name,
                color: colors[dialogueData.characters.length % colors.length],
                enabled: true
            };
            dialogueData.characters.push(newChar);
            saveDialogueData();
            renderDialoguePanel();
            bindDialogueEvents();
            if (dialogueData.globalEnabled) {
                applyDialogueHighlights();
            }
            nameInput.value = '';
            showDialogueToast('✅ 已添加角色: ' + name);
        };
        
        nameInput.onkeydown = function(e) {
            if (e.key === 'Enter') { addBtn.click(); }
        };
    }
    
    // 角色开关
    var toggles = document.querySelectorAll('.dialogue-char-toggle');
    for (var i = 0; i < toggles.length; i++) {
        toggles[i].onchange = function() {
            var id = parseInt(this.getAttribute('data-id'));
            var char = getDialogueCharacter(id);
            if (char) {
                char.enabled = this.checked;
                saveDialogueData();
                renderDialoguePanel();
                bindDialogueEvents();
                if (dialogueData.globalEnabled) {
                    applyDialogueHighlights();
                }
            }
        };
    }
    
    // 颜色选择器
    var colorPickers = document.querySelectorAll('.dialogue-color-picker');
    for (var i = 0; i < colorPickers.length; i++) {
        colorPickers[i].onchange = function() {
            var id = parseInt(this.getAttribute('data-id'));
            var char = getDialogueCharacter(id);
            if (char) {
                char.color = this.value;
                saveDialogueData();
                if (dialogueData.globalEnabled) {
                    applyDialogueHighlights();
                }
            }
        };
    }
    
    // 删除角色
    var deleteBtns = document.querySelectorAll('.dialogue-char-delete');
    for (var i = 0; i < deleteBtns.length; i++) {
        deleteBtns[i].onclick = function() {
            var id = parseInt(this.getAttribute('data-id'));
            var char = getDialogueCharacter(id);
            if (char && confirm('确定删除角色 "' + char.name + '" 吗？')) {
                dialogueData.characters = dialogueData.characters.filter(function(c) { return c.id !== id; });
                saveDialogueData();
                renderDialoguePanel();
                bindDialogueEvents();
                if (dialogueData.globalEnabled) {
                    applyDialogueHighlights();
                }
                showDialogueToast('已删除: ' + char.name);
            }
        };
    }
    
    // 双击重命名
    var charItems = document.querySelectorAll('.dialogue-char-item');
    for (var i = 0; i < charItems.length; i++) {
        charItems[i].ondblclick = function() {
            var id = parseInt(this.getAttribute('data-id'));
            var char = getDialogueCharacter(id);
            if (char) {
                var newName = prompt('重命名角色：', char.name);
                if (newName && newName.trim() && newName.trim() !== char.name) {
                    char.name = newName.trim();
                    saveDialogueData();
                    renderDialoguePanel();
                    bindDialogueEvents();
                    if (dialogueData.globalEnabled) {
                        applyDialogueHighlights();
                    }
                }
            }
        };
    }
    
    // 清空全部
    var clearBtn = document.getElementById('dialogueClearAllBtn');
    if (clearBtn) {
        clearBtn.onclick = function() {
            if (dialogueData.characters.length === 0) { showDialogueToast('⚠️ 暂无角色可清空'); return; }
            if (confirm('确定清空所有高亮角色吗？')) {
                dialogueData.characters = [];
                saveDialogueData();
                renderDialoguePanel();
                bindDialogueEvents();
                removeDialogueHighlights();
                showDialogueToast('已清空所有角色');
            }
        };
    }
}

// ========== 核心高亮功能 ==========

function applyDialogueHighlights() {
    // 先清除已有的高亮
    removeDialogueHighlights();
    
    if (!dialogueData.globalEnabled) return;
    if (dialogueData.characters.length === 0) return;
    
    var editor = document.getElementById('editor');
    if (!editor) return;
    
    // 获取启用的角色
    var enabledChars = dialogueData.characters.filter(function(c) { return c.enabled !== false; });
    if (enabledChars.length === 0) return;
    
    // 构建角色名映射（按名称长度降序，避免短名称匹配到长名称的一部分）
    var sortedChars = enabledChars.slice().sort(function(a, b) { return b.name.length - a.name.length; });
    
    // 获取所有文本节点
    var textNodes = getDialogueTextNodes(editor);
    var highlightCount = 0;
    
    for (var i = 0; i < textNodes.length; i++) {
        var node = textNodes[i];
        var text = node.textContent;
        var newText = text;
        var replaced = false;
        
        for (var j = 0; j < sortedChars.length; j++) {
            var char = sortedChars[j];
            var name = char.name;
            var color = char.color || '#FF6B6B';
            
            // 匹配 "角色名：对话内容" 或 "角色名:对话内容" 或 "角色名：“对话内容”"
            // 使用更精确的匹配：角色名 + 冒号/引号 + 对话内容
            var patterns = [
    // 1. 角色名： "对话"  (冒号 + 引号) - 使用 Unicode
    new RegExp('(' + escapeRegExp(name) + ')[：:][\\u201c\\u201e\\u300c\\u300e]([^\\u201d\\u201f\\u300d\\u300f]*?)[\\u201d\\u201f\\u300d\\u300f]', 'g'),
    // 2. 角色名； "对话"  (分号 + 引号)
    new RegExp('(' + escapeRegExp(name) + ')[；;][\\u201c\\u201e\\u300c\\u300e]([^\\u201d\\u201f\\u300d\\u300f]*?)[\\u201d\\u201f\\u300d\\u300f]', 'g'),
    // 3. 角色名"对话"  (直接引号)
    new RegExp('(' + escapeRegExp(name) + ')[\\u201c\\u201e\\u300c\\u300e]([^\\u201d\\u201f\\u300d\\u300f]*?)[\\u201d\\u201f\\u300d\\u300f]', 'g'),
    // 4. 角色名：对话 (冒号，无引号)
    new RegExp('(' + escapeRegExp(name) + ')[：:]([^。，,、！!？?\\n]*?)([。，,、！!？?\\n])', 'g'),
    // 5. 角色名；对话 (分号，无引号)
    new RegExp('(' + escapeRegExp(name) + ')[；;]([^。，,、！!？?\\n]*?)([。，,、！!？?\\n])', 'g')
];
            
            for (var p = 0; p < patterns.length; p++) {
                var regex = patterns[p];
                if (regex.test(newText)) {
                    // 重置正则
                    regex.lastIndex = 0;
                    newText = newText.replace(regex, function(match, namePart, content, endPunct) {
                        highlightCount++;
                        // 根据匹配类型构建高亮
                        if (match.indexOf('：') !== -1 || match.indexOf(':') !== -1) {
                            // 角色名：对话
                            var nameMatch = match.match(/^([^：:]+)[：:]/);
                            var nameDisplay = nameMatch ? nameMatch[0] : '';
                            var dialogContent = match.substring(nameDisplay.length);
                            return '<span class="dialogue-speaker" style="color:' + color + ';font-weight:600;">' + nameDisplay + '</span>' +
                                   '<span class="dialogue-content" style="background:' + color + '22;border-radius:4px;padding:0 4px;border-left:3px solid ' + color + ';">' + dialogContent + '</span>';
                        } else {
                            // 引号内的对话
                            return '<span class="dialogue-content" style="background:' + color + '22;border-radius:4px;padding:0 4px;border-left:3px solid ' + color + ';">' + match + '</span>';
                        }
                    });
                    replaced = true;
                }
            }
        }
        
        if (replaced && newText !== text) {
            var tempDiv = document.createElement('div');
            tempDiv.innerHTML = newText;
            var parent = node.parentNode;
            while (tempDiv.firstChild) {
                parent.insertBefore(tempDiv.firstChild, node);
            }
            parent.removeChild(node);
        }
    }
    
    if (highlightCount > 0) {
        console.log('💬 对话高亮: ' + highlightCount + ' 处');
    }
}

function removeDialogueHighlights() {
    var editor = document.getElementById('editor');
    if (!editor) return;
    
    var highlights = editor.querySelectorAll('.dialogue-content, .dialogue-speaker');
    for (var i = 0; i < highlights.length; i++) {
        var el = highlights[i];
        var textNode = document.createTextNode(el.textContent);
        el.parentNode.replaceChild(textNode, el);
    }
}

// ========== 获取文本节点 ==========

function getDialogueTextNodes(element) {
    var nodes = [];
    var walker = document.createTreeWalker(
        element,
        NodeFilter.SHOW_TEXT,
        {
            acceptNode: function(node) {
                // 跳过已经高亮的节点
                if (node.parentNode && node.parentNode.classList && 
                    (node.parentNode.classList.contains('dialogue-content') ||
                     node.parentNode.classList.contains('dialogue-speaker') ||
                     node.parentNode.classList.contains('character-highlight') ||
                     node.parentNode.classList.contains('setting-highlight'))) {
                    return NodeFilter.FILTER_REJECT;
                }
                var parent = node.parentNode;
                if (parent.tagName === 'SCRIPT' || parent.tagName === 'STYLE') {
                    return NodeFilter.FILTER_REJECT;
                }
                return NodeFilter.FILTER_ACCEPT;
            }
        },
        false
    );
    
    var node;
    while (node = walker.nextNode()) {
        if (node.textContent.trim()) {
            nodes.push(node);
        }
    }
    return nodes;
}

// ========== 辅助函数 ==========

function escapeRegExp(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function escapeHtml(str) {
    if (!str) return '';
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function showDialogueToast(message) {
    var existing = document.getElementById('dialogueToast');
    if (existing) existing.remove();
    var toast = document.createElement('div');
    toast.id = 'dialogueToast';
    toast.style.cssText = 'position:fixed;bottom:100px;left:50%;transform:translateX(-50%);background:rgba(0,0,0,0.8);color:white;padding:8px 20px;border-radius:20px;font-size:14px;z-index:99999;pointer-events:none;backdrop-filter:blur(10px);';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(function() {
        toast.style.opacity = '0';
        setTimeout(function() { if (toast.parentNode) toast.remove(); }, 300);
    }, 2000);
}

// ========== 新窗口打开 ==========

function openDialogueInNewWindow() {
    closeDialogueFloatingPanel();
    // 由于对话高亮功能需要实时编辑器交互，新窗口模式暂时不实现
    showDialogueToast('📌 对话高亮功能目前仅在侧边栏模式可用');
}

// ========== 右侧边栏入口绑定 ==========

function bindDialogueToolEntry() {
    var dialogueTool = document.querySelector('.sidebar-tool-item[data-tool="dialogue"]');
    if (dialogueTool) {
        dialogueTool.onclick = function(e) {
            // 如果点击的是展开按钮，不触发
            if (e.target.closest('.tool-expand-btn')) return;
            openDialogueSidebar('dialogue');
        };
        
        // 展开按钮 - 新窗口打开
        var expandBtn = dialogueTool.querySelector('.tool-expand-btn');
        if (expandBtn) {
            expandBtn.onclick = function(e) {
                e.stopPropagation();
                openDialogueInNewWindow();
            };
        }
    }
}

// ========== 初始化 ==========

function initDialogueTool() {
    getDialogueData();
    bindDialogueToolEntry();
    console.log('💬 对话高亮工具已加载，角色数:', dialogueData.characters.length);
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(initDialogueTool, 500);
});

// ========== 导出 ==========

window.openDialogueSidebar = openDialogueSidebar;
window.closeDialogueFloatingPanel = closeDialogueFloatingPanel;
window.openDialogueInNewWindow = openDialogueInNewWindow;
window.applyDialogueHighlights = applyDialogueHighlights;
window.removeDialogueHighlights = removeDialogueHighlights;
window.dialogueData = dialogueData;
window.getDialogueData = getDialogueData;
window.saveDialogueData = saveDialogueData;

console.log('💬 对话高亮工具加载完成');