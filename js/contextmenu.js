// ========== 右键菜单系统 ==========

console.log('🖱️ 右键菜单系统开始加载...');

// ========== 预设颜色 ==========

var markColors = [
    { name: '红色', color: '#ff4757', bg: 'rgba(255, 71, 87, 0.25)' },
    { name: '橙色', color: '#ff6b35', bg: 'rgba(255, 107, 53, 0.25)' },
    { name: '黄色', color: '#ffd93d', bg: 'rgba(255, 217, 61, 0.25)' },
    { name: '绿色', color: '#2ed573', bg: 'rgba(46, 213, 115, 0.25)' },
    { name: '青色', color: '#1e90ff', bg: 'rgba(30, 144, 255, 0.25)' },
    { name: '蓝色', color: '#3742fa', bg: 'rgba(55, 66, 250, 0.25)' },
    { name: '紫色', color: '#a29bfe', bg: 'rgba(162, 155, 254, 0.25)' },
    { name: '粉色', color: '#ff6b81', bg: 'rgba(255, 107, 129, 0.25)' },
    { name: '灰色', color: '#747d8c', bg: 'rgba(116, 125, 140, 0.25)' }
];

var customColor = '#ff6b35';

// ========== 获取选中文本 ==========

function getSelectedText() {
    var selection = window.getSelection();
    if (!selection || selection.isCollapsed) return '';
    var text = selection.toString().trim();
    var editor = document.getElementById('editor');
    if (editor && editor.contains(selection.anchorNode)) {
        return text;
    }
    return '';
}

function getSelectedRange() {
    var selection = window.getSelection();
    if (!selection || selection.isCollapsed) return null;
    var editor = document.getElementById('editor');
    if (editor && editor.contains(selection.anchorNode)) {
        return selection.getRangeAt(0);
    }
    return null;
}

// ========== 颜色工具函数 ==========

function hexToRgba(hex, alpha) {
    // 如果已经是 rgba 格式，直接返回
    if (hex && hex.startsWith('rgba')) {
        return hex;
    }
    if (!hex || !hex.startsWith('#')) {
        return 'rgba(255, 107, 53, ' + alpha + ')';
    }
    var r = parseInt(hex.slice(1, 3), 16);
    var g = parseInt(hex.slice(3, 5), 16);
    var b = parseInt(hex.slice(5, 7), 16);
    if (isNaN(r) || isNaN(g) || isNaN(b)) {
        return 'rgba(255, 107, 53, ' + alpha + ')';
    }
    return 'rgba(' + r + ', ' + g + ', ' + b + ', ' + alpha + ')';
}

function getColorFromBg(bgColor) {
    // 从背景色中提取颜色值
    if (!bgColor) return '#ff6b35';
    // 如果是 rgba 格式，提取 rgb 值
    var match = bgColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (match) {
        var r = parseInt(match[1]);
        var g = parseInt(match[2]);
        var b = parseInt(match[3]);
        return '#' + [r, g, b].map(function(c) {
            var hex = c.toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        }).join('');
    }
    return '#ff6b35';
}

// ========== 标记颜色功能 ==========

function applyMarkColor(colorHex) {
    var range = getSelectedRange();
    if (!range) {
        showContextToast('⚠️ 请先选中文字');
        return;
    }
    
    var editor = document.getElementById('editor');
    if (!editor) return;
    
    var selection = window.getSelection();
    var text = selection.toString();
    if (!text) {
        showContextToast('⚠️ 请先选中文字');
        return;
    }
    
    var bg = hexToRgba(colorHex, 0.25);
    
    var mark = document.createElement('span');
    mark.className = 'text-marker';
    mark.style.cssText = 'background:' + bg + ';border-left:3px solid ' + colorHex + ';padding:0 4px;border-radius:2px;display:inline;';
    mark.setAttribute('data-color', colorHex);
    mark.textContent = text;
    
    range.deleteContents();
    range.insertNode(mark);
    
    var space = document.createTextNode(' ');
    range.setStartAfter(mark);
    range.insertNode(space);
    
    range.setStartAfter(space);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);
    
    if (typeof saveCurrentChapter === 'function') {
        saveCurrentChapter();
    }
    
    showContextToast('✅ 已标记文字');
}

function clearMark() {
    var range = getSelectedRange();
    if (!range) {
        showContextToast('⚠️ 请先选中已标记的文字');
        return;
    }
    
    var editor = document.getElementById('editor');
    if (!editor) return;
    
    var selection = window.getSelection();
    var text = selection.toString();
    if (!text) {
        showContextToast('⚠️ 请先选中已标记的文字');
        return;
    }
    
    var container = range.commonAncestorContainer;
    var markElement = null;
    
    // 查找是否在标记元素内
    if (container.nodeType === Node.TEXT_NODE) {
        var parent = container.parentNode;
        if (parent && parent.classList && parent.classList.contains('text-marker')) {
            markElement = parent;
        }
    } else if (container.nodeType === Node.ELEMENT_NODE) {
        if (container.classList && container.classList.contains('text-marker')) {
            markElement = container;
        } else {
            // 检查子元素
            var children = container.querySelectorAll('.text-marker');
            if (children.length > 0) {
                markElement = children[0];
            }
        }
    }
    
    if (markElement) {
        var textNode = document.createTextNode(markElement.textContent);
        markElement.parentNode.replaceChild(textNode, markElement);
        // 选中替换后的文本
        var newRange = document.createRange();
        newRange.selectNodeContents(textNode);
        selection.removeAllRanges();
        selection.addRange(newRange);
        
        if (typeof saveCurrentChapter === 'function') {
            saveCurrentChapter();
        }
        showContextToast('✅ 已清除标记');
    } else {
        // 尝试查找选中范围内是否有标记
        var markers = editor.querySelectorAll('.text-marker');
        var found = false;
        for (var i = 0; i < markers.length; i++) {
            var marker = markers[i];
            if (marker.textContent === text) {
                var textNode = document.createTextNode(marker.textContent);
                marker.parentNode.replaceChild(textNode, marker);
                found = true;
                break;
            }
        }
        if (found) {
            if (typeof saveCurrentChapter === 'function') {
                saveCurrentChapter();
            }
            showContextToast('✅ 已清除标记');
        } else {
            showContextToast('⚠️ 未找到标记');
        }
    }
}

// ========== 自定义颜色选择器 ==========

function openCustomColorPicker(e) {
    if (e) e.stopPropagation();
    
    var input = document.createElement('input');
    input.type = 'color';
    input.value = customColor;
    input.style.cssText = 'position:fixed;top:-9999px;left:-9999px;opacity:0;pointer-events:none;';
    document.body.appendChild(input);
    
    var removed = false;
    
    function cleanup() {
        if (!removed && input.parentNode) {
            input.remove();
            removed = true;
        }
    }
    
    input.onchange = function() {
        customColor = this.value;
        applyMarkColor(customColor);
        cleanup();
        var menu = document.getElementById('customContextMenu');
        if (menu) menu.remove();
    };
    
    input.oncancel = function() {
        cleanup();
    };
    
    // 触发点击打开颜色选择器
    input.click();
    
    // 安全清理：如果用户没有选择颜色，5秒后自动清理
    setTimeout(function() {
        if (input.parentNode) {
            input.remove();
            removed = true;
        }
    }, 5000);
}

// ========== 新建功能 ==========

function createFromSelectedText(type) {
    var text = getSelectedText();
    if (!text) {
        showContextToast('⚠️ 请先选中文字');
        return;
    }
    
    switch(type) {
        case 'chapter':
            var book = getCurrentBook();
            if (!book) { showContextToast('⚠️ 请先打开一本书籍'); return; }
            var vol = getCurrentVolume();
            if (!vol) { showContextToast('⚠️ 请先选择一个分卷'); return; }
            var newChapter = new Chapter(Date.now(), text, '<p>' + text + '</p>');
            vol.chapters.push(newChapter);
            if (typeof saveAllData === 'function') saveAllData();
            if (typeof renderVolumeList === 'function') renderVolumeList();
            if (typeof renderCurrentChapter === 'function') renderCurrentChapter();
            showContextToast('✅ 已新建章节: ' + text);
            break;
            
        case 'character':
            if (typeof getCharacterData === 'function') {
                getCharacterData();
            }
            var existingPanel = document.getElementById('floatingToolPanel');
            if (existingPanel && existingPanel.getAttribute('data-tool') === 'characters') {
                addCharacterFromContext(text);
            } else {
                if (typeof openCharacterSidebar === 'function') {
                    openCharacterSidebar('characters');
                    setTimeout(function() {
                        addCharacterFromContext(text);
                    }, 400);
                } else {
                    showContextToast('⚠️ 角色功能未加载');
                }
            }
            break;
            
        case 'setting':
            if (typeof getSettingData === 'function') {
                getSettingData();
            }
            var existingPanel = document.getElementById('floatingToolPanel');
            if (existingPanel && existingPanel.getAttribute('data-tool') === 'setting') {
                addSettingFromContext(text);
            } else {
                if (typeof openSettingSidebar === 'function') {
                    openSettingSidebar('setting');
                    setTimeout(function() {
                        addSettingFromContext(text);
                    }, 400);
                } else {
                    showContextToast('⚠️ 设定功能未加载');
                }
            }
            break;
            
        case 'dictionary':
            if (typeof openDictionarySidebar === 'function') {
                openDictionarySidebar('dictionary');
                setTimeout(function() {
                    if (typeof addDictionaryEntry === 'function') {
                        var entry = addDictionaryEntry(text, '术语概念', '', '');
                        if (entry && typeof selectDictionaryEntry === 'function') {
                            selectDictionaryEntry(entry.id);
                        }
                        showContextToast('✅ 已新建词条: ' + text);
                    }
                }, 400);
            }
            break;
    }
}

// ========== 从上下文添加角色 ==========

function addCharacterFromContext(text) {
    try {
        var roots = characterData.nodes.filter(function(n) { return n.parentId === null; });
        if (roots.length === 0) {
            var newRoot = {
                id: genCharacterId(),
                parentId: null,
                type: 'folder',
                name: '📁 角色分类',
                order: 0,
                content: '角色分类'
            };
            characterData.nodes.push(newRoot);
            roots = [newRoot];
        }
        
        var parentId = roots[0].id;
        var children = getCharacterChildren(parentId);
        var newNode = {
            id: genCharacterId(),
            parentId: parentId,
            type: 'character',
            name: text,
            order: children.length,
            content: '【姓名】' + text + '\n【性别】\n【年龄】\n【外貌】\n【性格】\n【背景】\n【势力】\n【等级】\n【功法】\n【其他】'
        };
        characterData.nodes.push(newNode);
        characterData.selectedId = newNode.id;
        saveCharacterData();
        
        if (document.getElementById('characterTree')) {
            renderCharacterTree();
            updateCharacterEditor();
        }
        if (document.getElementById('compactCharacterTree')) {
            renderCompactCharacterTree();
            updateCompactCharacterEditor();
        }
        showContextToast('✅ 已新建角色: ' + text);
    } catch(e) {
        console.error('添加角色失败:', e);
        showContextToast('⚠️ 添加角色失败');
    }
}

// ========== 从上下文添加设定 ==========

function addSettingFromContext(text) {
    try {
        var roots = settingData.nodes.filter(function(n) { return n.parentId === null; });
        if (roots.length === 0) {
            var newRoot = {
                id: genSettingId(),
                parentId: null,
                type: 'folder',
                name: '📁 设定分类',
                icon: '📁',
                order: 0,
                content: '设定分类'
            };
            settingData.nodes.push(newRoot);
            roots = [newRoot];
        }
        
        var parentId = roots[0].id;
        var children = getSettingChildren(parentId);
        var newNode = {
            id: genSettingId(),
            parentId: parentId,
            type: 'setting',
            name: text,
            icon: '📄',
            order: children.length,
            content: '✍️ ' + text + '\n\n【描述】\n【类型】\n【详情】'
        };
        settingData.nodes.push(newNode);
        settingData.selectedId = newNode.id;
        saveSettingData();
        
        if (document.getElementById('settingTree')) {
            renderSettingTree();
            updateSettingEditor();
        }
        if (document.getElementById('compactSettingTree')) {
            renderCompactSettingTree();
            updateCompactSettingEditor();
        }
        showContextToast('✅ 已新建设定: ' + text);
    } catch(e) {
        console.error('添加设定失败:', e);
        showContextToast('⚠️ 添加设定失败');
    }
}

// ========== 全书搜索 ==========

function searchInBook() {
    var text = getSelectedText();
    if (!text) {
        showContextToast('⚠️ 请先选中文字');
        return;
    }
    
    if (typeof openFindReplacePanel === 'function') {
        openFindReplacePanel();
        setTimeout(function() {
            var findInput = document.getElementById('findTextFloat');
            if (findInput) {
                findInput.value = text;
                var countBtn = document.getElementById('findCountBtn');
                if (countBtn) countBtn.click();
            }
        }, 300);
    }
}

// ========== 创建右键菜单 ==========

function createContextMenu(e) {
    var existing = document.getElementById('customContextMenu');
    if (existing) existing.remove();
    
    var editor = document.getElementById('editor');
    if (!editor) return;
    if (!editor.contains(e.target)) return;
    
    e.preventDefault();
    
    var selectedText = getSelectedText();
    var hasSelection = selectedText.length > 0;
    
    var menu = document.createElement('div');
    menu.id = 'customContextMenu';
    menu.style.cssText = 'position:fixed;background:var(--panel-bg, rgba(255,255,255,0.98));backdrop-filter:blur(20px);border-radius:12px;padding:4px 0;box-shadow:0 8px 30px rgba(0,0,0,0.2);z-index:100000;min-width:200px;max-height:80vh;overflow-y:auto;border:1px solid var(--border-color, rgba(0,0,0,0.06));';
    
    var x = e.clientX;
    var y = e.clientY;
    var menuWidth = 220;
    var menuHeight = 450;
    if (x + menuWidth > window.innerWidth) x = window.innerWidth - menuWidth - 10;
    if (y + menuHeight > window.innerHeight) y = window.innerHeight - menuHeight - 10;
    if (x < 10) x = 10;
    if (y < 10) y = 10;
    menu.style.left = x + 'px';
    menu.style.top = y + 'px';
    
    // 构建菜单项
    var items = [];
    
    // 基础功能
    items.push({ label: '✂️ 剪切', action: function() { document.execCommand('cut'); } });
    items.push({ label: '📋 复制', action: function() { document.execCommand('copy'); } });
    items.push({ label: '📝 粘贴', action: function() { document.execCommand('paste'); } });
    items.push({ label: '📌 全选', action: function() { document.execCommand('selectAll'); } });
    items.push({ type: 'divider' });
    
    // 标记颜色 - 横向颜色选择器
    if (hasSelection) {
        items.push({
            type: 'colorPicker'
        });
        items.push({ type: 'divider' });
        items.push({ label: '🔗 插入链接', action: function() { if (typeof openInsertLinkDialog === 'function') openInsertLinkDialog(); } });
        items.push({ type: 'divider' });
        items.push({ label: '📖 新建章节', action: function() { createFromSelectedText('chapter'); } });
        items.push({ label: '👤 新建角色', action: function() { createFromSelectedText('character'); } });
        items.push({ label: '⚙️ 新建设定', action: function() { createFromSelectedText('setting'); } });
        items.push({ label: '📚 新建词条', action: function() { createFromSelectedText('dictionary'); } });
        items.push({ type: 'divider' });
        items.push({ label: '🔍 全书搜索', action: searchInBook });
        items.push({ label: '📊 字数统计', action: function() { 
            var text = getSelectedText();
            if (text) {
                var count = text.length;
                var chars = text.replace(/\s/g, '').length;
                showContextToast('📊 选中文字: ' + count + ' 字符 (不含空格: ' + chars + ')');
            }
        }});
    }
    
    // 渲染菜单
    function renderItems(items, parent) {
        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            
            if (item.type === 'divider') {
                var divider = document.createElement('div');
                divider.style.cssText = 'height:1px;background:var(--border-color, rgba(0,0,0,0.06));margin:4px 8px;';
                parent.appendChild(divider);
                continue;
            }
            
            if (item.type === 'colorPicker') {
    // 横向颜色选择器 - 缩小按钮
    var colorContainer = document.createElement('div');
    colorContainer.style.cssText = 'padding:4px 8px;display:flex;align-items:center;gap:3px;overflow-x:auto;max-width:220px;';
    colorContainer.style.overflowX = 'auto';
    colorContainer.style.whiteSpace = 'nowrap';
    
    // 颜色按钮 - 缩小到 16px
    for (var j = 0; j < markColors.length; j++) {
        var c = markColors[j];
        var colorBtn = document.createElement('button');
        colorBtn.style.cssText = 'width:16px;height:16px;border-radius:50%;border:1.5px solid rgba(0,0,0,0.08);cursor:pointer;flex-shrink:0;background:' + c.color + ';transition:all 0.15s;outline:none;';
        colorBtn.title = c.name;
        colorBtn.onmouseenter = function() { this.style.transform = 'scale(1.2)'; this.style.borderColor = 'rgba(0,0,0,0.3)'; };
        colorBtn.onmouseleave = function() { this.style.transform = 'scale(1)'; this.style.borderColor = 'rgba(0,0,0,0.08)'; };
        colorBtn.onclick = function(e) {
            e.stopPropagation();
            var color = this.style.background;
            applyMarkColor(color);
            var menu = document.getElementById('customContextMenu');
            if (menu) menu.remove();
        };
        colorContainer.appendChild(colorBtn);
    }
    
    // 自定义颜色按钮 - 彩虹渐变
    var customBtn = document.createElement('button');
    customBtn.className = 'custom-color-btn';
    customBtn.style.cssText = 'width:16px;height:16px;border-radius:50%;border:1.5px solid rgba(0,0,0,0.08);cursor:pointer;flex-shrink:0;background:conic-gradient(from 0deg, #ff0000, #ff8800, #ffff00, #00ff00, #0088ff, #8800ff, #ff00ff, #ff0000);transition:all 0.15s;outline:none;';
    customBtn.title = '自定义颜色';
    customBtn.onmouseenter = function() { 
        this.style.transform = 'scale(1.2)'; 
        this.style.borderColor = 'rgba(0,0,0,0.3)'; 
        this.style.boxShadow = '0 0 8px rgba(0,0,0,0.2)';
    };
    customBtn.onmouseleave = function() { 
        this.style.transform = 'scale(1)'; 
        this.style.borderColor = 'rgba(0,0,0,0.08)';
        this.style.boxShadow = 'none';
    };
    customBtn.onclick = function(e) {
        e.stopPropagation();
        openCustomColorPicker(e);
    };
    colorContainer.appendChild(customBtn);
    
    // 清除标记按钮 - 缩小到 16px
    var clearBtn = document.createElement('button');
    clearBtn.style.cssText = 'width:16px;height:16px;border-radius:50%;border:1.5px solid rgba(0,0,0,0.08);cursor:pointer;flex-shrink:0;background:#f5f5f5;font-size:8px;display:flex;align-items:center;justify-content:center;transition:all 0.15s;outline:none;color:#999;';
    clearBtn.innerHTML = '✕';
    clearBtn.title = '清除标记';
    clearBtn.onmouseenter = function() { this.style.transform = 'scale(1.2)'; this.style.borderColor = '#dc3545'; this.style.color = '#dc3545'; };
    clearBtn.onmouseleave = function() { this.style.transform = 'scale(1)'; this.style.borderColor = 'rgba(0,0,0,0.08)'; this.style.color = '#999'; };
    clearBtn.onclick = function(e) {
        e.stopPropagation();
        clearMark();
        var menu = document.getElementById('customContextMenu');
        if (menu) menu.remove();
    };
    colorContainer.appendChild(clearBtn);
    
    parent.appendChild(colorContainer);
    continue;
}
            
            var div = document.createElement('div');
            div.style.cssText = 'padding:6px 16px;cursor:pointer;font-size:13px;color:var(--text-color, #333);transition:background 0.15s;';
            div.textContent = item.label;
            div.onmouseenter = function() { this.style.background = 'rgba(0,0,0,0.05)'; };
            div.onmouseleave = function() { this.style.background = ''; };
            div.onclick = function(e) {
                e.stopPropagation();
                if (this._action) this._action();
                var menu = document.getElementById('customContextMenu');
                if (menu) menu.remove();
            };
            div._action = item.action;
            parent.appendChild(div);
        }
    }
    
    renderItems(items, menu);
    document.body.appendChild(menu);
    
    setTimeout(function() {
        document.addEventListener('click', function closeMenu(e) {
            if (!menu.contains(e.target)) {
                menu.remove();
                document.removeEventListener('click', closeMenu);
            }
        });
    }, 10);
    
    document.addEventListener('keydown', function closeMenuEsc(e) {
        if (e.key === 'Escape') {
            if (document.getElementById('customContextMenu')) {
                document.getElementById('customContextMenu').remove();
                document.removeEventListener('keydown', closeMenuEsc);
            }
        }
    });
}

// ========== Toast 提示 ==========

function showContextToast(message) {
    var existing = document.getElementById('contextToast');
    if (existing) existing.remove();
    var toast = document.createElement('div');
    toast.id = 'contextToast';
    toast.style.cssText = 'position:fixed;bottom:100px;left:50%;transform:translateX(-50%);background:rgba(0,0,0,0.8);color:white;padding:8px 20px;border-radius:20px;font-size:14px;z-index:99999;pointer-events:none;backdrop-filter:blur(10px);';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(function() {
        toast.style.opacity = '0';
        setTimeout(function() { if (toast.parentNode) toast.remove(); }, 300);
    }, 1500);
}

// ========== 初始化 ==========

function initContextMenu() {
    document.addEventListener('contextmenu', createContextMenu);
    console.log('🖱️ 右键菜单系统已初始化');
}

document.addEventListener('DOMContentLoaded', function() {
    setTimeout(initContextMenu, 500);
});

window.showContextToast = showContextToast;
window.applyMarkColor = applyMarkColor;
window.clearMark = clearMark;

console.log('🖱️ 右键菜单系统加载完成');