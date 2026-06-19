// ========== 大纲工具 - 完整版 ==========

// 大纲数据（按书籍隔离）
var outlineData = {
    nodes: [],
    selectedId: null,
    nextId: 1
};

// ========== 数据操作 ==========

function getOutlineData() {
    var bookId = currentBookId || 'global';
    var key = 'openwrite_outline_' + bookId;
    var saved = localStorage.getItem(key);
    if (saved) {
        try {
            var data = JSON.parse(saved);
            outlineData.nodes = data.nodes || [];
            outlineData.selectedId = data.selectedId || null;
            outlineData.nextId = data.nextId || 1;
            return;
        } catch(e) {}
    }
    setDefaultOutlineData();
}

function setDefaultOutlineData() {
    outlineData.nodes = [
        { id: 'root_1', parentId: null, type: 'folder', name: '📌 总纲', order: 0, content: '小说总纲：世界观设定、主线脉络、人物图谱……' },
        { id: 'root_2', parentId: null, type: 'folder', name: '📚 卷章集', order: 1, content: '各卷章目录' },
        { id: 'ch_1', parentId: 'root_2', type: 'chapter', name: '第一卷·风云初动', order: 0, content: '第一卷大纲内容...' },
        { id: 'ch_2', parentId: 'ch_1', type: 'chapter', name: '第一章 启程', order: 0, content: '第一章具体大纲...' },
        { id: 'ch_3', parentId: 'ch_1', type: 'chapter', name: '第二章 暗流', order: 1, content: '第二章具体大纲...' },
    ];
    outlineData.selectedId = 'root_1';
    outlineData.nextId = 100;
    saveOutlineData();
}

function saveOutlineData() {
    var bookId = currentBookId || 'global';
    var key = 'openwrite_outline_' + bookId;
    var data = {
        nodes: outlineData.nodes,
        selectedId: outlineData.selectedId,
        nextId: outlineData.nextId
    };
    localStorage.setItem(key, JSON.stringify(data));
}

function getOutlineChildren(parentId) {
    return outlineData.nodes.filter(function(n) { return n.parentId === parentId; }).sort(function(a, b) { return (a.order || 0) - (b.order || 0); });
}

function getOutlineNode(id) {
    return outlineData.nodes.find(function(n) { return n.id === id; });
}

function genOutlineId() {
    return 'node_' + (outlineData.nextId++);
}

function getAllDescendants(parentId) {
    var result = [];
    var children = getOutlineChildren(parentId);
    children.forEach(function(child) {
        result.push(child.id);
        result = result.concat(getAllDescendants(child.id));
    });
    return result;
}

// ========== 全屏模式渲染 ==========

function renderOutlineTree() {
    var container = document.getElementById('outlineTree');
    if (!container) return;
    container.innerHTML = '';
    var roots = outlineData.nodes.filter(function(n) { return n.parentId === null; }).sort(function(a, b) { return (a.order || 0) - (b.order || 0); });
    if (roots.length === 0) {
        container.innerHTML = '<div style="padding:20px;text-align:center;color:#888;font-size:13px;">暂无大纲节点<br><button onclick="addOutlineRoot()" style="margin-top:10px;padding:6px 16px;background:#9b784e;color:white;border:none;border-radius:6px;cursor:pointer;">📌 创建总纲</button></div>';
        return;
    }
    roots.forEach(function(root) {
        container.appendChild(createOutlineNodeElement(root, 0));
    });
}

function createOutlineNodeElement(node, depth) {
    var div = document.createElement('div');
    div.className = 'outline-tree-node';
    div.setAttribute('data-id', node.id);
    div.style.marginBottom = '2px';
    var header = document.createElement('div');
    header.className = 'outline-tree-header';
    header.style.cssText = 'display:flex;align-items:center;gap:6px;padding:6px 8px;border-radius:6px;cursor:pointer;transition:background 0.15s;padding-left:' + (depth * 16 + 8) + 'px;';
    if (outlineData.selectedId === node.id) {
        header.style.background = 'rgba(0,122,255,0.12)';
        header.style.fontWeight = '500';
    }
    header.setAttribute('data-id', node.id);
    var hasChildren = getOutlineChildren(node.id).length > 0;
    var toggle = document.createElement('span');
    toggle.style.cssText = 'font-size:10px;width:16px;text-align:center;cursor:pointer;color:#888;flex-shrink:0;';
    if (hasChildren) {
        var isExpanded = localStorage.getItem('outline_expanded_' + node.id) !== 'false';
        toggle.textContent = isExpanded ? '▾' : '▸';
        toggle.onclick = function(e) {
            e.stopPropagation();
            toggleOutlineFolder(node.id);
        };
    } else {
        toggle.textContent = '·';
        toggle.style.color = '#ccc';
    }
    header.appendChild(toggle);
    var icon = document.createElement('span');
    icon.style.fontSize = '16px';
    icon.style.flexShrink = '0';
    icon.textContent = node.type === 'folder' ? '📁' : '📄';
    header.appendChild(icon);
    var nameSpan = document.createElement('span');
    nameSpan.style.cssText = 'flex:1;font-size:13px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--text-color, #333);';
    nameSpan.textContent = node.name || '未命名';
    header.appendChild(nameSpan);
    header.onclick = function(e) {
        if (e.target === toggle) return;
        selectOutlineNode(node.id);
    };
    header.ondblclick = function(e) {
        e.stopPropagation();
        renameOutlineNode(node.id);
    };
    header.draggable = true;
    header.ondragstart = function(e) {
        e.dataTransfer.setData('text/plain', node.id);
        e.dataTransfer.effectAllowed = 'move';
        this.style.opacity = '0.5';
    };
    header.ondragend = function(e) {
        this.style.opacity = '1';
    };
    header.ondragover = function(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        this.style.borderTop = '2px solid #007aff';
    };
    header.ondragleave = function(e) {
        this.style.borderTop = '';
    };
    header.ondrop = function(e) {
        e.preventDefault();
        this.style.borderTop = '';
        var sourceId = e.dataTransfer.getData('text/plain');
        if (sourceId === node.id) return;
        moveOutlineNode(sourceId, node.id);
    };
    header.oncontextmenu = function(e) {
        e.preventDefault();
        e.stopPropagation();
        showOutlineContextMenu(e.clientX, e.clientY, node.id);
    };
    div.appendChild(header);
    var children = getOutlineChildren(node.id);
    if (children.length > 0) {
        var childrenDiv = document.createElement('div');
        childrenDiv.className = 'outline-tree-children';
        var isExpanded = localStorage.getItem('outline_expanded_' + node.id) !== 'false';
        childrenDiv.style.display = isExpanded ? 'block' : 'none';
        children.forEach(function(child) {
            childrenDiv.appendChild(createOutlineNodeElement(child, depth + 1));
        });
        div.appendChild(childrenDiv);
    }
    return div;
}

function toggleOutlineFolder(nodeId) {
    var current = localStorage.getItem('outline_expanded_' + nodeId);
    var newState = current === 'false' ? 'true' : 'false';
    localStorage.setItem('outline_expanded_' + nodeId, newState);
    renderOutlineTree();
}

function selectOutlineNode(id) {
    console.log('selectOutlineNode 被调用:', id);
    outlineData.selectedId = id;
    saveOutlineData();
    
    // 更新全屏模式（仅当全屏模式的 DOM 存在时）
    if (document.getElementById('outlineTree')) {
        renderOutlineTree();
        updateOutlineEditor();
    }
    
    // 更新紧凑模式
    if (document.getElementById('compactOutlineTree')) {
        renderCompactOutlineTree();
        updateCompactEditor();
    }
}

function renameOutlineNode(id) {
    var node = getOutlineNode(id);
    if (!node) return;
    var newName = prompt('重命名：', node.name);
    if (newName && newName.trim()) {
        node.name = newName.trim();
        saveOutlineData();
        renderOutlineTree();
        updateOutlineEditor();
        updateCompactEditor();
        renderCompactOutlineTree();
    }
}

function moveOutlineNode(sourceId, targetId) {
    var source = getOutlineNode(sourceId);
    var target = getOutlineNode(targetId);
    if (!source || !target) return;
    if (source.type === 'folder') {
        var descendants = getAllDescendants(source.id);
        if (descendants.indexOf(target.id) !== -1) {
            alert('不能将文件夹移动到自己的子节点中');
            return;
        }
    }
    var newParentId = target.type === 'folder' ? target.id : target.parentId;
    if (newParentId === source.id) return;
    var oldParentId = source.parentId;
    var oldSiblings = getOutlineChildren(oldParentId);
    oldSiblings.forEach(function(s, idx) {
        if (s.id === sourceId) {
            oldSiblings.splice(idx, 1);
        }
    });
    oldSiblings.forEach(function(s, idx) { s.order = idx; });
    source.parentId = newParentId;
    var newSiblings = getOutlineChildren(newParentId);
    source.order = newSiblings.length;
    newSiblings.push(source);
    newSiblings.forEach(function(s, idx) { s.order = idx; });
    if (target.type !== 'folder') {
        var targetIndex = newSiblings.indexOf(target);
        if (targetIndex !== -1) {
            newSiblings.splice(targetIndex, 0, newSiblings.splice(newSiblings.length - 1, 1)[0]);
            newSiblings.forEach(function(s, idx) { s.order = idx; });
        }
    }
    saveOutlineData();
    renderOutlineTree();
    updateOutlineEditor();
    renderCompactOutlineTree();
    updateCompactEditor();
}

function addOutlineRoot() {
    var name = prompt('请输入总纲名称：', '📌 总纲');
    if (!name || !name.trim()) return;
    var roots = outlineData.nodes.filter(function(n) { return n.parentId === null; });
    var newNode = {
        id: genOutlineId(),
        parentId: null,
        type: 'folder',
        name: name.trim(),
        order: roots.length,
        content: '在此撰写总纲内容...'
    };
    outlineData.nodes.push(newNode);
    outlineData.selectedId = newNode.id;
    saveOutlineData();
    renderOutlineTree();
    updateOutlineEditor();
    renderCompactOutlineTree();
    updateCompactEditor();
}

// ========== 添加子节点（直接创建章节） ==========

function addOutlineChild(parentId) {
    var parent = getOutlineNode(parentId);
    if (!parent) {
        alert('请先选择一个父节点');
        return;
    }
    var name = prompt('请输入新章节名称：', '新章节');
    if (!name || !name.trim()) return;
    
    var children = getOutlineChildren(parentId);
    var newNode = {
        id: genOutlineId(),
        parentId: parentId,
        type: 'chapter',
        name: name.trim(),
        order: children.length,
        content: '✍️ 在此撰写章节细纲...'
    };
    outlineData.nodes.push(newNode);
    outlineData.selectedId = newNode.id;
    saveOutlineData();
    renderOutlineTree();
    updateOutlineEditor();
    renderCompactOutlineTree();
    updateCompactEditor();
    localStorage.setItem('outline_expanded_' + parentId, 'true');
}

function deleteOutlineNode() {
    var node = getOutlineNode(outlineData.selectedId);
    if (!node) return;
    if (outlineData.nodes.filter(function(n) { return n.parentId === null; }).length === 1 && node.parentId === null) {
        alert('至少保留一个根节点');
        return;
    }
    if (confirm('确定删除「' + node.name + '」及其所有子节点吗？')) {
        var toDelete = [node.id];
        function collectChildren(pid) {
            outlineData.nodes.filter(function(n) { return n.parentId === pid; }).forEach(function(child) {
                toDelete.push(child.id);
                collectChildren(child.id);
            });
        }
        collectChildren(node.id);
        outlineData.nodes = outlineData.nodes.filter(function(n) { return toDelete.indexOf(n.id) === -1; });
        var siblings = getOutlineChildren(node.parentId);
        siblings.forEach(function(s, idx) { s.order = idx; });
        outlineData.selectedId = outlineData.nodes.length > 0 ? outlineData.nodes[0].id : null;
        saveOutlineData();
        renderOutlineTree();
        updateOutlineEditor();
        renderCompactOutlineTree();
        updateCompactEditor();
        alert('已删除');
    }
}

function showOutlineContextMenu(x, y, nodeId) {
    var oldMenu = document.getElementById('outlineContextMenu');
    if (oldMenu) oldMenu.remove();
    var node = getOutlineNode(nodeId);
    if (!node) return;
    var menu = document.createElement('div');
    menu.id = 'outlineContextMenu';
    menu.style.cssText = 'position:fixed;background:#fff;border-radius:8px;padding:4px 0;box-shadow:0 2px 12px rgba(0,0,0,0.15);z-index:10000;min-width:140px;';
    menu.style.left = x + 'px';
    menu.style.top = y + 'px';
    var isRoot = node.parentId === null;
    var menuHtml =
        '<button data-action="add" style="display:block;width:100%;padding:8px 16px;border:none;background:none;cursor:pointer;text-align:left;font-size:13px;color:#333;">➕ 新增子节点</button>' +
        '<button data-action="rename" style="display:block;width:100%;padding:8px 16px;border:none;background:none;cursor:pointer;text-align:left;font-size:13px;color:#333;">✏️ 重命名</button>' +
        (outlineData.nodes.filter(function(n) { return n.parentId === null; }).length > 1 || !isRoot ?
            '<button data-action="delete" style="display:block;width:100%;padding:8px 16px;border:none;background:none;cursor:pointer;text-align:left;font-size:13px;color:#dc3545;">🗑 删除</button>' : '');
    menu.innerHTML = menuHtml;
    document.body.appendChild(menu);
    menu.querySelectorAll('button').forEach(function(btn) {
        btn.onclick = function(e) {
            e.stopPropagation();
            var action = this.getAttribute('data-action');
            if (action === 'add') {
                addOutlineChild(nodeId);
            } else if (action === 'rename') {
                renameOutlineNode(nodeId);
            } else if (action === 'delete') {
                deleteOutlineNode();
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

function updateOutlineEditor() {
    var titleInput = document.getElementById('outlineEditorTitle');
    var contentArea = document.getElementById('outlineEditorContent');
    var wordCount = document.getElementById('outlineWordCount');
    var statusEl = document.getElementById('outlineStatus');
    
    // 如果元素不存在，说明全屏模式未打开，直接返回
    if (!titleInput || !contentArea) {
        return;
    }
    
    var node = getOutlineNode(outlineData.selectedId);
    if (node) {
        titleInput.value = node.name || '';
        contentArea.value = node.content || '';
        if (wordCount) wordCount.textContent = (node.content || '').length + ' 字';
        if (statusEl) statusEl.textContent = '已选择：' + node.name;
        var deleteBtn = document.getElementById('outlineDeleteBtn');
        if (deleteBtn) deleteBtn.style.display = 'inline-block';
    } else {
        titleInput.value = '';
        contentArea.value = '';
        if (wordCount) wordCount.textContent = '0 字';
        if (statusEl) statusEl.textContent = '请选择一个节点';
        var deleteBtn = document.getElementById('outlineDeleteBtn');
        if (deleteBtn) deleteBtn.style.display = 'none';
    }
}

function saveOutlineNode() {
    var node = getOutlineNode(outlineData.selectedId);
    if (!node) {
        alert('请先选择一个节点');
        return;
    }
    var title = document.getElementById('outlineEditorTitle').value.trim();
    var content = document.getElementById('outlineEditorContent').value;
    if (title) node.name = title;
    node.content = content;
    saveOutlineData();
    renderOutlineTree();
    updateOutlineEditor();
    renderCompactOutlineTree();
    updateCompactEditor();
    document.getElementById('outlineStatus').textContent = '✅ 已保存';
    setTimeout(function() {
        document.getElementById('outlineStatus').textContent = '已保存';
    }, 1500);
}

function searchOutlineNodes() {
    var keyword = document.getElementById('outlineSearchInput').value.trim().toLowerCase();
    var container = document.getElementById('outlineTree');
    if (!keyword) { renderOutlineTree(); return; }
    var allNodes = outlineData.nodes;
    var matchedIds = [];
    allNodes.forEach(function(n) {
        if (n.name.toLowerCase().indexOf(keyword) !== -1 || (n.content && n.content.toLowerCase().indexOf(keyword) !== -1)) {
            matchedIds.push(n.id);
        }
    });
    var items = container.querySelectorAll('.outline-tree-header');
    items.forEach(function(item) {
        var id = item.getAttribute('data-id');
        if (matchedIds.indexOf(id) !== -1) {
            item.style.background = 'rgba(255,193,7,0.3)';
            item.style.borderRadius = '4px';
        } else {
            if (outlineData.selectedId === id) {
                item.style.background = 'rgba(0,122,255,0.12)';
            } else {
                item.style.background = '';
            }
        }
    });
}

// ========== 全屏模式打开/关闭 ==========

function openOutlinePanel() {
    var existingPage = document.querySelector('.page[data-page="outline_panel"]');
    if (existingPage) {
        switchToTab('outline_panel');
        return;
    }
    var bookId = currentBookId || 'global';
    var tabId = 'outline_panel';
    openTabs.push({ id: tabId, title: '📖 大纲', type: 'outline', bookId: bookId });
    renderTabs();
    var pagesContainer = document.getElementById('pagesContainer');
    var pageDiv = document.createElement('div');
    pageDiv.className = 'page';
    pageDiv.setAttribute('data-page', tabId);
    pageDiv.innerHTML = renderOutlinePage();
    pagesContainer.appendChild(pageDiv);
    getOutlineData();
    renderOutlineTree();
    updateOutlineEditor();
    initOutlineEvents();
    switchToTab(tabId);
    var sidebar = document.querySelector('.sidebar-menu');
    if (sidebar) sidebar.style.display = 'none';
}

function closeOutlinePanel() {
    closeTab('outline_panel');
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

function renderOutlinePage() {
    return `
        <div class="outline-container" style="display:flex;height:100%;width:100%;">
            <div class="outline-sidebar" style="width:280px;min-width:200px;max-width:400px;background:var(--panel-bg, rgba(255,255,255,0.95));backdrop-filter:blur(8px);border-right:1px solid var(--border-color, rgba(0,0,0,0.08));display:flex;flex-direction:column;flex-shrink:0;position:relative;overflow:visible;">
                <div class="outline-sidebar-header" style="display:flex;justify-content:space-between;align-items:center;padding:12px 16px;background:rgba(0,0,0,0.03);border-bottom:1px solid var(--border-color, rgba(0,0,0,0.08));flex-shrink:0;">
                    <span style="font-weight:600;">📋 大纲目录</span>
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
                <!-- 搜索框 -->
                <div style="padding:8px 12px;flex-shrink:0;">
                    <input type="text" id="outlineSearchInput" placeholder="搜索大纲..." style="width:100%;padding:6px 10px 6px 32px;border:1px solid var(--border-color, #ddd);border-radius:6px;font-size:12px;background:var(--input-bg, #f8f8f8) url('icons/search.svg') no-repeat 8px center;background-size:16px 16px;color:var(--text-color, #333);">
                </div>
                <!-- 添加按钮 - 一左一右 -->
                <div style="display:flex;gap:6px;padding:0 12px 8px 12px;flex-shrink:0;">
                    <button id="outlineAddChapterBtn" title="新增章节" style="flex:1;background:#28a745;color:white;border:none;border-radius:4px;cursor:pointer;font-size:12px;padding:5px 0;font-weight:500;">+ 章节</button>
                     <button id="outlineAddFolderBtn" title="新增文件夹" style="flex:1;background:#9b784e;color:white;border:none;border-radius:4px;cursor:pointer;font-size:12px;padding:5px 0;font-weight:500;">
        <img src="icons/folder.svg" width="14" height="14" alt="分卷" style="vertical-align:middle; margin-right:4px;"> 分卷
    </button>
                </div>
                <div id="outlineTree" class="outline-tree-container" style="flex:1;overflow-y:auto;padding:8px 4px;"></div>
                <div style="padding:8px 12px;border-top:1px solid var(--border-color, rgba(0,0,0,0.08));font-size:11px;color:#888;display:flex;justify-content:space-between;flex-shrink:0;">
                    <span>节点: <span id="outlineNodeCount">0</span></span>
                    <span>💡 双击重命名 · 拖拽移动</span>
                </div>
                <div id="outlineResizeHandle" style="position:absolute;right:-4px;top:0;width:6px;height:100%;cursor:ew-resize;background:transparent;z-index:10;transition:background 0.2s;"></div>
            </div>
            <div class="outline-editor" style="flex:1;display:flex;flex-direction:column;background:var(--panel-bg, rgba(255,255,255,0.9));overflow:hidden;">
                <div style="display:flex;justify-content:space-between;align-items:center;padding:12px 20px;border-bottom:1px solid var(--border-color, rgba(0,0,0,0.08));flex-shrink:0;">
                    <input type="text" id="outlineEditorTitle" placeholder="大纲标题" style="font-size:18px;font-weight:600;border:none;background:transparent;outline:none;flex:1;color:var(--text-color, #333);">
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
                <textarea id="outlineEditorContent" style="flex:1;padding:20px;border:none;outline:none;resize:none;font-size:14px;line-height:1.8;background:transparent;color:var(--text-color, #333);font-family:inherit;" placeholder="在此撰写大纲内容..."></textarea>
                <div class="outline-status-bar" style="padding:8px 20px;border-top:1px solid var(--border-color, rgba(0,0,0,0.08));display:flex;justify-content:space-between;font-size:12px;color:#888;flex-shrink:0;">
                    <span id="outlineWordCount">0 字</span>
                    <span id="outlineStatus">已就绪</span>
                </div>
            </div>
        </div>
    `;
}

function initOutlineEvents() {
    var closeBtn = document.getElementById('outlineCloseBtn');
    if (closeBtn) closeBtn.onclick = closeOutlinePanel;
    var saveBtn = document.getElementById('outlineSaveBtn');
    if (saveBtn) saveBtn.onclick = saveOutlineNode;
    var deleteBtn = document.getElementById('outlineDeleteBtn');
    if (deleteBtn) deleteBtn.onclick = deleteOutlineNode;
    var addRootBtn = document.getElementById('outlineAddRootBtn');
    if (addRootBtn) addRootBtn.onclick = addOutlineRoot;
    var addChildBtn = document.getElementById('outlineAddChildBtn');
    if (addChildBtn) {
        addChildBtn.onclick = function() {
            if (outlineData.selectedId) {
                addOutlineChild(outlineData.selectedId);
            } else {
                alert('请先选择一个节点');
            }
        };
    }
    // ========== 新增：标签页的章节和分卷按钮 ==========
    var outlineAddChapterBtn = document.getElementById('outlineAddChapterBtn');
    if (outlineAddChapterBtn) {
        outlineAddChapterBtn.onclick = function() {
            if (outlineData.selectedId) {
                addOutlineChild(outlineData.selectedId);
            } else {
                alert('请先选择一个节点');
            }
        };
    }
    
    var outlineAddFolderBtn = document.getElementById('outlineAddFolderBtn');
    if (outlineAddFolderBtn) {
        outlineAddFolderBtn.onclick = function() {
            if (outlineData.selectedId) {
                var parent = getOutlineNode(outlineData.selectedId);
                if (parent) {
                    var name = prompt('请输入新文件夹名称：', '新分卷');
                    if (name && name.trim()) {
                        var children = getOutlineChildren(outlineData.selectedId);
                        var newNode = {
                            id: genOutlineId(),
                            parentId: outlineData.selectedId,
                            type: 'folder',
                            name: name.trim(),
                            order: children.length,
                            content: '📁 文件夹内容'
                        };
                        outlineData.nodes.push(newNode);
                        outlineData.selectedId = newNode.id;
                        localStorage.setItem('outline_expanded_' + outlineData.selectedId, 'true');
                        saveOutlineData();
                        renderOutlineTree();
                        updateOutlineEditor();
                        renderCompactOutlineTree();
                        updateCompactEditor();
                    }
                }
            } else {
                addOutlineRoot();
                renderOutlineTree();
                updateOutlineEditor();
            }
        };
    }
    var refreshBtn = document.getElementById('outlineRefreshBtn');
    if (refreshBtn) {
        refreshBtn.onclick = function() {
            getOutlineData();
            renderOutlineTree();
            updateOutlineEditor();
            renderCompactOutlineTree();
            updateCompactEditor();
        };
    }
    var searchInput = document.getElementById('outlineSearchInput');
    if (searchInput) searchInput.oninput = searchOutlineNodes;
    var pinBtn = document.getElementById('outlinePinBtn');
    if (pinBtn) {
        pinBtn.onclick = function() {
            console.log('📌 缩起按钮被点击！');
            closeOutlinePanel();
            setTimeout(function() {
                openToolSidebar('outline');
            }, 150);
        };
    }
    var contentArea = document.getElementById('outlineEditorContent');
    var titleInput = document.getElementById('outlineEditorTitle');
    var saveTimer = null;
    if (contentArea) {
        contentArea.oninput = function() {
            var node = getOutlineNode(outlineData.selectedId);
            if (node) {
                node.content = this.value;
                document.getElementById('outlineWordCount').textContent = this.value.length + ' 字';
                document.getElementById('outlineStatus').textContent = '✏️ 未保存';
                clearTimeout(saveTimer);
                saveTimer = setTimeout(function() {
                    saveOutlineData();
                    document.getElementById('outlineStatus').textContent = '✅ 已保存';
                    setTimeout(function() {
                        document.getElementById('outlineStatus').textContent = '已保存';
                    }, 1000);
                }, 500);
            }
        };
    }
    if (titleInput) {
        titleInput.oninput = function() {
            var node = getOutlineNode(outlineData.selectedId);
            if (node && this.value.trim()) {
                node.name = this.value.trim();
                saveOutlineData();
                renderOutlineTree();
                renderCompactOutlineTree();
            }
        };
    }
    var handle = document.getElementById('outlineResizeHandle');
    var sidebar = document.querySelector('.outline-sidebar');
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
    updateNodeCount();
}

function updateNodeCount() {
    var count = outlineData.nodes.length;
    var el = document.getElementById('outlineNodeCount');
    if (el) el.textContent = count;
}

// ========== 浮动面板（紧凑模式） ==========

function openToolSidebar(tool) {
    console.log('openToolSidebar 被调用，工具:', tool);
    var sidebar = document.querySelector('.sidebar-menu');
    if (sidebar) { sidebar.style.display = 'none'; }
    
    // 如果面板已存在，先移除
    var existingPanel = document.getElementById('floatingToolPanel');
    if (existingPanel) {
        existingPanel.remove();
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
    if (detailMain) {
        var panel = document.createElement('div');
        panel.id = 'floatingToolPanel';
        panel.style.cssText = 'width:420px;min-width:350px;max-width:550px;height:100%;background:var(--panel-bg, rgba(255,255,255,0.98));backdrop-filter:blur(12px);border-left:1px solid var(--border-color, rgba(0,0,0,0.08));border-right:1px solid var(--border-color, rgba(0,0,0,0.08));display:flex;flex-direction:column;flex-shrink:0;overflow:hidden;z-index:10;transition:width 0.2s ease;box-shadow:-2px 0 12px rgba(0,0,0,0.08);';
        panel.innerHTML = renderCompactOutlinePanel();
        var editor = document.querySelector('.detail-editor');
        if (editor && editor.nextSibling) {
            detailMain.insertBefore(panel, editor.nextSibling);
        } else {
            detailMain.appendChild(panel);
        }
        getOutlineData();
        renderCompactOutlineTree();
        updateCompactEditor();
        bindCompactOutlineEvents();
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

function closeFloatingPanel() {
    var panel = document.getElementById('floatingToolPanel');
    if (panel) { panel.remove(); }
    var rightSidebar = document.getElementById('rightSidebar');
    if (rightSidebar) {
        rightSidebar.style.width = '48px';
        rightSidebar.style.minWidth = '48px';
    }
}

function renderCompactOutlinePanel() {
    return `
        <div style="display:flex;flex-direction:column;height:100%;width:100%;">
            <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 14px;border-bottom:1px solid var(--border-color, rgba(0,0,0,0.08));flex-shrink:0;">
                <span style="font-weight:600;font-size:14px;">📋 大纲</span>
                <div style="display:flex;gap:4px;">
                    <button id="compactOutlineExpandBtn" title="新窗口打开" style="background:none;border:none;cursor:pointer;font-size:14px;padding:2px 8px;border-radius:4px;">⤢</button>
                    <button id="compactOutlineCloseBtn" title="关闭面板" style="background:none;border:none;cursor:pointer;font-size:14px;padding:2px 8px;border-radius:4px;">✕</button>
                </div>
            </div>
            <div style="display:flex;flex:1;overflow:hidden;">
                <div style="width:38%;min-width:120px;max-width:180px;border-right:1px solid var(--border-color, rgba(0,0,0,0.08));display:flex;flex-direction:column;overflow:hidden;">
                    <!-- 搜索框 -->
                    <div style="padding:4px 8px;flex-shrink:0;">
                        <input type="text" id="outlineSearchInput" placeholder="搜索..." style="width:100%;padding:6px 10px 6px 32px;border:1px solid var(--border-color, #ddd);border-radius:6px;font-size:12px;background:var(--input-bg, #f8f8f8) url('icons/search.svg') no-repeat 8px center;background-size:16px 16px;color:var(--text-color, #333);">
                    </div>
                    <!-- 添加按钮 - 一左一右 -->
                    <div style="display:flex;gap:6px;padding:4px 8px 6px 8px;flex-shrink:0;">
                        <button id="compactOutlineAddBtn" title="新增章节" style="flex:1;background:#28a745;color:white;border:none;border-radius:4px;cursor:pointer;font-size:12px;padding:4px 0;font-weight:500;">➕ 章节</button>
                        <button id="compactOutlineAddFolderBtn" title="新增文件夹" style="flex:1;background:#9b784e;color:white;border:none;border-radius:4px;cursor:pointer;font-size:12px;padding:4px 0;font-weight:500;">📁 分卷</button>
                    </div>
                    <!-- 大纲树 -->
                    <div id="compactOutlineTree" style="flex:1;overflow-y:auto;padding:4px 4px;"></div>
                    <div style="padding:3px 10px;border-top:1px solid var(--border-color, rgba(0,0,0,0.08));font-size:10px;color:#888;flex-shrink:0;display:flex;justify-content:space-between;">
                        <span>节点: <span id="compactNodeCount">0</span></span>
                        <span>📌 点击选择</span>
                    </div>
                </div>
                <div style="flex:1;display:flex;flex-direction:column;overflow:hidden;min-width:150px;">
                    <div style="padding:6px 12px;border-bottom:1px solid var(--border-color, rgba(0,0,0,0.08));flex-shrink:0;display:flex;gap:6px;align-items:center;">
                        <input type="text" id="compactOutlineTitle" placeholder="标题" style="flex:1;font-size:15px;font-weight:600;border:none;background:transparent;outline:none;color:var(--text-color, #333);">
                        <button id="compactOutlineSaveBtn" title="保存" style="background:#9b784e;color:white;border:none;border-radius:4px;cursor:pointer;font-size:11px;padding:2px 10px;">💾</button>
                    </div>
                    <textarea id="compactOutlineContent" style="flex:1;padding:10px 12px;border:none;outline:none;resize:none;font-size:13px;line-height:1.8;background:transparent;color:var(--text-color, #333);font-family:inherit;" placeholder="在此撰写大纲内容..."></textarea>
                    <div style="padding:3px 12px;border-top:1px solid var(--border-color, rgba(0,0,0,0.08));font-size:10px;color:#888;display:flex;justify-content:space-between;flex-shrink:0;">
                        <span id="compactWordCount">0 字</span>
                        <span id="compactStatus">已就绪</span>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// ========== 紧凑模式渲染 ==========

function renderCompactOutlineTree() {
    var container = document.getElementById('compactOutlineTree');
    if (!container) return;
    container.innerHTML = '';
    var roots = outlineData.nodes.filter(function(n) { return n.parentId === null; }).sort(function(a, b) { return (a.order || 0) - (b.order || 0); });
    if (roots.length === 0) {
        container.innerHTML = '<div style="padding:12px;text-align:center;color:#888;font-size:12px;">暂无大纲节点</div>';
        return;
    }
    roots.forEach(function(root) {
        container.appendChild(createCompactOutlineNode(root, 0));
    });
    var countEl = document.getElementById('compactNodeCount');
    if (countEl) countEl.textContent = outlineData.nodes.length;
}

function createCompactOutlineNode(node, depth) {
    var div = document.createElement('div');
    div.className = 'compact-outline-node';
    div.setAttribute('data-id', node.id);
    div.style.marginBottom = '1px';
    
    var header = document.createElement('div');
    header.className = 'compact-outline-header';
    header.style.cssText = 'display:flex;align-items:center;gap:4px;padding:3px 6px;border-radius:4px;cursor:pointer;transition:background 0.15s;padding-left:' + (depth * 12 + 4) + 'px;font-size:12px;';
    if (outlineData.selectedId === node.id) {
        header.style.background = 'rgba(0,122,255,0.12)';
        header.style.fontWeight = '500';
    }
    header.setAttribute('data-id', node.id);
    
    var hasChildren = getOutlineChildren(node.id).length > 0;
    var toggle = document.createElement('span');
    toggle.style.cssText = 'font-size:8px;width:12px;text-align:center;cursor:pointer;color:#888;flex-shrink:0;';
    if (hasChildren) {
        var isExpanded = localStorage.getItem('outline_expanded_' + node.id) !== 'false';
        toggle.textContent = isExpanded ? '▾' : '▸';
        toggle.onclick = function(e) {
            e.stopPropagation();
            e.preventDefault();
            var current = localStorage.getItem('outline_expanded_' + node.id);
            var newState = current === 'false' ? 'true' : 'false';
            localStorage.setItem('outline_expanded_' + node.id, newState);
            renderCompactOutlineTree();
        };
    } else {
        toggle.textContent = '·';
        toggle.style.color = '#ccc';
    }
    header.appendChild(toggle);
    
    var icon = document.createElement('span');
    icon.style.fontSize = '12px';
    icon.style.flexShrink = '0';
    icon.textContent = node.type === 'folder' ? '📁' : '📄';
    header.appendChild(icon);
    
    var nameSpan = document.createElement('span');
    nameSpan.style.cssText = 'flex:1;font-size:12px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--text-color, #333);';
    nameSpan.textContent = node.name || '未命名';
    header.appendChild(nameSpan);
    
    // ========== 点击选择 ==========
    header.onclick = function(e) {
    if (e.target === toggle) return;
    console.log('紧凑模式选中:', node.name);
    outlineData.selectedId = node.id;
    saveOutlineData();
    
    // 只更新紧凑模式（浮动面板）
    renderCompactOutlineTree();
    updateCompactEditor();
    
    // 如果全屏模式存在，也更新它
    if (document.getElementById('outlineTree')) {
        renderOutlineTree();
        updateOutlineEditor();
    }
};
    
    div.appendChild(header);
    
    var children = getOutlineChildren(node.id);
    if (children.length > 0) {
        var childrenDiv = document.createElement('div');
        childrenDiv.className = 'compact-outline-children';
        var isExpanded = localStorage.getItem('outline_expanded_' + node.id) !== 'false';
        childrenDiv.style.display = isExpanded ? 'block' : 'none';
        children.forEach(function(child) {
            childrenDiv.appendChild(createCompactOutlineNode(child, depth + 1));
        });
        div.appendChild(childrenDiv);
    }
    
    return div;
}

function toggleCompactOutlineFolder(nodeId) {
    var current = localStorage.getItem('outline_expanded_' + nodeId);
    var newState = current === 'false' ? 'true' : 'false';
    localStorage.setItem('outline_expanded_' + nodeId, newState);
    renderCompactOutlineTree();
}

function updateCompactEditor() {
    var node = getOutlineNode(outlineData.selectedId);
    var titleInput = document.getElementById('compactOutlineTitle');
    var contentArea = document.getElementById('compactOutlineContent');
    var wordCount = document.getElementById('compactWordCount');
    var statusEl = document.getElementById('compactStatus');
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

// ========== 紧凑模式事件绑定 ==========

function bindCompactOutlineEvents() {
    var addBtn = document.getElementById('compactOutlineAddBtn');
    if (addBtn) {
        addBtn.onclick = function() {
            if (outlineData.selectedId) {
                addOutlineChild(outlineData.selectedId);
            } else {
                addOutlineRoot();
            }
            renderCompactOutlineTree();
            updateCompactEditor();
        };
    }
    var addFolderBtn = document.getElementById('compactOutlineAddFolderBtn');
    if (addFolderBtn) {
        addFolderBtn.onclick = function() {
            if (outlineData.selectedId) {
                var parent = getOutlineNode(outlineData.selectedId);
                if (parent) {
                    var name = prompt('请输入新文件夹名称：', '新文件夹');
                    if (name && name.trim()) {
                        var children = getOutlineChildren(outlineData.selectedId);
                        var newNode = {
                            id: genOutlineId(),
                            parentId: outlineData.selectedId,
                            type: 'folder',
                            name: name.trim(),
                            order: children.length,
                            content: '📁 文件夹内容'
                        };
                        outlineData.nodes.push(newNode);
                        outlineData.selectedId = newNode.id;
                        localStorage.setItem('outline_expanded_' + outlineData.selectedId, 'true');
                        saveOutlineData();
                        renderOutlineTree();
                        updateOutlineEditor();
                        renderCompactOutlineTree();
                        updateCompactEditor();
                    }
                }
            } else {
                addOutlineRoot();
                renderCompactOutlineTree();
                updateCompactEditor();
            }
        };
    }
    var expandBtn = document.getElementById('compactOutlineExpandBtn');
    if (expandBtn) {
        expandBtn.onclick = function() {
            openOutlineInNewWindow();
        };
    }
    var closeBtn = document.getElementById('compactOutlineCloseBtn');
    if (closeBtn) {
        closeBtn.onclick = function() {
            closeFloatingPanel();
            var rightSidebar = document.getElementById('rightSidebar');
            if (rightSidebar) {
                rightSidebar.style.width = '48px';
                rightSidebar.style.minWidth = '48px';
            }
            var toolItems = document.querySelectorAll('.sidebar-tool-item');
            toolItems.forEach(function(item) {
                if (item.getAttribute('data-tool') === 'outline') {
                    item.style.background = '';
                }
            });
        };
    }
    var saveBtn = document.getElementById('compactOutlineSaveBtn');
    if (saveBtn) {
        saveBtn.onclick = function() {
            var node = getOutlineNode(outlineData.selectedId);
            if (!node) { alert('请先选择一个节点'); return; }
            var title = document.getElementById('compactOutlineTitle').value.trim();
            var content = document.getElementById('compactOutlineContent').value;
            if (title) node.name = title;
            node.content = content;
            saveOutlineData();
            renderOutlineTree();
            updateOutlineEditor();
            renderCompactOutlineTree();
            updateCompactEditor();
            document.getElementById('compactStatus').textContent = '✅ 已保存';
            setTimeout(function() {
                document.getElementById('compactStatus').textContent = '已就绪';
            }, 1500);
        };
    }
    var searchInput = document.getElementById('compactOutlineSearch');
    if (searchInput) {
        searchInput.oninput = function() {
            var keyword = this.value.trim().toLowerCase();
            var container = document.getElementById('compactOutlineTree');
            if (!keyword) { renderCompactOutlineTree(); return; }
            var items = container.querySelectorAll('.compact-outline-header');
            items.forEach(function(item) {
                var id = item.getAttribute('data-id');
                var node = getOutlineNode(id);
                if (node && (node.name.toLowerCase().indexOf(keyword) !== -1 || (node.content && node.content.toLowerCase().indexOf(keyword) !== -1))) {
                    item.style.background = 'rgba(255,193,7,0.3)';
                } else {
                    if (outlineData.selectedId === id) {
                        item.style.background = 'rgba(0,122,255,0.12)';
                    } else {
                        item.style.background = '';
                    }
                }
            });
        };
    }
    var titleInput = document.getElementById('compactOutlineTitle');
    var contentArea = document.getElementById('compactOutlineContent');
    var saveTimer = null;
    if (contentArea) {
        contentArea.oninput = function() {
            var node = getOutlineNode(outlineData.selectedId);
            if (node) {
                node.content = this.value;
                document.getElementById('compactWordCount').textContent = this.value.length + ' 字';
                document.getElementById('compactStatus').textContent = '✏️ 未保存';
                clearTimeout(saveTimer);
                saveTimer = setTimeout(function() {
                    saveOutlineData();
                    document.getElementById('compactStatus').textContent = '✅ 已保存';
                    setTimeout(function() {
                        document.getElementById('compactStatus').textContent = '已就绪';
                    }, 1000);
                }, 500);
            }
        };
    }
    if (titleInput) {
        titleInput.oninput = function() {
            var node = getOutlineNode(outlineData.selectedId);
            if (node && this.value.trim()) {
                node.name = this.value.trim();
                saveOutlineData();
                renderCompactOutlineTree();
            }
        };
    }
    var treeContainer = document.getElementById('compactOutlineTree');
    if (treeContainer) {
        treeContainer.addEventListener('contextmenu', function(e) {
            var target = e.target.closest('.compact-outline-header');
            if (target) {
                e.preventDefault();
                var nodeId = target.getAttribute('data-id');
                showCompactContextMenu(e.clientX, e.clientY, nodeId);
            }
        });
    }
}

function showCompactContextMenu(x, y, nodeId) {
    var oldMenu = document.getElementById('compactContextMenu');
    if (oldMenu) oldMenu.remove();
    var node = getOutlineNode(nodeId);
    if (!node) return;
    var menu = document.createElement('div');
    menu.id = 'compactContextMenu';
    menu.style.cssText = 'position:fixed;background:#fff;border-radius:8px;padding:4px 0;box-shadow:0 2px 12px rgba(0,0,0,0.15);z-index:10001;min-width:120px;';
    menu.style.left = Math.min(x, window.innerWidth - 140) + 'px';
    menu.style.top = Math.min(y, window.innerHeight - 120) + 'px';
    var menuHtml =
        '<button data-action="addChapter" style="display:block;width:100%;padding:6px 14px;border:none;background:none;cursor:pointer;text-align:left;font-size:12px;color:#333;">➕ 新增章节</button>' +
        '<button data-action="addFolder" style="display:block;width:100%;padding:6px 14px;border:none;background:none;cursor:pointer;text-align:left;font-size:12px;color:#333;">📁 新增文件夹</button>' +
        '<button data-action="rename" style="display:block;width:100%;padding:6px 14px;border:none;background:none;cursor:pointer;text-align:left;font-size:12px;color:#333;">✏️ 重命名</button>' +
        (outlineData.nodes.filter(function(n) { return n.parentId === null; }).length > 1 || node.parentId !== null ?
            '<button data-action="delete" style="display:block;width:100%;padding:6px 14px;border:none;background:none;cursor:pointer;text-align:left;font-size:12px;color:#dc3545;">🗑 删除</button>' : '');
    menu.innerHTML = menuHtml;
    document.body.appendChild(menu);
    menu.querySelectorAll('button').forEach(function(btn) {
        btn.onclick = function(e) {
            e.stopPropagation();
            var action = this.getAttribute('data-action');
            if (action === 'addChapter') {
                addOutlineChild(nodeId);
                renderCompactOutlineTree();
                updateCompactEditor();
            } else if (action === 'addFolder') {
                var name = prompt('请输入新文件夹名称：', '新文件夹');
                if (name && name.trim()) {
                    var children = getOutlineChildren(nodeId);
                    var newNode = {
                        id: genOutlineId(),
                        parentId: nodeId,
                        type: 'folder',
                        name: name.trim(),
                        order: children.length,
                        content: '📁 文件夹内容'
                    };
                    outlineData.nodes.push(newNode);
                    outlineData.selectedId = newNode.id;
                    localStorage.setItem('outline_expanded_' + nodeId, 'true');
                    saveOutlineData();
                    renderOutlineTree();
                    updateOutlineEditor();
                    renderCompactOutlineTree();
                    updateCompactEditor();
                }
            } else if (action === 'rename') {
                renameOutlineNode(nodeId);
            } else if (action === 'delete') {
                deleteOutlineNode();
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

// ========== 新窗口打开全屏大纲 ==========

function openOutlineInNewWindow() {
    closeFloatingPanel();
    var html = `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><title>📖 大纲 - 全屏编辑</title>
<style>
* { margin:0; padding:0; box-sizing:border-box; }
body { font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif; background:#f0f2f5; height:100vh; overflow:hidden; }
.outline-container { display:flex; height:100vh; width:100%; }
.outline-sidebar { width:300px; min-width:220px; max-width:450px; background:rgba(255,255,255,0.95); backdrop-filter:blur(8px); border-right:1px solid rgba(0,0,0,0.08); display:flex; flex-direction:column; flex-shrink:0; overflow:hidden; }
.outline-sidebar-header { display:flex; justify-content:space-between; align-items:center; padding:12px 16px; background:rgba(0,0,0,0.03); border-bottom:1px solid rgba(0,0,0,0.08); flex-shrink:0; }
.outline-sidebar-header span { font-weight:600; font-size:15px; }
.outline-sidebar-header button { background:none; border:none; cursor:pointer; font-size:16px; padding:0 4px; }
.outline-search { padding:8px 12px; flex-shrink:0; }
.outline-search input { width:100%; padding:6px 10px; border:1px solid #ddd; border-radius:6px; font-size:13px; background:#f8f8f8; }
/* 新增：添加按钮行 */
.outline-add-buttons { display:flex; gap:6px; padding:0 12px 8px 12px; flex-shrink:0; }
.outline-add-buttons button { flex:1; border:none; border-radius:4px; cursor:pointer; font-size:12px; padding:5px 0; font-weight:500; color:white; }
.outline-add-buttons .add-chapter { background:#28a745; }
.outline-add-buttons .add-folder { background:#9b784e; }
#outlineTree { flex:1; overflow-y:auto; padding:8px 4px; }
.outline-status { padding:6px 12px; border-top:1px solid rgba(0,0,0,0.08); font-size:11px; color:#888; display:flex; justify-content:space-between; flex-shrink:0; }
.outline-editor { flex:1; display:flex; flex-direction:column; background:rgba(255,255,255,0.9); overflow:hidden; }
.outline-editor-header { display:flex; justify-content:space-between; align-items:center; padding:12px 20px; border-bottom:1px solid rgba(0,0,0,0.08); flex-shrink:0; }
.outline-editor-header input { font-size:18px; font-weight:600; border:none; background:transparent; outline:none; flex:1; color:#333; }
.outline-editor-header button { padding:6px 16px; border:none; border-radius:6px; cursor:pointer; font-size:13px; }
.outline-editor-header .save-btn { background:#9b784e; color:white; }
.outline-editor-header .delete-btn { background:#dc3545; color:white; }
.outline-editor-content { flex:1; padding:20px; border:none; outline:none; resize:none; font-size:14px; line-height:1.8; background:transparent; color:#333; font-family:inherit; }
.outline-status-bar { padding:8px 20px; border-top:1px solid rgba(0,0,0,0.08); display:flex; justify-content:space-between; font-size:12px; color:#888; flex-shrink:0; }
::-webkit-scrollbar { width:6px; height:6px; }
::-webkit-scrollbar-thumb { background:rgba(136,136,136,0.4); border-radius:3px; }
::-webkit-scrollbar-track { background:transparent; }
.outline-tree-node { margin-bottom:2px; }
.outline-tree-header { display:flex; align-items:center; gap:6px; padding:5px 8px; border-radius:6px; cursor:pointer; transition:background 0.15s; font-size:13px; }
.outline-tree-header:hover { background:rgba(0,0,0,0.05); }
.outline-tree-header.active { background:rgba(0,122,255,0.12); font-weight:500; }
.outline-tree-children { margin-left:16px; }
.outline-tree-header .toggle { font-size:9px; width:14px; text-align:center; color:#888; flex-shrink:0; cursor:pointer; }
.outline-tree-header .icon { font-size:14px; flex-shrink:0; }
.outline-tree-header .name { flex:1; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; color:#333; }
</style>
</head>
<body>
<div class="outline-container">
<div class="outline-sidebar">
<div class="outline-sidebar-header">
<span>📋 大纲目录</span>
<div>
<button id="winAddRoot" title="新增根节点">📂</button>
<button id="winRefresh" title="刷新">🔄</button>
</div>
</div>
<div class="outline-search"><input type="text" id="winSearch" placeholder="🔍 搜索大纲..."></div>
<!-- 新增：添加按钮 - 一左一右 -->
<div class="outline-add-buttons">
    <button class="add-chapter" id="winAddChapterBtn">➕ 章节</button>
    <button class="add-folder" id="winAddFolderBtn">📁 分卷</button>
</div>
<div id="outlineTree"></div>
<div class="outline-status"><span>节点: <span id="winNodeCount">0</span></span><span>💡 双击重命名 · 右键菜单</span></div>
</div>
<div class="outline-editor">
<div class="outline-editor-header">
<input type="text" id="winTitle" placeholder="大纲标题">
<div style="display:flex;gap:8px;">
<button class="save-btn" id="winSave">💾 保存</button>
<button class="delete-btn" id="winDelete">🗑 删除</button>
</div>
</div>
<textarea id="winContent" class="outline-editor-content" placeholder="在此撰写大纲内容..."></textarea>
<div class="outline-status-bar"><span id="winWordCount">0 字</span><span id="winStatus">已就绪</span></div>
</div>
</div>
<script>
var outlineData = ${JSON.stringify(outlineData)};
var currentBookId = ${currentBookId || 'null'};
var selectedId = ${outlineData.selectedId ? JSON.stringify(outlineData.selectedId) : 'null'};

function getOutlineChildren(parentId) {
    return outlineData.nodes.filter(function(n) { return n.parentId === parentId; }).sort(function(a,b) { return (a.order||0)-(b.order||0); });
}
function getOutlineNode(id) {
    return outlineData.nodes.find(function(n) { return n.id === id; });
}
function saveOutlineData() {
    var key = 'openwrite_outline_' + (currentBookId || 'global');
    var data = { nodes: outlineData.nodes, selectedId: selectedId, nextId: outlineData.nextId || 100 };
    localStorage.setItem(key, JSON.stringify(data));
    if (window.opener && window.opener.window) {
        try { window.opener.window.location.reload(); } catch(e) {}
    }
}
function selectNode(id) { selectedId = id; renderTree(); updateEditor(); saveOutlineData(); }
function renderTree() {
    var container = document.getElementById('outlineTree');
    if (!container) return;
    container.innerHTML = '';
    var roots = outlineData.nodes.filter(function(n) { return n.parentId === null; }).sort(function(a,b) { return (a.order||0)-(b.order||0); });
    if (roots.length === 0) { container.innerHTML = '<div style="padding:20px;text-align:center;color:#888;font-size:13px;">暂无大纲节点</div>'; return; }
    roots.forEach(function(root) { container.appendChild(createNodeElement(root, 0)); });
    document.getElementById('winNodeCount').textContent = outlineData.nodes.length;
}
function createNodeElement(node, depth) {
    var div = document.createElement('div');
    div.className = 'outline-tree-node';
    div.setAttribute('data-id', node.id);
    var header = document.createElement('div');
    header.className = 'outline-tree-header';
    if (selectedId === node.id) header.classList.add('active');
    header.style.paddingLeft = (depth * 16 + 8) + 'px';
    header.setAttribute('data-id', node.id);
    var hasChildren = getOutlineChildren(node.id).length > 0;
    var toggle = document.createElement('span');
    toggle.className = 'toggle';
    if (hasChildren) {
        var isExpanded = localStorage.getItem('outline_expanded_' + node.id) !== 'false';
        toggle.textContent = isExpanded ? '▾' : '▸';
        toggle.onclick = function(e) { e.stopPropagation();
            var current = localStorage.getItem('outline_expanded_' + node.id);
            var newState = current === 'false' ? 'true' : 'false';
            localStorage.setItem('outline_expanded_' + node.id, newState);
            renderTree();
        };
    } else { toggle.textContent = '·'; toggle.style.color = '#ccc'; }
    header.appendChild(toggle);
    var icon = document.createElement('span');
    icon.className = 'icon';
    icon.textContent = node.type === 'folder' ? '📁' : '📄';
    header.appendChild(icon);
    var nameSpan = document.createElement('span');
    nameSpan.className = 'name';
    nameSpan.textContent = node.name || '未命名';
    header.appendChild(nameSpan);
    header.onclick = function(e) { if (e.target === toggle) return; selectNode(node.id); };
    header.ondblclick = function(e) { e.stopPropagation(); var newName = prompt('重命名：', node.name); if (newName && newName.trim()) { node.name = newName.trim(); saveOutlineData(); renderTree(); updateEditor(); } };
    header.oncontextmenu = function(e) { e.preventDefault(); e.stopPropagation();
        var menu = document.createElement('div');
        menu.style.cssText = 'position:fixed;background:#fff;border-radius:8px;padding:4px 0;box-shadow:0 2px 12px rgba(0,0,0,0.15);z-index:10000;min-width:120px;';
        menu.style.left = Math.min(e.clientX, window.innerWidth - 140) + 'px';
        menu.style.top = Math.min(e.clientY, window.innerHeight - 120) + 'px';
        var isRoot = node.parentId === null;
        menu.innerHTML =
            '<button data-action="addChapter" style="display:block;width:100%;padding:6px 14px;border:none;background:none;cursor:pointer;text-align:left;font-size:12px;">➕ 新增章节</button>' +
            '<button data-action="addFolder" style="display:block;width:100%;padding:6px 14px;border:none;background:none;cursor:pointer;text-align:left;font-size:12px;">📁 新增文件夹</button>' +
            '<button data-action="rename" style="display:block;width:100%;padding:6px 14px;border:none;background:none;cursor:pointer;text-align:left;font-size:12px;">✏️ 重命名</button>' +
            (outlineData.nodes.filter(function(n) { return n.parentId === null; }).length > 1 || !isRoot ?
                '<button data-action="delete" style="display:block;width:100%;padding:6px 14px;border:none;background:none;cursor:pointer;text-align:left;font-size:12px;color:#dc3545;">🗑 删除</button>' : '');
        document.body.appendChild(menu);
        menu.querySelectorAll('button').forEach(function(btn) {
            btn.onclick = function() {
                var action = this.getAttribute('data-action');
                if (action === 'addChapter' || action === 'addFolder') {
                    var type = action === 'addChapter' ? 'chapter' : 'folder';
                    var typeName = type === 'chapter' ? '章节' : '文件夹';
                    var name = prompt('请输入新' + typeName + '名称：', type === 'chapter' ? '新章节' : '新文件夹');
                    if (name && name.trim()) {
                        var children = getOutlineChildren(node.id);
                        var newNode = { id: 'node_' + (outlineData.nextId || 100), parentId: node.id, type: type, name: name.trim(), order: children.length, content: type === 'chapter' ? '✍️ 在此撰写章节细纲...' : '📁 文件夹内容' };
                        outlineData.nextId = (outlineData.nextId || 100) + 1;
                        outlineData.nodes.push(newNode);
                        selectedId = newNode.id;
                        localStorage.setItem('outline_expanded_' + node.id, 'true');
                        saveOutlineData();
                        renderTree();
                        updateEditor();
                    }
                } else if (action === 'rename') {
                    var newName = prompt('重命名：', node.name);
                    if (newName && newName.trim()) { node.name = newName.trim(); saveOutlineData(); renderTree(); updateEditor(); }
                } else if (action === 'delete') {
                    if (confirm('确定删除「' + node.name + '」及其所有子节点吗？')) {
                        var toDelete = [node.id];
                        function collectChildren(pid) {
                            outlineData.nodes.filter(function(n) { return n.parentId === pid; }).forEach(function(child) {
                                toDelete.push(child.id);
                                collectChildren(child.id);
                            });
                        }
                        collectChildren(node.id);
                        outlineData.nodes = outlineData.nodes.filter(function(n) { return toDelete.indexOf(n.id) === -1; });
                        var siblings = getOutlineChildren(node.parentId);
                        siblings.forEach(function(s, idx) { s.order = idx; });
                        selectedId = outlineData.nodes.length > 0 ? outlineData.nodes[0].id : null;
                        saveOutlineData();
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
    var children = getOutlineChildren(node.id);
    if (children.length > 0) {
        var childrenDiv = document.createElement('div');
        childrenDiv.className = 'outline-tree-children';
        var isExpanded = localStorage.getItem('outline_expanded_' + node.id) !== 'false';
        childrenDiv.style.display = isExpanded ? 'block' : 'none';
        children.forEach(function(child) { childrenDiv.appendChild(createNodeElement(child, depth + 1)); });
        div.appendChild(childrenDiv);
    }
    return div;
}
function updateEditor() {
    var node = getOutlineNode(selectedId);
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
    var node = getOutlineNode(selectedId);
    if (!node) { alert('请先选择一个节点'); return; }
    var title = document.getElementById('winTitle').value.trim();
    var content = document.getElementById('winContent').value;
    if (title) node.name = title;
    node.content = content;
    saveOutlineData();
    renderTree();
    updateEditor();
    document.getElementById('winStatus').textContent = '✅ 已保存';
    setTimeout(function() { document.getElementById('winStatus').textContent = '已保存'; }, 1500);
}
function deleteNode() {
    var node = getOutlineNode(selectedId);
    if (!node) return;
    if (outlineData.nodes.filter(function(n) { return n.parentId === null; }).length === 1 && node.parentId === null) {
        alert('至少保留一个根节点');
        return;
    }
    if (confirm('确定删除「' + node.name + '」及其所有子节点吗？')) {
        var toDelete = [node.id];
        function collectChildren(pid) {
            outlineData.nodes.filter(function(n) { return n.parentId === pid; }).forEach(function(child) {
                toDelete.push(child.id);
                collectChildren(child.id);
            });
        }
        collectChildren(node.id);
        outlineData.nodes = outlineData.nodes.filter(function(n) { return toDelete.indexOf(n.id) === -1; });
        var siblings = getOutlineChildren(node.parentId);
        siblings.forEach(function(s, idx) { s.order = idx; });
        selectedId = outlineData.nodes.length > 0 ? outlineData.nodes[0].id : null;
        saveOutlineData();
        renderTree();
        updateEditor();
        alert('已删除');
    }
}
// ========== 新增：独立窗口的章节和分卷按钮 ==========
document.getElementById('winAddChapterBtn').onclick = function() {
    if (selectedId) {
        var node = getOutlineNode(selectedId);
        if (node) {
            var name = prompt('请输入新章节名称：', '新章节');
            if (name && name.trim()) {
                var children = getOutlineChildren(selectedId);
                var newNode = { id: 'node_' + (outlineData.nextId || 100), parentId: selectedId, type: 'chapter', name: name.trim(), order: children.length, content: '✍️ 在此撰写章节细纲...' };
                outlineData.nextId = (outlineData.nextId || 100) + 1;
                outlineData.nodes.push(newNode);
                selectedId = newNode.id;
                localStorage.setItem('outline_expanded_' + selectedId, 'true');
                saveOutlineData();
                renderTree();
                updateEditor();
            }
        }
    } else { alert('请先选择一个节点'); }
};
document.getElementById('winAddFolderBtn').onclick = function() {
    if (selectedId) {
        var node = getOutlineNode(selectedId);
        if (node) {
            var name = prompt('请输入新分卷名称：', '新分卷');
            if (name && name.trim()) {
                var children = getOutlineChildren(selectedId);
                var newNode = { id: 'node_' + (outlineData.nextId || 100), parentId: selectedId, type: 'folder', name: name.trim(), order: children.length, content: '📁 文件夹内容' };
                outlineData.nextId = (outlineData.nextId || 100) + 1;
                outlineData.nodes.push(newNode);
                selectedId = newNode.id;
                localStorage.setItem('outline_expanded_' + selectedId, 'true');
                saveOutlineData();
                renderTree();
                updateEditor();
            }
        }
    } else { alert('请先选择一个节点'); }
};

document.getElementById('winAddRoot').onclick = function() {
    var name = prompt('请输入总纲名称：', '📌 总纲');
    if (name && name.trim()) {
        var roots = outlineData.nodes.filter(function(n) { return n.parentId === null; });
        var newNode = { id: 'node_' + (outlineData.nextId || 100), parentId: null, type: 'folder', name: name.trim(), order: roots.length, content: '在此撰写总纲内容...' };
        outlineData.nextId = (outlineData.nextId || 100) + 1;
        outlineData.nodes.push(newNode);
        selectedId = newNode.id;
        saveOutlineData();
        renderTree();
        updateEditor();
    }
};
document.getElementById('winRefresh').onclick = function() { renderTree(); updateEditor(); };
document.getElementById('winSave').onclick = saveNode;
document.getElementById('winDelete').onclick = deleteNode;
document.getElementById('winSearch').oninput = function() {
    var keyword = this.value.trim().toLowerCase();
    var container = document.getElementById('outlineTree');
    if (!keyword) { renderTree(); return; }
    var items = container.querySelectorAll('.outline-tree-header');
    items.forEach(function(item) {
        var id = item.getAttribute('data-id');
        var node = getOutlineNode(id);
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
    var node = getOutlineNode(selectedId);
    if (node) {
        node.content = this.value;
        document.getElementById('winWordCount').textContent = this.value.length + ' 字';
        document.getElementById('winStatus').textContent = '✏️ 未保存';
        clearTimeout(saveTimer);
        saveTimer = setTimeout(function() {
            saveOutlineData();
            document.getElementById('winStatus').textContent = '✅ 已保存';
            setTimeout(function() { document.getElementById('winStatus').textContent = '已保存'; }, 1000);
        }, 500);
    }
};
document.getElementById('winTitle').oninput = function() {
    var node = getOutlineNode(selectedId);
    if (node && this.value.trim()) {
        node.name = this.value.trim();
        saveOutlineData();
        renderTree();
    }
};
document.addEventListener('keydown', function(e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); saveNode(); }
});
renderTree();
updateEditor();
console.log('大纲窗口已打开');
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

function bindOutlineToolEntry() {
    var outlineTool = document.querySelector('.sidebar-tool-item[data-tool="outline"]');
    if (outlineTool) {
        outlineTool.onclick = function() {
            var existingPanel = document.getElementById('floatingToolPanel');
            if (existingPanel) {
                closeFloatingPanel();
                var toolItems = document.querySelectorAll('.sidebar-tool-item');
                toolItems.forEach(function(item) {
                    if (item.getAttribute('data-tool') === 'outline') {
                        item.style.background = '';
                    }
                });
            } else {
                openToolSidebar('outline');
            }
        };
    }
}

// ========== 导出 ==========

window.openOutlinePanel = openOutlinePanel;
window.closeOutlinePanel = closeOutlinePanel;
window.openToolSidebar = openToolSidebar;
window.closeFloatingPanel = closeFloatingPanel;
window.openOutlineInNewWindow = openOutlineInNewWindow;
window.outlineData = outlineData;
window.getOutlineData = getOutlineData;
window.saveOutlineData = saveOutlineData;
window.renderOutlineTree = renderOutlineTree;
window.updateOutlineEditor = updateOutlineEditor;
window.addOutlineRoot = addOutlineRoot;
window.addOutlineChild = addOutlineChild;
window.deleteOutlineNode = deleteOutlineNode;
window.renameOutlineNode = renameOutlineNode;
window.selectOutlineNode = selectOutlineNode;
window.getOutlineNode = getOutlineNode;
window.getOutlineChildren = getOutlineChildren;
window.renderCompactOutlineTree = renderCompactOutlineTree;
window.updateCompactEditor = updateCompactEditor;
window.bindOutlineToolEntry = bindOutlineToolEntry;

console.log('大纲工具已加载');
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(bindOutlineToolEntry, 500);
});