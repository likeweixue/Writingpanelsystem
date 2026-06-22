// ========== 人物工具 ==========

var characterData = {
    nodes: [],
    selectedId: null,
    nextId: 1
};

// ========== 数据操作 ==========

function getCharacterData() {
    var bookId = currentBookId || 'global';
    var key = 'openwrite_character_' + bookId;
    var saved = localStorage.getItem(key);
    if (saved) {
        try {
            var data = JSON.parse(saved);
            characterData.nodes = data.nodes || [];
            characterData.selectedId = data.selectedId || null;
            characterData.nextId = data.nextId || 1;
            return;
        } catch(e) {}
    }
    setDefaultCharacterData();
}

function setDefaultCharacterData() {
    characterData.nodes = [
        { id: 'root_1', parentId: null, type: 'folder', name: '⭐ 主要角色', order: 0, content: '主角、女主角、重要配角' },
        { id: 'root_2', parentId: null, type: 'folder', name: '🌑 次要角色', order: 1, content: '配角、龙套' },
        { id: 'root_3', parentId: null, type: 'folder', name: '👥 势力人物', order: 2, content: '各门派、势力成员' },
        { id: 'char_1', parentId: 'root_1', type: 'character', name: '李三思', order: 0,
          content: '【姓名】李三思\n【性别】男\n【年龄】18岁\n【外貌】身穿白衣，青丝飘逸，脸上一直带着温和的笑容\n【性格】温和善良，乐于助人，对人心把握很强\n【背景】出生荒古世家李家，是支脉第二十八代的长子\n【势力】妙音派，蜀国七大派之一\n【等级】御剑境七品\n【功法】天音波，玄品功法，利用自身灵力操控声波进行攻击\n【其他】曾经误入山洞而得到奇珍"混铁炉"' },
        { id: 'char_2', parentId: 'root_1', type: 'character', name: '雪灵儿', order: 1,
          content: '【姓名】雪灵儿\n【性别】女\n【年龄】17岁\n【外貌】冰肌玉骨，白衣胜雪\n【性格】表面冷若冰霜，内心善良\n【背景】冰雪宫圣女，身怀冰凤血脉\n【势力】冰雪宫\n【等级】御剑境六品\n【功法】冰凤诀，天阶下品\n【其他】与李三思共历患难' },
    ];
    characterData.selectedId = 'char_1';
    characterData.nextId = 100;
    saveCharacterData();
}

function saveCharacterData() {
    var bookId = currentBookId || 'global';
    var key = 'openwrite_character_' + bookId;
    var data = {
        nodes: characterData.nodes,
        selectedId: characterData.selectedId,
        nextId: characterData.nextId
    };
    localStorage.setItem(key, JSON.stringify(data));
}

function getCharacterChildren(parentId) {
    return characterData.nodes.filter(function(n) { return n.parentId === parentId; }).sort(function(a, b) { return (a.order || 0) - (b.order || 0); });
}

function getCharacterNode(id) {
    return characterData.nodes.find(function(n) { return n.id === id; });
}

function genCharacterId() {
    return 'char_' + (characterData.nextId++);
}

// ========== 全屏模式渲染 ==========

function renderCharacterTree() {
    var container = document.getElementById('characterTree');
    if (!container) return;
    container.innerHTML = '';
    var roots = characterData.nodes.filter(function(n) { return n.parentId === null; }).sort(function(a, b) { return (a.order || 0) - (b.order || 0); });
    if (roots.length === 0) {
        container.innerHTML = '<div style="padding:20px;text-align:center;color:#888;font-size:13px;">暂无角色分类</div>';
        return;
    }
    roots.forEach(function(root) {
        container.appendChild(createCharacterNodeElement(root, 0));
    });
}

function createCharacterNodeElement(node, depth) {
    var div = document.createElement('div');
    div.className = 'character-tree-node';
    div.setAttribute('data-id', node.id);
    div.style.marginBottom = '2px';
    var header = document.createElement('div');
    header.className = 'character-tree-header';
    header.style.cssText = 'display:flex;align-items:center;gap:6px;padding:6px 8px;border-radius:6px;cursor:pointer;transition:background 0.15s;padding-left:' + (depth * 16 + 8) + 'px;';
    if (characterData.selectedId === node.id) {
        header.style.background = 'rgba(0,122,255,0.12)';
        header.style.fontWeight = '500';
    }
    header.setAttribute('data-id', node.id);
    var hasChildren = getCharacterChildren(node.id).length > 0;
    var toggle = document.createElement('span');
    toggle.style.cssText = 'font-size:10px;width:16px;text-align:center;cursor:pointer;color:#888;flex-shrink:0;';
    if (hasChildren) {
        var isExpanded = localStorage.getItem('character_expanded_' + node.id) !== 'false';
        toggle.textContent = isExpanded ? '▾' : '▸';
        toggle.onclick = function(e) {
            e.stopPropagation();
            toggleCharacterFolder(node.id);
        };
    } else {
        toggle.textContent = '·';
        toggle.style.color = '#ccc';
    }
    header.appendChild(toggle);
    var icon = document.createElement('span');
    icon.style.fontSize = '16px';
    icon.style.flexShrink = '0';
    icon.textContent = node.type === 'folder' ? '📁' : '👤';
    header.appendChild(icon);
    var nameSpan = document.createElement('span');
    nameSpan.style.cssText = 'flex:1;font-size:13px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--text-color, #333);';
    nameSpan.textContent = node.name || '未命名';
    header.appendChild(nameSpan);
    header.onclick = function(e) {
        if (e.target === toggle) return;
        selectCharacterNode(node.id);
    };
    header.ondblclick = function(e) {
        e.stopPropagation();
        renameCharacterNode(node.id);
    };
    header.oncontextmenu = function(e) {
        e.preventDefault();
        e.stopPropagation();
        showCharacterContextMenu(e.clientX, e.clientY, node.id);
    };
    div.appendChild(header);
    var children = getCharacterChildren(node.id);
    if (children.length > 0) {
        var childrenDiv = document.createElement('div');
        childrenDiv.className = 'character-tree-children';
        var isExpanded = localStorage.getItem('character_expanded_' + node.id) !== 'false';
        childrenDiv.style.display = isExpanded ? 'block' : 'none';
        children.forEach(function(child) {
            childrenDiv.appendChild(createCharacterNodeElement(child, depth + 1));
        });
        div.appendChild(childrenDiv);
    }
    return div;
}

function toggleCharacterFolder(nodeId) {
    var current = localStorage.getItem('character_expanded_' + nodeId);
    var newState = current === 'false' ? 'true' : 'false';
    localStorage.setItem('character_expanded_' + nodeId, newState);
    renderCharacterTree();
}

function selectCharacterNode(id) {
    characterData.selectedId = id;
    saveCharacterData();
    renderCharacterTree();
    updateCharacterEditor();
    renderCompactCharacterTree();
    updateCompactCharacterEditor();
}

function renameCharacterNode(id) {
    var node = getCharacterNode(id);
    if (!node) return;
    var newName = prompt('重命名：', node.name);
    if (newName && newName.trim()) {
        node.name = newName.trim();
        saveCharacterData();
        renderCharacterTree();
        updateCharacterEditor();
        renderCompactCharacterTree();
        updateCompactCharacterEditor();
    }
}

function addCharacterRoot() {
    var name = prompt('请输入分类名称：', '新分类');
    if (!name || !name.trim()) return;
    var roots = characterData.nodes.filter(function(n) { return n.parentId === null; });
    var newNode = {
        id: genCharacterId(),
        parentId: null,
        type: 'folder',
        name: name.trim(),
        order: roots.length,
        content: '分类描述'
    };
    characterData.nodes.push(newNode);
    characterData.selectedId = newNode.id;
    saveCharacterData();
    renderCharacterTree();
    updateCharacterEditor();
    renderCompactCharacterTree();
    updateCompactCharacterEditor();
}

function addCharacterChild(parentId) {
    var parent = getCharacterNode(parentId);
    if (!parent) {
        alert('请先选择一个父节点');
        return;
    }
    var name = prompt('请输入角色姓名：', '新角色');
    if (!name || !name.trim()) return;
    var children = getCharacterChildren(parentId);
    var newNode = {
        id: genCharacterId(),
        parentId: parentId,
        type: 'character',
        name: name.trim(),
        order: children.length,
        content: '【姓名】' + name.trim() + '\n【性别】\n【年龄】\n【外貌】\n【性格】\n【背景】\n【势力】\n【等级】\n【功法】\n【其他】'
    };
    characterData.nodes.push(newNode);
    characterData.selectedId = newNode.id;
    saveCharacterData();
    renderCharacterTree();
    updateCharacterEditor();
    renderCompactCharacterTree();
    updateCompactCharacterEditor();
    localStorage.setItem('character_expanded_' + parentId, 'true');
}

function addCharacterFolder(parentId) {
    var parent = getCharacterNode(parentId);
    if (!parent) {
        alert('请先选择一个父节点');
        return;
    }
    var name = prompt('请输入新分类名称：', '新分类');
    if (!name || !name.trim()) return;
    var children = getCharacterChildren(parentId);
    var newNode = {
        id: genCharacterId(),
        parentId: parentId,
        type: 'folder',
        name: name.trim(),
        order: children.length,
        content: '分类说明'
    };
    characterData.nodes.push(newNode);
    characterData.selectedId = newNode.id;
    saveCharacterData();
    renderCharacterTree();
    updateCharacterEditor();
    renderCompactCharacterTree();
    updateCompactCharacterEditor();
    localStorage.setItem('character_expanded_' + parentId, 'true');
}

function deleteCharacterNode() {
    var node = getCharacterNode(characterData.selectedId);
    if (!node) return;
    if (characterData.nodes.filter(function(n) { return n.parentId === null; }).length === 1 && node.parentId === null) {
        alert('至少保留一个根分类');
        return;
    }
    if (confirm('确定删除「' + node.name + '」及其所有子项吗？')) {
        var toDelete = [node.id];
        function collectChildren(pid) {
            characterData.nodes.filter(function(n) { return n.parentId === pid; }).forEach(function(child) {
                toDelete.push(child.id);
                collectChildren(child.id);
            });
        }
        collectChildren(node.id);
        characterData.nodes = characterData.nodes.filter(function(n) { return toDelete.indexOf(n.id) === -1; });
        var siblings = getCharacterChildren(node.parentId);
        siblings.forEach(function(s, idx) { s.order = idx; });
        characterData.selectedId = characterData.nodes.length > 0 ? characterData.nodes[0].id : null;
        saveCharacterData();
        renderCharacterTree();
        updateCharacterEditor();
        renderCompactCharacterTree();
        updateCompactCharacterEditor();
        alert('已删除');
    }
}

function showCharacterContextMenu(x, y, nodeId) {
    var oldMenu = document.getElementById('characterContextMenu');
    if (oldMenu) oldMenu.remove();
    var node = getCharacterNode(nodeId);
    if (!node) return;
    var menu = document.createElement('div');
    menu.id = 'characterContextMenu';
    menu.style.cssText = 'position:fixed;background:#fff;border-radius:8px;padding:4px 0;box-shadow:0 2px 12px rgba(0,0,0,0.15);z-index:10000;min-width:140px;';
    menu.style.left = x + 'px';
    menu.style.top = y + 'px';
    var isRoot = node.parentId === null;
    var menuHtml =
        '<button data-action="addCharacter" style="display:block;width:100%;padding:8px 16px;border:none;background:none;cursor:pointer;text-align:left;font-size:13px;color:#333;">➕ 新增角色</button>' +
        '<button data-action="addFolder" style="display:block;width:100%;padding:8px 16px;border:none;background:none;cursor:pointer;text-align:left;font-size:13px;color:#333;">📁 新增分类</button>' +
        '<button data-action="rename" style="display:block;width:100%;padding:8px 16px;border:none;background:none;cursor:pointer;text-align:left;font-size:13px;color:#333;">✏️ 重命名</button>' +
        (characterData.nodes.filter(function(n) { return n.parentId === null; }).length > 1 || !isRoot ?
            '<button data-action="delete" style="display:block;width:100%;padding:8px 16px;border:none;background:none;cursor:pointer;text-align:left;font-size:13px;color:#dc3545;">🗑 删除</button>' : '');
    menu.innerHTML = menuHtml;
    document.body.appendChild(menu);
    menu.querySelectorAll('button').forEach(function(btn) {
        btn.onclick = function(e) {
            e.stopPropagation();
            var action = this.getAttribute('data-action');
            if (action === 'addCharacter') {
                addCharacterChild(nodeId);
            } else if (action === 'addFolder') {
                addCharacterFolder(nodeId);
            } else if (action === 'rename') {
                renameCharacterNode(nodeId);
            } else if (action === 'delete') {
                deleteCharacterNode();
            }
            menu.remove();
        };
    });
    setTimeout(function() {
        document.addEventListener('click', function closeMenu(e) {
            if (!menu.contains(e.target)) { menu.remove(); document.removeEventListener('click', closeMenu); }
        });
    }, 10);
}

function updateCharacterEditor() {
    var titleInput = document.getElementById('characterEditorTitle');
    var contentArea = document.getElementById('characterEditorContent');
    var wordCount = document.getElementById('characterWordCount');
    var statusEl = document.getElementById('characterStatus');
    if (!titleInput || !contentArea) return;
    var node = getCharacterNode(characterData.selectedId);
    if (node) {
        titleInput.value = node.name || '';
        contentArea.value = node.content || '';
        wordCount.textContent = (node.content || '').length + ' 字';
        statusEl.textContent = '已选择：' + node.name;
        var deleteBtn = document.getElementById('characterDeleteBtn');
        if (deleteBtn) deleteBtn.style.display = 'inline-block';
    } else {
        titleInput.value = '';
        contentArea.value = '';
        wordCount.textContent = '0 字';
        statusEl.textContent = '请选择一个节点';
        var deleteBtn = document.getElementById('characterDeleteBtn');
        if (deleteBtn) deleteBtn.style.display = 'none';
    }
}

function saveCharacterNode() {
    var node = getCharacterNode(characterData.selectedId);
    if (!node) {
        alert('请先选择一个节点');
        return;
    }
    var title = document.getElementById('characterEditorTitle').value.trim();
    var content = document.getElementById('characterEditorContent').value;
    if (title) node.name = title;
    node.content = content;
    saveCharacterData();
    renderCharacterTree();
    updateCharacterEditor();
    renderCompactCharacterTree();
    updateCompactCharacterEditor();
    document.getElementById('characterStatus').textContent = '✅ 已保存';
    setTimeout(function() {
        document.getElementById('characterStatus').textContent = '已保存';
    }, 1500);
}

// ========== 全屏模式打开/关闭 ==========

function openCharacterPanel() {
    var existingPage = document.querySelector('.page[data-page="character_panel"]');
    if (existingPage) {
        switchToTab('character_panel');
        return;
    }
    var bookId = currentBookId || 'global';
    var tabId = 'character_panel';
    openTabs.push({ id: tabId, title: '👥 角色', type: 'character', bookId: bookId });
    renderTabs();
    var pagesContainer = document.getElementById('pagesContainer');
    var pageDiv = document.createElement('div');
    pageDiv.className = 'page';
    pageDiv.setAttribute('data-page', tabId);
    pageDiv.innerHTML = renderCharacterPage();
    pagesContainer.appendChild(pageDiv);
    getCharacterData();
    renderCharacterTree();
    updateCharacterEditor();
    initCharacterEvents();
    switchToTab(tabId);
    var sidebar = document.querySelector('.sidebar-menu');
    if (sidebar) sidebar.style.display = 'none';
}

function closeCharacterPanel() {
    closeTab('character_panel');
    var sidebar = document.querySelector('.sidebar-menu');
    if (sidebar) {
        var activePage = document.querySelector('.page.active');
        if (activePage && activePage.getAttribute('data-page') && activePage.getAttribute('data-page').indexOf('book_') === 0) {
            sidebar.style.display = 'none';
        } else {
            sidebar.style.display = 'flex';
        }
    }
}

function renderCharacterPage() {
    return `
        <div class="character-container" style="display:flex;height:100%;width:100%;">
            <div class="character-sidebar" style="width:280px;min-width:200px;max-width:400px;background:var(--panel-bg, rgba(255,255,255,0.95));backdrop-filter:blur(8px);border-right:1px solid var(--border-color, rgba(0,0,0,0.08));display:flex;flex-direction:column;flex-shrink:0;position:relative;overflow:visible;">
                <div class="character-sidebar-header" style="display:flex;justify-content:space-between;align-items:center;padding:12px 16px;background:rgba(0,0,0,0.03);border-bottom:1px solid var(--border-color, rgba(0,0,0,0.08));flex-shrink:0;">
                    <span style="font-weight:600;">👥 角色目录</span>
                    <div style="display:flex;gap:6px;">
    <button id="outlineAddRootBtn" title="新增根节点" style="background:none;border:none;cursor:pointer;font-size:16px;">
        <img src="icons/folder.svg" width="16" height="16" alt="新增根节点">
    </button>
    <button id="outlineRefreshBtn" title="刷新" style="background:none;border:none;cursor:pointer;font-size:16px;">
        <img src="icons/refresh.svg" width="16" height="16" alt="刷新">
    </button>
    <button id="outlineCloseBtn" title="关闭" style="background:none;border:none;cursor:pointer;font-size:16px;">
        <img src="icons/close.svg" width="16" height="16" alt="关闭">
    </button>
</div>
                </div>
                <div style="padding:8px 12px;flex-shrink:0;">
                    <input type="text" id="outlineSearchInput" placeholder="搜索..." style="width:100%;padding:6px 10px 6px 32px;border:1px solid var(--border-color, #ddd);border-radius:6px;font-size:12px;background:var(--input-bg, #f8f8f8) url('icons/search.svg') no-repeat 8px center;background-size:16px 16px;color:var(--text-color, #333);">
                </div>
                <div style="display:flex;gap:6px;padding:0 12px 8px 12px;flex-shrink:0;">
                    <button id="characterAddItemBtn" title="新增角色" style="flex:1;background:#28a745;color:white;border:none;border-radius:4px;cursor:pointer;font-size:12px;padding:5px 0;font-weight:500;">+ 角色</button>
                     <button id="outlineAddFolderBtn" title="新增分类" style="flex:1;background:#9b784e;color:white;border:none;border-radius:4px;cursor:pointer;font-size:12px;padding:5px 0;font-weight:500;">
        <img src="icons/folder.svg" width="14" height="14" alt="分类" style="vertical-align:middle; margin-right:4px;"> 分卷
    </button>
                </div>
                <div id="characterTree" style="flex:1;overflow-y:auto;padding:8px 4px;"></div>
                <div style="padding:8px 12px;border-top:1px solid var(--border-color, rgba(0,0,0,0.08));font-size:11px;color:#888;display:flex;justify-content:space-between;flex-shrink:0;">
                    <span>角色: <span id="characterNodeCount">0</span></span>
                    <span>💡 双击重命名 · 右键菜单</span>
                </div>
                <div id="characterResizeHandle" style="position:absolute;right:-4px;top:0;width:6px;height:100%;cursor:ew-resize;background:transparent;z-index:10;transition:background 0.2s;"></div>
            </div>
            <div class="character-editor" style="flex:1;display:flex;flex-direction:column;background:var(--panel-bg, rgba(255,255,255,0.9));overflow:hidden;">
                <div style="display:flex;justify-content:space-between;align-items:center;padding:12px 20px;border-bottom:1px solid var(--border-color, rgba(0,0,0,0.08));flex-shrink:0;">
                    <input type="text" id="characterEditorTitle" placeholder="角色姓名" style="font-size:18px;font-weight:600;border:none;background:transparent;outline:none;flex:1;color:var(--text-color, #333);">
                    <div style="display:flex;gap:8px;">
    <button id="outlinePinBtn" title="收起为侧边栏" style="padding:6px 12px;background:#6c757d;color:white;border:none;border-radius:6px;cursor:pointer;font-size:13px;">
        <img src="icons/label.svg" width="14" height="14" alt="缩起" style="vertical-align:middle; margin-right:4px;"> 缩起
    </button>
    <button id="outlineSaveBtn" style="padding:6px 16px;background:#9b784e;color:white;border:none;border-radius:6px;cursor:pointer;">
        <img src="icons/toolbar.svg" width="14" height="14" alt="保存" style="vertical-align:middle; margin-right:4px;"> 保存
    </button>
    <button id="outlineDeleteBtn" style="padding:6px 16px;background:#dc3545;color:white;border:none;border-radius:6px;cursor:pointer;">
        <img src="icons/trash.svg" width="14" height="14" alt="删除" style="vertical-align:middle; margin-right:4px;"> 删除
    </button>
                    </div>
                </div>
                <textarea id="characterEditorContent" style="flex:1;padding:20px;border:none;outline:none;resize:none;font-size:14px;line-height:1.8;background:transparent;color:var(--text-color, #333);font-family:inherit;" placeholder="【姓名】\n【性别】\n【年龄】\n【外貌】\n【性格】\n【背景】\n【势力】\n【等级】\n【功法】\n【其他】"></textarea>
                <div class="character-status-bar" style="padding:8px 20px;border-top:1px solid var(--border-color, rgba(0,0,0,0.08));display:flex;justify-content:space-between;font-size:12px;color:#888;flex-shrink:0;">
                    <span id="characterWordCount">0 字</span>
                    <span id="characterStatus">已就绪</span>
                </div>
            </div>
        </div>
    `;
}

function initCharacterEvents() {
    var closeBtn = document.getElementById('characterCloseBtn');
    if (closeBtn) closeBtn.onclick = closeCharacterPanel;
    var saveBtn = document.getElementById('characterSaveBtn');
    if (saveBtn) saveBtn.onclick = saveCharacterNode;
    var deleteBtn = document.getElementById('characterDeleteBtn');
    if (deleteBtn) deleteBtn.onclick = deleteCharacterNode;
    var addRootBtn = document.getElementById('characterAddRootBtn');
    if (addRootBtn) addRootBtn.onclick = addCharacterRoot;
    var refreshBtn = document.getElementById('characterRefreshBtn');
    if (refreshBtn) {
        refreshBtn.onclick = function() {
            getCharacterData();
            renderCharacterTree();
            updateCharacterEditor();
            renderCompactCharacterTree();
            updateCompactCharacterEditor();
        };
    }
    var searchInput = document.getElementById('characterSearchInput');
    if (searchInput) {
        searchInput.oninput = function() {
            var keyword = this.value.trim().toLowerCase();
            var container = document.getElementById('characterTree');
            if (!keyword) { renderCharacterTree(); return; }
            var items = container.querySelectorAll('.character-tree-header');
            items.forEach(function(item) {
                var id = item.getAttribute('data-id');
                var node = getCharacterNode(id);
                if (node && (node.name.toLowerCase().indexOf(keyword) !== -1 || (node.content && node.content.toLowerCase().indexOf(keyword) !== -1))) {
                    item.style.background = 'rgba(255,193,7,0.3)';
                } else {
                    if (characterData.selectedId === id) {
                        item.style.background = 'rgba(0,122,255,0.12)';
                    } else {
                        item.style.background = '';
                    }
                }
            });
        };
    }
    var pinBtn = document.getElementById('characterPinBtn');
    if (pinBtn) {
        pinBtn.onclick = function() {
            closeCharacterPanel();
            setTimeout(function() {
                openCharacterSidebar('characters');
            }, 150);
        };
    }
    var addItemBtn = document.getElementById('characterAddItemBtn');
    if (addItemBtn) {
        addItemBtn.onclick = function() {
            if (characterData.selectedId) {
                addCharacterChild(characterData.selectedId);
            } else {
                alert('请先选择一个节点');
            }
        };
    }
    var addFolderBtn = document.getElementById('characterAddFolderBtn');
    if (addFolderBtn) {
        addFolderBtn.onclick = function() {
            if (characterData.selectedId) {
                addCharacterFolder(characterData.selectedId);
            } else {
                alert('请先选择一个节点');
            }
        };
    }
    var contentArea = document.getElementById('characterEditorContent');
    var titleInput = document.getElementById('characterEditorTitle');
    var saveTimer = null;
    if (contentArea) {
        contentArea.oninput = function() {
            var node = getCharacterNode(characterData.selectedId);
            if (node) {
                node.content = this.value;
                document.getElementById('characterWordCount').textContent = this.value.length + ' 字';
                document.getElementById('characterStatus').textContent = '✏️ 未保存';
                clearTimeout(saveTimer);
                saveTimer = setTimeout(function() {
                    saveCharacterData();
                    document.getElementById('characterStatus').textContent = '✅ 已保存';
                    setTimeout(function() {
                        document.getElementById('characterStatus').textContent = '已保存';
                    }, 1000);
                }, 500);
            }
        };
    }
    if (titleInput) {
        titleInput.oninput = function() {
            var node = getCharacterNode(characterData.selectedId);
            if (node && this.value.trim()) {
                node.name = this.value.trim();
                saveCharacterData();
                renderCharacterTree();
                renderCompactCharacterTree();
            }
        };
    }
    var handle = document.getElementById('characterResizeHandle');
    var sidebar = document.querySelector('.character-sidebar');
    if (handle && sidebar) {
        var isResizing = false;
        var startX = 0;
        var startWidth = 0;
        handle.onmousedown = function(e) {
            e.preventDefault();
            isResizing = true;
            startX = e.clientX;
            startWidth = sidebar.offsetWidth;
            document.body.style.cursor = 'ew-resize';
            document.onmousemove = function(ev) {
                if (!isResizing) return;
                var newWidth = startWidth + (ev.clientX - startX);
                if (newWidth < 150) newWidth = 150;
                if (newWidth > 400) newWidth = 400;
                sidebar.style.width = newWidth + 'px';
                sidebar.style.minWidth = newWidth + 'px';
            };
            document.onmouseup = function() {
                isResizing = false;
                document.body.style.cursor = '';
                document.onmousemove = null;
                document.onmouseup = null;
            };
        };
        handle.onmouseenter = function() { this.style.background = 'rgba(0,122,255,0.4)'; };
        handle.onmouseleave = function() { this.style.background = 'transparent'; };
    }
    updateCharacterNodeCount();
}

function updateCharacterNodeCount() {
    var count = characterData.nodes.length;
    var el = document.getElementById('characterNodeCount');
    if (el) el.textContent = count;
}

// ====================================================================
// ========== 浮动面板（紧凑模式） ==========
// ====================================================================

function openCharacterSidebar(tool) {
    console.log('openCharacterSidebar 被调用，工具:', tool);
    var sidebar = document.querySelector('.sidebar-menu');
    if (sidebar) { sidebar.style.display = 'none'; }
    var existingPanel = document.getElementById('floatingToolPanel');
    if (existingPanel) { existingPanel.remove(); }
    var rightSidebar = document.getElementById('rightSidebar');
    if (rightSidebar) {
        rightSidebar.classList.remove('collapsed');
        rightSidebar.style.display = 'flex';
        rightSidebar.style.width = '48px';
        rightSidebar.style.minWidth = '48px';
        localStorage.setItem('rightSidebar_collapsed', 'false');
    }
    var detailMain = document.querySelector('.detail-main');
    if (detailMain) {
        var panel = document.createElement('div');
        panel.id = 'floatingToolPanel';
        panel.style.cssText = 'width:420px;min-width:350px;max-width:550px;height:100%;background:var(--panel-bg, rgba(255,255,255,0.98));backdrop-filter:blur(12px);border-left:1px solid var(--border-color, rgba(0,0,0,0.08));border-right:1px solid var(--border-color, rgba(0,0,0,0.08));display:flex;flex-direction:column;flex-shrink:0;overflow:hidden;z-index:10;transition:width 0.2s ease;box-shadow:-2px 0 12px rgba(0,0,0,0.08);';
        panel.innerHTML = renderCompactCharacterPanel();
        var editor = document.querySelector('.detail-editor');
        if (editor && editor.nextSibling) {
            detailMain.insertBefore(panel, editor.nextSibling);
        } else {
            detailMain.appendChild(panel);
        }
        getCharacterData();
        renderCompactCharacterTree();
        updateCompactCharacterEditor();
        bindCompactCharacterEvents();
    }
    setTimeout(function() {
        var toolItems = document.querySelectorAll('.sidebar-tool-item');
        toolItems.forEach(function(item) {
            if (item.getAttribute('data-tool') === tool) {
                item.style.background = 'rgba(0,122,255,0.15)';
                item.style.borderRadius = '8px';
                setTimeout(function() {
                    item.style.background = '';
                }, 1500);
            }
        });
    }, 200);
}

function closeCharacterFloatingPanel() {
    var panel = document.getElementById('floatingToolPanel');
    if (panel) { panel.remove(); }
    var rightSidebar = document.getElementById('rightSidebar');
    if (rightSidebar) {
        rightSidebar.style.width = '48px';
        rightSidebar.style.minWidth = '48px';
    }
}

function renderCompactCharacterPanel() {
    return `
        <div style="display:flex;flex-direction:column;height:100%;width:100%;">
            <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 14px;border-bottom:1px solid var(--border-color, rgba(0,0,0,0.08));flex-shrink:0;">
                <span style="font-weight:600;font-size:14px;">👥 角色</span>
                <div style="display:flex;gap:4px;">
                    <button id="compactCharacterExpandBtn" title="新窗口打开" style="background:none;border:none;cursor:pointer;font-size:14px;padding:2px 8px;border-radius:4px;">⤢</button>
                    <button id="compactCharacterCloseBtn" title="关闭面板" style="background:none;border:none;cursor:pointer;font-size:14px;padding:2px 8px;border-radius:4px;">✕</button>
                </div>
            </div>
            <div style="display:flex;flex:1;overflow:hidden;">
                <div style="width:38%;min-width:120px;max-width:180px;border-right:1px solid var(--border-color, rgba(0,0,0,0.08));display:flex;flex-direction:column;overflow:hidden;">
                    <div style="padding:4px 8px;flex-shrink:0;">
                        <input type="text" id="outlineSearchInput" placeholder="搜索..." style="width:100%;padding:6px 10px 6px 32px;border:1px solid var(--border-color, #ddd);border-radius:6px;font-size:12px;background:var(--input-bg, #f8f8f8) url('icons/search.svg') no-repeat 8px center;background-size:16px 16px;color:var(--text-color, #333);">
                    </div>
                    <div style="display:flex;gap:6px;padding:4px 8px 6px 8px;flex-shrink:0;">
                        <button id="compactCharacterAddBtn" title="新增角色" style="flex:1;background:#28a745;color:white;border:none;border-radius:4px;cursor:pointer;font-size:12px;padding:4px 0;font-weight:500;">➕ 角色</button>
                        <button id="compactCharacterAddFolderBtn" title="新增分类" style="flex:1;background:#9b784e;color:white;border:none;border-radius:4px;cursor:pointer;font-size:12px;padding:4px 0;font-weight:500;">📁 分类</button>
                    </div>
                    <div id="compactCharacterTree" style="flex:1;overflow-y:auto;padding:4px 4px;"></div>
                    <div style="padding:3px 10px;border-top:1px solid var(--border-color, rgba(0,0,0,0.08));font-size:10px;color:#888;flex-shrink:0;display:flex;justify-content:space-between;">
                        <span>角色: <span id="compactCharacterNodeCount">0</span></span>
                        <span>📌 点击选择</span>
                    </div>
                </div>
                <div style="flex:1;display:flex;flex-direction:column;overflow:hidden;min-width:150px;">
                    <div style="padding:6px 12px;border-bottom:1px solid var(--border-color, rgba(0,0,0,0.08));flex-shrink:0;display:flex;gap:6px;align-items:center;">
                        <input type="text" id="compactCharacterTitle" placeholder="角色姓名" style="flex:1;font-size:15px;font-weight:600;border:none;background:transparent;outline:none;color:var(--text-color, #333);">
                        <button id="compactCharacterSaveBtn" title="保存" style="background:#9b784e;color:white;border:none;border-radius:4px;cursor:pointer;font-size:11px;padding:2px 10px;">💾</button>
                    </div>
                    <textarea id="compactCharacterContent" style="flex:1;padding:10px 12px;border:none;outline:none;resize:none;font-size:13px;line-height:1.8;background:transparent;color:var(--text-color, #333);font-family:inherit;" placeholder="【姓名】\n【性别】\n【年龄】\n【外貌】\n【性格】\n【背景】\n【势力】\n【等级】\n【功法】\n【其他】"></textarea>
                    <div style="padding:3px 12px;border-top:1px solid var(--border-color, rgba(0,0,0,0.08));font-size:10px;color:#888;display:flex;justify-content:space-between;flex-shrink:0;">
                        <span id="compactCharacterWordCount">0 字</span>
                        <span id="compactCharacterStatus">已就绪</span>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function renderCompactCharacterTree() {
    var container = document.getElementById('compactCharacterTree');
    if (!container) return;
    container.innerHTML = '';
    var roots = characterData.nodes.filter(function(n) { return n.parentId === null; }).sort(function(a, b) { return (a.order || 0) - (b.order || 0); });
    if (roots.length === 0) {
        container.innerHTML = '<div style="padding:12px;text-align:center;color:#888;font-size:12px;">暂无角色</div>';
        return;
    }
    roots.forEach(function(root) {
        container.appendChild(createCompactCharacterNode(root, 0));
    });
    var countEl = document.getElementById('compactCharacterNodeCount');
    if (countEl) countEl.textContent = characterData.nodes.length;
}

function createCompactCharacterNode(node, depth) {
    var div = document.createElement('div');
    div.className = 'compact-character-node';
    div.setAttribute('data-id', node.id);
    div.style.marginBottom = '1px';
    var header = document.createElement('div');
    header.className = 'compact-character-header';
    header.style.cssText = 'display:flex;align-items:center;gap:4px;padding:3px 6px;border-radius:4px;cursor:pointer;transition:background 0.15s;padding-left:' + (depth * 12 + 4) + 'px;font-size:12px;';
    if (characterData.selectedId === node.id) {
        header.style.background = 'rgba(0,122,255,0.12)';
        header.style.fontWeight = '500';
    }
    header.setAttribute('data-id', node.id);
    var hasChildren = getCharacterChildren(node.id).length > 0;
    var toggle = document.createElement('span');
    toggle.style.cssText = 'font-size:8px;width:12px;text-align:center;cursor:pointer;color:#888;flex-shrink:0;';
    if (hasChildren) {
        var isExpanded = localStorage.getItem('character_expanded_' + node.id) !== 'false';
        toggle.textContent = isExpanded ? '▾' : '▸';
        toggle.onclick = function(e) {
            e.stopPropagation();
            var current = localStorage.getItem('character_expanded_' + node.id);
            var newState = current === 'false' ? 'true' : 'false';
            localStorage.setItem('character_expanded_' + node.id, newState);
            renderCompactCharacterTree();
        };
    } else {
        toggle.textContent = '·';
        toggle.style.color = '#ccc';
    }
    header.appendChild(toggle);
    var icon = document.createElement('span');
    icon.style.fontSize = '12px';
    icon.style.flexShrink = '0';
    icon.textContent = node.type === 'folder' ? '📁' : '👤';
    header.appendChild(icon);
    var nameSpan = document.createElement('span');
    nameSpan.style.cssText = 'flex:1;font-size:12px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--text-color, #333);';
    nameSpan.textContent = node.name || '未命名';
    header.appendChild(nameSpan);
    header.onclick = function(e) {
        if (e.target === toggle) return;
        characterData.selectedId = node.id;
        saveCharacterData();
        renderCompactCharacterTree();
        updateCompactCharacterEditor();
        if (document.getElementById('characterTree')) {
            renderCharacterTree();
            updateCharacterEditor();
        }
    };
    div.appendChild(header);
    var children = getCharacterChildren(node.id);
    if (children.length > 0) {
        var childrenDiv = document.createElement('div');
        childrenDiv.className = 'compact-character-children';
        var isExpanded = localStorage.getItem('character_expanded_' + node.id) !== 'false';
        childrenDiv.style.display = isExpanded ? 'block' : 'none';
        children.forEach(function(child) {
            childrenDiv.appendChild(createCompactCharacterNode(child, depth + 1));
        });
        div.appendChild(childrenDiv);
    }
    return div;
}

function updateCompactCharacterEditor() {
    var node = getCharacterNode(characterData.selectedId);
    var titleInput = document.getElementById('compactCharacterTitle');
    var contentArea = document.getElementById('compactCharacterContent');
    var wordCount = document.getElementById('compactCharacterWordCount');
    var statusEl = document.getElementById('compactCharacterStatus');
    if (node) {
        if (titleInput) titleInput.value = node.name || '';
        if (contentArea) contentArea.value = node.content || '';
        if (wordCount) wordCount.textContent = (node.content || '').length + ' 字';
        if (statusEl) statusEl.textContent = '已选择：' + node.name;
    } else {
        if (titleInput) titleInput.value = '';
        if (contentArea) contentArea.value = '';
        if (wordCount) wordCount.textContent = '0 字';
        if (statusEl) statusEl.textContent = '请选择一个节点';
    }
}

function bindCompactCharacterEvents() {
    var addBtn = document.getElementById('compactCharacterAddBtn');
    if (addBtn) {
        addBtn.onclick = function() {
            if (characterData.selectedId) {
                addCharacterChild(characterData.selectedId);
            } else {
                alert('请先选择一个节点');
            }
            renderCompactCharacterTree();
            updateCompactCharacterEditor();
        };
    }
    var addFolderBtn = document.getElementById('compactCharacterAddFolderBtn');
    if (addFolderBtn) {
        addFolderBtn.onclick = function() {
            if (characterData.selectedId) {
                addCharacterFolder(characterData.selectedId);
            } else {
                alert('请先选择一个节点');
            }
            renderCompactCharacterTree();
            updateCompactCharacterEditor();
        };
    }
    var expandBtn = document.getElementById('compactCharacterExpandBtn');
    if (expandBtn) {
        expandBtn.onclick = function() {
            openCharacterInNewWindow();
        };
    }
    var closeBtn = document.getElementById('compactCharacterCloseBtn');
    if (closeBtn) {
        closeBtn.onclick = function() {
            closeCharacterFloatingPanel();
            var rightSidebar = document.getElementById('rightSidebar');
            if (rightSidebar) {
                rightSidebar.style.width = '48px';
                rightSidebar.style.minWidth = '48px';
            }
        };
    }
    var saveBtn = document.getElementById('compactCharacterSaveBtn');
    if (saveBtn) {
        saveBtn.onclick = function() {
            var node = getCharacterNode(characterData.selectedId);
            if (!node) { alert('请先选择一个节点'); return; }
            var title = document.getElementById('compactCharacterTitle').value.trim();
            var content = document.getElementById('compactCharacterContent').value;
            if (title) node.name = title;
            node.content = content;
            saveCharacterData();
            renderCharacterTree();
            updateCharacterEditor();
            renderCompactCharacterTree();
            updateCompactCharacterEditor();
            document.getElementById('compactCharacterStatus').textContent = '✅ 已保存';
            setTimeout(function() {
                document.getElementById('compactCharacterStatus').textContent = '已就绪';
            }, 1500);
        };
    }
    var searchInput = document.getElementById('compactCharacterSearch');
    if (searchInput) {
        searchInput.oninput = function() {
            var keyword = this.value.trim().toLowerCase();
            var container = document.getElementById('compactCharacterTree');
            if (!keyword) { renderCompactCharacterTree(); return; }
            var items = container.querySelectorAll('.compact-character-header');
            items.forEach(function(item) {
                var id = item.getAttribute('data-id');
                var node = getCharacterNode(id);
                if (node && (node.name.toLowerCase().indexOf(keyword) !== -1 || (node.content && node.content.toLowerCase().indexOf(keyword) !== -1))) {
                    item.style.background = 'rgba(255,193,7,0.3)';
                } else {
                    if (characterData.selectedId === id) {
                        item.style.background = 'rgba(0,122,255,0.12)';
                    } else {
                        item.style.background = '';
                    }
                }
            });
        };
    }
    var titleInput = document.getElementById('compactCharacterTitle');
    var contentArea = document.getElementById('compactCharacterContent');
    var saveTimer = null;
    if (contentArea) {
        contentArea.oninput = function() {
            var node = getCharacterNode(characterData.selectedId);
            if (node) {
                node.content = this.value;
                document.getElementById('compactCharacterWordCount').textContent = this.value.length + ' 字';
                document.getElementById('compactCharacterStatus').textContent = '✏️ 未保存';
                clearTimeout(saveTimer);
                saveTimer = setTimeout(function() {
                    saveCharacterData();
                    document.getElementById('compactCharacterStatus').textContent = '✅ 已保存';
                    setTimeout(function() {
                        document.getElementById('compactCharacterStatus').textContent = '已就绪';
                    }, 1000);
                }, 500);
            }
        };
    }
    if (titleInput) {
        titleInput.oninput = function() {
            var node = getCharacterNode(characterData.selectedId);
            if (node && this.value.trim()) {
                node.name = this.value.trim();
                saveCharacterData();
                renderCompactCharacterTree();
            }
        };
    }
}

// ========== 新窗口打开 ==========

function openCharacterInNewWindow() {
    closeCharacterFloatingPanel();
    
    var currentTheme = localStorage.getItem('app_theme') || 'default';
    var customBgImage = localStorage.getItem('custom_bg_image') || '';
    var customBgOpacity = parseInt(localStorage.getItem('custom_bg_opacity') || '30');
    
    var themeColors = {
        'default': { bg: '#f0f2f5', panel: 'rgba(255,255,255,0.95)', border: 'rgba(0,0,0,0.08)', text: '#333', textSecondary: '#888', headerBg: 'rgba(0,0,0,0.03)' },
        'eye': { bg: '#e8f0e5', panel: 'rgba(200,219,197,0.95)', border: 'rgba(44,62,47,0.12)', text: '#2c3e2f', textSecondary: '#5a7a5a', headerBg: 'rgba(44,62,47,0.06)' },
        'warm': { bg: '#f5efe5', panel: 'rgba(223,213,189,0.95)', border: 'rgba(74,59,44,0.12)', text: '#4a3b2c', textSecondary: '#8a7a6a', headerBg: 'rgba(74,59,44,0.06)' },
        'dark': { bg: '#1a1a2e', panel: 'rgba(30,30,46,0.95)', border: 'rgba(255,255,255,0.08)', text: '#e0e0e0', textSecondary: '#8888aa', headerBg: 'rgba(255,255,255,0.05)' },
        'open': { bg: '#f0f2f5', panel: 'rgba(255,255,255,0.2)', border: 'rgba(255,255,255,0.1)', text: '#333', textSecondary: '#888', headerBg: 'rgba(255,255,255,0.08)' }
    };
    var c = themeColors[currentTheme] || themeColors['default'];
    var isDark = currentTheme === 'dark';
    var isOpen = currentTheme === 'open';
    var hasCustomBg = customBgImage && customBgImage.length > 0;
    
    var bgStyle = '';
    if (hasCustomBg) {
        bgStyle = 'background-image: url(' + JSON.stringify(customBgImage) + '); background-size: cover; background-position: center; background-attachment: fixed; opacity: ' + (customBgOpacity/100) + ';';
    }
    
    getCharacterData();
    var dataJson = JSON.stringify(characterData);
    var bookId = currentBookId || 'global';
    var selectedId = characterData.selectedId ? JSON.stringify(characterData.selectedId) : 'null';
    
    var jsCode = `
function getCharacterChildren(parentId) {
    return characterData.nodes.filter(function(n) { return n.parentId === parentId; }).sort(function(a,b) { return (a.order||0)-(b.order||0); });
}
function getCharacterNode(id) {
    return characterData.nodes.find(function(n) { return n.id === id; });
}
function saveCharacterData() {
    var key = 'openwrite_character_' + (currentBookId || 'global');
    var data = { nodes: characterData.nodes, selectedId: selectedId, nextId: characterData.nextId || 100 };
    localStorage.setItem(key, JSON.stringify(data));
    if (window.opener && window.opener.window) {
        try { window.opener.window.location.reload(); } catch(e) {}
    }
}
function selectNode(id) { selectedId = id; renderTree(); updateEditor(); saveCharacterData(); }
function renderTree() {
    var container = document.getElementById('characterTree');
    if (!container) return;
    container.innerHTML = '';
    var roots = characterData.nodes.filter(function(n) { return n.parentId === null; }).sort(function(a,b) { return (a.order||0)-(b.order||0); });
    if (roots.length === 0) { container.innerHTML = '<div style="padding:20px;text-align:center;color:#888;font-size:13px;">暂无角色分类</div>'; return; }
    roots.forEach(function(root) { container.appendChild(createNodeElement(root, 0)); });
    document.getElementById('winNodeCount').textContent = characterData.nodes.length;
}
function createNodeElement(node, depth) {
    var div = document.createElement('div');
    div.className = 'character-tree-node';
    div.setAttribute('data-id', node.id);
    var header = document.createElement('div');
    header.className = 'character-tree-header';
    if (selectedId === node.id) header.classList.add('active');
    header.style.paddingLeft = (depth * 16 + 8) + 'px';
    header.setAttribute('data-id', node.id);
    var hasChildren = getCharacterChildren(node.id).length > 0;
    var toggle = document.createElement('span');
    toggle.className = 'toggle';
    if (hasChildren) {
        var isExpanded = localStorage.getItem('character_expanded_' + node.id) !== 'false';
        toggle.textContent = isExpanded ? '▾' : '▸';
        toggle.onclick = function(e) { e.stopPropagation();
            var current = localStorage.getItem('character_expanded_' + node.id);
            var newState = current === 'false' ? 'true' : 'false';
            localStorage.setItem('character_expanded_' + node.id, newState);
            renderTree();
        };
    } else { toggle.textContent = '·'; toggle.style.color = '#ccc'; }
    header.appendChild(toggle);
    var icon = document.createElement('span');
    icon.className = 'icon';
    icon.textContent = node.type === 'folder' ? '📁' : '👤';
    header.appendChild(icon);
    var nameSpan = document.createElement('span');
    nameSpan.className = 'name';
    nameSpan.textContent = node.name || '未命名';
    header.appendChild(nameSpan);
    header.onclick = function(e) { if (e.target === toggle) return; selectNode(node.id); };
    header.ondblclick = function(e) { e.stopPropagation(); var newName = prompt('重命名：', node.name); if (newName && newName.trim()) { node.name = newName.trim(); saveCharacterData(); renderTree(); updateEditor(); } };
    header.oncontextmenu = function(e) { e.preventDefault(); e.stopPropagation();
        var menu = document.createElement('div');
        menu.style.cssText = 'position:fixed;background:#fff;border-radius:8px;padding:4px 0;box-shadow:0 2px 12px rgba(0,0,0,0.15);z-index:10000;min-width:120px;';
        menu.style.left = Math.min(e.clientX, window.innerWidth - 140) + 'px';
        menu.style.top = Math.min(e.clientY, window.innerHeight - 120) + 'px';
        var isRoot = node.parentId === null;
        menu.innerHTML =
            '<button data-action="addCharacter" style="display:block;width:100%;padding:6px 14px;border:none;background:none;cursor:pointer;text-align:left;font-size:12px;">➕ 新增角色</button>' +
            '<button data-action="addFolder" style="display:block;width:100%;padding:6px 14px;border:none;background:none;cursor:pointer;text-align:left;font-size:12px;">📁 新增分类</button>' +
            '<button data-action="rename" style="display:block;width:100%;padding:6px 14px;border:none;background:none;cursor:pointer;text-align:left;font-size:12px;">✏️ 重命名</button>' +
            (characterData.nodes.filter(function(n) { return n.parentId === null; }).length > 1 || !isRoot ?
                '<button data-action="delete" style="display:block;width:100%;padding:6px 14px;border:none;background:none;cursor:pointer;text-align:left;font-size:12px;color:#dc3545;">🗑 删除</button>' : '');
        document.body.appendChild(menu);
        menu.querySelectorAll('button').forEach(function(btn) {
            btn.onclick = function() {
                var action = this.getAttribute('data-action');
                if (action === 'addCharacter') {
                    var name = prompt('请输入角色姓名：', '新角色');
                    if (name && name.trim()) {
                        var children = getCharacterChildren(node.id);
                        var newNode = { id: 'node_' + (characterData.nextId || 100), parentId: node.id, type: 'character', name: name.trim(), order: children.length, content: '【姓名】' + name.trim() + '\\n【性别】\\n【年龄】\\n【外貌】\\n【性格】\\n【背景】\\n【势力】\\n【等级】\\n【功法】\\n【其他】' };
                        characterData.nextId = (characterData.nextId || 100) + 1;
                        characterData.nodes.push(newNode);
                        selectedId = newNode.id;
                        localStorage.setItem('character_expanded_' + node.id, 'true');
                        saveCharacterData();
                        renderTree();
                        updateEditor();
                    }
                } else if (action === 'addFolder') {
                    var name = prompt('请输入新分类名称：', '新分类');
                    if (name && name.trim()) {
                        var children = getCharacterChildren(node.id);
                        var newNode = { id: 'node_' + (characterData.nextId || 100), parentId: node.id, type: 'folder', name: name.trim(), order: children.length, content: '分类说明' };
                        characterData.nextId = (characterData.nextId || 100) + 1;
                        characterData.nodes.push(newNode);
                        selectedId = newNode.id;
                        localStorage.setItem('character_expanded_' + node.id, 'true');
                        saveCharacterData();
                        renderTree();
                        updateEditor();
                    }
                } else if (action === 'rename') {
                    var newName = prompt('重命名：', node.name);
                    if (newName && newName.trim()) { node.name = newName.trim(); saveCharacterData(); renderTree(); updateEditor(); }
                } else if (action === 'delete') {
                    if (confirm('确定删除「' + node.name + '」及其所有子项吗？')) {
                        var toDelete = [node.id];
                        function collectChildren(pid) {
                            characterData.nodes.filter(function(n) { return n.parentId === pid; }).forEach(function(child) {
                                toDelete.push(child.id);
                                collectChildren(child.id);
                            });
                        }
                        collectChildren(node.id);
                        characterData.nodes = characterData.nodes.filter(function(n) { return toDelete.indexOf(n.id) === -1; });
                        var siblings = getCharacterChildren(node.parentId);
                        siblings.forEach(function(s, idx) { s.order = idx; });
                        selectedId = characterData.nodes.length > 0 ? characterData.nodes[0].id : null;
                        saveCharacterData();
                        renderTree();
                        updateEditor();
                    }
                }
                menu.remove();
            };
        });
        setTimeout(function() {
            document.addEventListener('click', function closeMenu(e) {
                if (!menu.contains(e.target)) { menu.remove(); document.removeEventListener('click', closeMenu); }
            });
        }, 10);
    };
    div.appendChild(header);
    var children = getCharacterChildren(node.id);
    if (children.length > 0) {
        var childrenDiv = document.createElement('div');
        childrenDiv.className = 'character-tree-children';
        var isExpanded = localStorage.getItem('character_expanded_' + node.id) !== 'false';
        childrenDiv.style.display = isExpanded ? 'block' : 'none';
        children.forEach(function(child) { childrenDiv.appendChild(createNodeElement(child, depth + 1)); });
        div.appendChild(childrenDiv);
    }
    return div;
}
function updateEditor() {
    var node = getCharacterNode(selectedId);
    var titleInput = document.getElementById('winTitle');
    var contentArea = document.getElementById('winContent');
    var wordCount = document.getElementById('winWordCount');
    var statusEl = document.getElementById('winStatus');
    var deleteBtn = document.getElementById('winDelete');
    if (node) {
        titleInput.value = node.name || '';
        contentArea.value = node.content || '';
        wordCount.textContent = (node.content || '').length + ' 字';
        statusEl.textContent = '已选择：' + node.name;
        deleteBtn.style.display = 'inline-block';
    } else {
        titleInput.value = '';
        contentArea.value = '';
        wordCount.textContent = '0 字';
        statusEl.textContent = '请选择一个节点';
        deleteBtn.style.display = 'none';
    }
}
function saveNode() {
    var node = getCharacterNode(selectedId);
    if (!node) { alert('请先选择一个节点'); return; }
    var title = document.getElementById('winTitle').value.trim();
    var content = document.getElementById('winContent').value;
    if (title) node.name = title;
    node.content = content;
    saveCharacterData();
    renderTree();
    updateEditor();
    document.getElementById('winStatus').textContent = '✅ 已保存';
    setTimeout(function() { document.getElementById('winStatus').textContent = '已保存'; }, 1500);
}
function deleteNode() {
    var node = getCharacterNode(selectedId);
    if (!node) return;
    if (characterData.nodes.filter(function(n) { return n.parentId === null; }).length === 1 && node.parentId === null) {
        alert('至少保留一个根分类');
        return;
    }
    if (confirm('确定删除「' + node.name + '」及其所有子项吗？')) {
        var toDelete = [node.id];
        function collectChildren(pid) {
            characterData.nodes.filter(function(n) { return n.parentId === pid; }).forEach(function(child) {
                toDelete.push(child.id);
                collectChildren(child.id);
            });
        }
        collectChildren(node.id);
        characterData.nodes = characterData.nodes.filter(function(n) { return toDelete.indexOf(n.id) === -1; });
        var siblings = getCharacterChildren(node.parentId);
        siblings.forEach(function(s, idx) { s.order = idx; });
        selectedId = characterData.nodes.length > 0 ? characterData.nodes[0].id : null;
        saveCharacterData();
        renderTree();
        updateEditor();
        alert('已删除');
    }
}
document.getElementById('winAddRoot').onclick = function() {
    var name = prompt('请输入分类名称：', '新分类');
    if (name && name.trim()) {
        var roots = characterData.nodes.filter(function(n) { return n.parentId === null; });
        var newNode = { id: 'node_' + (characterData.nextId || 100), parentId: null, type: 'folder', name: name.trim(), order: roots.length, content: '分类描述' };
        characterData.nextId = (characterData.nextId || 100) + 1;
        characterData.nodes.push(newNode);
        selectedId = newNode.id;
        saveCharacterData();
        renderTree();
        updateEditor();
    }
};
document.getElementById('winAddCharacterBtn').onclick = function() {
    if (selectedId) {
        var node = getCharacterNode(selectedId);
        if (node) {
            var name = prompt('请输入角色姓名：', '新角色');
            if (name && name.trim()) {
                var children = getCharacterChildren(selectedId);
                var newNode = { id: 'node_' + (characterData.nextId || 100), parentId: selectedId, type: 'character', name: name.trim(), order: children.length, content: '【姓名】' + name.trim() + '\\n【性别】\\n【年龄】\\n【外貌】\\n【性格】\\n【背景】\\n【势力】\\n【等级】\\n【功法】\\n【其他】' };
                characterData.nextId = (characterData.nextId || 100) + 1;
                characterData.nodes.push(newNode);
                selectedId = newNode.id;
                localStorage.setItem('character_expanded_' + selectedId, 'true');
                saveCharacterData();
                renderTree();
                updateEditor();
            }
        }
    } else { alert('请先选择一个节点'); }
};
document.getElementById('winAddFolderBtn').onclick = function() {
    if (selectedId) {
        var node = getCharacterNode(selectedId);
        if (node) {
            var name = prompt('请输入新分类名称：', '新分类');
            if (name && name.trim()) {
                var children = getCharacterChildren(selectedId);
                var newNode = { id: 'node_' + (characterData.nextId || 100), parentId: selectedId, type: 'folder', name: name.trim(), order: children.length, content: '分类说明' };
                characterData.nextId = (characterData.nextId || 100) + 1;
                characterData.nodes.push(newNode);
                selectedId = newNode.id;
                localStorage.setItem('character_expanded_' + selectedId, 'true');
                saveCharacterData();
                renderTree();
                updateEditor();
            }
        }
    } else { alert('请先选择一个节点'); }
};
document.getElementById('winRefresh').onclick = function() { renderTree(); updateEditor(); };
document.getElementById('winSave').onclick = saveNode;
document.getElementById('winDelete').onclick = deleteNode;
document.getElementById('winSearch').oninput = function() {
    var keyword = this.value.trim().toLowerCase();
    var container = document.getElementById('characterTree');
    if (!keyword) { renderTree(); return; }
    var items = container.querySelectorAll('.character-tree-header');
    items.forEach(function(item) {
        var id = item.getAttribute('data-id');
        var node = getCharacterNode(id);
        if (node && (node.name.toLowerCase().indexOf(keyword) !== -1 || (node.content && node.content.toLowerCase().indexOf(keyword) !== -1))) {
            item.style.background = 'rgba(255,193,7,0.3)';
        } else {
            if (selectedId === id) { item.style.background = 'rgba(0,122,255,0.12)'; }
            else { item.style.background = ''; }
        }
    });
};
var saveTimer = null;
document.getElementById('winContent').oninput = function() {
    var node = getCharacterNode(selectedId);
    if (node) {
        node.content = this.value;
        document.getElementById('winWordCount').textContent = this.value.length + ' 字';
        document.getElementById('winStatus').textContent = '✏️ 未保存';
        clearTimeout(saveTimer);
        saveTimer = setTimeout(function() {
            saveCharacterData();
            document.getElementById('winStatus').textContent = '✅ 已保存';
            setTimeout(function() { document.getElementById('winStatus').textContent = '已保存'; }, 1000);
        }, 500);
    }
};
document.getElementById('winTitle').oninput = function() {
    var node = getCharacterNode(selectedId);
    if (node && this.value.trim()) {
        node.name = this.value.trim();
        saveCharacterData();
        renderTree();
    }
};
document.addEventListener('keydown', function(e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); saveNode(); }
});
renderTree();
updateEditor();
console.log('角色窗口已打开');
`;
    
    var html = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>👥 角色 - 全屏编辑</title>
    <style>
        * { margin:0; padding:0; box-sizing:border-box; }
        body { font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif; ${hasCustomBg ? bgStyle : 'background:' + c.bg + ';'} height:100vh; overflow:hidden; color:${c.text}; position:relative; }
        ${hasCustomBg ? `
        body::before {
            content: '';
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.3);
            z-index: 0;
            pointer-events: none;
        }
        .character-container { position:relative; z-index:1; }
        ` : ''}
        .character-container { display:flex; height:100vh; width:100%; ${isOpen ? 'gap:12px;padding:12px;' : ''} }
        .character-sidebar { width:300px; min-width:220px; max-width:450px; background:${hasCustomBg ? 'rgba(0,0,0,0.5)' : c.panel}; backdrop-filter:blur(20px); border-right:1px solid ${c.border}; display:flex; flex-direction:column; flex-shrink:0; overflow:hidden; ${isOpen ? 'border-radius:20px;border:1px solid rgba(255,255,255,0.15);margin:0;' : ''} }
        ${hasCustomBg && isDark ? `
        .character-sidebar { background:rgba(0,0,0,0.6); }
        .character-editor { background:rgba(0,0,0,0.5); }
        ` : ''}
        .character-sidebar-header { display:flex; justify-content:space-between; align-items:center; padding:12px 16px; background:${c.headerBg}; border-bottom:1px solid ${c.border}; flex-shrink:0; }
        .character-sidebar-header span { font-weight:600; font-size:15px; color:${c.text}; }
        .character-sidebar-header button { background:none; border:none; cursor:pointer; font-size:16px; padding:0 4px; color:${c.textSecondary}; }
        .character-search { padding:8px 12px; flex-shrink:0; }
        .character-search input { width:100%; padding:6px 10px; border:1px solid ${c.border}; border-radius:6px; font-size:13px; background:${hasCustomBg ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.5)'}; color:${c.text}; }
        .character-search input::placeholder { color:${hasCustomBg ? 'rgba(255,255,255,0.6)' : c.textSecondary}; }
        .character-add-buttons { display:flex; gap:6px; padding:0 12px 8px 12px; flex-shrink:0; }
        .character-add-buttons button { flex:1; border:none; border-radius:4px; cursor:pointer; font-size:12px; padding:5px 0; font-weight:500; color:white; }
        .character-add-buttons .add-character { background:#28a745; }
        .character-add-buttons .add-folder { background:#9b784e; }
        #characterTree { flex:1; overflow-y:auto; padding:8px 4px; }
        .character-status { padding:6px 12px; border-top:1px solid ${c.border}; font-size:11px; color:${c.textSecondary}; display:flex; justify-content:space-between; flex-shrink:0; }
        .character-editor { flex:1; display:flex; flex-direction:column; background:${hasCustomBg ? 'rgba(0,0,0,0.4)' : c.panel}; backdrop-filter:blur(16px); overflow:hidden; ${isOpen ? 'border-radius:20px;border:1px solid rgba(255,255,255,0.15);' : ''} }
        .character-editor-header { display:flex; justify-content:space-between; align-items:center; padding:12px 20px; border-bottom:1px solid ${c.border}; flex-shrink:0; }
        .character-editor-header input { font-size:18px; font-weight:600; border:none; background:transparent; outline:none; flex:1; color:${c.text}; }
        .character-editor-header button { padding:6px 16px; border:none; border-radius:6px; cursor:pointer; font-size:13px; }
        .character-editor-header .save-btn { background:#9b784e; color:white; }
        .character-editor-header .delete-btn { background:#dc3545; color:white; }
        .character-editor-content { flex:1; padding:20px; border:none; outline:none; resize:none; font-size:14px; line-height:1.8; background:transparent; color:${c.text}; font-family:inherit; }
        .character-status-bar { padding:8px 20px; border-top:1px solid ${c.border}; display:flex; justify-content:space-between; font-size:12px; color:${c.textSecondary}; flex-shrink:0; }
        ::-webkit-scrollbar { width:6px; height:6px; }
        ::-webkit-scrollbar-thumb { background:${isDark ? 'rgba(255,255,255,0.2)' : 'rgba(136,136,136,0.4)'}; border-radius:3px; }
        ::-webkit-scrollbar-track { background:transparent; }
        .character-tree-node { margin-bottom:2px; }
        .character-tree-header { display:flex; align-items:center; gap:6px; padding:5px 8px; border-radius:6px; cursor:pointer; transition:background 0.15s; font-size:13px; color:${c.text}; }
        .character-tree-header:hover { background:${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)'}; }
        .character-tree-header.active { background:rgba(0,122,255,0.2); font-weight:500; }
        .character-tree-children { margin-left:16px; }
        .character-tree-header .toggle { font-size:9px; width:14px; text-align:center; color:${c.textSecondary}; flex-shrink:0; cursor:pointer; }
        .character-tree-header .icon { font-size:14px; flex-shrink:0; }
        .character-tree-header .name { flex:1; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
        ${hasCustomBg ? `
        .character-tree-header:hover { background:rgba(255,255,255,0.12); }
        .character-tree-header.active { background:rgba(0,122,255,0.3); }
        .character-sidebar-header { background:rgba(0,0,0,0.2); }
        .character-status { color:rgba(255,255,255,0.7); }
        .character-status-bar { color:rgba(255,255,255,0.7); }
        .character-editor-header input { color:#fff; }
        .character-editor-header input::placeholder { color:rgba(255,255,255,0.5); }
        .character-editor-content { color:#fff; }
        .character-editor-content::placeholder { color:rgba(255,255,255,0.5); }
        .character-sidebar-header button { color:rgba(255,255,255,0.7); }
        .character-sidebar-header span { color:#fff; }
        .character-search input { color:#fff; border-color:rgba(255,255,255,0.2); }
        .character-search input::placeholder { color:rgba(255,255,255,0.5); }
        ` : ''}
    </style>
</head>
<body>
<div class="character-container">
<div class="character-sidebar">
<div class="character-sidebar-header">
<span>👥 角色目录</span>
<div>
<button id="winAddRoot" title="新增分类">📂</button>
<button id="winRefresh" title="刷新">🔄</button>
</div>
</div>
<div class="character-search"><input type="text" id="winSearch" placeholder="🔍 搜索角色..."></div>
<div class="character-add-buttons">
    <button class="add-character" id="winAddCharacterBtn">➕ 角色</button>
    <button class="add-folder" id="winAddFolderBtn">📁 分类</button>
</div>
<div id="characterTree"></div>
<div class="character-status"><span>角色: <span id="winNodeCount">0</span></span><span>💡 双击重命名 · 右键菜单</span></div>
</div>
<div class="character-editor">
<div class="character-editor-header">
<input type="text" id="winTitle" placeholder="角色姓名">
<div style="display:flex;gap:8px;">
<button class="save-btn" id="winSave">💾 保存</button>
<button class="delete-btn" id="winDelete">🗑 删除</button>
</div>
</div>
<textarea id="winContent" class="character-editor-content" placeholder="【姓名】\n【性别】\n【年龄】\n【外貌】\n【性格】\n【背景】\n【势力】\n【等级】\n【功法】\n【其他】"></textarea>
<div class="character-status-bar"><span id="winWordCount">0 字</span><span id="winStatus">已就绪</span></div>
</div>
</div>
<script>
var characterData = ${dataJson};
var currentBookId = ${bookId};
var selectedId = ${selectedId};
${jsCode}
<\/script>
</body>
</html>`;
    
    var newWindow = window.open('', '_blank', 'width=1200,height=800,menubar=no,toolbar=no,location=no,status=no,scrollbars=no');
    if (newWindow) {
        newWindow.document.write(html);
        newWindow.document.close();
        newWindow.focus();
    } else {
        alert('请允许弹出窗口，或手动打开新窗口。');
    }
}

// ========== 右侧边栏入口绑定 ==========

function bindCharacterToolEntry() {
    var characterTool = document.querySelector('.sidebar-tool-item[data-tool="characters"]');
    if (characterTool) {
        characterTool.onclick = function() {
            var existingPanel = document.getElementById('floatingToolPanel');
            if (existingPanel) {
                closeCharacterFloatingPanel();
                var toolItems = document.querySelectorAll('.sidebar-tool-item');
                toolItems.forEach(function(item) {
                    if (item.getAttribute('data-tool') === 'characters') {
                        item.style.background = '';
                    }
                });
            } else {
                openCharacterSidebar('characters');
            }
        };
    }
}

// ========== 导出 ==========

window.openCharacterPanel = openCharacterPanel;
window.closeCharacterPanel = closeCharacterPanel;
window.openCharacterSidebar = openCharacterSidebar;
window.closeCharacterFloatingPanel = closeCharacterFloatingPanel;
window.openCharacterInNewWindow = openCharacterInNewWindow;
window.characterData = characterData;
window.getCharacterData = getCharacterData;
window.saveCharacterData = saveCharacterData;
window.renderCharacterTree = renderCharacterTree;
window.updateCharacterEditor = updateCharacterEditor;
window.addCharacterRoot = addCharacterRoot;
window.addCharacterChild = addCharacterChild;
window.addCharacterFolder = addCharacterFolder;
window.deleteCharacterNode = deleteCharacterNode;
window.renameCharacterNode = renameCharacterNode;
window.selectCharacterNode = selectCharacterNode;
window.getCharacterNode = getCharacterNode;
window.getCharacterChildren = getCharacterChildren;
window.renderCompactCharacterTree = renderCompactCharacterTree;
window.updateCompactCharacterEditor = updateCompactCharacterEditor;
window.bindCharacterToolEntry = bindCharacterToolEntry;

console.log('人物工具已加载');
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(bindCharacterToolEntry, 500);
});