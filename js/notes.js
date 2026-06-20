// ========== 笔记工具 ==========

var noteData = {
    nodes: [],
    selectedId: null,
    nextId: 1
};

// ========== 数据操作 ==========

function getNoteData() {
    var bookId = currentBookId || 'global';
    var key = 'openwrite_note_' + bookId;
    var saved = localStorage.getItem(key);
    if (saved) {
        try {
            var data = JSON.parse(saved);
            noteData.nodes = data.nodes || [];
            noteData.selectedId = data.selectedId || null;
            noteData.nextId = data.nextId || 1;
            return;
        } catch(e) {}
    }
    setDefaultNoteData();
}

function setDefaultNoteData() {
    noteData.nodes = [
        { id: 'root_1', parentId: null, type: 'folder', name: '📂 灵感记录', order: 0, content: '随时记录的灵感碎片' },
        { id: 'root_2', parentId: null, type: 'folder', name: '📂 设定草稿', order: 1, content: '未完善的设定草稿' },
        { id: 'root_3', parentId: null, type: 'folder', name: '📂 剧情构思', order: 2, content: '剧情走向、伏笔构思' },
        { id: 'note_1', parentId: 'root_1', type: 'note', name: '开篇灵感', order: 0,
          content: '开篇场景：主角在山崖上练剑，夕阳西下，远处传来战鼓声...\n\n伏笔：那把剑似乎有灵性，剑柄上的纹路像是某种古老的文字。' },
        { id: 'note_2', parentId: 'root_2', type: 'note', name: '世界观草稿', order: 0,
          content: '世界分为九重天，每重天之间有结界。\n\n下界：凡人世界，灵气稀薄\n中界：修仙界，宗门林立\n上界：神话领域，神魔并存' },
        { id: 'note_3', parentId: 'root_3', type: 'note', name: '剧情走向', order: 0,
          content: '第一卷：主角成长，宗门试炼\n第二卷：遭遇魔族，揭开身世\n第三卷：九界纷争，最终决战' },
    ];
    noteData.selectedId = 'note_1';
    noteData.nextId = 100;
    saveNoteData();
}

function saveNoteData() {
    var bookId = currentBookId || 'global';
    var key = 'openwrite_note_' + bookId;
    var data = {
        nodes: noteData.nodes,
        selectedId: noteData.selectedId,
        nextId: noteData.nextId
    };
    localStorage.setItem(key, JSON.stringify(data));
}

function getNoteChildren(parentId) {
    return noteData.nodes.filter(function(n) { return n.parentId === parentId; }).sort(function(a, b) { return (a.order || 0) - (b.order || 0); });
}

function getNoteNode(id) {
    return noteData.nodes.find(function(n) { return n.id === id; });
}

function genNoteId() {
    return 'note_' + (noteData.nextId++);
}

// ========== 全屏模式渲染 ==========

function renderNoteTree() {
    var container = document.getElementById('noteTree');
    if (!container) return;
    container.innerHTML = '';
    var roots = noteData.nodes.filter(function(n) { return n.parentId === null; }).sort(function(a, b) { return (a.order || 0) - (b.order || 0); });
    if (roots.length === 0) {
        container.innerHTML = '<div style="padding:20px;text-align:center;color:#888;font-size:13px;">暂无笔记分类</div>';
        return;
    }
    roots.forEach(function(root) {
        container.appendChild(createNoteNodeElement(root, 0));
    });
}

function createNoteNodeElement(node, depth) {
    var div = document.createElement('div');
    div.className = 'note-tree-node';
    div.setAttribute('data-id', node.id);
    div.style.marginBottom = '2px';
    var header = document.createElement('div');
    header.className = 'note-tree-header';
    header.style.cssText = 'display:flex;align-items:center;gap:6px;padding:6px 8px;border-radius:6px;cursor:pointer;transition:background 0.15s;padding-left:' + (depth * 16 + 8) + 'px;';
    if (noteData.selectedId === node.id) {
        header.style.background = 'rgba(0,122,255,0.12)';
        header.style.fontWeight = '500';
    }
    header.setAttribute('data-id', node.id);
    var hasChildren = getNoteChildren(node.id).length > 0;
    var toggle = document.createElement('span');
    toggle.style.cssText = 'font-size:10px;width:16px;text-align:center;cursor:pointer;color:#888;flex-shrink:0;';
    if (hasChildren) {
        var isExpanded = localStorage.getItem('note_expanded_' + node.id) !== 'false';
        toggle.textContent = isExpanded ? '▾' : '▸';
        toggle.onclick = function(e) {
            e.stopPropagation();
            toggleNoteFolder(node.id);
        };
    } else {
        toggle.textContent = '·';
        toggle.style.color = '#ccc';
    }
    header.appendChild(toggle);
    var icon = document.createElement('span');
    icon.style.fontSize = '16px';
    icon.style.flexShrink = '0';
    icon.textContent = node.type === 'folder' ? '📁' : '📝';
    header.appendChild(icon);
    var nameSpan = document.createElement('span');
    nameSpan.style.cssText = 'flex:1;font-size:13px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--text-color, #333);';
    nameSpan.textContent = node.name || '未命名';
    header.appendChild(nameSpan);
    header.onclick = function(e) {
        if (e.target === toggle) return;
        selectNoteNode(node.id);
    };
    header.ondblclick = function(e) {
        e.stopPropagation();
        renameNoteNode(node.id);
    };
    header.oncontextmenu = function(e) {
        e.preventDefault();
        e.stopPropagation();
        showNoteContextMenu(e.clientX, e.clientY, node.id);
    };
    div.appendChild(header);
    var children = getNoteChildren(node.id);
    if (children.length > 0) {
        var childrenDiv = document.createElement('div');
        childrenDiv.className = 'note-tree-children';
        var isExpanded = localStorage.getItem('note_expanded_' + node.id) !== 'false';
        childrenDiv.style.display = isExpanded ? 'block' : 'none';
        children.forEach(function(child) {
            childrenDiv.appendChild(createNoteNodeElement(child, depth + 1));
        });
        div.appendChild(childrenDiv);
    }
    return div;
}

function toggleNoteFolder(nodeId) {
    var current = localStorage.getItem('note_expanded_' + nodeId);
    var newState = current === 'false' ? 'true' : 'false';
    localStorage.setItem('note_expanded_' + nodeId, newState);
    renderNoteTree();
}

function selectNoteNode(id) {
    noteData.selectedId = id;
    saveNoteData();
    renderNoteTree();
    updateNoteEditor();
    renderCompactNoteTree();
    updateCompactNoteEditor();
}

function renameNoteNode(id) {
    var node = getNoteNode(id);
    if (!node) return;
    var newName = prompt('重命名：', node.name);
    if (newName && newName.trim()) {
        node.name = newName.trim();
        saveNoteData();
        renderNoteTree();
        updateNoteEditor();
        renderCompactNoteTree();
        updateCompactNoteEditor();
    }
}

function addNoteRoot() {
    var name = prompt('请输入分类名称：', '新分类');
    if (!name || !name.trim()) return;
    var roots = noteData.nodes.filter(function(n) { return n.parentId === null; });
    var newNode = {
        id: genNoteId(),
        parentId: null,
        type: 'folder',
        name: name.trim(),
        order: roots.length,
        content: '分类描述'
    };
    noteData.nodes.push(newNode);
    noteData.selectedId = newNode.id;
    saveNoteData();
    renderNoteTree();
    updateNoteEditor();
    renderCompactNoteTree();
    updateCompactNoteEditor();
}

function addNoteChild(parentId) {
    var parent = getNoteNode(parentId);
    if (!parent) {
        alert('请先选择一个父节点');
        return;
    }
    var name = prompt('请输入笔记标题：', '新笔记');
    if (!name || !name.trim()) return;
    var children = getNoteChildren(parentId);
    var newNode = {
        id: genNoteId(),
        parentId: parentId,
        type: 'note',
        name: name.trim(),
        order: children.length,
        content: '✍️ ' + name.trim() + '\n\n在此记录你的灵感...'
    };
    noteData.nodes.push(newNode);
    noteData.selectedId = newNode.id;
    saveNoteData();
    renderNoteTree();
    updateNoteEditor();
    renderCompactNoteTree();
    updateCompactNoteEditor();
    localStorage.setItem('note_expanded_' + parentId, 'true');
}

function addNoteFolder(parentId) {
    var parent = getNoteNode(parentId);
    if (!parent) {
        alert('请先选择一个父节点');
        return;
    }
    var name = prompt('请输入新分类名称：', '新分类');
    if (!name || !name.trim()) return;
    var children = getNoteChildren(parentId);
    var newNode = {
        id: genNoteId(),
        parentId: parentId,
        type: 'folder',
        name: name.trim(),
        order: children.length,
        content: '📂 分类说明'
    };
    noteData.nodes.push(newNode);
    noteData.selectedId = newNode.id;
    saveNoteData();
    renderNoteTree();
    updateNoteEditor();
    renderCompactNoteTree();
    updateCompactNoteEditor();
    localStorage.setItem('note_expanded_' + parentId, 'true');
}

function deleteNoteNode() {
    var node = getNoteNode(noteData.selectedId);
    if (!node) return;
    if (noteData.nodes.filter(function(n) { return n.parentId === null; }).length === 1 && node.parentId === null) {
        alert('至少保留一个根分类');
        return;
    }
    if (confirm('确定删除「' + node.name + '」及其所有子项吗？')) {
        var toDelete = [node.id];
        function collectChildren(pid) {
            noteData.nodes.filter(function(n) { return n.parentId === pid; }).forEach(function(child) {
                toDelete.push(child.id);
                collectChildren(child.id);
            });
        }
        collectChildren(node.id);
        noteData.nodes = noteData.nodes.filter(function(n) { return toDelete.indexOf(n.id) === -1; });
        var siblings = getNoteChildren(node.parentId);
        siblings.forEach(function(s, idx) { s.order = idx; });
        noteData.selectedId = noteData.nodes.length > 0 ? noteData.nodes[0].id : null;
        saveNoteData();
        renderNoteTree();
        updateNoteEditor();
        renderCompactNoteTree();
        updateCompactNoteEditor();
        alert('已删除');
    }
}

function showNoteContextMenu(x, y, nodeId) {
    var oldMenu = document.getElementById('noteContextMenu');
    if (oldMenu) oldMenu.remove();
    var node = getNoteNode(nodeId);
    if (!node) return;
    var menu = document.createElement('div');
    menu.id = 'noteContextMenu';
    menu.style.cssText = 'position:fixed;background:#fff;border-radius:8px;padding:4px 0;box-shadow:0 2px 12px rgba(0,0,0,0.15);z-index:10000;min-width:140px;';
    menu.style.left = x + 'px';
    menu.style.top = y + 'px';
    var isRoot = node.parentId === null;
    var menuHtml =
        '<button data-action="addNote" style="display:block;width:100%;padding:8px 16px;border:none;background:none;cursor:pointer;text-align:left;font-size:13px;color:#333;">➕ 新增笔记</button>' +
        '<button data-action="addFolder" style="display:block;width:100%;padding:8px 16px;border:none;background:none;cursor:pointer;text-align:left;font-size:13px;color:#333;">📁 新增分类</button>' +
        '<button data-action="rename" style="display:block;width:100%;padding:8px 16px;border:none;background:none;cursor:pointer;text-align:left;font-size:13px;color:#333;">✏️ 重命名</button>' +
        (noteData.nodes.filter(function(n) { return n.parentId === null; }).length > 1 || !isRoot ?
            '<button data-action="delete" style="display:block;width:100%;padding:8px 16px;border:none;background:none;cursor:pointer;text-align:left;font-size:13px;color:#dc3545;">🗑 删除</button>' : '');
    menu.innerHTML = menuHtml;
    document.body.appendChild(menu);
    menu.querySelectorAll('button').forEach(function(btn) {
        btn.onclick = function(e) {
            e.stopPropagation();
            var action = this.getAttribute('data-action');
            if (action === 'addNote') {
                addNoteChild(nodeId);
            } else if (action === 'addFolder') {
                addNoteFolder(nodeId);
            } else if (action === 'rename') {
                renameNoteNode(nodeId);
            } else if (action === 'delete') {
                deleteNoteNode();
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

function updateNoteEditor() {
    var titleInput = document.getElementById('noteEditorTitle');
    var contentArea = document.getElementById('noteEditorContent');
    var wordCount = document.getElementById('noteWordCount');
    var statusEl = document.getElementById('noteStatus');
    if (!titleInput || !contentArea) return;
    var node = getNoteNode(noteData.selectedId);
    if (node) {
        titleInput.value = node.name || '';
        contentArea.value = node.content || '';
        wordCount.textContent = (node.content || '').length + ' 字';
        statusEl.textContent = '已选择：' + node.name;
        var deleteBtn = document.getElementById('noteDeleteBtn');
        if (deleteBtn) deleteBtn.style.display = 'inline-block';
    } else {
        titleInput.value = '';
        contentArea.value = '';
        wordCount.textContent = '0 字';
        statusEl.textContent = '请选择一个节点';
        var deleteBtn = document.getElementById('noteDeleteBtn');
        if (deleteBtn) deleteBtn.style.display = 'none';
    }
}

function saveNoteNode() {
    var node = getNoteNode(noteData.selectedId);
    if (!node) {
        alert('请先选择一个节点');
        return;
    }
    var title = document.getElementById('noteEditorTitle').value.trim();
    var content = document.getElementById('noteEditorContent').value;
    if (title) node.name = title;
    node.content = content;
    saveNoteData();
    renderNoteTree();
    updateNoteEditor();
    renderCompactNoteTree();
    updateCompactNoteEditor();
    document.getElementById('noteStatus').textContent = '✅ 已保存';
    setTimeout(function() {
        document.getElementById('noteStatus').textContent = '已保存';
    }, 1500);
}

// ========== 全屏模式打开/关闭 ==========

function openNotePanel() {
    var existingPage = document.querySelector('.page[data-page="note_panel"]');
    if (existingPage) {
        switchToTab('note_panel');
        return;
    }
    var bookId = currentBookId || 'global';
    var tabId = 'note_panel';
    openTabs.push({ id: tabId, title: '📓 笔记', type: 'note', bookId: bookId });
    renderTabs();
    var pagesContainer = document.getElementById('pagesContainer');
    var pageDiv = document.createElement('div');
    pageDiv.className = 'page';
    pageDiv.setAttribute('data-page', tabId);
    pageDiv.innerHTML = renderNotePage();
    pagesContainer.appendChild(pageDiv);
    getNoteData();
    renderNoteTree();
    updateNoteEditor();
    initNoteEvents();
    switchToTab(tabId);
    var sidebar = document.querySelector('.sidebar-menu');
    if (sidebar) sidebar.style.display = 'none';
}

function closeNotePanel() {
    closeTab('note_panel');
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

function renderNotePage() {
    return `
        <div class="note-container" style="display:flex;height:100%;width:100%;">
            <div class="note-sidebar" style="width:280px;min-width:200px;max-width:400px;background:var(--panel-bg, rgba(255,255,255,0.95));backdrop-filter:blur(8px);border-right:1px solid var(--border-color, rgba(0,0,0,0.08));display:flex;flex-direction:column;flex-shrink:0;position:relative;overflow:visible;">
                <div class="note-sidebar-header" style="display:flex;justify-content:space-between;align-items:center;padding:12px 16px;background:rgba(0,0,0,0.03);border-bottom:1px solid var(--border-color, rgba(0,0,0,0.08));flex-shrink:0;">
                    <span style="font-weight:600;">📓 笔记目录</span>
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
                    <button id="noteAddItemBtn" title="新增笔记" style="flex:1;background:#28a745;color:white;border:none;border-radius:4px;cursor:pointer;font-size:12px;padding:5px 0;font-weight:500;">+ 笔记</button>
                     <button id="outlineAddFolderBtn" title="新增分类" style="flex:1;background:#9b784e;color:white;border:none;border-radius:4px;cursor:pointer;font-size:12px;padding:5px 0;font-weight:500;">
        <img src="icons/folder.svg" width="14" height="14" alt="分类" style="vertical-align:middle; margin-right:4px;"> 分类
    </button>
                </div>
                <div id="noteTree" style="flex:1;overflow-y:auto;padding:8px 4px;"></div>
                <div style="padding:8px 12px;border-top:1px solid var(--border-color, rgba(0,0,0,0.08));font-size:11px;color:#888;display:flex;justify-content:space-between;flex-shrink:0;">
                    <span>笔记: <span id="noteNodeCount">0</span></span>
                    <span>💡 双击重命名 · 右键菜单</span>
                </div>
                <div id="noteResizeHandle" style="position:absolute;right:-4px;top:0;width:6px;height:100%;cursor:ew-resize;background:transparent;z-index:10;transition:background 0.2s;"></div>
            </div>
            <div class="note-editor" style="flex:1;display:flex;flex-direction:column;background:var(--panel-bg, rgba(255,255,255,0.9));overflow:hidden;">
                <div style="display:flex;justify-content:space-between;align-items:center;padding:12px 20px;border-bottom:1px solid var(--border-color, rgba(0,0,0,0.08));flex-shrink:0;">
                    <input type="text" id="noteEditorTitle" placeholder="笔记标题" style="font-size:18px;font-weight:600;border:none;background:transparent;outline:none;flex:1;color:var(--text-color, #333);">
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
                <textarea id="noteEditorContent" style="flex:1;padding:20px;border:none;outline:none;resize:none;font-size:14px;line-height:1.8;background:transparent;color:var(--text-color, #333);font-family:inherit;" placeholder="在此记录你的灵感与笔记..."></textarea>
                <div class="note-status-bar" style="padding:8px 20px;border-top:1px solid var(--border-color, rgba(0,0,0,0.08));display:flex;justify-content:space-between;font-size:12px;color:#888;flex-shrink:0;">
                    <span id="noteWordCount">0 字</span>
                    <span id="noteStatus">已就绪</span>
                </div>
            </div>
        </div>
    `;
}

function initNoteEvents() {
    var closeBtn = document.getElementById('noteCloseBtn');
    if (closeBtn) closeBtn.onclick = closeNotePanel;
    var saveBtn = document.getElementById('noteSaveBtn');
    if (saveBtn) saveBtn.onclick = saveNoteNode;
    var deleteBtn = document.getElementById('noteDeleteBtn');
    if (deleteBtn) deleteBtn.onclick = deleteNoteNode;
    var addRootBtn = document.getElementById('noteAddRootBtn');
    if (addRootBtn) addRootBtn.onclick = addNoteRoot;
    var refreshBtn = document.getElementById('noteRefreshBtn');
    if (refreshBtn) {
        refreshBtn.onclick = function() {
            getNoteData();
            renderNoteTree();
            updateNoteEditor();
            renderCompactNoteTree();
            updateCompactNoteEditor();
        };
    }
    var searchInput = document.getElementById('noteSearchInput');
    if (searchInput) {
        searchInput.oninput = function() {
            var keyword = this.value.trim().toLowerCase();
            var container = document.getElementById('noteTree');
            if (!keyword) { renderNoteTree(); return; }
            var items = container.querySelectorAll('.note-tree-header');
            items.forEach(function(item) {
                var id = item.getAttribute('data-id');
                var node = getNoteNode(id);
                if (node && (node.name.toLowerCase().indexOf(keyword) !== -1 || (node.content && node.content.toLowerCase().indexOf(keyword) !== -1))) {
                    item.style.background = 'rgba(255,193,7,0.3)';
                } else {
                    if (noteData.selectedId === id) {
                        item.style.background = 'rgba(0,122,255,0.12)';
                    } else {
                        item.style.background = '';
                    }
                }
            });
        };
    }
    var pinBtn = document.getElementById('notePinBtn');
    if (pinBtn) {
        pinBtn.onclick = function() {
            closeNotePanel();
            setTimeout(function() {
                openNoteSidebar('notes');
            }, 150);
        };
    }
    var addItemBtn = document.getElementById('noteAddItemBtn');
    if (addItemBtn) {
        addItemBtn.onclick = function() {
            if (noteData.selectedId) {
                addNoteChild(noteData.selectedId);
            } else {
                alert('请先选择一个节点');
            }
        };
    }
    var addFolderBtn = document.getElementById('noteAddFolderBtn');
    if (addFolderBtn) {
        addFolderBtn.onclick = function() {
            if (noteData.selectedId) {
                addNoteFolder(noteData.selectedId);
            } else {
                alert('请先选择一个节点');
            }
        };
    }
    var contentArea = document.getElementById('noteEditorContent');
    var titleInput = document.getElementById('noteEditorTitle');
    var saveTimer = null;
    if (contentArea) {
        contentArea.oninput = function() {
            var node = getNoteNode(noteData.selectedId);
            if (node) {
                node.content = this.value;
                document.getElementById('noteWordCount').textContent = this.value.length + ' 字';
                document.getElementById('noteStatus').textContent = '✏️ 未保存';
                clearTimeout(saveTimer);
                saveTimer = setTimeout(function() {
                    saveNoteData();
                    document.getElementById('noteStatus').textContent = '✅ 已保存';
                    setTimeout(function() {
                        document.getElementById('noteStatus').textContent = '已保存';
                    }, 1000);
                }, 500);
            }
        };
    }
    if (titleInput) {
        titleInput.oninput = function() {
            var node = getNoteNode(noteData.selectedId);
            if (node && this.value.trim()) {
                node.name = this.value.trim();
                saveNoteData();
                renderNoteTree();
                renderCompactNoteTree();
            }
        };
    }
    var handle = document.getElementById('noteResizeHandle');
    var sidebar = document.querySelector('.note-sidebar');
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
    updateNoteNodeCount();
}

function updateNoteNodeCount() {
    var count = noteData.nodes.length;
    var el = document.getElementById('noteNodeCount');
    if (el) el.textContent = count;
}

// ====================================================================
// ========== 浮动面板（紧凑模式） ==========
// ====================================================================

function openNoteSidebar(tool) {
    console.log('openNoteSidebar 被调用，工具:', tool);
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
        panel.innerHTML = renderCompactNotePanel();
        var editor = document.querySelector('.detail-editor');
        if (editor && editor.nextSibling) {
            detailMain.insertBefore(panel, editor.nextSibling);
        } else {
            detailMain.appendChild(panel);
        }
        getNoteData();
        renderCompactNoteTree();
        updateCompactNoteEditor();
        bindCompactNoteEvents();
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

function closeNoteFloatingPanel() {
    var panel = document.getElementById('floatingToolPanel');
    if (panel) { panel.remove(); }
    var rightSidebar = document.getElementById('rightSidebar');
    if (rightSidebar) {
        rightSidebar.style.width = '48px';
        rightSidebar.style.minWidth = '48px';
    }
}

function renderCompactNotePanel() {
    return `
        <div style="display:flex;flex-direction:column;height:100%;width:100%;">
            <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 14px;border-bottom:1px solid var(--border-color, rgba(0,0,0,0.08));flex-shrink:0;">
                <span style="font-weight:600;font-size:14px;">📓 笔记</span>
                <div style="display:flex;gap:4px;">
                    <button id="compactNoteExpandBtn" title="新窗口打开" style="background:none;border:none;cursor:pointer;font-size:14px;padding:2px 8px;border-radius:4px;">⤢</button>
                    <button id="compactNoteCloseBtn" title="关闭面板" style="background:none;border:none;cursor:pointer;font-size:14px;padding:2px 8px;border-radius:4px;">✕</button>
                </div>
            </div>
            <div style="display:flex;flex:1;overflow:hidden;">
                <div style="width:38%;min-width:120px;max-width:180px;border-right:1px solid var(--border-color, rgba(0,0,0,0.08));display:flex;flex-direction:column;overflow:hidden;">
                    <div style="padding:4px 8px;flex-shrink:0;">
                        <input type="text" id="outlineSearchInput" placeholder="搜索..." style="width:100%;padding:6px 10px 6px 32px;border:1px solid var(--border-color, #ddd);border-radius:6px;font-size:12px;background:var(--input-bg, #f8f8f8) url('icons/search.svg') no-repeat 8px center;background-size:16px 16px;color:var(--text-color, #333);">
                    </div>
                    <div style="display:flex;gap:6px;padding:4px 8px 6px 8px;flex-shrink:0;">
                        <button id="compactNoteAddBtn" title="新增笔记" style="flex:1;background:#28a745;color:white;border:none;border-radius:4px;cursor:pointer;font-size:12px;padding:4px 0;font-weight:500;">➕ 笔记</button>
                        <button id="compactNoteAddFolderBtn" title="新增分类" style="flex:1;background:#9b784e;color:white;border:none;border-radius:4px;cursor:pointer;font-size:12px;padding:4px 0;font-weight:500;">📁 分类</button>
                    </div>
                    <div id="compactNoteTree" style="flex:1;overflow-y:auto;padding:4px 4px;"></div>
                    <div style="padding:3px 10px;border-top:1px solid var(--border-color, rgba(0,0,0,0.08));font-size:10px;color:#888;flex-shrink:0;display:flex;justify-content:space-between;">
                        <span>笔记: <span id="compactNoteNodeCount">0</span></span>
                        <span>📌 点击选择</span>
                    </div>
                </div>
                <div style="flex:1;display:flex;flex-direction:column;overflow:hidden;min-width:150px;">
                    <div style="padding:6px 12px;border-bottom:1px solid var(--border-color, rgba(0,0,0,0.08));flex-shrink:0;display:flex;gap:6px;align-items:center;">
                        <input type="text" id="compactNoteTitle" placeholder="笔记标题" style="flex:1;font-size:15px;font-weight:600;border:none;background:transparent;outline:none;color:var(--text-color, #333);">
                        <button id="compactNoteSaveBtn" title="保存" style="background:#9b784e;color:white;border:none;border-radius:4px;cursor:pointer;font-size:11px;padding:2px 10px;">💾</button>
                    </div>
                    <textarea id="compactNoteContent" style="flex:1;padding:10px 12px;border:none;outline:none;resize:none;font-size:13px;line-height:1.8;background:transparent;color:var(--text-color, #333);font-family:inherit;" placeholder="在此记录你的灵感..."></textarea>
                    <div style="padding:3px 12px;border-top:1px solid var(--border-color, rgba(0,0,0,0.08));font-size:10px;color:#888;display:flex;justify-content:space-between;flex-shrink:0;">
                        <span id="compactNoteWordCount">0 字</span>
                        <span id="compactNoteStatus">已就绪</span>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function renderCompactNoteTree() {
    var container = document.getElementById('compactNoteTree');
    if (!container) return;
    container.innerHTML = '';
    var roots = noteData.nodes.filter(function(n) { return n.parentId === null; }).sort(function(a, b) { return (a.order || 0) - (b.order || 0); });
    if (roots.length === 0) {
        container.innerHTML = '<div style="padding:12px;text-align:center;color:#888;font-size:12px;">暂无笔记</div>';
        return;
    }
    roots.forEach(function(root) {
        container.appendChild(createCompactNoteNode(root, 0));
    });
    var countEl = document.getElementById('compactNoteNodeCount');
    if (countEl) countEl.textContent = noteData.nodes.length;
}

function createCompactNoteNode(node, depth) {
    var div = document.createElement('div');
    div.className = 'compact-note-node';
    div.setAttribute('data-id', node.id);
    div.style.marginBottom = '1px';
    var header = document.createElement('div');
    header.className = 'compact-note-header';
    header.style.cssText = 'display:flex;align-items:center;gap:4px;padding:3px 6px;border-radius:4px;cursor:pointer;transition:background 0.15s;padding-left:' + (depth * 12 + 4) + 'px;font-size:12px;';
    if (noteData.selectedId === node.id) {
        header.style.background = 'rgba(0,122,255,0.12)';
        header.style.fontWeight = '500';
    }
    header.setAttribute('data-id', node.id);
    var hasChildren = getNoteChildren(node.id).length > 0;
    var toggle = document.createElement('span');
    toggle.style.cssText = 'font-size:8px;width:12px;text-align:center;cursor:pointer;color:#888;flex-shrink:0;';
    if (hasChildren) {
        var isExpanded = localStorage.getItem('note_expanded_' + node.id) !== 'false';
        toggle.textContent = isExpanded ? '▾' : '▸';
        toggle.onclick = function(e) {
            e.stopPropagation();
            var current = localStorage.getItem('note_expanded_' + node.id);
            var newState = current === 'false' ? 'true' : 'false';
            localStorage.setItem('note_expanded_' + node.id, newState);
            renderCompactNoteTree();
        };
    } else {
        toggle.textContent = '·';
        toggle.style.color = '#ccc';
    }
    header.appendChild(toggle);
    var icon = document.createElement('span');
    icon.style.fontSize = '12px';
    icon.style.flexShrink = '0';
    icon.textContent = node.type === 'folder' ? '📁' : '📝';
    header.appendChild(icon);
    var nameSpan = document.createElement('span');
    nameSpan.style.cssText = 'flex:1;font-size:12px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--text-color, #333);';
    nameSpan.textContent = node.name || '未命名';
    header.appendChild(nameSpan);
    header.onclick = function(e) {
        if (e.target === toggle) return;
        noteData.selectedId = node.id;
        saveNoteData();
        renderCompactNoteTree();
        updateCompactNoteEditor();
        if (document.getElementById('noteTree')) {
            renderNoteTree();
            updateNoteEditor();
        }
    };
    div.appendChild(header);
    var children = getNoteChildren(node.id);
    if (children.length > 0) {
        var childrenDiv = document.createElement('div');
        childrenDiv.className = 'compact-note-children';
        var isExpanded = localStorage.getItem('note_expanded_' + node.id) !== 'false';
        childrenDiv.style.display = isExpanded ? 'block' : 'none';
        children.forEach(function(child) {
            childrenDiv.appendChild(createCompactNoteNode(child, depth + 1));
        });
        div.appendChild(childrenDiv);
    }
    return div;
}

function updateCompactNoteEditor() {
    var node = getNoteNode(noteData.selectedId);
    var titleInput = document.getElementById('compactNoteTitle');
    var contentArea = document.getElementById('compactNoteContent');
    var wordCount = document.getElementById('compactNoteWordCount');
    var statusEl = document.getElementById('compactNoteStatus');
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

function bindCompactNoteEvents() {
    var addBtn = document.getElementById('compactNoteAddBtn');
    if (addBtn) {
        addBtn.onclick = function() {
            if (noteData.selectedId) {
                addNoteChild(noteData.selectedId);
            } else {
                alert('请先选择一个节点');
            }
            renderCompactNoteTree();
            updateCompactNoteEditor();
        };
    }
    var addFolderBtn = document.getElementById('compactNoteAddFolderBtn');
    if (addFolderBtn) {
        addFolderBtn.onclick = function() {
            if (noteData.selectedId) {
                addNoteFolder(noteData.selectedId);
            } else {
                alert('请先选择一个节点');
            }
            renderCompactNoteTree();
            updateCompactNoteEditor();
        };
    }
    var expandBtn = document.getElementById('compactNoteExpandBtn');
    if (expandBtn) {
        expandBtn.onclick = function() {
            openNoteInNewWindow();
        };
    }
    var closeBtn = document.getElementById('compactNoteCloseBtn');
    if (closeBtn) {
        closeBtn.onclick = function() {
            closeNoteFloatingPanel();
            var rightSidebar = document.getElementById('rightSidebar');
            if (rightSidebar) {
                rightSidebar.style.width = '48px';
                rightSidebar.style.minWidth = '48px';
            }
        };
    }
    var saveBtn = document.getElementById('compactNoteSaveBtn');
    if (saveBtn) {
        saveBtn.onclick = function() {
            var node = getNoteNode(noteData.selectedId);
            if (!node) { alert('请先选择一个节点'); return; }
            var title = document.getElementById('compactNoteTitle').value.trim();
            var content = document.getElementById('compactNoteContent').value;
            if (title) node.name = title;
            node.content = content;
            saveNoteData();
            renderNoteTree();
            updateNoteEditor();
            renderCompactNoteTree();
            updateCompactNoteEditor();
            document.getElementById('compactNoteStatus').textContent = '✅ 已保存';
            setTimeout(function() {
                document.getElementById('compactNoteStatus').textContent = '已就绪';
            }, 1500);
        };
    }
    var searchInput = document.getElementById('compactNoteSearch');
    if (searchInput) {
        searchInput.oninput = function() {
            var keyword = this.value.trim().toLowerCase();
            var container = document.getElementById('compactNoteTree');
            if (!keyword) { renderCompactNoteTree(); return; }
            var items = container.querySelectorAll('.compact-note-header');
            items.forEach(function(item) {
                var id = item.getAttribute('data-id');
                var node = getNoteNode(id);
                if (node && (node.name.toLowerCase().indexOf(keyword) !== -1 || (node.content && node.content.toLowerCase().indexOf(keyword) !== -1))) {
                    item.style.background = 'rgba(255,193,7,0.3)';
                } else {
                    if (noteData.selectedId === id) {
                        item.style.background = 'rgba(0,122,255,0.12)';
                    } else {
                        item.style.background = '';
                    }
                }
            });
        };
    }
    var titleInput = document.getElementById('compactNoteTitle');
    var contentArea = document.getElementById('compactNoteContent');
    var saveTimer = null;
    if (contentArea) {
        contentArea.oninput = function() {
            var node = getNoteNode(noteData.selectedId);
            if (node) {
                node.content = this.value;
                document.getElementById('compactNoteWordCount').textContent = this.value.length + ' 字';
                document.getElementById('compactNoteStatus').textContent = '✏️ 未保存';
                clearTimeout(saveTimer);
                saveTimer = setTimeout(function() {
                    saveNoteData();
                    document.getElementById('compactNoteStatus').textContent = '✅ 已保存';
                    setTimeout(function() {
                        document.getElementById('compactNoteStatus').textContent = '已就绪';
                    }, 1000);
                }, 500);
            }
        };
    }
    if (titleInput) {
        titleInput.oninput = function() {
            var node = getNoteNode(noteData.selectedId);
            if (node && this.value.trim()) {
                node.name = this.value.trim();
                saveNoteData();
                renderCompactNoteTree();
            }
        };
    }
    // 展开 - 使用 openNoteInNewWindow
document.getElementById('compactNoteExpandBtn').onclick = function() {
    if (typeof openNoteInNewWindow === 'function') {
        openNoteInNewWindow();
    } else {
        window.open('html/notes.html', '_blank', 'width=1200,height=800,resizable=yes');
    }
};
}

// ========== 新窗口打开 ==========

function openNoteInNewWindow() {
    // 关闭浮动面板
    if (typeof closeFloatingPanel === 'function') {
        closeFloatingPanel();
    }
    
    // 确保数据已加载
    getNoteData();
    
    // 序列化数据
    var dataJson = JSON.stringify(noteData);
    var bookId = currentBookId || 'global';
    
    var html = `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><title>📓 笔记 - 全屏编辑</title>
<style>
* { margin:0; padding:0; box-sizing:border-box; }
body { font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif; background:#f0f2f5; height:100vh; overflow:hidden; }
.note-container { display:flex; height:100vh; width:100%; }
.note-sidebar { width:300px; min-width:220px; max-width:450px; background:rgba(255,255,255,0.95); backdrop-filter:blur(8px); border-right:1px solid rgba(0,0,0,0.08); display:flex; flex-direction:column; flex-shrink:0; overflow:hidden; }
.note-sidebar-header { display:flex; justify-content:space-between; align-items:center; padding:12px 16px; background:rgba(0,0,0,0.03); border-bottom:1px solid rgba(0,0,0,0.08); flex-shrink:0; }
.note-sidebar-header span { font-weight:600; font-size:15px; }
.note-sidebar-header button { background:none; border:none; cursor:pointer; font-size:16px; padding:0 4px; }
.note-search { padding:8px 12px; flex-shrink:0; }
.note-search input { width:100%; padding:6px 10px; border:1px solid #ddd; border-radius:6px; font-size:13px; background:#f8f8f8; }
.note-add-buttons { display:flex; gap:6px; padding:0 12px 8px 12px; flex-shrink:0; }
.note-add-buttons button { flex:1; border:none; border-radius:4px; cursor:pointer; font-size:12px; padding:5px 0; font-weight:500; color:white; }
.note-add-buttons .add-note { background:#28a745; }
.note-add-buttons .add-folder { background:#9b784e; }
#noteTree { flex:1; overflow-y:auto; padding:8px 4px; }
.note-status { padding:6px 12px; border-top:1px solid rgba(0,0,0,0.08); font-size:11px; color:#888; display:flex; justify-content:space-between; flex-shrink:0; }
.note-editor { flex:1; display:flex; flex-direction:column; background:rgba(255,255,255,0.9); overflow:hidden; }
.note-editor-header { display:flex; justify-content:space-between; align-items:center; padding:12px 20px; border-bottom:1px solid rgba(0,0,0,0.08); flex-shrink:0; }
.note-editor-header input { font-size:18px; font-weight:600; border:none; background:transparent; outline:none; flex:1; color:#333; }
.note-editor-header button { padding:6px 16px; border:none; border-radius:6px; cursor:pointer; font-size:13px; }
.note-editor-header .save-btn { background:#9b784e; color:white; }
.note-editor-header .delete-btn { background:#dc3545; color:white; }
.note-editor-content { flex:1; padding:20px; border:none; outline:none; resize:none; font-size:14px; line-height:1.8; background:transparent; color:#333; font-family:inherit; }
.note-status-bar { padding:8px 20px; border-top:1px solid rgba(0,0,0,0.08); display:flex; justify-content:space-between; font-size:12px; color:#888; flex-shrink:0; }
::-webkit-scrollbar { width:6px; height:6px; }
::-webkit-scrollbar-thumb { background:rgba(136,136,136,0.4); border-radius:3px; }
::-webkit-scrollbar-track { background:transparent; }
.note-tree-node { margin-bottom:2px; }
.note-tree-header { display:flex; align-items:center; gap:6px; padding:5px 8px; border-radius:6px; cursor:pointer; transition:background 0.15s; font-size:13px; }
.note-tree-header:hover { background:rgba(0,0,0,0.05); }
.note-tree-header.active { background:rgba(0,122,255,0.12); font-weight:500; }
.note-tree-children { margin-left:16px; }
.note-tree-header .toggle { font-size:9px; width:14px; text-align:center; color:#888; flex-shrink:0; cursor:pointer; }
.note-tree-header .icon { font-size:14px; flex-shrink:0; }
.note-tree-header .name { flex:1; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; color:#333; }
</style>
</head>
<body>
<div class="note-container">
<div class="note-sidebar">
<div class="note-sidebar-header">
<span>📓 笔记目录</span>
<div>
<button id="winAddRoot" title="新增分类">📂</button>
<button id="winRefresh" title="刷新">🔄</button>
</div>
</div>
<div class="note-search"><input type="text" id="winSearch" placeholder="🔍 搜索笔记..."></div>
<div class="note-add-buttons">
    <button class="add-note" id="winAddNoteBtn">➕ 笔记</button>
    <button class="add-folder" id="winAddFolderBtn">📁 分类</button>
</div>
<div id="noteTree"></div>
<div class="note-status"><span>笔记: <span id="winNodeCount">0</span></span><span>💡 双击重命名 · 右键菜单</span></div>
</div>
<div class="note-editor">
<div class="note-editor-header">
<input type="text" id="winTitle" placeholder="笔记标题">
<div style="display:flex;gap:8px;">
<button class="save-btn" id="winSave">💾 保存</button>
<button class="delete-btn" id="winDelete">🗑 删除</button>
</div>
</div>
<textarea id="winContent" class="note-editor-content" placeholder="在此记录你的灵感..."></textarea>
<div class="note-status-bar"><span id="winWordCount">0 字</span><span id="winStatus">已就绪</span></div>
</div>
</div>
<script>
// 从父窗口传递的数据
var noteData = ${dataJson};
var currentBookId = ${bookId};
var selectedId = ${noteData.selectedId ? JSON.stringify(noteData.selectedId) : 'null'};

function getNoteChildren(parentId) {
    return noteData.nodes.filter(function(n) { return n.parentId === parentId; }).sort(function(a,b) { return (a.order||0)-(b.order||0); });
}
function getNoteNode(id) {
    return noteData.nodes.find(function(n) { return n.id === id; });
}
function saveNoteData() {
    var key = 'openwrite_note_' + (currentBookId || 'global');
    var data = { nodes: noteData.nodes, selectedId: selectedId, nextId: noteData.nextId || 100 };
    localStorage.setItem(key, JSON.stringify(data));
    if (window.opener && window.opener.window) {
        try { window.opener.window.location.reload(); } catch(e) {}
    }
}
function selectNode(id) { 
    selectedId = id; 
    renderTree(); 
    updateEditor(); 
    saveNoteData(); 
}
function renderTree() {
    var container = document.getElementById('noteTree');
    if (!container) {
        console.warn('noteTree 元素不存在');
        return;
    }
    container.innerHTML = '';
    var roots = noteData.nodes.filter(function(n) { return n.parentId === null; }).sort(function(a,b) { return (a.order||0)-(b.order||0); });
    if (roots.length === 0) { 
        container.innerHTML = '<div style="padding:20px;text-align:center;color:#888;font-size:13px;">暂无笔记分类</div>'; 
        document.getElementById('winNodeCount').textContent = '0';
        return; 
    }
    roots.forEach(function(root) { 
        container.appendChild(createNodeElement(root, 0)); 
    });
    document.getElementById('winNodeCount').textContent = noteData.nodes.length;
}
function createNodeElement(node, depth) {
    var div = document.createElement('div');
    div.className = 'note-tree-node';
    div.setAttribute('data-id', node.id);
    var header = document.createElement('div');
    header.className = 'note-tree-header';
    if (selectedId === node.id) header.classList.add('active');
    header.style.paddingLeft = (depth * 16 + 8) + 'px';
    header.setAttribute('data-id', node.id);
    var hasChildren = getNoteChildren(node.id).length > 0;
    var toggle = document.createElement('span');
    toggle.className = 'toggle';
    if (hasChildren) {
        var isExpanded = localStorage.getItem('note_expanded_' + node.id) !== 'false';
        toggle.textContent = isExpanded ? '▾' : '▸';
        toggle.onclick = function(e) { 
            e.stopPropagation();
            var current = localStorage.getItem('note_expanded_' + node.id);
            var newState = current === 'false' ? 'true' : 'false';
            localStorage.setItem('note_expanded_' + node.id, newState);
            renderTree();
        };
    } else { 
        toggle.textContent = '·'; 
        toggle.style.color = '#ccc'; 
    }
    header.appendChild(toggle);
    var icon = document.createElement('span');
    icon.className = 'icon';
    icon.textContent = node.type === 'folder' ? '📁' : '📝';
    header.appendChild(icon);
    var nameSpan = document.createElement('span');
    nameSpan.className = 'name';
    nameSpan.textContent = node.name || '未命名';
    header.appendChild(nameSpan);
    header.onclick = function(e) { 
        if (e.target === toggle) return; 
        selectNode(node.id); 
    };
    header.ondblclick = function(e) { 
        e.stopPropagation(); 
        var newName = prompt('重命名：', node.name); 
        if (newName && newName.trim()) { 
            node.name = newName.trim(); 
            saveNoteData(); 
            renderTree(); 
            updateEditor(); 
        } 
    };
    header.oncontextmenu = function(e) { 
        e.preventDefault(); 
        e.stopPropagation();
        showContextMenu(e.clientX, e.clientY, node.id);
    };
    div.appendChild(header);
    var children = getNoteChildren(node.id);
    if (children.length > 0) {
        var childrenDiv = document.createElement('div');
        childrenDiv.className = 'note-tree-children';
        var isExpanded = localStorage.getItem('note_expanded_' + node.id) !== 'false';
        childrenDiv.style.display = isExpanded ? 'block' : 'none';
        children.forEach(function(child) { 
            childrenDiv.appendChild(createNodeElement(child, depth + 1)); 
        });
        div.appendChild(childrenDiv);
    }
    return div;
}

function showContextMenu(x, y, nodeId) {
    var node = getNoteNode(nodeId);
    if (!node) return;
    var menu = document.createElement('div');
    menu.style.cssText = 'position:fixed;background:#fff;border-radius:8px;padding:4px 0;box-shadow:0 2px 12px rgba(0,0,0,0.15);z-index:10000;min-width:140px;';
    menu.style.left = Math.min(x, window.innerWidth - 140) + 'px';
    menu.style.top = Math.min(y, window.innerHeight - 120) + 'px';
    var isRoot = node.parentId === null;
    menu.innerHTML =
        '<button data-action="addNote" style="display:block;width:100%;padding:6px 14px;border:none;background:none;cursor:pointer;text-align:left;font-size:12px;">➕ 新增笔记</button>' +
        '<button data-action="addFolder" style="display:block;width:100%;padding:6px 14px;border:none;background:none;cursor:pointer;text-align:left;font-size:12px;">📁 新增分类</button>' +
        '<button data-action="rename" style="display:block;width:100%;padding:6px 14px;border:none;background:none;cursor:pointer;text-align:left;font-size:12px;">✏️ 重命名</button>' +
        (noteData.nodes.filter(function(n) { return n.parentId === null; }).length > 1 || !isRoot ?
            '<button data-action="delete" style="display:block;width:100%;padding:6px 14px;border:none;background:none;cursor:pointer;text-align:left;font-size:12px;color:#dc3545;">🗑 删除</button>' : '');
    document.body.appendChild(menu);
    menu.querySelectorAll('button').forEach(function(btn) {
        btn.onclick = function() {
            var action = this.getAttribute('data-action');
            if (action === 'addNote') {
                var name = prompt('请输入笔记标题：', '新笔记');
                if (name && name.trim()) {
                    var children = getNoteChildren(node.id);
                    var newNode = { 
                        id: 'node_' + (noteData.nextId || 100), 
                        parentId: node.id, 
                        type: 'note', 
                        name: name.trim(), 
                        order: children.length, 
                        content: '✍️ ' + name.trim() + '\\n\\n在此记录你的灵感...' 
                    };
                    noteData.nextId = (noteData.nextId || 100) + 1;
                    noteData.nodes.push(newNode);
                    selectedId = newNode.id;
                    localStorage.setItem('note_expanded_' + node.id, 'true');
                    saveNoteData();
                    renderTree();
                    updateEditor();
                }
            } else if (action === 'addFolder') {
                var name = prompt('请输入新分类名称：', '新分类');
                if (name && name.trim()) {
                    var children = getNoteChildren(node.id);
                    var newNode = { 
                        id: 'node_' + (noteData.nextId || 100), 
                        parentId: node.id, 
                        type: 'folder', 
                        name: name.trim(), 
                        order: children.length, 
                        content: '📂 分类说明' 
                    };
                    noteData.nextId = (noteData.nextId || 100) + 1;
                    noteData.nodes.push(newNode);
                    selectedId = newNode.id;
                    localStorage.setItem('note_expanded_' + node.id, 'true');
                    saveNoteData();
                    renderTree();
                    updateEditor();
                }
            } else if (action === 'rename') {
                var newName = prompt('重命名：', node.name);
                if (newName && newName.trim()) { 
                    node.name = newName.trim(); 
                    saveNoteData(); 
                    renderTree(); 
                    updateEditor(); 
                }
            } else if (action === 'delete') {
                if (confirm('确定删除「' + node.name + '」及其所有子项吗？')) {
                    var toDelete = [node.id];
                    function collectChildren(pid) {
                        noteData.nodes.filter(function(n) { return n.parentId === pid; }).forEach(function(child) {
                            toDelete.push(child.id);
                            collectChildren(child.id);
                        });
                    }
                    collectChildren(node.id);
                    noteData.nodes = noteData.nodes.filter(function(n) { return toDelete.indexOf(n.id) === -1; });
                    var siblings = getNoteChildren(node.parentId);
                    siblings.forEach(function(s, idx) { s.order = idx; });
                    selectedId = noteData.nodes.length > 0 ? noteData.nodes[0].id : null;
                    saveNoteData();
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
}

function updateEditor() {
    var node = getNoteNode(selectedId);
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
    var node = getNoteNode(selectedId);
    if (!node) { alert('请先选择一个节点'); return; }
    var title = document.getElementById('winTitle').value.trim();
    var content = document.getElementById('winContent').value;
    if (title) node.name = title;
    node.content = content;
    saveNoteData();
    renderTree();
    updateEditor();
    document.getElementById('winStatus').textContent = '✅ 已保存';
    setTimeout(function() { document.getElementById('winStatus').textContent = '已保存'; }, 1500);
}
function deleteNode() {
    var node = getNoteNode(selectedId);
    if (!node) return;
    if (noteData.nodes.filter(function(n) { return n.parentId === null; }).length === 1 && node.parentId === null) {
        alert('至少保留一个根分类');
        return;
    }
    if (confirm('确定删除「' + node.name + '」及其所有子项吗？')) {
        var toDelete = [node.id];
        function collectChildren(pid) {
            noteData.nodes.filter(function(n) { return n.parentId === pid; }).forEach(function(child) {
                toDelete.push(child.id);
                collectChildren(child.id);
            });
        }
        collectChildren(node.id);
        noteData.nodes = noteData.nodes.filter(function(n) { return toDelete.indexOf(n.id) === -1; });
        var siblings = getNoteChildren(node.parentId);
        siblings.forEach(function(s, idx) { s.order = idx; });
        selectedId = noteData.nodes.length > 0 ? noteData.nodes[0].id : null;
        saveNoteData();
        renderTree();
        updateEditor();
        alert('已删除');
    }
}

// 绑定按钮事件
document.getElementById('winAddRoot').onclick = function() {
    var name = prompt('请输入分类名称：', '新分类');
    if (name && name.trim()) {
        var roots = noteData.nodes.filter(function(n) { return n.parentId === null; });
        var newNode = { 
            id: 'node_' + (noteData.nextId || 100), 
            parentId: null, 
            type: 'folder', 
            name: name.trim(), 
            order: roots.length, 
            content: '分类描述' 
        };
        noteData.nextId = (noteData.nextId || 100) + 1;
        noteData.nodes.push(newNode);
        selectedId = newNode.id;
        saveNoteData();
        renderTree();
        updateEditor();
    }
};
document.getElementById('winAddNoteBtn').onclick = function() {
    if (selectedId) {
        var node = getNoteNode(selectedId);
        if (node) {
            var name = prompt('请输入笔记标题：', '新笔记');
            if (name && name.trim()) {
                var children = getNoteChildren(selectedId);
                var newNode = { 
                    id: 'node_' + (noteData.nextId || 100), 
                    parentId: selectedId, 
                    type: 'note', 
                    name: name.trim(), 
                    order: children.length, 
                    content: '✍️ ' + name.trim() + '\\n\\n在此记录你的灵感...' 
                };
                noteData.nextId = (noteData.nextId || 100) + 1;
                noteData.nodes.push(newNode);
                selectedId = newNode.id;
                localStorage.setItem('note_expanded_' + selectedId, 'true');
                saveNoteData();
                renderTree();
                updateEditor();
            }
        }
    } else { alert('请先选择一个节点'); }
};
document.getElementById('winAddFolderBtn').onclick = function() {
    if (selectedId) {
        var node = getNoteNode(selectedId);
        if (node) {
            var name = prompt('请输入新分类名称：', '新分类');
            if (name && name.trim()) {
                var children = getNoteChildren(selectedId);
                var newNode = { 
                    id: 'node_' + (noteData.nextId || 100), 
                    parentId: selectedId, 
                    type: 'folder', 
                    name: name.trim(), 
                    order: children.length, 
                    content: '📂 分类说明' 
                };
                noteData.nextId = (noteData.nextId || 100) + 1;
                noteData.nodes.push(newNode);
                selectedId = newNode.id;
                localStorage.setItem('note_expanded_' + selectedId, 'true');
                saveNoteData();
                renderTree();
                updateEditor();
            }
        }
    } else { alert('请先选择一个节点'); }
};
document.getElementById('winRefresh').onclick = function() { 
    // 重新从 localStorage 加载数据
    var key = 'openwrite_note_' + (currentBookId || 'global');
    var saved = localStorage.getItem(key);
    if (saved) {
        try {
            var data = JSON.parse(saved);
            noteData.nodes = data.nodes || [];
            noteData.selectedId = data.selectedId || null;
            noteData.nextId = data.nextId || 1;
        } catch(e) {}
    }
    renderTree(); 
    updateEditor(); 
};
document.getElementById('winSave').onclick = saveNode;
document.getElementById('winDelete').onclick = deleteNode;
document.getElementById('winSearch').oninput = function() {
    var keyword = this.value.trim().toLowerCase();
    var container = document.getElementById('noteTree');
    if (!keyword) { renderTree(); return; }
    var items = container.querySelectorAll('.note-tree-header');
    items.forEach(function(item) {
        var id = item.getAttribute('data-id');
        var node = getNoteNode(id);
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
    var node = getNoteNode(selectedId);
    if (node) {
        node.content = this.value;
        document.getElementById('winWordCount').textContent = this.value.length + ' 字';
        document.getElementById('winStatus').textContent = '✏️ 未保存';
        clearTimeout(saveTimer);
        saveTimer = setTimeout(function() {
            saveNoteData();
            document.getElementById('winStatus').textContent = '✅ 已保存';
            setTimeout(function() { document.getElementById('winStatus').textContent = '已保存'; }, 1000);
        }, 500);
    }
};
document.getElementById('winTitle').oninput = function() {
    var node = getNoteNode(selectedId);
    if (node && this.value.trim()) {
        node.name = this.value.trim();
        saveNoteData();
        renderTree();
    }
};
document.addEventListener('keydown', function(e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); saveNode(); }
});

// 初始化
renderTree();
updateEditor();
console.log('笔记窗口已打开');
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

function bindNoteToolEntry() {
    var noteTool = document.querySelector('.sidebar-tool-item[data-tool="notes"]');
    if (noteTool) {
        noteTool.onclick = function() {
            var existingPanel = document.getElementById('floatingToolPanel');
            if (existingPanel) {
                closeNoteFloatingPanel();
                var toolItems = document.querySelectorAll('.sidebar-tool-item');
                toolItems.forEach(function(item) {
                    if (item.getAttribute('data-tool') === 'notes') {
                        item.style.background = '';
                    }
                });
            } else {
                openNoteSidebar('notes');
            }
        };
    }
}

// ========== 导出 ==========

window.openNotePanel = openNotePanel;
window.closeNotePanel = closeNotePanel;
window.openNoteSidebar = openNoteSidebar;
window.closeNoteFloatingPanel = closeNoteFloatingPanel;
window.openNoteInNewWindow = openNoteInNewWindow;
window.noteData = noteData;
window.getNoteData = getNoteData;
window.saveNoteData = saveNoteData;
window.renderNoteTree = renderNoteTree;
window.updateNoteEditor = updateNoteEditor;
window.addNoteRoot = addNoteRoot;
window.addNoteChild = addNoteChild;
window.addNoteFolder = addNoteFolder;
window.deleteNoteNode = deleteNoteNode;
window.renameNoteNode = renameNoteNode;
window.selectNoteNode = selectNoteNode;
window.getNoteNode = getNoteNode;
window.getNoteChildren = getNoteChildren;
window.renderCompactNoteTree = renderCompactNoteTree;
window.updateCompactNoteEditor = updateCompactNoteEditor;
window.bindNoteToolEntry = bindNoteToolEntry;

console.log('笔记工具已加载');
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(bindNoteToolEntry, 500);
});