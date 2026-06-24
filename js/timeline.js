// ========== 时间线工具 ==========

var timelineData = {
    nodes: [],
    selectedId: null,
    nextId: 1
};

// ========== 数据操作 ==========

function getTimelineData() {
    var bookId = currentBookId || 'global';
    var key = 'openwrite_timeline_' + bookId;
    var saved = localStorage.getItem(key);
    if (saved) {
        try {
            var data = JSON.parse(saved);
            timelineData.nodes = data.nodes || [];
            timelineData.selectedId = data.selectedId || null;
            timelineData.nextId = data.nextId || 1;
            return;
        } catch(e) {}
    }
    setDefaultTimelineData();
}

function setDefaultTimelineData() {
    timelineData.nodes = [
        { id: 'root_1', parentId: null, type: 'folder', name: '📜 上古纪元', order: 0, date: '10000年前', content: '远古神话时代' },
        { id: 'root_2', parentId: null, type: 'folder', name: '🏛️ 中古王朝', order: 1, date: '3000年前', content: '王朝兴衰时代' },
        { id: 'root_3', parentId: null, type: 'folder', name: '⚔️ 近世风云', order: 2, date: '100年前至今', content: '主角所在时代' },
        { id: 'evt_1', parentId: 'root_1', type: 'event', name: '天地初开', order: 0, date: '混沌元年', content: '混沌神与深渊魔激战，星辰碎裂，人族诞生。' },
        { id: 'evt_2', parentId: 'root_1', type: 'event', name: '神魔大战', order: 1, date: '太古历1000年', content: '神魔两族全面开战，最终神族封印魔族于九幽之下。' },
        { id: 'evt_3', parentId: 'root_2', type: 'event', name: '九龙夺嫡', order: 0, date: '太初历210年', content: '九位皇子争夺帝位，天下大乱，最终明帝登基。' },
        { id: 'evt_4', parentId: 'root_3', type: 'event', name: '主角出生', order: 0, date: '现历元年', content: '主角在荒古世家李家降生。' },
    ];
    timelineData.selectedId = 'evt_1';
    timelineData.nextId = 100;
    saveTimelineData();
}

function saveTimelineData() {
    var bookId = currentBookId || 'global';
    var key = 'openwrite_timeline_' + bookId;
    var data = {
        nodes: timelineData.nodes,
        selectedId: timelineData.selectedId,
        nextId: timelineData.nextId
    };
    localStorage.setItem(key, JSON.stringify(data));
}

function getTimelineChildren(parentId) {
    return timelineData.nodes.filter(function(n) { return n.parentId === parentId; }).sort(function(a, b) { return (a.order || 0) - (b.order || 0); });
}

function getTimelineNode(id) {
    return timelineData.nodes.find(function(n) { return n.id === id; });
}

function genTimelineId() {
    return 'evt_' + (timelineData.nextId++);
}

// ========== 全屏模式渲染 ==========

function renderTimelineTree() {
    var container = document.getElementById('timelineTree');
    if (!container) return;
    container.innerHTML = '';
    var roots = timelineData.nodes.filter(function(n) { return n.parentId === null; }).sort(function(a, b) { return (a.order || 0) - (b.order || 0); });
    if (roots.length === 0) {
        container.innerHTML = '<div style="padding:20px;text-align:center;color:#888;font-size:13px;">暂无时间线节点</div>';
        return;
    }
    roots.forEach(function(root) {
        container.appendChild(createTimelineNodeElement(root, 0));
    });
}

function createTimelineNodeElement(node, depth) {
    var div = document.createElement('div');
    div.className = 'timeline-tree-node';
    div.setAttribute('data-id', node.id);
    div.style.marginBottom = '2px';
    var header = document.createElement('div');
    header.className = 'timeline-tree-header';
    header.style.cssText = 'display:flex;align-items:center;gap:6px;padding:6px 8px;border-radius:6px;cursor:pointer;transition:background 0.15s;padding-left:' + (depth * 16 + 8) + 'px;';
    if (timelineData.selectedId === node.id) {
        header.style.background = 'rgba(0,122,255,0.12)';
        header.style.fontWeight = '500';
    }
    header.setAttribute('data-id', node.id);
    var hasChildren = getTimelineChildren(node.id).length > 0;
    var toggle = document.createElement('span');
    toggle.style.cssText = 'font-size:10px;width:16px;text-align:center;cursor:pointer;color:#888;flex-shrink:0;';
    if (hasChildren) {
        var isExpanded = localStorage.getItem('timeline_expanded_' + node.id) !== 'false';
        toggle.textContent = isExpanded ? '▾' : '▸';
        toggle.onclick = function(e) {
            e.stopPropagation();
            toggleTimelineFolder(node.id);
        };
    } else {
        toggle.textContent = '·';
        toggle.style.color = '#ccc';
    }
    header.appendChild(toggle);
    var icon = document.createElement('span');
    icon.style.fontSize = '16px';
    icon.style.flexShrink = '0';
    icon.textContent = node.type === 'folder' ? '📁' : '⏳';
    header.appendChild(icon);
    var nameSpan = document.createElement('span');
    nameSpan.style.cssText = 'flex:1;font-size:13px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--text-color, #333);';
    nameSpan.textContent = node.name || '未命名';
    header.appendChild(nameSpan);
    if (node.type === 'event' && node.date) {
        var dateSpan = document.createElement('span');
        dateSpan.style.cssText = 'font-size:10px;color:#888;margin-right:4px;flex-shrink:0;';
        dateSpan.textContent = '📅 ' + node.date;
        header.appendChild(dateSpan);
    }
    header.onclick = function(e) {
        if (e.target === toggle) return;
        selectTimelineNode(node.id);
    };
    header.ondblclick = function(e) {
        e.stopPropagation();
        renameTimelineNode(node.id);
    };
    header.oncontextmenu = function(e) {
        e.preventDefault();
        e.stopPropagation();
        showTimelineContextMenu(e.clientX, e.clientY, node.id);
    };
    div.appendChild(header);
    var children = getTimelineChildren(node.id);
    if (children.length > 0) {
        var childrenDiv = document.createElement('div');
        childrenDiv.className = 'timeline-tree-children';
        var isExpanded = localStorage.getItem('timeline_expanded_' + node.id) !== 'false';
        childrenDiv.style.display = isExpanded ? 'block' : 'none';
        children.forEach(function(child) {
            childrenDiv.appendChild(createTimelineNodeElement(child, depth + 1));
        });
        div.appendChild(childrenDiv);
    }
    return div;
}

function toggleTimelineFolder(nodeId) {
    var current = localStorage.getItem('timeline_expanded_' + nodeId);
    var newState = current === 'false' ? 'true' : 'false';
    localStorage.setItem('timeline_expanded_' + nodeId, newState);
    renderTimelineTree();
}

function selectTimelineNode(id) {
    timelineData.selectedId = id;
    saveTimelineData();
    renderTimelineTree();
    updateTimelineEditor();
    renderCompactTimelineTree();
    updateCompactTimelineEditor();
}

function renameTimelineNode(id) {
    var node = getTimelineNode(id);
    if (!node) return;
    var newName = prompt('重命名：', node.name);
    if (newName && newName.trim()) {
        node.name = newName.trim();
        saveTimelineData();
        renderTimelineTree();
        updateTimelineEditor();
        renderCompactTimelineTree();
        updateCompactTimelineEditor();
    }
}

function addTimelineRoot() {
    var name = prompt('请输入时代名称：', '新纪元');
    if (!name || !name.trim()) return;
    var date = prompt('请输入时间范围：', '') || '未知';
    var roots = timelineData.nodes.filter(function(n) { return n.parentId === null; });
    var newNode = {
        id: genTimelineId(),
        parentId: null,
        type: 'folder',
        name: name.trim(),
        date: date,
        order: roots.length,
        content: '时代描述...'
    };
    timelineData.nodes.push(newNode);
    timelineData.selectedId = newNode.id;
    saveTimelineData();
    renderTimelineTree();
    updateTimelineEditor();
    renderCompactTimelineTree();
    updateCompactTimelineEditor();
}

function addTimelineChild(parentId) {
    var parent = getTimelineNode(parentId);
    if (!parent) {
        alert('请先选择一个父节点');
        return;
    }
    var name = prompt('请输入事件名称：', '新事件');
    if (!name || !name.trim()) return;
    var date = prompt('请输入事件日期：', '') || '';
    var children = getTimelineChildren(parentId);
    var newNode = {
        id: genTimelineId(),
        parentId: parentId,
        type: 'event',
        name: name.trim(),
        date: date,
        order: children.length,
        content: '事件描述...'
    };
    timelineData.nodes.push(newNode);
    timelineData.selectedId = newNode.id;
    saveTimelineData();
    renderTimelineTree();
    updateTimelineEditor();
    renderCompactTimelineTree();
    updateCompactTimelineEditor();
    localStorage.setItem('timeline_expanded_' + parentId, 'true');
}

function addTimelineFolder(parentId) {
    var parent = getTimelineNode(parentId);
    if (!parent) {
        alert('请先选择一个父节点');
        return;
    }
    var name = prompt('请输入新分类名称：', '新分类');
    if (!name || !name.trim()) return;
    var date = prompt('请输入时间范围：', '') || '';
    var children = getTimelineChildren(parentId);
    var newNode = {
        id: genTimelineId(),
        parentId: parentId,
        type: 'folder',
        name: name.trim(),
        date: date,
        order: children.length,
        content: '分类说明'
    };
    timelineData.nodes.push(newNode);
    timelineData.selectedId = newNode.id;
    saveTimelineData();
    renderTimelineTree();
    updateTimelineEditor();
    renderCompactTimelineTree();
    updateCompactTimelineEditor();
    localStorage.setItem('timeline_expanded_' + parentId, 'true');
}

function deleteTimelineNode() {
    var node = getTimelineNode(timelineData.selectedId);
    if (!node) return;
    if (timelineData.nodes.filter(function(n) { return n.parentId === null; }).length === 1 && node.parentId === null) {
        alert('至少保留一个根分类');
        return;
    }
    if (confirm('确定删除「' + node.name + '」及其所有子项吗？')) {
        var toDelete = [node.id];
        function collectChildren(pid) {
            timelineData.nodes.filter(function(n) { return n.parentId === pid; }).forEach(function(child) {
                toDelete.push(child.id);
                collectChildren(child.id);
            });
        }
        collectChildren(node.id);
        timelineData.nodes = timelineData.nodes.filter(function(n) { return toDelete.indexOf(n.id) === -1; });
        var siblings = getTimelineChildren(node.parentId);
        siblings.forEach(function(s, idx) { s.order = idx; });
        timelineData.selectedId = timelineData.nodes.length > 0 ? timelineData.nodes[0].id : null;
        saveTimelineData();
        renderTimelineTree();
        updateTimelineEditor();
        renderCompactTimelineTree();
        updateCompactTimelineEditor();
        alert('已删除');
    }
}

function showTimelineContextMenu(x, y, nodeId) {
    var oldMenu = document.getElementById('timelineContextMenu');
    if (oldMenu) oldMenu.remove();
    var node = getTimelineNode(nodeId);
    if (!node) return;
    var menu = document.createElement('div');
    menu.id = 'timelineContextMenu';
    menu.style.cssText = 'position:fixed;background:#fff;border-radius:8px;padding:4px 0;box-shadow:0 2px 12px rgba(0,0,0,0.15);z-index:10000;min-width:140px;';
    menu.style.left = x + 'px';
    menu.style.top = y + 'px';
    var isRoot = node.parentId === null;
    var menuHtml =
        '<button data-action="addEvent" style="display:block;width:100%;padding:8px 16px;border:none;background:none;cursor:pointer;text-align:left;font-size:13px;color:#333;">➕ 新增事件</button>' +
        '<button data-action="addFolder" style="display:block;width:100%;padding:8px 16px;border:none;background:none;cursor:pointer;text-align:left;font-size:13px;color:#333;">📁 新增分类</button>' +
        '<button data-action="rename" style="display:block;width:100%;padding:8px 16px;border:none;background:none;cursor:pointer;text-align:left;font-size:13px;color:#333;">✏️ 重命名</button>' +
        (node.type === 'event' ? '<button data-action="date" style="display:block;width:100%;padding:8px 16px;border:none;background:none;cursor:pointer;text-align:left;font-size:13px;color:#333;">📅 修改日期</button>' : '') +
        (timelineData.nodes.filter(function(n) { return n.parentId === null; }).length > 1 || !isRoot ?
            '<button data-action="delete" style="display:block;width:100%;padding:8px 16px;border:none;background:none;cursor:pointer;text-align:left;font-size:13px;color:#dc3545;">🗑 删除</button>' : '');
    menu.innerHTML = menuHtml;
    document.body.appendChild(menu);
    menu.querySelectorAll('button').forEach(function(btn) {
        btn.onclick = function(e) {
            e.stopPropagation();
            var action = this.getAttribute('data-action');
            if (action === 'addEvent') {
                addTimelineChild(nodeId);
            } else if (action === 'addFolder') {
                addTimelineFolder(nodeId);
            } else if (action === 'rename') {
                renameTimelineNode(nodeId);
            } else if (action === 'date' && node.type === 'event') {
                var newDate = prompt('请输入事件日期：', node.date || '');
                if (newDate !== null) {
                    node.date = newDate;
                    saveTimelineData();
                    renderTimelineTree();
                    updateTimelineEditor();
                    renderCompactTimelineTree();
                    updateCompactTimelineEditor();
                }
            } else if (action === 'delete') {
                deleteTimelineNode();
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

function updateTimelineEditor() {
    var titleInput = document.getElementById('timelineEditorTitle');
    var dateInput = document.getElementById('timelineEditorDate');
    var contentArea = document.getElementById('timelineEditorContent');
    var wordCount = document.getElementById('timelineWordCount');
    var statusEl = document.getElementById('timelineStatus');
    if (!titleInput || !contentArea) return;
    var node = getTimelineNode(timelineData.selectedId);
    if (node) {
        titleInput.value = node.name || '';
        dateInput.value = node.date || '';
        contentArea.value = node.content || '';
        wordCount.textContent = (node.content || '').length + ' 字';
        statusEl.textContent = '已选择：' + node.name;
        var deleteBtn = document.getElementById('timelineDeleteBtn');
        if (deleteBtn) deleteBtn.style.display = 'inline-block';
        var dateRow = document.getElementById('timelineDateRow');
        if (dateRow) dateRow.style.display = 'flex';
    } else {
        titleInput.value = '';
        dateInput.value = '';
        contentArea.value = '';
        wordCount.textContent = '0 字';
        statusEl.textContent = '请选择一个节点';
        var deleteBtn = document.getElementById('timelineDeleteBtn');
        if (deleteBtn) deleteBtn.style.display = 'none';
        var dateRow = document.getElementById('timelineDateRow');
        if (dateRow) dateRow.style.display = 'none';
    }
}

function saveTimelineNode() {
    var node = getTimelineNode(timelineData.selectedId);
    if (!node) {
        alert('请先选择一个节点');
        return;
    }
    var title = document.getElementById('timelineEditorTitle').value.trim();
    var date = document.getElementById('timelineEditorDate').value.trim();
    var content = document.getElementById('timelineEditorContent').value;
    if (title) node.name = title;
    if (node.type === 'event') node.date = date;
    node.content = content;
    saveTimelineData();
    renderTimelineTree();
    updateTimelineEditor();
    renderCompactTimelineTree();
    updateCompactTimelineEditor();
    document.getElementById('timelineStatus').textContent = '✅ 已保存';
    setTimeout(function() {
        document.getElementById('timelineStatus').textContent = '已保存';
    }, 1500);
}

// ========== 全屏模式打开/关闭 ==========

function openTimelinePanel() {
    var existingPage = document.querySelector('.page[data-page="timeline_panel"]');
    if (existingPage) {
        switchToTab('timeline_panel');
        return;
    }
    var bookId = currentBookId || 'global';
    var tabId = 'timeline_panel';
    openTabs.push({ id: tabId, title: '⏱️ 时间线', type: 'timeline', bookId: bookId });
    renderTabs();
    var pagesContainer = document.getElementById('pagesContainer');
    var pageDiv = document.createElement('div');
    pageDiv.className = 'page';
    pageDiv.setAttribute('data-page', tabId);
    pageDiv.innerHTML = renderTimelinePage();
    pagesContainer.appendChild(pageDiv);
    getTimelineData();
    renderTimelineTree();
    updateTimelineEditor();
    initTimelineEvents();
    switchToTab(tabId);
    var sidebar = document.querySelector('.sidebar-menu');
    if (sidebar) sidebar.style.display = 'none';
}

function closeTimelinePanel() {
    closeTab('timeline_panel');
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

function renderTimelinePage() {
    return `
        <div class="timeline-container" style="display:flex;height:100%;width:100%;">
            <div class="timeline-sidebar" style="width:280px;min-width:200px;max-width:400px;background:var(--panel-bg, rgba(255,255,255,0.95));backdrop-filter:blur(8px);border-right:1px solid var(--border-color, rgba(0,0,0,0.08));display:flex;flex-direction:column;flex-shrink:0;position:relative;overflow:visible;">
                <div class="timeline-sidebar-header" style="display:flex;justify-content:space-between;align-items:center;padding:12px 16px;background:rgba(0,0,0,0.03);border-bottom:1px solid var(--border-color, rgba(0,0,0,0.08));flex-shrink:0;">
                    <span style="font-weight:600;">⏱️ 时间线目录</span>
                    <div style="display:flex;gap:6px;">
                        <button id="timelineAddRootBtn" title="新增根节点" style="background:none;border:none;cursor:pointer;font-size:16px;">
                            <img src="icons/folder.svg" width="16" height="16" alt="新增根节点">
                        </button>
                        <button id="timelineRefreshBtn" title="刷新" style="background:none;border:none;cursor:pointer;font-size:16px;">
                            <img src="icons/refresh.svg" width="16" height="16" alt="刷新">
                        </button>
                        <button id="timelineCloseBtn" title="关闭" style="background:none;border:none;cursor:pointer;font-size:16px;">
                            <img src="icons/close.svg" width="16" height="16" alt="关闭">
                        </button>
                    </div>
                </div>
                <div style="padding:8px 12px;flex-shrink:0;">
                    <input type="text" id="timelineSearchInput" placeholder="搜索时间线..." style="width:100%;padding:6px 10px 6px 32px;border:1px solid var(--border-color, #ddd);border-radius:6px;font-size:12px;background:var(--input-bg, #f8f8f8) url('icons/search.svg') no-repeat 8px center;background-size:16px 16px;color:var(--text-color, #333);">
                </div>
                <div style="display:flex;gap:6px;padding:0 12px 8px 12px;flex-shrink:0;">
                    <button id="timelineAddEventBtn" title="新增事件" style="flex:1;background:#28a745;color:white;border:none;border-radius:4px;cursor:pointer;font-size:12px;padding:5px 0;font-weight:500;">+ 事件</button>
                    <button id="timelineAddFolderBtn" title="新增分类" style="flex:1;background:#9b784e;color:white;border:none;border-radius:4px;cursor:pointer;font-size:12px;padding:5px 0;font-weight:500;">
                        <img src="icons/folder.svg" width="14" height="14" alt="分类" style="vertical-align:middle; margin-right:4px;"> 分类
                    </button>
                </div>
                <div id="timelineTree" style="flex:1;overflow-y:auto;padding:8px 4px;"></div>
                <div style="padding:8px 12px;border-top:1px solid var(--border-color, rgba(0,0,0,0.08));font-size:11px;color:#888;display:flex;justify-content:space-between;flex-shrink:0;">
                    <span>事件: <span id="timelineNodeCount">0</span></span>
                    <span>💡 双击重命名 · 右键菜单</span>
                </div>
                <div id="timelineResizeHandle" style="position:absolute;right:-4px;top:0;width:6px;height:100%;cursor:ew-resize;background:transparent;z-index:10;transition:background 0.2s;"></div>
            </div>
            <div class="timeline-editor" style="flex:1;display:flex;flex-direction:column;background:var(--panel-bg, rgba(255,255,255,0.9));overflow:hidden;">
                <div style="display:flex;justify-content:space-between;align-items:center;padding:12px 20px;border-bottom:1px solid var(--border-color, rgba(0,0,0,0.08));flex-shrink:0;">
                    <div style="display:flex;align-items:center;gap:12px;flex:1;">
                        <span style="font-size:20px;">⏳</span>
                        <input type="text" id="timelineEditorTitle" placeholder="事件名称" style="font-size:18px;font-weight:600;border:none;background:transparent;outline:none;flex:1;color:var(--text-color, #333);">
                    </div>
                    <div style="display:flex;gap:8px;">
                        <button id="timelinePinBtn" title="收起为侧边栏" style="padding:6px 12px;background:#6c757d;color:white;border:none;border-radius:6px;cursor:pointer;font-size:13px;">
                            <img src="icons/label.svg" width="14" height="14" alt="缩起" style="vertical-align:middle; margin-right:4px;"> 缩起
                        </button>
                        <button id="timelineSaveBtn" style="padding:6px 16px;background:#9b784e;color:white;border:none;border-radius:6px;cursor:pointer;">
                            <img src="icons/toolbar.svg" width="14" height="14" alt="保存" style="vertical-align:middle; margin-right:4px;"> 保存
                        </button>
                        <button id="timelineDeleteBtn" style="padding:6px 16px;background:#dc3545;color:white;border:none;border-radius:6px;cursor:pointer;">
                            <img src="icons/trash.svg" width="14" height="14" alt="删除" style="vertical-align:middle; margin-right:4px;"> 删除
                        </button>
                    </div>
                </div>
                <div id="timelineDateRow" style="display:flex;align-items:center;gap:8px;padding:8px 20px;border-bottom:1px solid var(--border-color, rgba(0,0,0,0.05));flex-shrink:0;">
                    <span style="font-size:13px;color:#888;">📅 日期：</span>
                    <input type="text" id="timelineEditorDate" placeholder="如：太古历1000年" style="flex:1;padding:4px 8px;border:1px solid var(--border-color, #ddd);border-radius:4px;background:transparent;color:var(--text-color, #333);font-size:13px;">
                </div>
                <textarea id="timelineEditorContent" style="flex:1;padding:20px;border:none;outline:none;resize:none;font-size:14px;line-height:1.8;background:transparent;color:var(--text-color, #333);font-family:inherit;" placeholder="事件描述..."></textarea>
                <div class="timeline-status-bar" style="padding:8px 20px;border-top:1px solid var(--border-color, rgba(0,0,0,0.08));display:flex;justify-content:space-between;font-size:12px;color:#888;flex-shrink:0;">
                    <span id="timelineWordCount">0 字</span>
                    <span id="timelineStatus">已就绪</span>
                </div>
            </div>
        </div>
    `;
}

function initTimelineEvents() {
    var closeBtn = document.getElementById('timelineCloseBtn');
    if (closeBtn) closeBtn.onclick = closeTimelinePanel;
    var saveBtn = document.getElementById('timelineSaveBtn');
    if (saveBtn) saveBtn.onclick = saveTimelineNode;
    var deleteBtn = document.getElementById('timelineDeleteBtn');
    if (deleteBtn) deleteBtn.onclick = deleteTimelineNode;
    var addRootBtn = document.getElementById('timelineAddRootBtn');
    if (addRootBtn) addRootBtn.onclick = addTimelineRoot;
    var refreshBtn = document.getElementById('timelineRefreshBtn');
    if (refreshBtn) {
        refreshBtn.onclick = function() {
            getTimelineData();
            renderTimelineTree();
            updateTimelineEditor();
            renderCompactTimelineTree();
            updateCompactTimelineEditor();
        };
    }
    var searchInput = document.getElementById('timelineSearchInput');
    if (searchInput) {
        searchInput.oninput = function() {
            var keyword = this.value.trim().toLowerCase();
            var container = document.getElementById('timelineTree');
            if (!keyword) { renderTimelineTree(); return; }
            var items = container.querySelectorAll('.timeline-tree-header');
            items.forEach(function(item) {
                var id = item.getAttribute('data-id');
                var node = getTimelineNode(id);
                if (node && (node.name.toLowerCase().indexOf(keyword) !== -1 || (node.content && node.content.toLowerCase().indexOf(keyword) !== -1) || (node.date && node.date.toLowerCase().indexOf(keyword) !== -1))) {
                    item.style.background = 'rgba(255,193,7,0.3)';
                } else {
                    if (timelineData.selectedId === id) {
                        item.style.background = 'rgba(0,122,255,0.12)';
                    } else {
                        item.style.background = '';
                    }
                }
            });
        };
    }
    var pinBtn = document.getElementById('timelinePinBtn');
    if (pinBtn) {
        pinBtn.onclick = function() {
            closeTimelinePanel();
            setTimeout(function() {
                openTimelineSidebar('timeline');
            }, 150);
        };
    }
    var addEventBtn = document.getElementById('timelineAddEventBtn');
    if (addEventBtn) {
        addEventBtn.onclick = function() {
            if (timelineData.selectedId) {
                var parent = getTimelineNode(timelineData.selectedId);
                if (parent) {
                    var children = getTimelineChildren(timelineData.selectedId);
                    var newNumber = children.length + 1;
                    var defaultName = '事件 ' + newNumber;
                    var newNode = {
                        id: genTimelineId(),
                        parentId: timelineData.selectedId,
                        type: 'event',
                        name: defaultName,
                        date: '',
                        order: children.length,
                        content: '事件描述...'
                    };
                    timelineData.nodes.push(newNode);
                    timelineData.selectedId = newNode.id;
                    localStorage.setItem('timeline_expanded_' + timelineData.selectedId, 'true');
                    saveTimelineData();
                    renderTimelineTree();
                    updateTimelineEditor();
                    renderCompactTimelineTree();
                    updateCompactTimelineEditor();
                }
            } else {
                var roots = timelineData.nodes.filter(function(n) { return n.parentId === null; });
                var newNumber = roots.length + 1;
                var defaultName = '📜 时代 ' + newNumber;
                var newNode = {
                    id: genTimelineId(),
                    parentId: null,
                    type: 'folder',
                    name: defaultName,
                    date: '',
                    order: roots.length,
                    content: '时代描述...'
                };
                timelineData.nodes.push(newNode);
                timelineData.selectedId = newNode.id;
                saveTimelineData();
                renderTimelineTree();
                updateTimelineEditor();
                renderCompactTimelineTree();
                updateCompactTimelineEditor();
            }
        };
    }
    var addFolderBtn = document.getElementById('timelineAddFolderBtn');
    if (addFolderBtn) {
        addFolderBtn.onclick = function() {
            if (timelineData.selectedId) {
                var parent = getTimelineNode(timelineData.selectedId);
                if (parent) {
                    var children = getTimelineChildren(timelineData.selectedId);
                    var newNumber = children.length + 1;
                    var defaultName = '📁 分类 ' + newNumber;
                    var newNode = {
                        id: genTimelineId(),
                        parentId: timelineData.selectedId,
                        type: 'folder',
                        name: defaultName,
                        date: '',
                        order: children.length,
                        content: '分类说明'
                    };
                    timelineData.nodes.push(newNode);
                    timelineData.selectedId = newNode.id;
                    localStorage.setItem('timeline_expanded_' + timelineData.selectedId, 'true');
                    saveTimelineData();
                    renderTimelineTree();
                    updateTimelineEditor();
                    renderCompactTimelineTree();
                    updateCompactTimelineEditor();
                }
            } else {
                var roots = timelineData.nodes.filter(function(n) { return n.parentId === null; });
                var newNumber = roots.length + 1;
                var defaultName = '📁 分类 ' + newNumber;
                var newNode = {
                    id: genTimelineId(),
                    parentId: null,
                    type: 'folder',
                    name: defaultName,
                    date: '',
                    order: roots.length,
                    content: '分类说明'
                };
                timelineData.nodes.push(newNode);
                timelineData.selectedId = newNode.id;
                saveTimelineData();
                renderTimelineTree();
                updateTimelineEditor();
                renderCompactTimelineTree();
                updateCompactTimelineEditor();
            }
        };
    }
    var contentArea = document.getElementById('timelineEditorContent');
    var titleInput = document.getElementById('timelineEditorTitle');
    var dateInput = document.getElementById('timelineEditorDate');
    var saveTimer = null;
    if (contentArea) {
        contentArea.oninput = function() {
            var node = getTimelineNode(timelineData.selectedId);
            if (node) {
                node.content = this.value;
                document.getElementById('timelineWordCount').textContent = this.value.length + ' 字';
                document.getElementById('timelineStatus').textContent = '✏️ 未保存';
                clearTimeout(saveTimer);
                saveTimer = setTimeout(function() {
                    saveTimelineData();
                    document.getElementById('timelineStatus').textContent = '✅ 已保存';
                    setTimeout(function() {
                        document.getElementById('timelineStatus').textContent = '已保存';
                    }, 1000);
                }, 500);
            }
        };
    }
    if (titleInput) {
        titleInput.oninput = function() {
            var node = getTimelineNode(timelineData.selectedId);
            if (node && this.value.trim()) {
                node.name = this.value.trim();
                saveTimelineData();
                renderTimelineTree();
                renderCompactTimelineTree();
            }
        };
    }
    if (dateInput) {
        dateInput.oninput = function() {
            var node = getTimelineNode(timelineData.selectedId);
            if (node && node.type === 'event') {
                node.date = this.value.trim();
                saveTimelineData();
                renderTimelineTree();
                renderCompactTimelineTree();
            }
        };
    }
    var handle = document.getElementById('timelineResizeHandle');
    var sidebar = document.querySelector('.timeline-sidebar');
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
    updateTimelineNodeCount();
}

function updateTimelineNodeCount() {
    var count = timelineData.nodes.length;
    var el = document.getElementById('timelineNodeCount');
    if (el) el.textContent = count;
}

// ====================================================================
// ========== 浮动面板（紧凑模式） ==========
// ====================================================================

function openTimelineSidebar(tool) {
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
        panel.innerHTML = renderCompactTimelinePanel();
        var editor = document.querySelector('.detail-editor');
        if (editor && editor.nextSibling) {
            detailMain.insertBefore(panel, editor.nextSibling);
        } else {
            detailMain.appendChild(panel);
        }
        getTimelineData();
        renderCompactTimelineTree();
        updateCompactTimelineEditor();
        bindCompactTimelineEvents();
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

function closeTimelineFloatingPanel() {
    var panel = document.getElementById('floatingToolPanel');
    if (panel) { panel.remove(); }
    var rightSidebar = document.getElementById('rightSidebar');
    if (rightSidebar) {
        rightSidebar.style.width = '48px';
        rightSidebar.style.minWidth = '48px';
    }
}

function renderCompactTimelinePanel() {
    return `
        <div style="display:flex;flex-direction:column;height:100%;width:100%;">
            <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 14px;border-bottom:1px solid var(--border-color, rgba(0,0,0,0.08));flex-shrink:0;">
                <span style="font-weight:600;font-size:14px;">⏱️ 时间线</span>
                <div style="display:flex;gap:4px;">
                    <button id="compactTimelineExpandBtn" title="新窗口打开" style="background:none;border:none;cursor:pointer;font-size:14px;padding:2px 8px;border-radius:4px;">⤢</button>
                    <button id="compactTimelineCloseBtn" title="关闭面板" style="background:none;border:none;cursor:pointer;font-size:14px;padding:2px 8px;border-radius:4px;">✕</button>
                </div>
            </div>
            <div style="display:flex;flex:1;overflow:hidden;">
                <div style="width:38%;min-width:120px;max-width:180px;border-right:1px solid var(--border-color, rgba(0,0,0,0.08));display:flex;flex-direction:column;overflow:hidden;">
                    <div style="padding:4px 8px;flex-shrink:0;">
                        <input type="text" id="compactTimelineSearch" placeholder="搜索..." style="width:100%;padding:6px 10px 6px 32px;border:1px solid var(--border-color, #ddd);border-radius:6px;font-size:12px;background:var(--input-bg, #f8f8f8) url('icons/search.svg') no-repeat 8px center;background-size:16px 16px;color:var(--text-color, #333);">
                    </div>
                    <div style="display:flex;gap:6px;padding:4px 8px 6px 8px;flex-shrink:0;">
                        <button id="compactTimelineAddBtn" title="新增事件" style="flex:1;background:#28a745;color:white;border:none;border-radius:4px;cursor:pointer;font-size:12px;padding:4px 0;font-weight:500;">➕ 事件</button>
                        <button id="compactTimelineAddFolderBtn" title="新增分类" style="flex:1;background:#9b784e;color:white;border:none;border-radius:4px;cursor:pointer;font-size:12px;padding:4px 0;font-weight:500;">📁 分类</button>
                    </div>
                    <div id="compactTimelineTree" style="flex:1;overflow-y:auto;padding:4px 4px;"></div>
                    <div style="padding:3px 10px;border-top:1px solid var(--border-color, rgba(0,0,0,0.08));font-size:10px;color:#888;flex-shrink:0;display:flex;justify-content:space-between;">
                        <span>事件: <span id="compactTimelineNodeCount">0</span></span>
                        <span>📌 点击选择</span>
                    </div>
                </div>
                <div style="flex:1;display:flex;flex-direction:column;overflow:hidden;min-width:150px;">
                    <div style="padding:6px 12px;border-bottom:1px solid var(--border-color, rgba(0,0,0,0.08));flex-shrink:0;display:flex;gap:6px;align-items:center;">
                        <input type="text" id="compactTimelineTitle" placeholder="事件名称" style="flex:1;font-size:15px;font-weight:600;border:none;background:transparent;outline:none;color:var(--text-color, #333);">
                        <button id="compactTimelineSaveBtn" title="保存" style="background:#9b784e;color:white;border:none;border-radius:4px;cursor:pointer;font-size:11px;padding:2px 10px;">💾</button>
                    </div>
                    <div style="padding:2px 12px;border-bottom:1px solid var(--border-color, rgba(0,0,0,0.05));flex-shrink:0;display:flex;align-items:center;gap:6px;">
                        <span style="font-size:11px;color:#888;">📅</span>
                        <input type="text" id="compactTimelineDate" placeholder="日期" style="flex:1;padding:2px 6px;border:1px solid var(--border-color, #ddd);border-radius:4px;font-size:12px;background:transparent;color:var(--text-color, #333);">
                    </div>
                    <textarea id="compactTimelineContent" style="flex:1;padding:10px 12px;border:none;outline:none;resize:none;font-size:13px;line-height:1.8;background:transparent;color:var(--text-color, #333);font-family:inherit;" placeholder="事件描述..."></textarea>
                    <div style="padding:3px 12px;border-top:1px solid var(--border-color, rgba(0,0,0,0.08));font-size:10px;color:#888;display:flex;justify-content:space-between;flex-shrink:0;">
                        <span id="compactTimelineWordCount">0 字</span>
                        <span id="compactTimelineStatus">已就绪</span>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function renderCompactTimelineTree() {
    var container = document.getElementById('compactTimelineTree');
    if (!container) return;
    container.innerHTML = '';
    var roots = timelineData.nodes.filter(function(n) { return n.parentId === null; }).sort(function(a, b) { return (a.order || 0) - (b.order || 0); });
    if (roots.length === 0) {
        container.innerHTML = '<div style="padding:12px;text-align:center;color:#888;font-size:12px;">暂无时间线节点</div>';
        return;
    }
    roots.forEach(function(root) {
        container.appendChild(createCompactTimelineNode(root, 0));
    });
    var countEl = document.getElementById('compactTimelineNodeCount');
    if (countEl) countEl.textContent = timelineData.nodes.length;
}

function createCompactTimelineNode(node, depth) {
    var div = document.createElement('div');
    div.className = 'compact-timeline-node';
    div.setAttribute('data-id', node.id);
    div.style.marginBottom = '1px';
    var header = document.createElement('div');
    header.className = 'compact-timeline-header';
    header.style.cssText = 'display:flex;align-items:center;gap:4px;padding:3px 6px;border-radius:4px;cursor:pointer;transition:background 0.15s;padding-left:' + (depth * 12 + 4) + 'px;font-size:12px;';
    if (timelineData.selectedId === node.id) {
        header.style.background = 'rgba(0,122,255,0.12)';
        header.style.fontWeight = '500';
    }
    header.setAttribute('data-id', node.id);
    var hasChildren = getTimelineChildren(node.id).length > 0;
    var toggle = document.createElement('span');
    toggle.style.cssText = 'font-size:8px;width:12px;text-align:center;cursor:pointer;color:#888;flex-shrink:0;';
    if (hasChildren) {
        var isExpanded = localStorage.getItem('timeline_expanded_' + node.id) !== 'false';
        toggle.textContent = isExpanded ? '▾' : '▸';
        toggle.onclick = function(e) {
            e.stopPropagation();
            var current = localStorage.getItem('timeline_expanded_' + node.id);
            var newState = current === 'false' ? 'true' : 'false';
            localStorage.setItem('timeline_expanded_' + node.id, newState);
            renderCompactTimelineTree();
        };
    } else {
        toggle.textContent = '·';
        toggle.style.color = '#ccc';
    }
    header.appendChild(toggle);
    var icon = document.createElement('span');
    icon.style.fontSize = '12px';
    icon.style.flexShrink = '0';
    icon.textContent = node.type === 'folder' ? '📁' : '⏳';
    header.appendChild(icon);
    var nameSpan = document.createElement('span');
    nameSpan.style.cssText = 'flex:1;font-size:12px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--text-color, #333);';
    nameSpan.textContent = node.name || '未命名';
    header.appendChild(nameSpan);
    if (node.type === 'event' && node.date) {
        var dateSpan = document.createElement('span');
        dateSpan.style.cssText = 'font-size:9px;color:#888;flex-shrink:0;margin-left:4px;';
        dateSpan.textContent = '📅' + node.date;
        header.appendChild(dateSpan);
    }
    header.onclick = function(e) {
        if (e.target === toggle) return;
        timelineData.selectedId = node.id;
        saveTimelineData();
        renderCompactTimelineTree();
        updateCompactTimelineEditor();
        if (document.getElementById('timelineTree')) {
            renderTimelineTree();
            updateTimelineEditor();
        }
    };
    div.appendChild(header);
    var children = getTimelineChildren(node.id);
    if (children.length > 0) {
        var childrenDiv = document.createElement('div');
        childrenDiv.className = 'compact-timeline-children';
        var isExpanded = localStorage.getItem('timeline_expanded_' + node.id) !== 'false';
        childrenDiv.style.display = isExpanded ? 'block' : 'none';
        children.forEach(function(child) {
            childrenDiv.appendChild(createCompactTimelineNode(child, depth + 1));
        });
        div.appendChild(childrenDiv);
    }
    return div;
}

function updateCompactTimelineEditor() {
    var node = getTimelineNode(timelineData.selectedId);
    var titleInput = document.getElementById('compactTimelineTitle');
    var dateInput = document.getElementById('compactTimelineDate');
    var contentArea = document.getElementById('compactTimelineContent');
    var wordCount = document.getElementById('compactTimelineWordCount');
    var statusEl = document.getElementById('compactTimelineStatus');
    if (node) {
        if (titleInput) titleInput.value = node.name || '';
        if (dateInput) dateInput.value = node.date || '';
        if (contentArea) contentArea.value = node.content || '';
        if (wordCount) wordCount.textContent = (node.content || '').length + ' 字';
        if (statusEl) statusEl.textContent = '已选择：' + node.name;
    } else {
        if (titleInput) titleInput.value = '';
        if (dateInput) dateInput.value = '';
        if (contentArea) contentArea.value = '';
        if (wordCount) wordCount.textContent = '0 字';
        if (statusEl) statusEl.textContent = '请选择一个节点';
    }
}

function bindCompactTimelineEvents() {
    var addBtn = document.getElementById('compactTimelineAddBtn');
    if (addBtn) {
        addBtn.onclick = function() {
            if (timelineData.selectedId) {
                var parent = getTimelineNode(timelineData.selectedId);
                if (parent) {
                    var children = getTimelineChildren(timelineData.selectedId);
                    var newNumber = children.length + 1;
                    var defaultName = '事件 ' + newNumber;
                    var newNode = {
                        id: genTimelineId(),
                        parentId: timelineData.selectedId,
                        type: 'event',
                        name: defaultName,
                        date: '',
                        order: children.length,
                        content: '事件描述...'
                    };
                    timelineData.nodes.push(newNode);
                    timelineData.selectedId = newNode.id;
                    localStorage.setItem('timeline_expanded_' + timelineData.selectedId, 'true');
                    saveTimelineData();
                    renderTimelineTree();
                    updateTimelineEditor();
                    renderCompactTimelineTree();
                    updateCompactTimelineEditor();
                }
            } else {
                var roots = timelineData.nodes.filter(function(n) { return n.parentId === null; });
                var newNumber = roots.length + 1;
                var defaultName = '📜 时代 ' + newNumber;
                var newNode = {
                    id: genTimelineId(),
                    parentId: null,
                    type: 'folder',
                    name: defaultName,
                    date: '',
                    order: roots.length,
                    content: '时代描述...'
                };
                timelineData.nodes.push(newNode);
                timelineData.selectedId = newNode.id;
                saveTimelineData();
                renderTimelineTree();
                updateTimelineEditor();
                renderCompactTimelineTree();
                updateCompactTimelineEditor();
            }
        };
    }
    var addFolderBtn = document.getElementById('compactTimelineAddFolderBtn');
    if (addFolderBtn) {
        addFolderBtn.onclick = function() {
            if (timelineData.selectedId) {
                var parent = getTimelineNode(timelineData.selectedId);
                if (parent) {
                    var children = getTimelineChildren(timelineData.selectedId);
                    var newNumber = children.length + 1;
                    var defaultName = '📁 分类 ' + newNumber;
                    var newNode = {
                        id: genTimelineId(),
                        parentId: timelineData.selectedId,
                        type: 'folder',
                        name: defaultName,
                        date: '',
                        order: children.length,
                        content: '分类说明'
                    };
                    timelineData.nodes.push(newNode);
                    timelineData.selectedId = newNode.id;
                    localStorage.setItem('timeline_expanded_' + timelineData.selectedId, 'true');
                    saveTimelineData();
                    renderTimelineTree();
                    updateTimelineEditor();
                    renderCompactTimelineTree();
                    updateCompactTimelineEditor();
                }
            } else {
                var roots = timelineData.nodes.filter(function(n) { return n.parentId === null; });
                var newNumber = roots.length + 1;
                var defaultName = '📁 分类 ' + newNumber;
                var newNode = {
                    id: genTimelineId(),
                    parentId: null,
                    type: 'folder',
                    name: defaultName,
                    date: '',
                    order: roots.length,
                    content: '分类说明'
                };
                timelineData.nodes.push(newNode);
                timelineData.selectedId = newNode.id;
                saveTimelineData();
                renderTimelineTree();
                updateTimelineEditor();
                renderCompactTimelineTree();
                updateCompactTimelineEditor();
            }
        };
    }
    var expandBtn = document.getElementById('compactTimelineExpandBtn');
    if (expandBtn) {
        expandBtn.onclick = function() {
            openTimelineInNewWindow();
        };
    }
    var closeBtn = document.getElementById('compactTimelineCloseBtn');
    if (closeBtn) {
        closeBtn.onclick = function() {
            closeTimelineFloatingPanel();
            var rightSidebar = document.getElementById('rightSidebar');
            if (rightSidebar) {
                rightSidebar.style.width = '48px';
                rightSidebar.style.minWidth = '48px';
            }
        };
    }
    var saveBtn = document.getElementById('compactTimelineSaveBtn');
    if (saveBtn) {
        saveBtn.onclick = function() {
            var node = getTimelineNode(timelineData.selectedId);
            if (!node) { alert('请先选择一个节点'); return; }
            var title = document.getElementById('compactTimelineTitle').value.trim();
            var date = document.getElementById('compactTimelineDate').value.trim();
            var content = document.getElementById('compactTimelineContent').value;
            if (title) node.name = title;
            if (node.type === 'event') node.date = date;
            node.content = content;
            saveTimelineData();
            renderTimelineTree();
            updateTimelineEditor();
            renderCompactTimelineTree();
            updateCompactTimelineEditor();
            document.getElementById('compactTimelineStatus').textContent = '✅ 已保存';
            setTimeout(function() {
                document.getElementById('compactTimelineStatus').textContent = '已就绪';
            }, 1500);
        };
    }
    var searchInput = document.getElementById('compactTimelineSearch');
    if (searchInput) {
        searchInput.oninput = function() {
            var keyword = this.value.trim().toLowerCase();
            var container = document.getElementById('compactTimelineTree');
            if (!keyword) { renderCompactTimelineTree(); return; }
            var items = container.querySelectorAll('.compact-timeline-header');
            items.forEach(function(item) {
                var id = item.getAttribute('data-id');
                var node = getTimelineNode(id);
                if (node && (node.name.toLowerCase().indexOf(keyword) !== -1 || (node.content && node.content.toLowerCase().indexOf(keyword) !== -1) || (node.date && node.date.toLowerCase().indexOf(keyword) !== -1))) {
                    item.style.background = 'rgba(255,193,7,0.3)';
                } else {
                    if (timelineData.selectedId === id) {
                        item.style.background = 'rgba(0,122,255,0.12)';
                    } else {
                        item.style.background = '';
                    }
                }
            });
        };
    }
    var titleInput = document.getElementById('compactTimelineTitle');
    var dateInput = document.getElementById('compactTimelineDate');
    var contentArea = document.getElementById('compactTimelineContent');
    var saveTimer = null;
    if (contentArea) {
        contentArea.oninput = function() {
            var node = getTimelineNode(timelineData.selectedId);
            if (node) {
                node.content = this.value;
                document.getElementById('compactTimelineWordCount').textContent = this.value.length + ' 字';
                document.getElementById('compactTimelineStatus').textContent = '✏️ 未保存';
                clearTimeout(saveTimer);
                saveTimer = setTimeout(function() {
                    saveTimelineData();
                    document.getElementById('compactTimelineStatus').textContent = '✅ 已保存';
                    setTimeout(function() {
                        document.getElementById('compactTimelineStatus').textContent = '已就绪';
                    }, 1000);
                }, 500);
            }
        };
    }
    if (titleInput) {
        titleInput.oninput = function() {
            var node = getTimelineNode(timelineData.selectedId);
            if (node && this.value.trim()) {
                node.name = this.value.trim();
                saveTimelineData();
                renderCompactTimelineTree();
            }
        };
    }
    if (dateInput) {
        dateInput.oninput = function() {
            var node = getTimelineNode(timelineData.selectedId);
            if (node && node.type === 'event') {
                node.date = this.value.trim();
                saveTimelineData();
                renderCompactTimelineTree();
            }
        };
    }
}

// ========== 新窗口打开 ==========

function openTimelineInNewWindow() {
    closeTimelineFloatingPanel();
    
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
    
    getTimelineData();
    var dataJson = JSON.stringify(timelineData);
    var bookId = currentBookId || 'global';
    var selectedId = timelineData.selectedId ? JSON.stringify(timelineData.selectedId) : 'null';
    
    var jsCode = `
function getTimelineChildren(parentId) {
    return timelineData.nodes.filter(function(n) { return n.parentId === parentId; }).sort(function(a,b) { return (a.order||0)-(b.order||0); });
}
function getTimelineNode(id) {
    return timelineData.nodes.find(function(n) { return n.id === id; });
}
function saveTimelineData() {
    var key = 'openwrite_timeline_' + (currentBookId || 'global');
    var data = { nodes: timelineData.nodes, selectedId: selectedId, nextId: timelineData.nextId || 100 };
    localStorage.setItem(key, JSON.stringify(data));
    if (window.opener && window.opener.window) {
        try { window.opener.window.location.reload(); } catch(e) {}
    }
}
function selectNode(id) { selectedId = id; renderTree(); updateEditor(); saveTimelineData(); }
function renderTree() {
    var container = document.getElementById('timelineTree');
    if (!container) return;
    container.innerHTML = '';
    var roots = timelineData.nodes.filter(function(n) { return n.parentId === null; }).sort(function(a,b) { return (a.order||0)-(b.order||0); });
    if (roots.length === 0) { container.innerHTML = '<div style="padding:20px;text-align:center;color:#888;font-size:13px;">暂无时间线节点</div>'; return; }
    roots.forEach(function(root) { container.appendChild(createNodeElement(root, 0)); });
    document.getElementById('winNodeCount').textContent = timelineData.nodes.length;
}
function createNodeElement(node, depth) {
    var div = document.createElement('div');
    div.className = 'timeline-tree-node';
    div.setAttribute('data-id', node.id);
    var header = document.createElement('div');
    header.className = 'timeline-tree-header';
    if (selectedId === node.id) header.classList.add('active');
    header.style.paddingLeft = (depth * 16 + 8) + 'px';
    header.setAttribute('data-id', node.id);
    var hasChildren = getTimelineChildren(node.id).length > 0;
    var toggle = document.createElement('span');
    toggle.className = 'toggle';
    if (hasChildren) {
        var isExpanded = localStorage.getItem('timeline_expanded_' + node.id) !== 'false';
        toggle.textContent = isExpanded ? '▾' : '▸';
        toggle.onclick = function(e) { e.stopPropagation();
            var current = localStorage.getItem('timeline_expanded_' + node.id);
            var newState = current === 'false' ? 'true' : 'false';
            localStorage.setItem('timeline_expanded_' + node.id, newState);
            renderTree();
        };
    } else { toggle.textContent = '·'; toggle.style.color = '#ccc'; }
    header.appendChild(toggle);
    var icon = document.createElement('span');
    icon.className = 'icon';
    icon.textContent = node.type === 'folder' ? '📁' : '⏳';
    header.appendChild(icon);
    var nameSpan = document.createElement('span');
    nameSpan.className = 'name';
    nameSpan.textContent = node.name || '未命名';
    header.appendChild(nameSpan);
    if (node.type === 'event' && node.date) {
        var dateSpan = document.createElement('span');
        dateSpan.className = 'date-tag';
        dateSpan.textContent = '📅 ' + node.date;
        header.appendChild(dateSpan);
    }
    header.onclick = function(e) { if (e.target === toggle) return; selectNode(node.id); };
    header.ondblclick = function(e) { e.stopPropagation(); var newName = prompt('重命名：', node.name); if (newName && newName.trim()) { node.name = newName.trim(); saveTimelineData(); renderTree(); updateEditor(); } };
    header.oncontextmenu = function(e) { e.preventDefault(); e.stopPropagation();
        var menu = document.createElement('div');
        menu.style.cssText = 'position:fixed;background:#fff;border-radius:8px;padding:4px 0;box-shadow:0 2px 12px rgba(0,0,0,0.15);z-index:10000;min-width:120px;';
        menu.style.left = Math.min(e.clientX, window.innerWidth - 140) + 'px';
        menu.style.top = Math.min(e.clientY, window.innerHeight - 120) + 'px';
        var isRoot = node.parentId === null;
        menu.innerHTML =
            '<button data-action="addEvent" style="display:block;width:100%;padding:6px 14px;border:none;background:none;cursor:pointer;text-align:left;font-size:12px;">➕ 新增事件</button>' +
            '<button data-action="addFolder" style="display:block;width:100%;padding:6px 14px;border:none;background:none;cursor:pointer;text-align:left;font-size:12px;">📁 新增分类</button>' +
            '<button data-action="rename" style="display:block;width:100%;padding:6px 14px;border:none;background:none;cursor:pointer;text-align:left;font-size:12px;">✏️ 重命名</button>' +
            (node.type === 'event' ? '<button data-action="date" style="display:block;width:100%;padding:6px 14px;border:none;background:none;cursor:pointer;text-align:left;font-size:12px;">📅 修改日期</button>' : '') +
            (timelineData.nodes.filter(function(n) { return n.parentId === null; }).length > 1 || !isRoot ?
                '<button data-action="delete" style="display:block;width:100%;padding:6px 14px;border:none;background:none;cursor:pointer;text-align:left;font-size:12px;color:#dc3545;">🗑 删除</button>' : '');
        document.body.appendChild(menu);
        menu.querySelectorAll('button').forEach(function(btn) {
            btn.onclick = function() {
                var action = this.getAttribute('data-action');
                if (action === 'addEvent') {
                    var name = prompt('请输入事件名称：', '新事件');
                    if (name && name.trim()) {
                        var date = prompt('请输入事件日期：', '');
                        var children = getTimelineChildren(node.id);
                        var newNode = { id: 'evt_' + (timelineData.nextId || 100), parentId: node.id, type: 'event', name: name.trim(), date: date || '', order: children.length, content: '事件描述...' };
                        timelineData.nextId = (timelineData.nextId || 100) + 1;
                        timelineData.nodes.push(newNode);
                        selectedId = newNode.id;
                        localStorage.setItem('timeline_expanded_' + node.id, 'true');
                        saveTimelineData();
                        renderTree();
                        updateEditor();
                    }
                } else if (action === 'addFolder') {
                    var name = prompt('请输入新分类名称：', '新分类');
                    if (name && name.trim()) {
                        var date = prompt('请输入时间范围：', '');
                        var children = getTimelineChildren(node.id);
                        var newNode = { id: 'evt_' + (timelineData.nextId || 100), parentId: node.id, type: 'folder', name: name.trim(), date: date || '', order: children.length, content: '分类说明' };
                        timelineData.nextId = (timelineData.nextId || 100) + 1;
                        timelineData.nodes.push(newNode);
                        selectedId = newNode.id;
                        localStorage.setItem('timeline_expanded_' + node.id, 'true');
                        saveTimelineData();
                        renderTree();
                        updateEditor();
                    }
                } else if (action === 'rename') {
                    var newName = prompt('重命名：', node.name);
                    if (newName && newName.trim()) { node.name = newName.trim(); saveTimelineData(); renderTree(); updateEditor(); }
                } else if (action === 'date' && node.type === 'event') {
                    var newDate = prompt('请输入事件日期：', node.date || '');
                    if (newDate !== null) { node.date = newDate; saveTimelineData(); renderTree(); updateEditor(); }
                } else if (action === 'delete') {
                    if (confirm('确定删除「' + node.name + '」及其所有子项吗？')) {
                        var toDelete = [node.id];
                        function collectChildren(pid) {
                            timelineData.nodes.filter(function(n) { return n.parentId === pid; }).forEach(function(child) {
                                toDelete.push(child.id);
                                collectChildren(child.id);
                            });
                        }
                        collectChildren(node.id);
                        timelineData.nodes = timelineData.nodes.filter(function(n) { return toDelete.indexOf(n.id) === -1; });
                        var siblings = getTimelineChildren(node.parentId);
                        siblings.forEach(function(s, idx) { s.order = idx; });
                        selectedId = timelineData.nodes.length > 0 ? timelineData.nodes[0].id : null;
                        saveTimelineData();
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
    var children = getTimelineChildren(node.id);
    if (children.length > 0) {
        var childrenDiv = document.createElement('div');
        childrenDiv.className = 'timeline-tree-children';
        var isExpanded = localStorage.getItem('timeline_expanded_' + node.id) !== 'false';
        childrenDiv.style.display = isExpanded ? 'block' : 'none';
        children.forEach(function(child) { childrenDiv.appendChild(createNodeElement(child, depth + 1)); });
        div.appendChild(childrenDiv);
    }
    return div;
}
function updateEditor() {
    var node = getTimelineNode(selectedId);
    var titleInput = document.getElementById('winTitle');
    var dateInput = document.getElementById('winDate');
    var contentArea = document.getElementById('winContent');
    var wordCount = document.getElementById('winWordCount');
    var statusEl = document.getElementById('winStatus');
    var deleteBtn = document.getElementById('winDelete');
    var dateRow = document.querySelector('.timeline-date-row');
    if (node) {
        titleInput.value = node.name || '';
        dateInput.value = node.date || '';
        contentArea.value = node.content || '';
        wordCount.textContent = (node.content || '').length + ' 字';
        statusEl.textContent = '已选择：' + node.name;
        deleteBtn.style.display = 'inline-block';
        if (dateRow) dateRow.style.display = 'flex';
    } else {
        titleInput.value = '';
        dateInput.value = '';
        contentArea.value = '';
        wordCount.textContent = '0 字';
        statusEl.textContent = '请选择一个节点';
        deleteBtn.style.display = 'none';
        if (dateRow) dateRow.style.display = 'none';
    }
}
function saveNode() {
    var node = getTimelineNode(selectedId);
    if (!node) { alert('请先选择一个节点'); return; }
    var title = document.getElementById('winTitle').value.trim();
    var date = document.getElementById('winDate').value.trim();
    var content = document.getElementById('winContent').value;
    if (title) node.name = title;
    if (node.type === 'event') node.date = date;
    node.content = content;
    saveTimelineData();
    renderTree();
    updateEditor();
    document.getElementById('winStatus').textContent = '✅ 已保存';
    setTimeout(function() { document.getElementById('winStatus').textContent = '已保存'; }, 1500);
}
function deleteNode() {
    var node = getTimelineNode(selectedId);
    if (!node) return;
    if (timelineData.nodes.filter(function(n) { return n.parentId === null; }).length === 1 && node.parentId === null) {
        alert('至少保留一个根分类');
        return;
    }
    if (confirm('确定删除「' + node.name + '」及其所有子项吗？')) {
        var toDelete = [node.id];
        function collectChildren(pid) {
            timelineData.nodes.filter(function(n) { return n.parentId === pid; }).forEach(function(child) {
                toDelete.push(child.id);
                collectChildren(child.id);
            });
        }
        collectChildren(node.id);
        timelineData.nodes = timelineData.nodes.filter(function(n) { return toDelete.indexOf(n.id) === -1; });
        var siblings = getTimelineChildren(node.parentId);
        siblings.forEach(function(s, idx) { s.order = idx; });
        selectedId = timelineData.nodes.length > 0 ? timelineData.nodes[0].id : null;
        saveTimelineData();
        renderTree();
        updateEditor();
        alert('已删除');
    }
}
document.getElementById('winAddRoot').onclick = function() {
    var name = prompt('请输入时代名称：', '新纪元');
    if (name && name.trim()) {
        var date = prompt('请输入时间范围：', '');
        var roots = timelineData.nodes.filter(function(n) { return n.parentId === null; });
        var newNode = { id: 'evt_' + (timelineData.nextId || 100), parentId: null, type: 'folder', name: name.trim(), date: date || '', order: roots.length, content: '时代描述...' };
        timelineData.nextId = (timelineData.nextId || 100) + 1;
        timelineData.nodes.push(newNode);
        selectedId = newNode.id;
        saveTimelineData();
        renderTree();
        updateEditor();
    }
};
// ========== 独立窗口的事件和分类按钮（直接创建，无需输入） ==========
document.getElementById('winAddEventBtn').onclick = function() {
    if (selectedId) {
        var node = getTimelineNode(selectedId);
        if (node) {
            var children = getTimelineChildren(selectedId);
            var newNumber = children.length + 1;
            var defaultName = '事件 ' + newNumber;
            var newNode = {
                id: 'evt_' + (timelineData.nextId || 100),
                parentId: selectedId,
                type: 'event',
                name: defaultName,
                date: '',
                order: children.length,
                content: '事件描述...'
            };
            timelineData.nextId = (timelineData.nextId || 100) + 1;
            timelineData.nodes.push(newNode);
            selectedId = newNode.id;
            localStorage.setItem('timeline_expanded_' + selectedId, 'true');
            saveTimelineData();
            renderTree();
            updateEditor();
        }
    } else {
        var roots = timelineData.nodes.filter(function(n) { return n.parentId === null; });
        var newNumber = roots.length + 1;
        var defaultName = '📜 时代 ' + newNumber;
        var newNode = {
            id: 'evt_' + (timelineData.nextId || 100),
            parentId: null,
            type: 'folder',
            name: defaultName,
            date: '',
            order: roots.length,
            content: '时代描述...'
        };
        timelineData.nextId = (timelineData.nextId || 100) + 1;
        timelineData.nodes.push(newNode);
        selectedId = newNode.id;
        saveTimelineData();
        renderTree();
        updateEditor();
    }
};
document.getElementById('winAddFolderBtn').onclick = function() {
    if (selectedId) {
        var node = getTimelineNode(selectedId);
        if (node) {
            var children = getTimelineChildren(selectedId);
            var newNumber = children.length + 1;
            var defaultName = '📁 分类 ' + newNumber;
            var newNode = {
                id: 'evt_' + (timelineData.nextId || 100),
                parentId: selectedId,
                type: 'folder',
                name: defaultName,
                date: '',
                order: children.length,
                content: '分类说明'
            };
            timelineData.nextId = (timelineData.nextId || 100) + 1;
            timelineData.nodes.push(newNode);
            selectedId = newNode.id;
            localStorage.setItem('timeline_expanded_' + selectedId, 'true');
            saveTimelineData();
            renderTree();
            updateEditor();
        }
    } else {
        var roots = timelineData.nodes.filter(function(n) { return n.parentId === null; });
        var newNumber = roots.length + 1;
        var defaultName = '📁 分类 ' + newNumber;
        var newNode = {
            id: 'evt_' + (timelineData.nextId || 100),
            parentId: null,
            type: 'folder',
            name: defaultName,
            date: '',
            order: roots.length,
            content: '分类说明'
        };
        timelineData.nextId = (timelineData.nextId || 100) + 1;
        timelineData.nodes.push(newNode);
        selectedId = newNode.id;
        saveTimelineData();
        renderTree();
        updateEditor();
    }
};
document.getElementById('winRefresh').onclick = function() { renderTree(); updateEditor(); };
document.getElementById('winSave').onclick = saveNode;
document.getElementById('winDelete').onclick = deleteNode;
document.getElementById('winSearch').oninput = function() {
    var keyword = this.value.trim().toLowerCase();
    var container = document.getElementById('timelineTree');
    if (!keyword) { renderTree(); return; }
    var items = container.querySelectorAll('.timeline-tree-header');
    items.forEach(function(item) {
        var id = item.getAttribute('data-id');
        var node = getTimelineNode(id);
        if (node && (node.name.toLowerCase().indexOf(keyword) !== -1 || (node.content && node.content.toLowerCase().indexOf(keyword) !== -1) || (node.date && node.date.toLowerCase().indexOf(keyword) !== -1))) {
            item.style.background = 'rgba(255,193,7,0.3)';
        } else {
            if (selectedId === id) { item.style.background = 'rgba(0,122,255,0.12)'; }
            else { item.style.background = ''; }
        }
    });
};
var saveTimer = null;
document.getElementById('winContent').oninput = function() {
    var node = getTimelineNode(selectedId);
    if (node) {
        node.content = this.value;
        document.getElementById('winWordCount').textContent = this.value.length + ' 字';
        document.getElementById('winStatus').textContent = '✏️ 未保存';
        clearTimeout(saveTimer);
        saveTimer = setTimeout(function() {
            saveTimelineData();
            document.getElementById('winStatus').textContent = '✅ 已保存';
            setTimeout(function() { document.getElementById('winStatus').textContent = '已保存'; }, 1000);
        }, 500);
    }
};
document.getElementById('winTitle').oninput = function() {
    var node = getTimelineNode(selectedId);
    if (node && this.value.trim()) {
        node.name = this.value.trim();
        saveTimelineData();
        renderTree();
    }
};
document.getElementById('winDate').oninput = function() {
    var node = getTimelineNode(selectedId);
    if (node && node.type === 'event') {
        node.date = this.value.trim();
        saveTimelineData();
        renderTree();
    }
};
document.addEventListener('keydown', function(e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); saveNode(); }
});
renderTree();
updateEditor();
console.log('时间线窗口已打开');
`;
    
    var html = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>⏱️ 时间线 - 全屏编辑</title>
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
        .timeline-container { position:relative; z-index:1; }
        ` : ''}
        .timeline-container { display:flex; height:100vh; width:100%; ${isOpen ? 'gap:12px;padding:12px;' : ''} }
        .timeline-sidebar { width:300px; min-width:220px; max-width:450px; background:${hasCustomBg ? 'rgba(0,0,0,0.5)' : c.panel}; backdrop-filter:blur(20px); border-right:1px solid ${c.border}; display:flex; flex-direction:column; flex-shrink:0; overflow:hidden; ${isOpen ? 'border-radius:20px;border:1px solid rgba(255,255,255,0.15);margin:0;' : ''} }
        ${hasCustomBg && isDark ? `
        .timeline-sidebar { background:rgba(0,0,0,0.6); }
        .timeline-editor { background:rgba(0,0,0,0.5); }
        ` : ''}
        .timeline-sidebar-header { display:flex; justify-content:space-between; align-items:center; padding:12px 16px; background:${c.headerBg}; border-bottom:1px solid ${c.border}; flex-shrink:0; }
        .timeline-sidebar-header span { font-weight:600; font-size:15px; color:${c.text}; }
        .timeline-sidebar-header button { background:none; border:none; cursor:pointer; font-size:16px; padding:0 4px; color:${c.textSecondary}; }
        .timeline-search { padding:8px 12px; flex-shrink:0; }
        .timeline-search input { width:100%; padding:6px 10px; border:1px solid ${c.border}; border-radius:6px; font-size:13px; background:${hasCustomBg ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.5)'}; color:${c.text}; }
        .timeline-search input::placeholder { color:${hasCustomBg ? 'rgba(255,255,255,0.6)' : c.textSecondary}; }
        .timeline-add-buttons { display:flex; gap:6px; padding:0 12px 8px 12px; flex-shrink:0; }
        .timeline-add-buttons button { flex:1; border:none; border-radius:4px; cursor:pointer; font-size:12px; padding:5px 0; font-weight:500; color:white; }
        .timeline-add-buttons .add-event { background:#28a745; }
        .timeline-add-buttons .add-folder { background:#9b784e; }
        #timelineTree { flex:1; overflow-y:auto; padding:8px 4px; }
        .timeline-status { padding:6px 12px; border-top:1px solid ${c.border}; font-size:11px; color:${c.textSecondary}; display:flex; justify-content:space-between; flex-shrink:0; }
        .timeline-editor { flex:1; display:flex; flex-direction:column; background:${hasCustomBg ? 'rgba(0,0,0,0.4)' : c.panel}; backdrop-filter:blur(16px); overflow:hidden; ${isOpen ? 'border-radius:20px;border:1px solid rgba(255,255,255,0.15);' : ''} }
        .timeline-editor-header { display:flex; justify-content:space-between; align-items:center; padding:12px 20px; border-bottom:1px solid ${c.border}; flex-shrink:0; }
        .timeline-editor-header input { font-size:18px; font-weight:600; border:none; background:transparent; outline:none; flex:1; color:${c.text}; }
        .timeline-editor-header button { padding:6px 16px; border:none; border-radius:6px; cursor:pointer; font-size:13px; }
        .timeline-editor-header .save-btn { background:#9b784e; color:white; }
        .timeline-editor-header .delete-btn { background:#dc3545; color:white; }
        .timeline-date-row { display:flex; align-items:center; gap:8px; padding:6px 20px; border-bottom:1px solid ${c.border}; flex-shrink:0; }
        .timeline-date-row span { font-size:13px; color:${c.textSecondary}; }
        .timeline-date-row input { flex:1; padding:4px 8px; border:1px solid ${c.border}; border-radius:4px; font-size:13px; background:${hasCustomBg ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.5)'}; color:${c.text}; }
        .timeline-editor-content { flex:1; padding:20px; border:none; outline:none; resize:none; font-size:14px; line-height:1.8; background:transparent; color:${c.text}; font-family:inherit; }
        .timeline-status-bar { padding:8px 20px; border-top:1px solid ${c.border}; display:flex; justify-content:space-between; font-size:12px; color:${c.textSecondary}; flex-shrink:0; }
        ::-webkit-scrollbar { width:6px; height:6px; }
        ::-webkit-scrollbar-thumb { background:${isDark ? 'rgba(255,255,255,0.2)' : 'rgba(136,136,136,0.4)'}; border-radius:3px; }
        ::-webkit-scrollbar-track { background:transparent; }
        .timeline-tree-node { margin-bottom:2px; }
        .timeline-tree-header { display:flex; align-items:center; gap:6px; padding:5px 8px; border-radius:6px; cursor:pointer; transition:background 0.15s; font-size:13px; color:${c.text}; }
        .timeline-tree-header:hover { background:${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)'}; }
        .timeline-tree-header.active { background:rgba(0,122,255,0.2); font-weight:500; }
        .timeline-tree-children { margin-left:16px; }
        .timeline-tree-header .toggle { font-size:9px; width:14px; text-align:center; color:${c.textSecondary}; flex-shrink:0; cursor:pointer; }
        .timeline-tree-header .icon { font-size:14px; flex-shrink:0; }
        .timeline-tree-header .name { flex:1; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
        .timeline-tree-header .date-tag { font-size:10px; color:${c.textSecondary}; flex-shrink:0; }
        ${hasCustomBg ? `
        .timeline-tree-header:hover { background:rgba(255,255,255,0.12); }
        .timeline-tree-header.active { background:rgba(0,122,255,0.3); }
        .timeline-sidebar-header { background:rgba(0,0,0,0.2); }
        .timeline-status { color:rgba(255,255,255,0.7); }
        .timeline-status-bar { color:rgba(255,255,255,0.7); }
        .timeline-editor-header input { color:#fff; }
        .timeline-editor-header input::placeholder { color:rgba(255,255,255,0.5); }
        .timeline-editor-content { color:#fff; }
        .timeline-editor-content::placeholder { color:rgba(255,255,255,0.5); }
        .timeline-sidebar-header button { color:rgba(255,255,255,0.7); }
        .timeline-sidebar-header span { color:#fff; }
        .timeline-search input { color:#fff; border-color:rgba(255,255,255,0.2); }
        .timeline-search input::placeholder { color:rgba(255,255,255,0.5); }
        ` : ''}
    </style>
</head>
<body>
<div class="timeline-container">
<div class="timeline-sidebar">
<div class="timeline-sidebar-header">
<span>⏱️ 时间线目录</span>
<div>
<button id="winAddRoot" title="新增时代">📂</button>
<button id="winRefresh" title="刷新">🔄</button>
</div>
</div>
<div class="timeline-search"><input type="text" id="winSearch" placeholder="🔍 搜索时间线..."></div>
<div class="timeline-add-buttons">
    <button class="add-event" id="winAddEventBtn">➕ 事件</button>
    <button class="add-folder" id="winAddFolderBtn">📁 分类</button>
</div>
<div id="timelineTree"></div>
<div class="timeline-status"><span>事件: <span id="winNodeCount">0</span></span><span>💡 双击重命名 · 右键菜单</span></div>
</div>
<div class="timeline-editor">
<div class="timeline-editor-header">
<input type="text" id="winTitle" placeholder="事件名称">
<div style="display:flex;gap:8px;">
<button class="save-btn" id="winSave">💾 保存</button>
<button class="delete-btn" id="winDelete">🗑 删除</button>
</div>
</div>
<div class="timeline-date-row">
<span>📅 日期：</span>
<input type="text" id="winDate" placeholder="如：太古历1000年">
</div>
<textarea id="winContent" class="timeline-editor-content" placeholder="事件描述..."></textarea>
<div class="timeline-status-bar"><span id="winWordCount">0 字</span><span id="winStatus">已就绪</span></div>
</div>
</div>
<script>
var timelineData = ${dataJson};
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

function bindTimelineToolEntry() {
    var timelineTool = document.querySelector('.sidebar-tool-item[data-tool="timeline"]');
    if (timelineTool) {
        timelineTool.onclick = function() {
            var existingPanel = document.getElementById('floatingToolPanel');
            if (existingPanel) {
                closeTimelineFloatingPanel();
                var toolItems = document.querySelectorAll('.sidebar-tool-item');
                toolItems.forEach(function(item) {
                    if (item.getAttribute('data-tool') === 'timeline') {
                        item.style.background = '';
                    }
                });
            } else {
                openTimelineSidebar('timeline');
            }
        };
    }
}

// ========== 导出 ==========

window.openTimelinePanel = openTimelinePanel;
window.closeTimelinePanel = closeTimelinePanel;
window.openTimelineSidebar = openTimelineSidebar;
window.closeTimelineFloatingPanel = closeTimelineFloatingPanel;
window.openTimelineInNewWindow = openTimelineInNewWindow;
window.timelineData = timelineData;
window.getTimelineData = getTimelineData;
window.saveTimelineData = saveTimelineData;
window.renderTimelineTree = renderTimelineTree;
window.updateTimelineEditor = updateTimelineEditor;
window.addTimelineRoot = addTimelineRoot;
window.addTimelineChild = addTimelineChild;
window.addTimelineFolder = addTimelineFolder;
window.deleteTimelineNode = deleteTimelineNode;
window.renameTimelineNode = renameTimelineNode;
window.selectTimelineNode = selectTimelineNode;
window.getTimelineNode = getTimelineNode;
window.getTimelineChildren = getTimelineChildren;
window.renderCompactTimelineTree = renderCompactTimelineTree;
window.updateCompactTimelineEditor = updateCompactTimelineEditor;
window.bindTimelineToolEntry = bindTimelineToolEntry;

console.log('时间线工具已加载');
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(bindTimelineToolEntry, 500);
});