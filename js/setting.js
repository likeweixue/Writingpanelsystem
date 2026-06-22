// ========== 设定工具 ==========

var settingData = {
    nodes: [],
    selectedId: null,
    nextId: 1
};

// ========== 数据操作 ==========

function getSettingData() {
    var bookId = currentBookId || 'global';
    var key = 'openwrite_setting_' + bookId;
    var saved = localStorage.getItem(key);
    if (saved) {
        try {
            var data = JSON.parse(saved);
            settingData.nodes = data.nodes || [];
            settingData.selectedId = data.selectedId || null;
            settingData.nextId = data.nextId || 1;
            return;
        } catch(e) {}
    }
    setDefaultSettingData();
}

function setDefaultSettingData() {
    settingData.nodes = [
        { id: 'root_1', parentId: null, type: 'folder', name: '⚡ 修炼体系', order: 0, icon: '⚡', content: '修炼境界、功法等级、特殊能力等' },
        { id: 'root_2', parentId: null, type: 'folder', name: '🏛️ 门派势力', order: 1, icon: '🏛️', content: '各大宗门、家族、势力组织' },
        { id: 'root_3', parentId: null, type: 'folder', name: '🗺️ 地理志', order: 2, icon: '🗺️', content: '大陆版块、秘境、地形地貌' },
        { id: 'root_4', parentId: null, type: 'folder', name: '📜 历史纪年', order: 3, icon: '📜', content: '大事记、文明更迭、神话传说' },
        { id: 'root_5', parentId: null, type: 'folder', name: '🔮 法宝道具', order: 4, icon: '🔮', content: '神器、法宝、灵植灵药' },
        { id: 'root_6', parentId: null, type: 'folder', name: '🐉 怪物异兽', order: 5, icon: '🐉', content: '妖兽、神兽、异族' },
        { id: 'set_1', parentId: 'root_1', type: 'setting', name: '紫霄幻月指', order: 0, icon: '👆',
          content: '【品阶】玄阶上品\n【威力】练至大成者，可于指尖凝出幻月之力，击出之时，可使人陷入月下幻境，忘却战斗，丧失抵抗之力。\n【修炼条件】必须拥有聚灵之体，以及对月之力量有极高的亲和力。\n【修炼方法】习者需要在每月皓月之夜，吸纳月华之精，沐浴在紫霄神石之前，融月光于身，同时领悟天地之变化。' },
        { id: 'set_2', parentId: 'root_2', type: 'setting', name: '霜龙宫', order: 0, icon: '🏔️',
          content: '【类型】修仙宗门\n【地位】北域三大顶尖势力之一\n【特点】以冰系功法著称\n【势力范围】极北冰原' },
        { id: 'set_3', parentId: 'root_5', type: 'setting', name: '霜华玲珑塔', order: 0, icon: '🗼',
          content: '【品阶】天阶下品\n【功效】可镇封邪魔，净化灵气\n【来历】上古时期霜龙宫镇宫之宝' },
        { id: 'set_4', parentId: 'root_6', type: 'setting', name: '幽瞳影蛇', order: 0, icon: '🐍',
          content: '【类型】妖兽\n【等级】三阶\n【特点】速度极快，双目可释放幻术\n【栖息地】南疆十万大山' },
    ];
    settingData.selectedId = 'set_1';
    settingData.nextId = 100;
    saveSettingData();
}

function saveSettingData() {
    var bookId = currentBookId || 'global';
    var key = 'openwrite_setting_' + bookId;
    var data = {
        nodes: settingData.nodes,
        selectedId: settingData.selectedId,
        nextId: settingData.nextId
    };
    localStorage.setItem(key, JSON.stringify(data));
}

function getSettingChildren(parentId) {
    return settingData.nodes.filter(function(n) { return n.parentId === parentId; }).sort(function(a, b) { return (a.order || 0) - (b.order || 0); });
}

function getSettingNode(id) {
    return settingData.nodes.find(function(n) { return n.id === id; });
}

function genSettingId() {
    return 'set_' + (settingData.nextId++);
}

// ========== 全屏模式渲染 ==========

function renderSettingTree() {
    var container = document.getElementById('settingTree');
    if (!container) return;
    container.innerHTML = '';
    var roots = settingData.nodes.filter(function(n) { return n.parentId === null; }).sort(function(a, b) { return (a.order || 0) - (b.order || 0); });
    if (roots.length === 0) {
        container.innerHTML = '<div style="padding:20px;text-align:center;color:#888;font-size:13px;">暂无设定分类</div>';
        return;
    }
    roots.forEach(function(root) {
        container.appendChild(createSettingNodeElement(root, 0));
    });
}

function createSettingNodeElement(node, depth) {
    var div = document.createElement('div');
    div.className = 'setting-tree-node';
    div.setAttribute('data-id', node.id);
    div.style.marginBottom = '2px';
    var header = document.createElement('div');
    header.className = 'setting-tree-header';
    header.style.cssText = 'display:flex;align-items:center;gap:6px;padding:6px 8px;border-radius:6px;cursor:pointer;transition:background 0.15s;padding-left:' + (depth * 16 + 8) + 'px;';
    if (settingData.selectedId === node.id) {
        header.style.background = 'rgba(0,122,255,0.12)';
        header.style.fontWeight = '500';
    }
    header.setAttribute('data-id', node.id);
    var hasChildren = getSettingChildren(node.id).length > 0;
    var toggle = document.createElement('span');
    toggle.style.cssText = 'font-size:10px;width:16px;text-align:center;cursor:pointer;color:#888;flex-shrink:0;';
    if (hasChildren) {
        var isExpanded = localStorage.getItem('setting_expanded_' + node.id) !== 'false';
        toggle.textContent = isExpanded ? '▾' : '▸';
        toggle.onclick = function(e) {
            e.stopPropagation();
            toggleSettingFolder(node.id);
        };
    } else {
        toggle.textContent = '·';
        toggle.style.color = '#ccc';
    }
    header.appendChild(toggle);
    var icon = document.createElement('span');
    icon.style.fontSize = '16px';
    icon.style.flexShrink = '0';
    icon.textContent = node.icon || (node.type === 'folder' ? '📁' : '📄');
    header.appendChild(icon);
    var nameSpan = document.createElement('span');
    nameSpan.style.cssText = 'flex:1;font-size:13px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--text-color, #333);';
    nameSpan.textContent = node.name || '未命名';
    header.appendChild(nameSpan);
    header.onclick = function(e) {
        if (e.target === toggle) return;
        selectSettingNode(node.id);
    };
    header.ondblclick = function(e) {
        e.stopPropagation();
        renameSettingNode(node.id);
    };
    header.oncontextmenu = function(e) {
        e.preventDefault();
        e.stopPropagation();
        showSettingContextMenu(e.clientX, e.clientY, node.id);
    };
    div.appendChild(header);
    var children = getSettingChildren(node.id);
    if (children.length > 0) {
        var childrenDiv = document.createElement('div');
        childrenDiv.className = 'setting-tree-children';
        var isExpanded = localStorage.getItem('setting_expanded_' + node.id) !== 'false';
        childrenDiv.style.display = isExpanded ? 'block' : 'none';
        children.forEach(function(child) {
            childrenDiv.appendChild(createSettingNodeElement(child, depth + 1));
        });
        div.appendChild(childrenDiv);
    }
    return div;
}

function toggleSettingFolder(nodeId) {
    var current = localStorage.getItem('setting_expanded_' + nodeId);
    var newState = current === 'false' ? 'true' : 'false';
    localStorage.setItem('setting_expanded_' + nodeId, newState);
    renderSettingTree();
}

function selectSettingNode(id) {
    settingData.selectedId = id;
    saveSettingData();
    renderSettingTree();
    updateSettingEditor();
    renderCompactSettingTree();
    updateCompactSettingEditor();
}

function renameSettingNode(id) {
    var node = getSettingNode(id);
    if (!node) return;
    var newName = prompt('重命名：', node.name);
    if (newName && newName.trim()) {
        node.name = newName.trim();
        saveSettingData();
        renderSettingTree();
        updateSettingEditor();
        renderCompactSettingTree();
        updateCompactSettingEditor();
    }
}

function addSettingRoot() {
    var name = prompt('请输入分类名称：', '新分类');
    if (!name || !name.trim()) return;
    var icon = prompt('请输入图标（如：⚡🏛️🗺️）：', '📁') || '📁';
    var roots = settingData.nodes.filter(function(n) { return n.parentId === null; });
    var newNode = {
        id: genSettingId(),
        parentId: null,
        type: 'folder',
        name: name.trim(),
        icon: icon,
        order: roots.length,
        content: '分类描述...'
    };
    settingData.nodes.push(newNode);
    settingData.selectedId = newNode.id;
    saveSettingData();
    renderSettingTree();
    updateSettingEditor();
    renderCompactSettingTree();
    updateCompactSettingEditor();
}

function addSettingChild(parentId) {
    var parent = getSettingNode(parentId);
    if (!parent) {
        alert('请先选择一个父节点');
        return;
    }
    var name = prompt('请输入设定名称：', '新设定');
    if (!name || !name.trim()) return;
    var icon = prompt('请输入图标（如：⚡🏛️🗺️🔮🐉）：', '📄') || '📄';
    var children = getSettingChildren(parentId);
    var newNode = {
        id: genSettingId(),
        parentId: parentId,
        type: 'setting',
        name: name.trim(),
        icon: icon,
        order: children.length,
        content: '✍️ 在此撰写设定详情...\n\n【品阶】\n【描述】\n【来历】'
    };
    settingData.nodes.push(newNode);
    settingData.selectedId = newNode.id;
    saveSettingData();
    renderSettingTree();
    updateSettingEditor();
    renderCompactSettingTree();
    updateCompactSettingEditor();
    localStorage.setItem('setting_expanded_' + parentId, 'true');
}

function addSettingFolder(parentId) {
    var parent = getSettingNode(parentId);
    if (!parent) {
        alert('请先选择一个父节点');
        return;
    }
    var name = prompt('请输入新分类名称：', '新分类');
    if (!name || !name.trim()) return;
    var icon = prompt('请输入图标：', '📁') || '📁';
    var children = getSettingChildren(parentId);
    var newNode = {
        id: genSettingId(),
        parentId: parentId,
        type: 'folder',
        name: name.trim(),
        icon: icon,
        order: children.length,
        content: '分类说明'
    };
    settingData.nodes.push(newNode);
    settingData.selectedId = newNode.id;
    saveSettingData();
    renderSettingTree();
    updateSettingEditor();
    renderCompactSettingTree();
    updateCompactSettingEditor();
    localStorage.setItem('setting_expanded_' + parentId, 'true');
}

function deleteSettingNode() {
    var node = getSettingNode(settingData.selectedId);
    if (!node) return;
    if (settingData.nodes.filter(function(n) { return n.parentId === null; }).length === 1 && node.parentId === null) {
        alert('至少保留一个根分类');
        return;
    }
    if (confirm('确定删除「' + node.name + '」及其所有子条目吗？')) {
        var toDelete = [node.id];
        function collectChildren(pid) {
            settingData.nodes.filter(function(n) { return n.parentId === pid; }).forEach(function(child) {
                toDelete.push(child.id);
                collectChildren(child.id);
            });
        }
        collectChildren(node.id);
        settingData.nodes = settingData.nodes.filter(function(n) { return toDelete.indexOf(n.id) === -1; });
        var siblings = getSettingChildren(node.parentId);
        siblings.forEach(function(s, idx) { s.order = idx; });
        settingData.selectedId = settingData.nodes.length > 0 ? settingData.nodes[0].id : null;
        saveSettingData();
        renderSettingTree();
        updateSettingEditor();
        renderCompactSettingTree();
        updateCompactSettingEditor();
        alert('已删除');
    }
}

function showSettingContextMenu(x, y, nodeId) {
    var oldMenu = document.getElementById('settingContextMenu');
    if (oldMenu) oldMenu.remove();
    var node = getSettingNode(nodeId);
    if (!node) return;
    var menu = document.createElement('div');
    menu.id = 'settingContextMenu';
    menu.style.cssText = 'position:fixed;background:#fff;border-radius:8px;padding:4px 0;box-shadow:0 2px 12px rgba(0,0,0,0.15);z-index:10000;min-width:140px;';
    menu.style.left = x + 'px';
    menu.style.top = y + 'px';
    var isRoot = node.parentId === null;
    var menuHtml =
        '<button data-action="addSetting" style="display:block;width:100%;padding:8px 16px;border:none;background:none;cursor:pointer;text-align:left;font-size:13px;color:#333;">➕ 新增设定</button>' +
        '<button data-action="addFolder" style="display:block;width:100%;padding:8px 16px;border:none;background:none;cursor:pointer;text-align:left;font-size:13px;color:#333;">📁 新增分类</button>' +
        '<button data-action="rename" style="display:block;width:100%;padding:8px 16px;border:none;background:none;cursor:pointer;text-align:left;font-size:13px;color:#333;">✏️ 重命名</button>' +
        '<button data-action="icon" style="display:block;width:100%;padding:8px 16px;border:none;background:none;cursor:pointer;text-align:left;font-size:13px;color:#333;">🎨 更换图标</button>' +
        (settingData.nodes.filter(function(n) { return n.parentId === null; }).length > 1 || !isRoot ?
            '<button data-action="delete" style="display:block;width:100%;padding:8px 16px;border:none;background:none;cursor:pointer;text-align:left;font-size:13px;color:#dc3545;">🗑 删除</button>' : '');
    menu.innerHTML = menuHtml;
    document.body.appendChild(menu);
    menu.querySelectorAll('button').forEach(function(btn) {
        btn.onclick = function(e) {
            e.stopPropagation();
            var action = this.getAttribute('data-action');
            if (action === 'addSetting') {
                addSettingChild(nodeId);
            } else if (action === 'addFolder') {
                addSettingFolder(nodeId);
            } else if (action === 'rename') {
                renameSettingNode(nodeId);
            } else if (action === 'icon') {
                var newIcon = prompt('请输入新图标：', node.icon || '📄');
                if (newIcon) {
                    node.icon = newIcon;
                    saveSettingData();
                    renderSettingTree();
                    updateSettingEditor();
                    renderCompactSettingTree();
                    updateCompactSettingEditor();
                }
            } else if (action === 'delete') {
                deleteSettingNode();
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

function updateSettingEditor() {
    var titleInput = document.getElementById('settingEditorTitle');
    var contentArea = document.getElementById('settingEditorContent');
    var wordCount = document.getElementById('settingWordCount');
    var statusEl = document.getElementById('settingStatus');
    var iconDisplay = document.getElementById('settingIconDisplay');
    if (!titleInput || !contentArea) return;
    var node = getSettingNode(settingData.selectedId);
    if (node) {
        titleInput.value = node.name || '';
        contentArea.value = node.content || '';
        wordCount.textContent = (node.content || '').length + ' 字';
        statusEl.textContent = '已选择：' + node.name;
        if (iconDisplay) iconDisplay.textContent = node.icon || '📄';
        var deleteBtn = document.getElementById('settingDeleteBtn');
        if (deleteBtn) deleteBtn.style.display = 'inline-block';
    } else {
        titleInput.value = '';
        contentArea.value = '';
        wordCount.textContent = '0 字';
        statusEl.textContent = '请选择一个节点';
        if (iconDisplay) iconDisplay.textContent = '📄';
        var deleteBtn = document.getElementById('settingDeleteBtn');
        if (deleteBtn) deleteBtn.style.display = 'none';
    }
}

function saveSettingNode() {
    var node = getSettingNode(settingData.selectedId);
    if (!node) {
        alert('请先选择一个节点');
        return;
    }
    var title = document.getElementById('settingEditorTitle').value.trim();
    var content = document.getElementById('settingEditorContent').value;
    if (title) node.name = title;
    node.content = content;
    saveSettingData();
    renderSettingTree();
    updateSettingEditor();
    renderCompactSettingTree();
    updateCompactSettingEditor();
    document.getElementById('settingStatus').textContent = '✅ 已保存';
    setTimeout(function() {
        document.getElementById('settingStatus').textContent = '已保存';
    }, 1500);
}

// ========== 全屏模式打开/关闭 ==========

function openSettingPanel() {
    var existingPage = document.querySelector('.page[data-page="setting_panel"]');
    if (existingPage) {
        switchToTab('setting_panel');
        return;
    }
    var bookId = currentBookId || 'global';
    var tabId = 'setting_panel';
    openTabs.push({ id: tabId, title: '⚙️ 设定', type: 'setting', bookId: bookId });
    renderTabs();
    var pagesContainer = document.getElementById('pagesContainer');
    var pageDiv = document.createElement('div');
    pageDiv.className = 'page';
    pageDiv.setAttribute('data-page', tabId);
    pageDiv.innerHTML = renderSettingPage();
    pagesContainer.appendChild(pageDiv);
    getSettingData();
    renderSettingTree();
    updateSettingEditor();
    initSettingEvents();
    switchToTab(tabId);
    var sidebar = document.querySelector('.sidebar-menu');
    if (sidebar) sidebar.style.display = 'none';
}

function closeSettingPanel() {
    closeTab('setting_panel');
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

function renderSettingPage() {
    return `
        <div class="setting-container" style="display:flex;height:100%;width:100%;">
            <div class="setting-sidebar" style="width:280px;min-width:200px;max-width:400px;background:var(--panel-bg, rgba(255,255,255,0.95));backdrop-filter:blur(8px);border-right:1px solid var(--border-color, rgba(0,0,0,0.08));display:flex;flex-direction:column;flex-shrink:0;position:relative;overflow:visible;">
                <div class="setting-sidebar-header" style="display:flex;justify-content:space-between;align-items:center;padding:12px 16px;background:rgba(0,0,0,0.03);border-bottom:1px solid var(--border-color, rgba(0,0,0,0.08));flex-shrink:0;">
                    <span style="font-weight:600;">⚙️ 设定目录</span>
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
                    <button id="settingAddItemBtn" title="新增设定" style="flex:1;background:#28a745;color:white;border:none;border-radius:4px;cursor:pointer;font-size:12px;padding:5px 0;font-weight:500;">+ 设定</button>
                     <button id="outlineAddFolderBtn" title="新增分类" style="flex:1;background:#9b784e;color:white;border:none;border-radius:4px;cursor:pointer;font-size:12px;padding:5px 0;font-weight:500;">
        <img src="icons/folder.svg" width="14" height="14" alt="分类" style="vertical-align:middle; margin-right:4px;"> 分类
    </button>
                </div>
                <div id="settingTree" style="flex:1;overflow-y:auto;padding:8px 4px;"></div>
                <div style="padding:8px 12px;border-top:1px solid var(--border-color, rgba(0,0,0,0.08));font-size:11px;color:#888;display:flex;justify-content:space-between;flex-shrink:0;">
                    <span>条目: <span id="settingNodeCount">0</span></span>
                    <span>💡 双击重命名 · 右键菜单</span>
                </div>
                <div id="settingResizeHandle" style="position:absolute;right:-4px;top:0;width:6px;height:100%;cursor:ew-resize;background:transparent;z-index:10;transition:background 0.2s;"></div>
            </div>
            <div class="setting-editor" style="flex:1;display:flex;flex-direction:column;background:var(--panel-bg, rgba(255,255,255,0.9));overflow:hidden;">
                <div style="display:flex;justify-content:space-between;align-items:center;padding:12px 20px;border-bottom:1px solid var(--border-color, rgba(0,0,0,0.08));flex-shrink:0;">
                    <div style="display:flex;align-items:center;gap:12px;flex:1;">
                        <span id="settingIconDisplay" style="font-size:24px;">📄</span>
                        <input type="text" id="settingEditorTitle" placeholder="设定名称" style="font-size:18px;font-weight:600;border:none;background:transparent;outline:none;flex:1;color:var(--text-color, #333);">
                    </div>
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
                <textarea id="settingEditorContent" style="flex:1;padding:20px;border:none;outline:none;resize:none;font-size:14px;line-height:1.8;background:transparent;color:var(--text-color, #333);font-family:inherit;" placeholder="在此撰写设定详情..."></textarea>
                <div class="setting-status-bar" style="padding:8px 20px;border-top:1px solid var(--border-color, rgba(0,0,0,0.08));display:flex;justify-content:space-between;font-size:12px;color:#888;flex-shrink:0;">
                    <span id="settingWordCount">0 字</span>
                    <span id="settingStatus">已就绪</span>
                </div>
            </div>
        </div>
    `;
}

function initSettingEvents() {
    var closeBtn = document.getElementById('settingCloseBtn');
    if (closeBtn) closeBtn.onclick = closeSettingPanel;
    var saveBtn = document.getElementById('settingSaveBtn');
    if (saveBtn) saveBtn.onclick = saveSettingNode;
    var deleteBtn = document.getElementById('settingDeleteBtn');
    if (deleteBtn) deleteBtn.onclick = deleteSettingNode;
    var addRootBtn = document.getElementById('settingAddRootBtn');
    if (addRootBtn) addRootBtn.onclick = addSettingRoot;
    var refreshBtn = document.getElementById('settingRefreshBtn');
    if (refreshBtn) {
        refreshBtn.onclick = function() {
            getSettingData();
            renderSettingTree();
            updateSettingEditor();
            renderCompactSettingTree();
            updateCompactSettingEditor();
        };
    }
    var searchInput = document.getElementById('settingSearchInput');
    if (searchInput) {
        searchInput.oninput = function() {
            var keyword = this.value.trim().toLowerCase();
            var container = document.getElementById('settingTree');
            if (!keyword) { renderSettingTree(); return; }
            var items = container.querySelectorAll('.setting-tree-header');
            items.forEach(function(item) {
                var id = item.getAttribute('data-id');
                var node = getSettingNode(id);
                if (node && (node.name.toLowerCase().indexOf(keyword) !== -1 || (node.content && node.content.toLowerCase().indexOf(keyword) !== -1))) {
                    item.style.background = 'rgba(255,193,7,0.3)';
                } else {
                    if (settingData.selectedId === id) {
                        item.style.background = 'rgba(0,122,255,0.12)';
                    } else {
                        item.style.background = '';
                    }
                }
            });
        };
    }
    var pinBtn = document.getElementById('settingPinBtn');
    if (pinBtn) {
        pinBtn.onclick = function() {
            closeSettingPanel();
            setTimeout(function() {
                openSettingSidebar('setting');
            }, 150);
        };
    }
    var addItemBtn = document.getElementById('settingAddItemBtn');
    if (addItemBtn) {
        addItemBtn.onclick = function() {
            if (settingData.selectedId) {
                addSettingChild(settingData.selectedId);
            } else {
                alert('请先选择一个节点');
            }
        };
    }
    var addFolderBtn = document.getElementById('settingAddFolderBtn');
    if (addFolderBtn) {
        addFolderBtn.onclick = function() {
            if (settingData.selectedId) {
                addSettingFolder(settingData.selectedId);
            } else {
                alert('请先选择一个节点');
            }
        };
    }
    var contentArea = document.getElementById('settingEditorContent');
    var titleInput = document.getElementById('settingEditorTitle');
    var saveTimer = null;
    if (contentArea) {
        contentArea.oninput = function() {
            var node = getSettingNode(settingData.selectedId);
            if (node) {
                node.content = this.value;
                document.getElementById('settingWordCount').textContent = this.value.length + ' 字';
                document.getElementById('settingStatus').textContent = '✏️ 未保存';
                clearTimeout(saveTimer);
                saveTimer = setTimeout(function() {
                    saveSettingData();
                    document.getElementById('settingStatus').textContent = '✅ 已保存';
                    setTimeout(function() {
                        document.getElementById('settingStatus').textContent = '已保存';
                    }, 1000);
                }, 500);
            }
        };
    }
    if (titleInput) {
        titleInput.oninput = function() {
            var node = getSettingNode(settingData.selectedId);
            if (node && this.value.trim()) {
                node.name = this.value.trim();
                saveSettingData();
                renderSettingTree();
                renderCompactSettingTree();
            }
        };
    }
    var handle = document.getElementById('settingResizeHandle');
    var sidebar = document.querySelector('.setting-sidebar');
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
    updateSettingNodeCount();
}

function updateSettingNodeCount() {
    var count = settingData.nodes.length;
    var el = document.getElementById('settingNodeCount');
    if (el) el.textContent = count;
}

// ====================================================================
// ========== 浮动面板（紧凑模式） ==========
// ====================================================================

function openSettingSidebar(tool) {
    console.log('openSettingSidebar 被调用，工具:', tool);
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
        panel.innerHTML = renderCompactSettingPanel();
        var editor = document.querySelector('.detail-editor');
        if (editor && editor.nextSibling) {
            detailMain.insertBefore(panel, editor.nextSibling);
        } else {
            detailMain.appendChild(panel);
        }
        getSettingData();
        renderCompactSettingTree();
        updateCompactSettingEditor();
        bindCompactSettingEvents();
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

function closeSettingFloatingPanel() {
    var panel = document.getElementById('floatingToolPanel');
    if (panel) { panel.remove(); }
    var rightSidebar = document.getElementById('rightSidebar');
    if (rightSidebar) {
        rightSidebar.style.width = '48px';
        rightSidebar.style.minWidth = '48px';
    }
}

function renderCompactSettingPanel() {
    return `
        <div style="display:flex;flex-direction:column;height:100%;width:100%;">
            <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 14px;border-bottom:1px solid var(--border-color, rgba(0,0,0,0.08));flex-shrink:0;">
                <span style="font-weight:600;font-size:14px;">⚙️ 设定</span>
                <div style="display:flex;gap:4px;">
                    <button id="compactSettingExpandBtn" title="新窗口打开" style="background:none;border:none;cursor:pointer;font-size:14px;padding:2px 8px;border-radius:4px;">⤢</button>
                    <button id="compactSettingCloseBtn" title="关闭面板" style="background:none;border:none;cursor:pointer;font-size:14px;padding:2px 8px;border-radius:4px;">✕</button>
                </div>
            </div>
            <div style="display:flex;flex:1;overflow:hidden;">
                <div style="width:38%;min-width:120px;max-width:180px;border-right:1px solid var(--border-color, rgba(0,0,0,0.08));display:flex;flex-direction:column;overflow:hidden;">
                    <div style="padding:4px 8px;flex-shrink:0;">
                        <input type="text" id="outlineSearchInput" placeholder="搜索..." style="width:100%;padding:6px 10px 6px 32px;border:1px solid var(--border-color, #ddd);border-radius:6px;font-size:12px;background:var(--input-bg, #f8f8f8) url('icons/search.svg') no-repeat 8px center;background-size:16px 16px;color:var(--text-color, #333);">
                    </div>
                    <div style="display:flex;gap:6px;padding:4px 8px 6px 8px;flex-shrink:0;">
                        <button id="compactSettingAddBtn" title="新增设定" style="flex:1;background:#28a745;color:white;border:none;border-radius:4px;cursor:pointer;font-size:12px;padding:4px 0;font-weight:500;">➕ 设定</button>
                        <button id="compactSettingAddFolderBtn" title="新增分类" style="flex:1;background:#9b784e;color:white;border:none;border-radius:4px;cursor:pointer;font-size:12px;padding:4px 0;font-weight:500;">📁 分类</button>
                    </div>
                    <div id="compactSettingTree" style="flex:1;overflow-y:auto;padding:4px 4px;"></div>
                    <div style="padding:3px 10px;border-top:1px solid var(--border-color, rgba(0,0,0,0.08));font-size:10px;color:#888;flex-shrink:0;display:flex;justify-content:space-between;">
                        <span>条目: <span id="compactSettingNodeCount">0</span></span>
                        <span>📌 点击选择</span>
                    </div>
                </div>
                <div style="flex:1;display:flex;flex-direction:column;overflow:hidden;min-width:150px;">
                    <div style="padding:6px 12px;border-bottom:1px solid var(--border-color, rgba(0,0,0,0.08));flex-shrink:0;display:flex;gap:6px;align-items:center;">
                        <span id="compactSettingIcon" style="font-size:18px;">📄</span>
                        <input type="text" id="compactSettingTitle" placeholder="设定名称" style="flex:1;font-size:15px;font-weight:600;border:none;background:transparent;outline:none;color:var(--text-color, #333);">
                        <button id="compactSettingSaveBtn" title="保存" style="background:#9b784e;color:white;border:none;border-radius:4px;cursor:pointer;font-size:11px;padding:2px 10px;">💾</button>
                    </div>
                    <textarea id="compactSettingContent" style="flex:1;padding:10px 12px;border:none;outline:none;resize:none;font-size:13px;line-height:1.8;background:transparent;color:var(--text-color, #333);font-family:inherit;" placeholder="在此撰写设定详情..."></textarea>
                    <div style="padding:3px 12px;border-top:1px solid var(--border-color, rgba(0,0,0,0.08));font-size:10px;color:#888;display:flex;justify-content:space-between;flex-shrink:0;">
                        <span id="compactSettingWordCount">0 字</span>
                        <span id="compactSettingStatus">已就绪</span>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function renderCompactSettingTree() {
    var container = document.getElementById('compactSettingTree');
    if (!container) return;
    container.innerHTML = '';
    var roots = settingData.nodes.filter(function(n) { return n.parentId === null; }).sort(function(a, b) { return (a.order || 0) - (b.order || 0); });
    if (roots.length === 0) {
        container.innerHTML = '<div style="padding:12px;text-align:center;color:#888;font-size:12px;">暂无设定</div>';
        return;
    }
    roots.forEach(function(root) {
        container.appendChild(createCompactSettingNode(root, 0));
    });
    var countEl = document.getElementById('compactSettingNodeCount');
    if (countEl) countEl.textContent = settingData.nodes.length;
}

function createCompactSettingNode(node, depth) {
    var div = document.createElement('div');
    div.className = 'compact-setting-node';
    div.setAttribute('data-id', node.id);
    div.style.marginBottom = '1px';
    var header = document.createElement('div');
    header.className = 'compact-setting-header';
    header.style.cssText = 'display:flex;align-items:center;gap:4px;padding:3px 6px;border-radius:4px;cursor:pointer;transition:background 0.15s;padding-left:' + (depth * 12 + 4) + 'px;font-size:12px;';
    if (settingData.selectedId === node.id) {
        header.style.background = 'rgba(0,122,255,0.12)';
        header.style.fontWeight = '500';
    }
    header.setAttribute('data-id', node.id);
    var hasChildren = getSettingChildren(node.id).length > 0;
    var toggle = document.createElement('span');
    toggle.style.cssText = 'font-size:8px;width:12px;text-align:center;cursor:pointer;color:#888;flex-shrink:0;';
    if (hasChildren) {
        var isExpanded = localStorage.getItem('setting_expanded_' + node.id) !== 'false';
        toggle.textContent = isExpanded ? '▾' : '▸';
        toggle.onclick = function(e) {
            e.stopPropagation();
            var current = localStorage.getItem('setting_expanded_' + node.id);
            var newState = current === 'false' ? 'true' : 'false';
            localStorage.setItem('setting_expanded_' + node.id, newState);
            renderCompactSettingTree();
        };
    } else {
        toggle.textContent = '·';
        toggle.style.color = '#ccc';
    }
    header.appendChild(toggle);
    var icon = document.createElement('span');
    icon.style.fontSize = '12px';
    icon.style.flexShrink = '0';
    icon.textContent = node.icon || (node.type === 'folder' ? '📁' : '📄');
    header.appendChild(icon);
    var nameSpan = document.createElement('span');
    nameSpan.style.cssText = 'flex:1;font-size:12px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--text-color, #333);';
    nameSpan.textContent = node.name || '未命名';
    header.appendChild(nameSpan);
    header.onclick = function(e) {
        if (e.target === toggle) return;
        settingData.selectedId = node.id;
        saveSettingData();
        renderCompactSettingTree();
        updateCompactSettingEditor();
        if (document.getElementById('settingTree')) {
            renderSettingTree();
            updateSettingEditor();
        }
    };
    div.appendChild(header);
    var children = getSettingChildren(node.id);
    if (children.length > 0) {
        var childrenDiv = document.createElement('div');
        childrenDiv.className = 'compact-setting-children';
        var isExpanded = localStorage.getItem('setting_expanded_' + node.id) !== 'false';
        childrenDiv.style.display = isExpanded ? 'block' : 'none';
        children.forEach(function(child) {
            childrenDiv.appendChild(createCompactSettingNode(child, depth + 1));
        });
        div.appendChild(childrenDiv);
    }
    return div;
}

function updateCompactSettingEditor() {
    var node = getSettingNode(settingData.selectedId);
    var titleInput = document.getElementById('compactSettingTitle');
    var contentArea = document.getElementById('compactSettingContent');
    var wordCount = document.getElementById('compactSettingWordCount');
    var statusEl = document.getElementById('compactSettingStatus');
    var iconDisplay = document.getElementById('compactSettingIcon');
    if (node) {
        if (titleInput) titleInput.value = node.name || '';
        if (contentArea) contentArea.value = node.content || '';
        if (wordCount) wordCount.textContent = (node.content || '').length + ' 字';
        if (statusEl) statusEl.textContent = '已选择：' + node.name;
        if (iconDisplay) iconDisplay.textContent = node.icon || '📄';
    } else {
        if (titleInput) titleInput.value = '';
        if (contentArea) contentArea.value = '';
        if (wordCount) wordCount.textContent = '0 字';
        if (statusEl) statusEl.textContent = '请选择一个节点';
        if (iconDisplay) iconDisplay.textContent = '📄';
    }
}

function bindCompactSettingEvents() {
    var addBtn = document.getElementById('compactSettingAddBtn');
    if (addBtn) {
        addBtn.onclick = function() {
            if (settingData.selectedId) {
                addSettingChild(settingData.selectedId);
            } else {
                alert('请先选择一个节点');
            }
            renderCompactSettingTree();
            updateCompactSettingEditor();
        };
    }
    var addFolderBtn = document.getElementById('compactSettingAddFolderBtn');
    if (addFolderBtn) {
        addFolderBtn.onclick = function() {
            if (settingData.selectedId) {
                addSettingFolder(settingData.selectedId);
            } else {
                alert('请先选择一个节点');
            }
            renderCompactSettingTree();
            updateCompactSettingEditor();
        };
    }
    var expandBtn = document.getElementById('compactSettingExpandBtn');
    if (expandBtn) {
        expandBtn.onclick = function() {
            openSettingInNewWindow();
        };
    }
    var closeBtn = document.getElementById('compactSettingCloseBtn');
    if (closeBtn) {
        closeBtn.onclick = function() {
            closeSettingFloatingPanel();
            var rightSidebar = document.getElementById('rightSidebar');
            if (rightSidebar) {
                rightSidebar.style.width = '48px';
                rightSidebar.style.minWidth = '48px';
            }
        };
    }
    var saveBtn = document.getElementById('compactSettingSaveBtn');
    if (saveBtn) {
        saveBtn.onclick = function() {
            var node = getSettingNode(settingData.selectedId);
            if (!node) { alert('请先选择一个节点'); return; }
            var title = document.getElementById('compactSettingTitle').value.trim();
            var content = document.getElementById('compactSettingContent').value;
            if (title) node.name = title;
            node.content = content;
            saveSettingData();
            renderSettingTree();
            updateSettingEditor();
            renderCompactSettingTree();
            updateCompactSettingEditor();
            document.getElementById('compactSettingStatus').textContent = '✅ 已保存';
            setTimeout(function() {
                document.getElementById('compactSettingStatus').textContent = '已就绪';
            }, 1500);
        };
    }
    var searchInput = document.getElementById('compactSettingSearch');
    if (searchInput) {
        searchInput.oninput = function() {
            var keyword = this.value.trim().toLowerCase();
            var container = document.getElementById('compactSettingTree');
            if (!keyword) { renderCompactSettingTree(); return; }
            var items = container.querySelectorAll('.compact-setting-header');
            items.forEach(function(item) {
                var id = item.getAttribute('data-id');
                var node = getSettingNode(id);
                if (node && (node.name.toLowerCase().indexOf(keyword) !== -1 || (node.content && node.content.toLowerCase().indexOf(keyword) !== -1))) {
                    item.style.background = 'rgba(255,193,7,0.3)';
                } else {
                    if (settingData.selectedId === id) {
                        item.style.background = 'rgba(0,122,255,0.12)';
                    } else {
                        item.style.background = '';
                    }
                }
            });
        };
    }
    var titleInput = document.getElementById('compactSettingTitle');
    var contentArea = document.getElementById('compactSettingContent');
    var saveTimer = null;
    if (contentArea) {
        contentArea.oninput = function() {
            var node = getSettingNode(settingData.selectedId);
            if (node) {
                node.content = this.value;
                document.getElementById('compactSettingWordCount').textContent = this.value.length + ' 字';
                document.getElementById('compactSettingStatus').textContent = '✏️ 未保存';
                clearTimeout(saveTimer);
                saveTimer = setTimeout(function() {
                    saveSettingData();
                    document.getElementById('compactSettingStatus').textContent = '✅ 已保存';
                    setTimeout(function() {
                        document.getElementById('compactSettingStatus').textContent = '已就绪';
                    }, 1000);
                }, 500);
            }
        };
    }
    if (titleInput) {
        titleInput.oninput = function() {
            var node = getSettingNode(settingData.selectedId);
            if (node && this.value.trim()) {
                node.name = this.value.trim();
                saveSettingData();
                renderCompactSettingTree();
            }
        };
    }
}

// ========== 新窗口打开 ==========

function openSettingInNewWindow() {
    closeSettingFloatingPanel();
    
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
    
    getSettingData();
    var dataJson = JSON.stringify(settingData);
    var bookId = currentBookId || 'global';
    var selectedId = settingData.selectedId ? JSON.stringify(settingData.selectedId) : 'null';
    
    var jsCode = `
function getSettingChildren(parentId) {
    return settingData.nodes.filter(function(n) { return n.parentId === parentId; }).sort(function(a,b) { return (a.order||0)-(b.order||0); });
}
function getSettingNode(id) {
    return settingData.nodes.find(function(n) { return n.id === id; });
}
function saveSettingData() {
    var key = 'openwrite_setting_' + (currentBookId || 'global');
    var data = { nodes: settingData.nodes, selectedId: selectedId, nextId: settingData.nextId || 100 };
    localStorage.setItem(key, JSON.stringify(data));
    if (window.opener && window.opener.window) {
        try { window.opener.window.location.reload(); } catch(e) {}
    }
}
function selectNode(id) { selectedId = id; renderTree(); updateEditor(); saveSettingData(); }
function renderTree() {
    var container = document.getElementById('settingTree');
    if (!container) return;
    container.innerHTML = '';
    var roots = settingData.nodes.filter(function(n) { return n.parentId === null; }).sort(function(a,b) { return (a.order||0)-(b.order||0); });
    if (roots.length === 0) { container.innerHTML = '<div style="padding:20px;text-align:center;color:#888;font-size:13px;">暂无设定分类</div>'; return; }
    roots.forEach(function(root) { container.appendChild(createNodeElement(root, 0)); });
    document.getElementById('winNodeCount').textContent = settingData.nodes.length;
}
function createNodeElement(node, depth) {
    var div = document.createElement('div');
    div.className = 'setting-tree-node';
    div.setAttribute('data-id', node.id);
    var header = document.createElement('div');
    header.className = 'setting-tree-header';
    if (selectedId === node.id) header.classList.add('active');
    header.style.paddingLeft = (depth * 16 + 8) + 'px';
    header.setAttribute('data-id', node.id);
    var hasChildren = getSettingChildren(node.id).length > 0;
    var toggle = document.createElement('span');
    toggle.className = 'toggle';
    if (hasChildren) {
        var isExpanded = localStorage.getItem('setting_expanded_' + node.id) !== 'false';
        toggle.textContent = isExpanded ? '▾' : '▸';
        toggle.onclick = function(e) { e.stopPropagation();
            var current = localStorage.getItem('setting_expanded_' + node.id);
            var newState = current === 'false' ? 'true' : 'false';
            localStorage.setItem('setting_expanded_' + node.id, newState);
            renderTree();
        };
    } else { toggle.textContent = '·'; toggle.style.color = '#ccc'; }
    header.appendChild(toggle);
    var icon = document.createElement('span');
    icon.className = 'icon';
    icon.textContent = node.icon || (node.type === 'folder' ? '📁' : '📄');
    header.appendChild(icon);
    var nameSpan = document.createElement('span');
    nameSpan.className = 'name';
    nameSpan.textContent = node.name || '未命名';
    header.appendChild(nameSpan);
    header.onclick = function(e) { if (e.target === toggle) return; selectNode(node.id); };
    header.ondblclick = function(e) { e.stopPropagation(); var newName = prompt('重命名：', node.name); if (newName && newName.trim()) { node.name = newName.trim(); saveSettingData(); renderTree(); updateEditor(); } };
    header.oncontextmenu = function(e) { e.preventDefault(); e.stopPropagation();
        var menu = document.createElement('div');
        menu.style.cssText = 'position:fixed;background:#fff;border-radius:8px;padding:4px 0;box-shadow:0 2px 12px rgba(0,0,0,0.15);z-index:10000;min-width:120px;';
        menu.style.left = Math.min(e.clientX, window.innerWidth - 140) + 'px';
        menu.style.top = Math.min(e.clientY, window.innerHeight - 120) + 'px';
        var isRoot = node.parentId === null;
        menu.innerHTML =
            '<button data-action="addSetting" style="display:block;width:100%;padding:6px 14px;border:none;background:none;cursor:pointer;text-align:left;font-size:12px;">➕ 新增设定</button>' +
            '<button data-action="addFolder" style="display:block;width:100%;padding:6px 14px;border:none;background:none;cursor:pointer;text-align:left;font-size:12px;">📁 新增分类</button>' +
            '<button data-action="rename" style="display:block;width:100%;padding:6px 14px;border:none;background:none;cursor:pointer;text-align:left;font-size:12px;">✏️ 重命名</button>' +
            '<button data-action="icon" style="display:block;width:100%;padding:6px 14px;border:none;background:none;cursor:pointer;text-align:left;font-size:12px;">🎨 更换图标</button>' +
            (settingData.nodes.filter(function(n) { return n.parentId === null; }).length > 1 || !isRoot ?
                '<button data-action="delete" style="display:block;width:100%;padding:6px 14px;border:none;background:none;cursor:pointer;text-align:left;font-size:12px;color:#dc3545;">🗑 删除</button>' : '');
        document.body.appendChild(menu);
        menu.querySelectorAll('button').forEach(function(btn) {
            btn.onclick = function() {
                var action = this.getAttribute('data-action');
                if (action === 'addSetting') {
                    var name = prompt('请输入设定名称：', '新设定');
                    if (name && name.trim()) {
                        var icon = prompt('请输入图标：', '📄') || '📄';
                        var children = getSettingChildren(node.id);
                        var newNode = { id: 'node_' + (settingData.nextId || 100), parentId: node.id, type: 'setting', name: name.trim(), icon: icon, order: children.length, content: '✍️ 在此撰写设定详情...' };
                        settingData.nextId = (settingData.nextId || 100) + 1;
                        settingData.nodes.push(newNode);
                        selectedId = newNode.id;
                        localStorage.setItem('setting_expanded_' + node.id, 'true');
                        saveSettingData();
                        renderTree();
                        updateEditor();
                    }
                } else if (action === 'addFolder') {
                    var name = prompt('请输入新分类名称：', '新分类');
                    if (name && name.trim()) {
                        var icon = prompt('请输入图标：', '📁') || '📁';
                        var children = getSettingChildren(node.id);
                        var newNode = { id: 'node_' + (settingData.nextId || 100), parentId: node.id, type: 'folder', name: name.trim(), icon: icon, order: children.length, content: '分类说明' };
                        settingData.nextId = (settingData.nextId || 100) + 1;
                        settingData.nodes.push(newNode);
                        selectedId = newNode.id;
                        localStorage.setItem('setting_expanded_' + node.id, 'true');
                        saveSettingData();
                        renderTree();
                        updateEditor();
                    }
                } else if (action === 'rename') {
                    var newName = prompt('重命名：', node.name);
                    if (newName && newName.trim()) { node.name = newName.trim(); saveSettingData(); renderTree(); updateEditor(); }
                } else if (action === 'icon') {
                    var newIcon = prompt('请输入新图标：', node.icon || '📄');
                    if (newIcon) { node.icon = newIcon; saveSettingData(); renderTree(); updateEditor(); }
                } else if (action === 'delete') {
                    if (confirm('确定删除「' + node.name + '」及其所有子条目吗？')) {
                        var toDelete = [node.id];
                        function collectChildren(pid) {
                            settingData.nodes.filter(function(n) { return n.parentId === pid; }).forEach(function(child) {
                                toDelete.push(child.id);
                                collectChildren(child.id);
                            });
                        }
                        collectChildren(node.id);
                        settingData.nodes = settingData.nodes.filter(function(n) { return toDelete.indexOf(n.id) === -1; });
                        var siblings = getSettingChildren(node.parentId);
                        siblings.forEach(function(s, idx) { s.order = idx; });
                        selectedId = settingData.nodes.length > 0 ? settingData.nodes[0].id : null;
                        saveSettingData();
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
    var children = getSettingChildren(node.id);
    if (children.length > 0) {
        var childrenDiv = document.createElement('div');
        childrenDiv.className = 'setting-tree-children';
        var isExpanded = localStorage.getItem('setting_expanded_' + node.id) !== 'false';
        childrenDiv.style.display = isExpanded ? 'block' : 'none';
        children.forEach(function(child) { childrenDiv.appendChild(createNodeElement(child, depth + 1)); });
        div.appendChild(childrenDiv);
    }
    return div;
}
function updateEditor() {
    var node = getSettingNode(selectedId);
    var titleInput = document.getElementById('winTitle');
    var contentArea = document.getElementById('winContent');
    var wordCount = document.getElementById('winWordCount');
    var statusEl = document.getElementById('winStatus');
    var iconDisplay = document.getElementById('winIconDisplay');
    var deleteBtn = document.getElementById('winDelete');
    if (node) {
        titleInput.value = node.name || '';
        contentArea.value = node.content || '';
        wordCount.textContent = (node.content || '').length + ' 字';
        statusEl.textContent = '已选择：' + node.name;
        if (iconDisplay) iconDisplay.textContent = node.icon || '📄';
        deleteBtn.style.display = 'inline-block';
    } else {
        titleInput.value = '';
        contentArea.value = '';
        wordCount.textContent = '0 字';
        statusEl.textContent = '请选择一个节点';
        if (iconDisplay) iconDisplay.textContent = '📄';
        deleteBtn.style.display = 'none';
    }
}
function saveNode() {
    var node = getSettingNode(selectedId);
    if (!node) { alert('请先选择一个节点'); return; }
    var title = document.getElementById('winTitle').value.trim();
    var content = document.getElementById('winContent').value;
    if (title) node.name = title;
    node.content = content;
    saveSettingData();
    renderTree();
    updateEditor();
    document.getElementById('winStatus').textContent = '✅ 已保存';
    setTimeout(function() { document.getElementById('winStatus').textContent = '已保存'; }, 1500);
}
function deleteNode() {
    var node = getSettingNode(selectedId);
    if (!node) return;
    if (settingData.nodes.filter(function(n) { return n.parentId === null; }).length === 1 && node.parentId === null) {
        alert('至少保留一个根分类');
        return;
    }
    if (confirm('确定删除「' + node.name + '」及其所有子条目吗？')) {
        var toDelete = [node.id];
        function collectChildren(pid) {
            settingData.nodes.filter(function(n) { return n.parentId === pid; }).forEach(function(child) {
                toDelete.push(child.id);
                collectChildren(child.id);
            });
        }
        collectChildren(node.id);
        settingData.nodes = settingData.nodes.filter(function(n) { return toDelete.indexOf(n.id) === -1; });
        var siblings = getSettingChildren(node.parentId);
        siblings.forEach(function(s, idx) { s.order = idx; });
        selectedId = settingData.nodes.length > 0 ? settingData.nodes[0].id : null;
        saveSettingData();
        renderTree();
        updateEditor();
        alert('已删除');
    }
}
document.getElementById('winAddRoot').onclick = function() {
    var name = prompt('请输入分类名称：', '新分类');
    if (name && name.trim()) {
        var icon = prompt('请输入图标：', '📁') || '📁';
        var roots = settingData.nodes.filter(function(n) { return n.parentId === null; });
        var newNode = { id: 'node_' + (settingData.nextId || 100), parentId: null, type: 'folder', name: name.trim(), icon: icon, order: roots.length, content: '分类描述...' };
        settingData.nextId = (settingData.nextId || 100) + 1;
        settingData.nodes.push(newNode);
        selectedId = newNode.id;
        saveSettingData();
        renderTree();
        updateEditor();
    }
};
document.getElementById('winAddSettingBtn').onclick = function() {
    if (selectedId) {
        var node = getSettingNode(selectedId);
        if (node) {
            var name = prompt('请输入设定名称：', '新设定');
            if (name && name.trim()) {
                var icon = prompt('请输入图标：', '📄') || '📄';
                var children = getSettingChildren(selectedId);
                var newNode = { id: 'node_' + (settingData.nextId || 100), parentId: selectedId, type: 'setting', name: name.trim(), icon: icon, order: children.length, content: '✍️ 在此撰写设定详情...' };
                settingData.nextId = (settingData.nextId || 100) + 1;
                settingData.nodes.push(newNode);
                selectedId = newNode.id;
                localStorage.setItem('setting_expanded_' + selectedId, 'true');
                saveSettingData();
                renderTree();
                updateEditor();
            }
        }
    } else { alert('请先选择一个节点'); }
};
document.getElementById('winAddFolderBtn').onclick = function() {
    if (selectedId) {
        var node = getSettingNode(selectedId);
        if (node) {
            var name = prompt('请输入新分类名称：', '新分类');
            if (name && name.trim()) {
                var icon = prompt('请输入图标：', '📁') || '📁';
                var children = getSettingChildren(selectedId);
                var newNode = { id: 'node_' + (settingData.nextId || 100), parentId: selectedId, type: 'folder', name: name.trim(), icon: icon, order: children.length, content: '分类说明' };
                settingData.nextId = (settingData.nextId || 100) + 1;
                settingData.nodes.push(newNode);
                selectedId = newNode.id;
                localStorage.setItem('setting_expanded_' + selectedId, 'true');
                saveSettingData();
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
    var container = document.getElementById('settingTree');
    if (!keyword) { renderTree(); return; }
    var items = container.querySelectorAll('.setting-tree-header');
    items.forEach(function(item) {
        var id = item.getAttribute('data-id');
        var node = getSettingNode(id);
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
    var node = getSettingNode(selectedId);
    if (node) {
        node.content = this.value;
        document.getElementById('winWordCount').textContent = this.value.length + ' 字';
        document.getElementById('winStatus').textContent = '✏️ 未保存';
        clearTimeout(saveTimer);
        saveTimer = setTimeout(function() {
            saveSettingData();
            document.getElementById('winStatus').textContent = '✅ 已保存';
            setTimeout(function() { document.getElementById('winStatus').textContent = '已保存'; }, 1000);
        }, 500);
    }
};
document.getElementById('winTitle').oninput = function() {
    var node = getSettingNode(selectedId);
    if (node && this.value.trim()) {
        node.name = this.value.trim();
        saveSettingData();
        renderTree();
    }
};
document.addEventListener('keydown', function(e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); saveNode(); }
});
renderTree();
updateEditor();
console.log('设定窗口已打开');
`;
    
    var html = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>⚙️ 设定 - 全屏编辑</title>
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
        .setting-container { position:relative; z-index:1; }
        ` : ''}
        .setting-container { display:flex; height:100vh; width:100%; ${isOpen ? 'gap:12px;padding:12px;' : ''} }
        .setting-sidebar { width:300px; min-width:220px; max-width:450px; background:${hasCustomBg ? 'rgba(0,0,0,0.5)' : c.panel}; backdrop-filter:blur(20px); border-right:1px solid ${c.border}; display:flex; flex-direction:column; flex-shrink:0; overflow:hidden; ${isOpen ? 'border-radius:20px;border:1px solid rgba(255,255,255,0.15);margin:0;' : ''} }
        ${hasCustomBg && isDark ? `
        .setting-sidebar { background:rgba(0,0,0,0.6); }
        .setting-editor { background:rgba(0,0,0,0.5); }
        ` : ''}
        .setting-sidebar-header { display:flex; justify-content:space-between; align-items:center; padding:12px 16px; background:${c.headerBg}; border-bottom:1px solid ${c.border}; flex-shrink:0; }
        .setting-sidebar-header span { font-weight:600; font-size:15px; color:${c.text}; }
        .setting-sidebar-header button { background:none; border:none; cursor:pointer; font-size:16px; padding:0 4px; color:${c.textSecondary}; }
        .setting-search { padding:8px 12px; flex-shrink:0; }
        .setting-search input { width:100%; padding:6px 10px; border:1px solid ${c.border}; border-radius:6px; font-size:13px; background:${hasCustomBg ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.5)'}; color:${c.text}; }
        .setting-search input::placeholder { color:${hasCustomBg ? 'rgba(255,255,255,0.6)' : c.textSecondary}; }
        .setting-add-buttons { display:flex; gap:6px; padding:0 12px 8px 12px; flex-shrink:0; }
        .setting-add-buttons button { flex:1; border:none; border-radius:4px; cursor:pointer; font-size:12px; padding:5px 0; font-weight:500; color:white; }
        .setting-add-buttons .add-setting { background:#28a745; }
        .setting-add-buttons .add-folder { background:#9b784e; }
        #settingTree { flex:1; overflow-y:auto; padding:8px 4px; }
        .setting-status { padding:6px 12px; border-top:1px solid ${c.border}; font-size:11px; color:${c.textSecondary}; display:flex; justify-content:space-between; flex-shrink:0; }
        .setting-editor { flex:1; display:flex; flex-direction:column; background:${hasCustomBg ? 'rgba(0,0,0,0.4)' : c.panel}; backdrop-filter:blur(16px); overflow:hidden; ${isOpen ? 'border-radius:20px;border:1px solid rgba(255,255,255,0.15);' : ''} }
        .setting-editor-header { display:flex; justify-content:space-between; align-items:center; padding:12px 20px; border-bottom:1px solid ${c.border}; flex-shrink:0; }
        .setting-editor-header .icon-display { font-size:24px; margin-right:12px; }
        .setting-editor-header input { font-size:18px; font-weight:600; border:none; background:transparent; outline:none; flex:1; color:${c.text}; }
        .setting-editor-header button { padding:6px 16px; border:none; border-radius:6px; cursor:pointer; font-size:13px; }
        .setting-editor-header .save-btn { background:#9b784e; color:white; }
        .setting-editor-header .delete-btn { background:#dc3545; color:white; }
        .setting-editor-content { flex:1; padding:20px; border:none; outline:none; resize:none; font-size:14px; line-height:1.8; background:transparent; color:${c.text}; font-family:inherit; }
        .setting-status-bar { padding:8px 20px; border-top:1px solid ${c.border}; display:flex; justify-content:space-between; font-size:12px; color:${c.textSecondary}; flex-shrink:0; }
        ::-webkit-scrollbar { width:6px; height:6px; }
        ::-webkit-scrollbar-thumb { background:${isDark ? 'rgba(255,255,255,0.2)' : 'rgba(136,136,136,0.4)'}; border-radius:3px; }
        ::-webkit-scrollbar-track { background:transparent; }
        .setting-tree-node { margin-bottom:2px; }
        .setting-tree-header { display:flex; align-items:center; gap:6px; padding:5px 8px; border-radius:6px; cursor:pointer; transition:background 0.15s; font-size:13px; color:${c.text}; }
        .setting-tree-header:hover { background:${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)'}; }
        .setting-tree-header.active { background:rgba(0,122,255,0.2); font-weight:500; }
        .setting-tree-children { margin-left:16px; }
        .setting-tree-header .toggle { font-size:9px; width:14px; text-align:center; color:${c.textSecondary}; flex-shrink:0; cursor:pointer; }
        .setting-tree-header .icon { font-size:14px; flex-shrink:0; }
        .setting-tree-header .name { flex:1; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
        ${hasCustomBg ? `
        .setting-tree-header:hover { background:rgba(255,255,255,0.12); }
        .setting-tree-header.active { background:rgba(0,122,255,0.3); }
        .setting-sidebar-header { background:rgba(0,0,0,0.2); }
        .setting-status { color:rgba(255,255,255,0.7); }
        .setting-status-bar { color:rgba(255,255,255,0.7); }
        .setting-editor-header input { color:#fff; }
        .setting-editor-header input::placeholder { color:rgba(255,255,255,0.5); }
        .setting-editor-content { color:#fff; }
        .setting-editor-content::placeholder { color:rgba(255,255,255,0.5); }
        .setting-sidebar-header button { color:rgba(255,255,255,0.7); }
        .setting-sidebar-header span { color:#fff; }
        .setting-search input { color:#fff; border-color:rgba(255,255,255,0.2); }
        .setting-search input::placeholder { color:rgba(255,255,255,0.5); }
        ` : ''}
    </style>
</head>
<body>
<div class="setting-container">
<div class="setting-sidebar">
<div class="setting-sidebar-header">
<span>⚙️ 设定目录</span>
<div>
<button id="winAddRoot" title="新增分类">📂</button>
<button id="winRefresh" title="刷新">🔄</button>
</div>
</div>
<div class="setting-search"><input type="text" id="winSearch" placeholder="🔍 搜索设定..."></div>
<div class="setting-add-buttons">
    <button class="add-setting" id="winAddSettingBtn">➕ 设定</button>
    <button class="add-folder" id="winAddFolderBtn">📁 分类</button>
</div>
<div id="settingTree"></div>
<div class="setting-status"><span>条目: <span id="winNodeCount">0</span></span><span>💡 双击重命名 · 右键菜单</span></div>
</div>
<div class="setting-editor">
<div class="setting-editor-header">
<span class="icon-display" id="winIconDisplay">📄</span>
<input type="text" id="winTitle" placeholder="设定名称">
<div style="display:flex;gap:8px;">
<button class="save-btn" id="winSave">💾 保存</button>
<button class="delete-btn" id="winDelete">🗑 删除</button>
</div>
</div>
<textarea id="winContent" class="setting-editor-content" placeholder="在此撰写设定详情..."></textarea>
<div class="setting-status-bar"><span id="winWordCount">0 字</span><span id="winStatus">已就绪</span></div>
</div>
</div>
<script>
var settingData = ${dataJson};
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

function bindSettingToolEntry() {
    var settingTool = document.querySelector('.sidebar-tool-item[data-tool="setting"]');
    if (settingTool) {
        settingTool.onclick = function() {
            var existingPanel = document.getElementById('floatingToolPanel');
            if (existingPanel) {
                closeSettingFloatingPanel();
                var toolItems = document.querySelectorAll('.sidebar-tool-item');
                toolItems.forEach(function(item) {
                    if (item.getAttribute('data-tool') === 'setting') {
                        item.style.background = '';
                    }
                });
            } else {
                openSettingSidebar('setting');
            }
        };
    }
}

// ========== 导出 ==========

window.openSettingPanel = openSettingPanel;
window.closeSettingPanel = closeSettingPanel;
window.openSettingSidebar = openSettingSidebar;
window.closeSettingFloatingPanel = closeSettingFloatingPanel;
window.openSettingInNewWindow = openSettingInNewWindow;
window.settingData = settingData;
window.getSettingData = getSettingData;
window.saveSettingData = saveSettingData;
window.renderSettingTree = renderSettingTree;
window.updateSettingEditor = updateSettingEditor;
window.addSettingRoot = addSettingRoot;
window.addSettingChild = addSettingChild;
window.addSettingFolder = addSettingFolder;
window.deleteSettingNode = deleteSettingNode;
window.renameSettingNode = renameSettingNode;
window.selectSettingNode = selectSettingNode;
window.getSettingNode = getSettingNode;
window.getSettingChildren = getSettingChildren;
window.renderCompactSettingTree = renderCompactSettingTree;
window.updateCompactSettingEditor = updateCompactSettingEditor;
window.bindSettingToolEntry = bindSettingToolEntry;

console.log('设定工具已加载');
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(bindSettingToolEntry, 500);
});