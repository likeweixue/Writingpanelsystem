// ========== 书籍管理 ==========

function getBookById(bookId) {
    for (var i = 0; i < books.length; i++) {
        if (books[i].id == bookId) return books[i];
    }
    return null;
}

function getCurrentBook() {
    return getBookById(currentBookId);
}

function getCurrentVolume() {
    var book = getCurrentBook();
    if (!book || !book.volumes) return null;
    for (var i = 0; i < book.volumes.length; i++) {
        if (book.volumes[i].id === currentVolumeId) return book.volumes[i];
    }
    return null;
}

function getCurrentChapter() {
    var vol = getCurrentVolume();
    if (!vol || !vol.chapters) return null;
    for (var i = 0; i < vol.chapters.length; i++) {
        if (vol.chapters[i].id === currentChapterId) return vol.chapters[i];
    }
    return null;
}

function numberToChinese(num) {
    var chineseNum = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十'];
    if (num <= 10) return chineseNum[num];
    if (num < 20) return '十' + (num === 10 ? '' : chineseNum[num - 10]);
    if (num < 100) {
        var tens = Math.floor(num / 10);
        var ones = num % 10;
        return chineseNum[tens] + '十' + (ones === 0 ? '' : chineseNum[ones]);
    }
    return num.toString();
}

function renderBooks() {
    var container = document.getElementById('booksContainer');
    if (!container) return;
    
    // 确保加载最新的 groups
    loadGroups();
    
    if (!books || books.length === 0) {
        container.innerHTML = '<div style="padding:40px;text-align:center;color:#888;">暂无书籍，点击"新建书籍"开始创作</div>';
        return;
    }
    container.innerHTML = '';
    
    // 确保至少有一个默认分组
    if (!groups || groups.length === 0) {
        groups = [{ id: 'default', name: '默认分组' }];
        saveGroups();
    }
    
    for (var g = 0; g < groups.length; g++) {
        var group = groups[g];
        var groupBooks = books.filter(function(b) { 
            return b.groupId === group.id || (!b.groupId && group.id === 'default'); 
        });
        
        // 即使没有书籍也显示分组（可选）
        var groupDiv = document.createElement('div');
        groupDiv.className = 'group-section';
        groupDiv.setAttribute('data-group-id', group.id);
        groupDiv.innerHTML = '<div class="group-header"><h3>' + escapeHtml(group.name) + ' <span style="font-size:12px;opacity:0.6;">(' + groupBooks.length + '本)</span></h3><button class="group-menu-btn" data-id="' + group.id + '" style="background:none;border:none;font-size:18px;cursor:pointer;">⋯</button></div><div class="books-grid" data-group="' + group.id + '"></div>';
        var grid = groupDiv.querySelector('.books-grid');
        
        for (var i = 0; i < groupBooks.length; i++) {
            var book = groupBooks[i];
            var totalWords = 0, totalChapters = 0;
            if (book.volumes) {
                for (var v = 0; v < book.volumes.length; v++) {
                    var vol = book.volumes[v];
                    if (vol && vol.chapters) {
                        totalChapters += vol.chapters.length;
                        for (var c = 0; c < vol.chapters.length; c++) {
                            if (vol.chapters[c] && vol.chapters[c].content) {
                                totalWords += vol.chapters[c].content.replace(/<[^>]*>/g, '').length;
                            }
                        }
                    }
                }
            }
            
            var card = document.createElement('div');
            card.className = 'book-card';
            card.setAttribute('data-id', book.id);
            card.setAttribute('draggable', 'true');
            
            // 如果有封面图片就显示封面，否则显示默认图标
            var coverHtml = '';
            if (book.cover) {
                coverHtml = '<img src="' + book.cover + '" style="width:100%; height:100%; object-fit:cover; position:absolute; top:0; left:0; border-radius:8px;">';
            }
            
            card.innerHTML = '<div class="book-menu" data-id="' + book.id + '" style="position:absolute; top:8px; right:8px; background:rgba(0,0,0,0.5); border-radius:50%; width:28px; height:28px; display:flex; align-items:center; justify-content:center; cursor:pointer; color:white; z-index:10;">⋯</div>' +
                '<div class="book-cover" style="background: #e0e0e0; height:100%; display:flex; flex-direction:column; justify-content:center; align-items:center; text-align:center; padding:20px; position:relative;">' +
                coverHtml +
                '<div style="font-size:48px; position:relative; z-index:1;"></div>' +
                '<h4 style="position:relative; z-index:1;">' + escapeHtml(book.title) + '</h4>' +
                '<p style="position:relative; z-index:1;">' + (book.volumes ? book.volumes.length : 0) + '卷 · ' + totalChapters + '章 · ' + totalWords + '字</p>' +
                '</div>';
            
            card.onclick = (function(id) {
                return function(e) {
                    if (e.target.classList && e.target.classList.contains('book-menu')) return;
                    openBookTab(id);
                };
            })(book.id);
            
            card.ondragstart = function(e) {
                e.dataTransfer.setData('text/plain', this.getAttribute('data-id'));
                e.dataTransfer.effectAllowed = 'move';
                this.style.opacity = '0.5';
            };
            card.ondragend = function(e) { this.style.opacity = '1'; };
            grid.appendChild(card);
        }
        container.appendChild(groupDiv);
    }
    bindBookMenus();
    bindGroupMenus();
    enableGroupDrop();
}

function enableGroupDrop() {
    var groupsDiv = document.querySelectorAll('.group-section');
    for (var i = 0; i < groupsDiv.length; i++) {
        var groupDiv = groupsDiv[i];
        groupDiv.ondragover = function(e) {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            this.style.backgroundColor = 'rgba(0,122,255,0.05)';
        };
        groupDiv.ondragleave = function(e) {
            this.style.backgroundColor = '';
        };
        groupDiv.ondrop = function(e) {
            e.preventDefault();
            this.style.backgroundColor = '';
            var bookId = parseInt(e.dataTransfer.getData('text/plain'));
            var targetGroupId = this.getAttribute('data-group-id');
            var book = books.find(function(b) { return b.id === bookId; });
            if (book) {
                book.groupId = targetGroupId;
                saveAllData();
                renderBooks();
            }
        };
    }
}

function bindBookMenus() {
    var menus = document.querySelectorAll('.book-menu');
    for (var i = 0; i < menus.length; i++) {
        menus[i].onclick = function(e) {
            e.stopPropagation();
            var bookId = parseInt(this.getAttribute('data-id'));
            showBookMenu(bookId, this);
        };
    }
}

function bindGroupMenus() {
    var menus = document.querySelectorAll('.group-menu-btn');
    for (var i = 0; i < menus.length; i++) {
        menus[i].onclick = function(e) {
            e.stopPropagation();
            var groupId = this.getAttribute('data-id');
            showGroupMenu(groupId, this);
        };
    }
}

function showBookMenu(bookId, btn) {
    var book = getBookById(bookId);
    if (!book) return;
    var menu = document.createElement('div');
    menu.style.cssText = 'position:fixed;background:#fff;border-radius:8px;padding:4px 0;box-shadow:0 2px 8px rgba(0,0,0,0.15);z-index:1000;min-width:120px;';
    menu.innerHTML = '<button class="edit-book" style="display:block;width:100%;padding:8px 16px;border:none;background:none;cursor:pointer;">✏️ 编辑</button><button class="rename-book" style="display:block;width:100%;padding:8px 16px;border:none;background:none;cursor:pointer;">📝 重命名</button><button class="delete-book" style="display:block;width:100%;padding:8px 16px;border:none;background:none;cursor:pointer;">🗑 删除</button>';
    var rect = btn.getBoundingClientRect();
    menu.style.top = rect.bottom + 'px';
    menu.style.left = rect.left + 'px';
    document.body.appendChild(menu);
    
    // 编辑按钮
    menu.querySelector('.edit-book').onclick = function() {
        openBookEditPanel(bookId);
        menu.remove();
    };
    
    // 重命名按钮
    menu.querySelector('.rename-book').onclick = function() {
        var newName = prompt('请输入新名称', book.title);
        if (newName && newName.trim()) {
            book.title = newName.trim();
            saveAllData();
            renderBooks();
            var tabId = 'book_' + bookId;
            for (var i = 0; i < openTabs.length; i++) {
                if (openTabs[i].id === tabId) {
                    openTabs[i].title = newName;
                    renderTabs();
                    break;
                }
            }
        }
        menu.remove();
    };
    
    // 删除按钮
    menu.querySelector('.delete-book').onclick = function() {
        if (confirm('确定要删除这本书吗？')) {
            moveToTrash(book);
            books = books.filter(function(b) { return b.id !== bookId; });
            saveAllData();
            renderBooks();
            var tabId = 'book_' + bookId;
            for (var i = 0; i < openTabs.length; i++) {
                if (openTabs[i].id === tabId) {
                    closeTab(tabId);
                    break;
                }
            }
        }
        menu.remove();
    };
    
    setTimeout(function() {
        document.addEventListener('click', function closeMenu(e) {
            if (!menu.contains(e.target)) { menu.remove(); document.removeEventListener('click', closeMenu); }
        });
    }, 100);
}

function showGroupMenu(groupId, btn) {
    var group = groups.find(function(g) { return g.id == groupId; });
    if (!group || group.name === '默认分组') { alert('默认分组不能操作'); return; }
    var menu = document.createElement('div');
    menu.style.cssText = 'position:fixed;background:#fff;border-radius:8px;padding:4px 0;box-shadow:0 2px 8px rgba(0,0,0,0.15);z-index:1000;min-width:120px;';
    menu.innerHTML = '<button class="rename-group" style="display:block;width:100%;padding:8px 16px;border:none;background:none;cursor:pointer;">重命名</button><button class="delete-group" style="display:block;width:100%;padding:8px 16px;border:none;background:none;cursor:pointer;">删除分组</button>';
    var rect = btn.getBoundingClientRect();
    menu.style.top = rect.bottom + 'px';
    menu.style.left = rect.left + 'px';
    document.body.appendChild(menu);
    menu.querySelector('.rename-group').onclick = function() {
        var newName = prompt('请输入新名称', group.name);
        if (newName && newName.trim()) {
            group.name = newName.trim();
            saveGroups();
            renderBooks();
        }
        menu.remove();
    };
    menu.querySelector('.delete-group').onclick = function() {
        if (confirm('确定删除分组吗？书籍将移到默认分组')) {
            var defaultGroup = groups.find(function(g) { return g.name === '默认分组'; });
            for (var i = 0; i < books.length; i++) {
                if (books[i].groupId == groupId) books[i].groupId = defaultGroup.id;
            }
            groups = groups.filter(function(g) { return g.id != groupId; });
            saveGroups();
            saveAllData();
            renderBooks();
        }
        menu.remove();
    };
    setTimeout(function() {
        document.addEventListener('click', function closeMenu(e) {
            if (!menu.contains(e.target)) { menu.remove(); document.removeEventListener('click', closeMenu); }
        });
    }, 100);
}

function openBookTab(bookId) {
    var book = getBookById(bookId);
    if (!book) return;
    var tabId = 'book_' + bookId;
    for (var i = 0; i < openTabs.length; i++) {
        if (openTabs[i].id === tabId) { switchToTab(tabId); return; }
    }
    openTabs.push({ id: tabId, title: book.title, type: 'book', bookId: bookId });
    renderTabs();
    var pagesContainer = document.getElementById('pagesContainer');
    var pageDiv = document.createElement('div');
    pageDiv.className = 'page';
    pageDiv.setAttribute('data-page', tabId);
    pageDiv.innerHTML = renderBookEditor(bookId);
    pagesContainer.appendChild(pageDiv);
    initBookEditor(tabId, bookId);
    switchToTab(tabId);
    var sidebar = document.querySelector('.sidebar-menu');
    if (sidebar) sidebar.style.display = 'none';
    var toolbar = document.getElementById('mainToolbar');
    if (toolbar) toolbar.classList.add('visible');
}

function renderBookEditor(bookId) {
    return '<div class="book-detail-page" data-book-id="' + bookId + '">' +
        '<div class="detail-main">' +
        '<div class="icon-sidebar" id="iconSidebar">' +
        '<div class="icon-sidebar-content">' +
        '<div class="icon-sidebar-item" data-target="chapters" title="章节">' +
        '<div class="icon-sidebar-icon">📖</div>' +
        '</div>' +
        '<div class="icon-sidebar-item" data-target="library" title="书库">' +
        '<div class="icon-sidebar-icon">📚</div>' +
        '</div>' +//这三个东西一定要保存，要不然出大事我靠了
        '<div class="icon-sidebar-item" data-target="history" title="历史">' +   // 新增历史图标
        '<div class="icon-sidebar-icon">⏱️</div>' +
        '</div>' +
        '</div>' +//这三个东西一定要保存，要不然出大事我靠了
        '</div>' +//这三个东西一定要保存，要不然出大事我靠了
        '<div class="left-sidebar" id="leftSidebar" style="width:280px;">' +
        '<div class="left-sidebar-header">' +
        '<span> 章节</span>' +
        '<button class="toggle-left-sidebar-btn" id="toggleLeftSidebarBtn" title="收起">◀</button>' +
        '</div>' +
        '<div class="left-sidebar-content" id="leftSidebarContent">' +
        '<div class="chapters-header">' +
        '<button id="addVolumeBtn">+ 分卷</button>' +
        '<button id="addChapterBtn">+ 章节</button>' +
        '<button id="trashBtnHeader" class="trash-btn">回收站</button>' +
        '</div>' +
        '<div id="volumeList" class="volume-list"></div>' +
        '</div>' +
        '</div>' +
        // 书库面板（初始隐藏）
        '<div class="library-sidebar" id="librarySidebar" style="display:none; width:280px;">' +
        '<div class="library-sidebar-header">' +
        '<span>📚 书库</span>' +
        '<button id="closeLibraryBtn" style="background:none; border:none; font-size:16px; cursor:pointer;">✕</button>' +
        '</div>' +
        '<div id="libraryContent" class="library-sidebar-content" style="flex:1; overflow-y:auto; padding:12px;">' +
        '<div style="text-align:center; padding:20px; color:#888;">加载中...</div>' +
        '</div>' +
        '</div>' +
        // 编辑器
        '<div class="detail-editor">' +
        '<input type="text" id="chapterTitle" placeholder="章节标题" class="title-input">' +
        '<div id="editor" contenteditable="true" class="editor-content"><p>开始写作...</p></div>' +
        // 在 renderBookEditor 函数中，找到 status-bar 部分，替换为：
'<div class="status-bar">' +
'<div style="display: flex; gap: 16px; align-items: center; flex-wrap: wrap;">' +
'<span>📝 <span id="wordCount">0</span> 字</span>' +
'<span>💾 <span id="saveStatus">已保存</span></span>' +
'<span>⏰ <span id="currentTime">--:--:--</span></span>' +
'<span>📦 <span id="backupStatus">备份待命</span></span>' +
'</div>' +
'</div>'
        '</div>' +
        '<div class="right-sidebar" id="rightSidebar">' +
        '<div class="right-sidebar-header">' +
        '<span>🛠️ 工具</span>' +
        '<button class="toggle-right-sidebar-btn" id="toggleRightSidebarBtn" title="收起">▶</button>' +
        '</div>' +
        '<div class="right-sidebar-content">' +
        '<div class="sidebar-tool-item" data-tool="outline"><div class="sidebar-tool-icon">📋</div><div class="sidebar-tool-label">大纲</div></div>' +
        '<div class="sidebar-tool-item" data-tool="timeline"><div class="sidebar-tool-icon">⏱️</div><div class="sidebar-tool-label">时间线</div></div>' +
        '<div class="sidebar-tool-item" data-tool="characters"><div class="sidebar-tool-icon">👥</div><div class="sidebar-tool-label">角色</div></div>' +
        '<div class="sidebar-tool-item" data-tool="setting"><div class="sidebar-tool-icon">⚙️</div><div class="sidebar-tool-label">设定</div></div>' +
        '<div class="sidebar-tool-item" data-tool="relation"><div class="sidebar-tool-icon">🔗</div><div class="sidebar-tool-label">关系图</div></div>' +
        '<div class="sidebar-tool-item" data-tool="whiteboard"><div class="sidebar-tool-icon">📝</div><div class="sidebar-tool-label">无边记</div></div>' +
        '<div class="sidebar-tool-item" data-tool="namegen"><div class="sidebar-tool-icon">✏️</div><div class="sidebar-tool-label">起名</div></div>' +
        '<div class="sidebar-tool-item" data-tool="notes"><div class="sidebar-tool-icon">📓</div><div class="sidebar-tool-label">笔记</div></div>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '</div>';
}

function initBookEditor(tabId, bookId) {
    currentBookId = bookId;
    var book = getCurrentBook();
    if (book && book.volumes && book.volumes.length > 0) {
        currentVolumeId = book.volumes[0].id;
        if (book.volumes[0].chapters && book.volumes[0].chapters.length > 0) {
            currentChapterId = book.volumes[0].chapters[0].id;
        }
    }
    renderVolumeList();
    renderCurrentChapter();
    bindEditorEvents();
    loadEditorSettings();
    initRightSidebar();
    setTimeout(ensureRightSidebarPosition, 200);
    
    var trashBtn = document.getElementById('trashBtnHeader');
    if (trashBtn) trashBtn.onclick = function() { openTrashPanel(); };

    // 在 initBookEditor 函数末尾添加
setTimeout(function() {
    addBatchActionButtons();
    bindCheckboxEvents();
}, 200);
// 添加可调节的拖动条 - 完全修复版
function addResizeHandle() {
    var chaptersPanel = document.getElementById('leftSidebar');
    if (!chaptersPanel) {
        console.log('leftSidebar not found');
        return;
    }
    
    // 如果已经有拖动条，先移除
    var existingHandle = document.getElementById('resizeHandle');
    if (existingHandle) {
        existingHandle.remove();
    }
    
    // 确保父元素有相对定位
    chaptersPanel.style.position = 'relative';
    chaptersPanel.style.overflow = 'visible';
    
    var handle = document.createElement('div');
    handle.id = 'resizeHandle';
    handle.style.cssText = 'position: absolute; right: -3px; top: 0; width: 6px; height: 100%; cursor: ew-resize; background: transparent; z-index: 10000; transition: background 0.2s;';
    
    chaptersPanel.appendChild(handle);
    
    var isResizing = false;
    var startX = 0;
    var startWidth = 0;
    
    handle.addEventListener('mouseenter', function() {
        this.style.background = 'rgba(0, 122, 255, 0.5)';
    });
    
    handle.addEventListener('mouseleave', function() {
        if (!isResizing) {
            this.style.background = 'transparent';
        }
    });
    
    handle.addEventListener('mousedown', function(e) {
        e.preventDefault();
        e.stopPropagation();
        isResizing = true;
        startX = e.clientX;
        startWidth = chaptersPanel.offsetWidth;
        
        document.body.style.cursor = 'ew-resize';
        document.body.classList.add('resizing');
        
        function onMouseMove(e) {
            if (!isResizing) return;
            var deltaX = e.clientX - startX;
            var newWidth = startWidth + deltaX;
            // 限制宽度范围
            if (newWidth < 180) newWidth = 180;
            if (newWidth > 500) newWidth = 500;
            chaptersPanel.style.width = newWidth + 'px';
            chaptersPanel.style.flex = '0 0 ' + newWidth + 'px';
            chaptersPanel.style.minWidth = newWidth + 'px';
            // 保存宽度
            localStorage.setItem('chapters_width', newWidth);
        }
        
        function onMouseUp() {
            isResizing = false;
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
            document.body.style.cursor = '';
            document.body.classList.remove('resizing');
            handle.style.background = 'transparent';
        }
        
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    });
    
    // 恢复保存的宽度
    var savedWidth = localStorage.getItem('chapters_width');
    if (savedWidth) {
        var width = parseInt(savedWidth);
        if (width >= 180 && width <= 500) {
            chaptersPanel.style.width = width + 'px';
            chaptersPanel.style.flex = '0 0 ' + width + 'px';
            chaptersPanel.style.minWidth = width + 'px';
        }
    }
    
    console.log('resizeHandle 已添加并绑定事件');
}
    
    // 恢复保存的宽度
    function restoreChaptersWidth() {
        var chaptersPanel = document.getElementById('chaptersPanel') || document.getElementById('leftSidebar');
        if (!chaptersPanel) return;
        var savedWidth = localStorage.getItem('chapters_width');
        if (savedWidth) {
            var width = parseInt(savedWidth);
            if (width >= 180 && width <= 500) {
                chaptersPanel.style.width = width + 'px';
            }
        }
    }
    // 添加拖动条和恢复宽度
    setTimeout(function() {
        addResizeHandle();
        restoreChaptersWidth();
    }, 200);

    // 书库面板功能
        // 书库面板功能
    function initLibraryPanel() {
        var librarySidebar = document.getElementById('librarySidebar');
        var leftSidebar = document.getElementById('leftSidebar');
        var closeBtn = document.getElementById('closeLibraryBtn');
        
        if (!librarySidebar) return;
        
        // 关闭按钮 - 直接关闭书库面板，不打开章节面板
        if (closeBtn) {
            closeBtn.onclick = function(e) {
                e.stopPropagation();
                librarySidebar.style.display = 'none';
                // 不自动打开章节面板，保持干净
                console.log('书库面板已关闭');
            };
        }
        
        // 添加拖动条
        addLibraryResizeHandle();
        
        // 渲染书籍列表
        renderLibraryList();
    }
    
    function addLibraryResizeHandle() {
    var librarySidebar = document.getElementById('librarySidebar');
    if (!librarySidebar) {
        console.log('librarySidebar not found');
        return;
    }
    
    // 如果已经有拖动条，先移除
    var existingHandle = document.getElementById('libraryResizeHandle');
    if (existingHandle) {
        existingHandle.remove();
    }
    
    // 确保父元素有相对定位，并且 overflow 为 visible
    librarySidebar.style.position = 'relative';
    librarySidebar.style.overflow = 'visible';
    
    var handle = document.createElement('div');
    handle.id = 'libraryResizeHandle';
    handle.style.cssText = 'position: absolute; right: -3px; top: 0; width: 6px; height: 100%; cursor: ew-resize; background: transparent; z-index: 10000; transition: background 0.2s;';
    
    librarySidebar.appendChild(handle);
    
    var isResizing = false;
    var startX = 0;
    var startWidth = 0;
    
    handle.addEventListener('mouseenter', function() {
        this.style.background = 'rgba(0, 122, 255, 0.5)';
    });
    
    handle.addEventListener('mouseleave', function() {
        if (!isResizing) {
            this.style.background = 'transparent';
        }
    });
    
    handle.addEventListener('mousedown', function(e) {
        e.preventDefault();
        e.stopPropagation();
        isResizing = true;
        startX = e.clientX;
        startWidth = librarySidebar.offsetWidth;
        
        document.body.style.cursor = 'ew-resize';
        document.body.classList.add('resizing');
        
        function onMouseMove(e) {
            if (!isResizing) return;
            var deltaX = e.clientX - startX;
            var newWidth = startWidth + deltaX;
            // 限制宽度范围
            if (newWidth < 180) newWidth = 180;
            if (newWidth > 500) newWidth = 500;
            librarySidebar.style.width = newWidth + 'px';
            librarySidebar.style.flex = '0 0 ' + newWidth + 'px';
            librarySidebar.style.minWidth = newWidth + 'px';
            // 保存宽度
            localStorage.setItem('library_width', newWidth);
        }
        
        function onMouseUp() {
            isResizing = false;
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
            document.body.style.cursor = '';
            document.body.classList.remove('resizing');
            handle.style.background = 'transparent';
        }
        
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    });
    
    // 恢复保存的宽度
    var savedWidth = localStorage.getItem('library_width');
    if (savedWidth) {
        var width = parseInt(savedWidth);
        if (width >= 180 && width <= 500) {
            librarySidebar.style.width = width + 'px';
            librarySidebar.style.flex = '0 0 ' + width + 'px';
            librarySidebar.style.minWidth = width + 'px';
        }
    }
    
    console.log('libraryResizeHandle 已添加并绑定事件');
}
    
    function renderLibraryList() {
        var container = document.getElementById('libraryContent');
        if (!container) return;
        
        if (!books || books.length === 0) {
            container.innerHTML = '<div style="text-align:center; padding:20px; color:#888;">暂无书籍，点击"新建书籍"开始创作</div>';
            return;
        }
        
        var html = '';
        for (var i = 0; i < books.length; i++) {
            var book = books[i];
            var totalChapters = 0;
            if (book.volumes) {
                for (var v = 0; v < book.volumes.length; v++) {
                    if (book.volumes[v].chapters) {
                        totalChapters += book.volumes[v].chapters.length;
                    }
                }
            }
            
            var isActive = (currentBookId === book.id);
            html += '<div class="library-book-item" data-book-id="' + book.id + '" style="' + (isActive ? 'background: rgba(0,122,255,0.1); border-left: 3px solid #007aff;' : 'background: rgba(0,0,0,0.02); margin:4px 0; padding:10px; border-radius:8px; cursor:pointer; transition:all 0.2s;') + '">' +
                '<div style="display:flex; align-items:center; gap:12px;">' +
                '<div style="font-size:24px;">📖</div>' +
                '<div style="flex:1;">' +
                '<div style="font-weight:500;">' + escapeHtml(book.title) + '</div>' +
                '<div style="font-size:11px; color:#888;">' + (book.volumes ? book.volumes.length : 0) + '卷 · ' + totalChapters + '章</div>' +
                '</div>' +
                (isActive ? '<div style="background:#007aff; color:white; border-radius:12px; padding:2px 8px; font-size:10px;">当前</div>' : '') +
                '</div>' +
                '</div>';
        }
        container.innerHTML = html;
        
        // 绑定点击事件
        var bookItems = document.querySelectorAll('.library-book-item');
        for (var i = 0; i < bookItems.length; i++) {
            bookItems[i].onclick = function() {
                var bookId = parseInt(this.getAttribute('data-book-id'));
                if (bookId !== currentBookId) {
                    openBookTab(bookId);
                }
                // 关闭书库面板，显示章节面板
                // 在 initBookEditor 函数末尾，initLibraryPanel(); 和 bindIconSidebarEvents(); 之后添加
                // 确保章节面板初始显示，书库面板隐藏
                var leftSidebar = document.getElementById('leftSidebar');
                var librarySidebar = document.getElementById('librarySidebar');
                if (leftSidebar) leftSidebar.style.display = 'flex';
                if (librarySidebar) librarySidebar.style.display = 'none';
            };
        }
    }
        // 图标边栏切换事件（简化版）
    function bindIconSidebarEvents() {
        var chapterIcon = document.querySelector('.icon-sidebar-item[data-target="chapters"]');
        var libraryIcon = document.querySelector('.icon-sidebar-item[data-target="library"]');
        
        if (chapterIcon) {
            chapterIcon.onclick = function() {
                var leftSidebar = document.getElementById('leftSidebar');
                var librarySidebar = document.getElementById('librarySidebar');
                var toggleBtn = document.getElementById('toggleLeftSidebarBtn');
                
                // 关闭书库面板
                if (librarySidebar) librarySidebar.style.display = 'none';
                
                // 打开章节面板
                if (leftSidebar) {
                    leftSidebar.style.display = 'flex';
                    leftSidebar.style.setProperty('width', '280px', 'important');
                    leftSidebar.style.setProperty('min-width', '280px', 'important');
                    leftSidebar.style.setProperty('flex', '0 0 280px', 'important');
                    leftSidebar.style.overflow = 'visible';
                    if (toggleBtn) toggleBtn.innerHTML = '◀';
                    localStorage.setItem('leftSidebar_collapsed', 'false');
                }
            };
        }
        
        if (libraryIcon) {
            libraryIcon.onclick = function() {
                var leftSidebar = document.getElementById('leftSidebar');
                var librarySidebar = document.getElementById('librarySidebar');
                var toggleBtn = document.getElementById('toggleLeftSidebarBtn');
                
                // 关闭章节面板
                if (leftSidebar) {
                    leftSidebar.style.setProperty('width', '0', 'important');
                    leftSidebar.style.setProperty('min-width', '0', 'important');
                    leftSidebar.style.setProperty('flex', '0 0 0', 'important');
                    leftSidebar.style.overflow = 'hidden';
                    if (toggleBtn) toggleBtn.innerHTML = '▶';
                    localStorage.setItem('leftSidebar_collapsed', 'true');
                }
                
                // 打开书库面板
                if (librarySidebar) {
                    librarySidebar.style.display = 'flex';
                    if (typeof renderLibraryList === 'function') renderLibraryList();
                }
            };
        }
    }
    // 初始化历史面板
    initHistoryPanel();
     // 初始化书库
    initLibraryPanel();
    bindIconSidebarEvents();
    
    // 确保章节面板显示，书库面板隐藏
    var leftPanel = document.getElementById('leftSidebar');
    var libraryPanel = document.getElementById('librarySidebar');
    if (leftPanel) leftPanel.style.display = 'flex';
    if (libraryPanel) libraryPanel.style.display = 'none';
    
        // 左面板切换功能（收起/展开）- 使用内联样式
    var leftSidebar = document.getElementById('leftSidebar');
    var toggleLeftBtn = document.getElementById('toggleLeftSidebarBtn');
    if (leftSidebar && toggleLeftBtn) {
        // 恢复保存的状态
        var leftCollapsed = localStorage.getItem('leftSidebar_collapsed') === 'true';
        if (leftCollapsed) {
            leftSidebar.style.setProperty('width', '0', 'important');
            leftSidebar.style.setProperty('min-width', '0', 'important');
            leftSidebar.style.setProperty('flex', '0 0 0', 'important');
            leftSidebar.style.overflow = 'hidden';
            toggleLeftBtn.innerHTML = '▶';
            toggleLeftBtn.title = '展开章节栏';
        } else {
            leftSidebar.style.setProperty('width', '280px', 'important');
            leftSidebar.style.setProperty('min-width', '280px', 'important');
            leftSidebar.style.setProperty('flex', '0 0 280px', 'important');
            leftSidebar.style.overflow = 'visible';
            toggleLeftBtn.innerHTML = '◀';
            toggleLeftBtn.title = '收起章节栏';
        }
        
        // 绑定点击事件
        toggleLeftBtn.onclick = function(e) {
            e.stopPropagation();
            var isCollapsed = leftSidebar.offsetWidth === 0;
            if (isCollapsed) {
                // 展开
                leftSidebar.style.setProperty('width', '280px', 'important');
                leftSidebar.style.setProperty('min-width', '280px', 'important');
                leftSidebar.style.setProperty('flex', '0 0 280px', 'important');
                leftSidebar.style.overflow = 'visible';
                toggleLeftBtn.innerHTML = '◀';
                toggleLeftBtn.title = '收起章节栏';
            } else {
                // 收起
                leftSidebar.style.setProperty('width', '0', 'important');
                leftSidebar.style.setProperty('min-width', '0', 'important');
                leftSidebar.style.setProperty('flex', '0 0 0', 'important');
                leftSidebar.style.overflow = 'hidden';
                toggleLeftBtn.innerHTML = '▶';
                toggleLeftBtn.title = '展开章节栏';
            }
            localStorage.setItem('leftSidebar_collapsed', leftSidebar.offsetWidth === 0);
        };
    }

    // 右面板切换功能
    var rightSidebar = document.getElementById('rightSidebar');
    var toggleRightBtn = document.getElementById('toggleRightSidebarBtn');
    if (rightSidebar && toggleRightBtn) {
        var rightCollapsed = localStorage.getItem('rightSidebar_collapsed') === 'true';
        if (rightCollapsed) {
            rightSidebar.classList.add('collapsed');
            toggleRightBtn.innerHTML = '◀';
            toggleRightBtn.title = '展开工具';
        } else {
            toggleRightBtn.innerHTML = '▶';
        }
        toggleRightBtn.onclick = function() {
            rightSidebar.classList.toggle('collapsed');
            var isCollapsed = rightSidebar.classList.contains('collapsed');
            if (isCollapsed) {
                toggleRightBtn.innerHTML = '◀';
                toggleRightBtn.title = '展开工具';
            } else {
                toggleRightBtn.innerHTML = '▶';
                toggleRightBtn.title = '收起工具';
            }
            localStorage.setItem('rightSidebar_collapsed', isCollapsed);
        };
    }

    // 绑定工具点击事件
    var tools = document.querySelectorAll('.sidebar-tool-item');
    for (var i = 0; i < tools.length; i++) {
        tools[i].onclick = function() {
            var tool = this.getAttribute('data-tool');
            openSecondaryWindow(tool);
        };
    }
    
    // 启动状态栏定时器
    startStatusBarTimers();
}

function loadEditorSettings() {
    var savedFont = localStorage.getItem('editor_font_family');
    var savedSize = localStorage.getItem('editor_font_size');
    var savedLineHeight = localStorage.getItem('editor_line_height');
    var editor = document.getElementById('editor');
    if (editor) {
        if (savedFont) editor.style.fontFamily = savedFont;
        if (savedSize) editor.style.fontSize = savedSize + 'px';
        if (savedLineHeight) editor.style.lineHeight = savedLineHeight;
    }
}

// 在 renderVolumeList 函数中，找到章节渲染的部分，替换为以下代码：

function renderVolumeList() {
    var container = document.getElementById('volumeList');
    var book = getCurrentBook();
    if (!container || !book) return;
    container.innerHTML = '';
    if (!book.volumes || book.volumes.length === 0) {
        container.innerHTML = '<div style="padding:20px;text-align:center;opacity:0.6;">暂无分卷，点击"分卷"创建</div>';
        return;
    }
    
    for (var v = 0; v < book.volumes.length; v++) {
        var vol = book.volumes[v];
        var volDiv = document.createElement('div');
        volDiv.className = 'volume-item';
        volDiv.setAttribute('data-vol-id', vol.id);
        volDiv.setAttribute('data-vol-order', v);
        volDiv.setAttribute('draggable', 'true');
        
        // 分卷头部（带按钮）
        volDiv.innerHTML = '<div class="volume-header" style="display:flex; align-items:center; justify-content:space-between; padding:8px 12px; background:rgba(0,0,0,0.03); border-radius:8px; margin-bottom:4px;">' +
            '<span class="volume-title" style="font-weight:600; cursor:pointer;">' + escapeHtml(vol.name) + ' <span style="font-size:11px; font-weight:normal;">(' + (vol.chapters ? vol.chapters.length : 0) + '章)</span></span>' +
            '<div class="volume-actions" style="display:flex; gap:4px; opacity:0.6; transition:opacity 0.2s;">' +
            '<button class="volume-move-up" title="上移" style="background:none; border:none; cursor:pointer; font-size:14px; padding:2px 6px; border-radius:4px;">⬆️</button>' +
            '<button class="volume-move-down" title="下移" style="background:none; border:none; cursor:pointer; font-size:14px; padding:2px 6px; border-radius:4px;">⬇️</button>' +
            '<button class="volume-rename" title="重命名" style="background:none; border:none; cursor:pointer; font-size:14px; padding:2px 6px; border-radius:4px;">✏️</button>' +
            '<button class="volume-delete" title="删除分卷" style="background:none; border:none; cursor:pointer; font-size:14px; padding:2px 6px; border-radius:4px; color:#999;">✖</button>' +
            '</div>' +
            '</div>' +
            '<div class="chapter-list" data-volume="' + vol.id + '"></div>';
        
        var chapterContainer = volDiv.querySelector('.chapter-list');
        
        // 渲染章节（带复选框）
        if (vol.chapters && vol.chapters.length > 0) {
            for (var c = 0; c < vol.chapters.length; c++) {
                var ch = vol.chapters[c];
                var chDiv = document.createElement('div');
                chDiv.className = 'chapter-item' + (ch.id === currentChapterId && vol.id === currentVolumeId ? ' active' : '');
                chDiv.setAttribute('data-chapter-id', ch.id);
                chDiv.setAttribute('data-vol-id', vol.id);
                chDiv.setAttribute('data-chapter-order', c);
                chDiv.setAttribute('draggable', 'true');
                
                // 添加复选框和章节标题
                chDiv.innerHTML = 
                    '<input type="checkbox" class="chapter-checkbox" data-chapter-id="' + ch.id + '" data-vol-id="' + vol.id + '" style="margin-right: 8px; cursor: pointer;">' +
                    '<span class="chapter-title" style="flex:1; cursor:pointer;">' + escapeHtml(ch.title) + '</span>' +
                    '<div class="chapter-actions" style="display:flex; gap:4px;">' +
                    '<button class="chapter-move-up" title="上移" style="background:none; border:none; cursor:pointer; font-size:14px;">⬆️</button>' +
                    '<button class="chapter-move-down" title="下移" style="background:none; border:none; cursor:pointer; font-size:14px;">⬇️</button>' +
                    '<button class="chapter-rename" title="重命名" style="background:none; border:none; cursor:pointer; font-size:14px;">✏️</button>' +
                    '<button class="delete-chapter" title="删除" style="background:none; border:none; cursor:pointer; font-size:14px; color:#999;">✖</button>' +
                    '</div>';
                
                // 章节标题点击
                chDiv.querySelector('.chapter-title').onclick = (function(volId, chId) {
                    return function() { 
                        currentVolumeId = volId; 
                        currentChapterId = chId; 
                        renderVolumeList(); 
                        renderCurrentChapter(); 
                    };
                })(vol.id, ch.id);
                
                // 章节上移
                chDiv.querySelector('.chapter-move-up').onclick = (function(volId, chId, idx) {
                    return function(e) {
                        e.stopPropagation();
                        moveChapter(volId, chId, idx, 'up');
                    };
                })(vol.id, ch.id, c);
                
                // 章节下移
                chDiv.querySelector('.chapter-move-down').onclick = (function(volId, chId, idx) {
                    return function(e) {
                        e.stopPropagation();
                        moveChapter(volId, chId, idx, 'down');
                    };
                })(vol.id, ch.id, c);
                
                // 章节重命名
                chDiv.querySelector('.chapter-rename').onclick = (function(ch) {
                    return function(e) {
                        e.stopPropagation();
                        var newName = prompt('请输入新的章节名称', ch.title);
                        if (newName && newName.trim()) {
                            ch.title = newName.trim();
                            saveAllData();
                            renderVolumeList();
                            renderCurrentChapter();
                            renderBooks();
                        }
                    };
                })(ch);
                
                // 章节删除
                chDiv.querySelector('.delete-chapter').onclick = (function(volId, chId, chTitle) {
                    return function(e) {
                        e.stopPropagation();
                        if (confirm('确定删除章节 "' + chTitle + '" 吗？')) {
                            var vol = getCurrentVolume();
                            if (vol && vol.chapters.length === 1) {
                                alert('每个分卷至少保留一个章节');
                                return;
                            }
                            moveChapterToTrash(volId, chId, chTitle, '');
                            vol.chapters = vol.chapters.filter(function(c) { return c.id !== chId; });
                            if (currentChapterId === chId && currentVolumeId === volId) {
                                currentChapterId = vol.chapters[0] ? vol.chapters[0].id : null;
                            }
                            saveAllData();
                            renderVolumeList();
                            renderCurrentChapter();
                            renderBooks();
                            alert('已移至回收站');
                        }
                    };
                })(vol.id, ch.id, ch.title);
                
                chapterContainer.appendChild(chDiv);
            }
        }
        
        // 分卷标题点击（展开/折叠）
        volDiv.querySelector('.volume-title').onclick = function() {
            var chapterList = this.closest('.volume-item').querySelector('.chapter-list');
            if (chapterList) {
                if (chapterList.style.display === 'none') {
                    chapterList.style.display = 'block';
                } else {
                    chapterList.style.display = 'none';
                }
            }
        };
        
        // 分卷上移
        volDiv.querySelector('.volume-move-up').onclick = (function(volId, idx) {
            return function(e) {
                e.stopPropagation();
                moveVolume(volId, idx, 'up');
            };
        })(vol.id, v);
        
        // 分卷下移
        volDiv.querySelector('.volume-move-down').onclick = (function(volId, idx) {
            return function(e) {
                e.stopPropagation();
                moveVolume(volId, idx, 'down');
            };
        })(vol.id, v);
        
        // 分卷重命名
        volDiv.querySelector('.volume-rename').onclick = (function(vol) {
            return function(e) {
                e.stopPropagation();
                var newName = prompt('请输入新的分卷名称', vol.name);
                if (newName && newName.trim()) {
                    vol.name = newName.trim();
                    saveAllData();
                    renderVolumeList();
                    renderBooks();
                }
            };
        })(vol);
        
        // 分卷删除
        volDiv.querySelector('.volume-delete').onclick = (function(volId, volName, volIndex) {
            return function(e) {
                e.stopPropagation();
                var book = getCurrentBook();
                if (book.volumes.length === 1) {
                    alert('至少保留一个分卷');
                    return;
                }
                if (confirm('确定删除分卷 "' + volName + '" 吗？其中的章节也会被删除！')) {
                    var vol = book.volumes[volIndex];
                    if (vol && vol.chapters) {
                        for (var i = 0; i < vol.chapters.length; i++) {
                            var ch = vol.chapters[i];
                            moveChapterToTrash(volId, ch.id, ch.title, ch.content);
                        }
                    }
                    book.volumes.splice(volIndex, 1);
                    if (currentVolumeId == volId) {
                        currentVolumeId = book.volumes[0] ? book.volumes[0].id : null;
                        currentChapterId = (book.volumes[0] && book.volumes[0].chapters && book.volumes[0].chapters[0]) ? book.volumes[0].chapters[0].id : null;
                    }
                    saveAllData();
                    renderVolumeList();
                    renderCurrentChapter();
                    renderBooks();
                    alert('分卷已删除');
                }
            };
        })(vol.id, vol.name, v);
        
        container.appendChild(volDiv);
    }
    
        // 初始化拖拽排序
    initVolumeDragAndDrop();
    initChapterDragAndDrop();
    
    // 注意：批量操作按钮已经在 initBookEditor 中通过 addBatchActionButtons() 添加
    // 这里不需要重复添加，否则会重复
    // addBatchActionButtons();  // 注释掉这行
}

// 移动分卷
function moveVolume(volId, currentIndex, direction) {
    var book = getCurrentBook();
    if (!book.volumes) return;
    
    var newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= book.volumes.length) return;
    
    // 交换位置
    var temp = book.volumes[currentIndex];
    book.volumes[currentIndex] = book.volumes[newIndex];
    book.volumes[newIndex] = temp;
    
    saveAllData();
    renderVolumeList();
    renderBooks();
}

// 初始化分卷拖拽排序
function initVolumeDragAndDrop() {
    var volumeItems = document.querySelectorAll('.volume-item');
    var dragSource = null;
    
    volumeItems.forEach(function(item) {
        item.setAttribute('draggable', 'true');
        
        item.addEventListener('dragstart', function(e) {
            dragSource = this;
            this.style.opacity = '0.5';
            e.dataTransfer.setData('text/plain', this.getAttribute('data-vol-id'));
            e.dataTransfer.effectAllowed = 'move';
        });
        
        item.addEventListener('dragend', function(e) {
            this.style.opacity = '1';
            dragSource = null;
        });
        
        item.addEventListener('dragover', function(e) {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            this.style.borderTop = '2px solid #007aff';
        });
        
        item.addEventListener('dragleave', function(e) {
            this.style.borderTop = '';
        });
        
        item.addEventListener('drop', function(e) {
            e.preventDefault();
            this.style.borderTop = '';
            
            if (!dragSource || dragSource === this) return;
            
            var sourceVolId = parseInt(dragSource.getAttribute('data-vol-id'));
            var targetVolId = parseInt(this.getAttribute('data-vol-id'));
            
            var book = getCurrentBook();
            var sourceIndex = book.volumes.findIndex(function(v) { return v.id == sourceVolId; });
            var targetIndex = book.volumes.findIndex(function(v) { return v.id == targetVolId; });
            
            if (sourceIndex === -1 || targetIndex === -1) return;
            
            // 移动分卷
            var temp = book.volumes[sourceIndex];
            book.volumes.splice(sourceIndex, 1);
            book.volumes.splice(targetIndex, 0, temp);
            
            saveAllData();
            renderVolumeList();
            renderBooks();
        });
    });
}

// 移动章节
function moveChapter(volId, chapterId, currentIndex, direction) {
    var book = getCurrentBook();
    var vol = book.volumes.find(function(v) { return v.id == volId; });
    if (!vol || !vol.chapters) return;
    
    var newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= vol.chapters.length) return;
    
    // 交换位置
    var temp = vol.chapters[currentIndex];
    vol.chapters[currentIndex] = vol.chapters[newIndex];
    vol.chapters[newIndex] = temp;
    
    saveAllData();
    renderVolumeList();
    renderCurrentChapter();
    renderBooks();
}

// 初始化章节拖拽排序
function initChapterDragAndDrop() {
    var chapterItems = document.querySelectorAll('.chapter-item');
    var dragSource = null;
    
    chapterItems.forEach(function(item) {
        item.setAttribute('draggable', 'true');
        
        item.addEventListener('dragstart', function(e) {
            dragSource = this;
            this.style.opacity = '0.5';
            e.dataTransfer.setData('text/plain', this.getAttribute('data-chapter-id'));
            e.dataTransfer.effectAllowed = 'move';
        });
        
        item.addEventListener('dragend', function(e) {
            this.style.opacity = '1';
            dragSource = null;
        });
        
        item.addEventListener('dragover', function(e) {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            this.style.borderTop = '2px solid #007aff';
        });
        
        item.addEventListener('dragleave', function(e) {
            this.style.borderTop = '';
        });
        
        item.addEventListener('drop', function(e) {
            e.preventDefault();
            this.style.borderTop = '';
            
            if (!dragSource || dragSource === this) return;
            
            var sourceVolId = parseInt(dragSource.getAttribute('data-vol-id'));
            var sourceChapterId = parseInt(dragSource.getAttribute('data-chapter-id'));
            var targetVolId = parseInt(this.getAttribute('data-vol-id'));
            var targetChapterId = parseInt(this.getAttribute('data-chapter-id'));
            
            if (sourceVolId !== targetVolId) {
                alert('不能跨分卷拖拽章节');
                return;
            }
            
            var book = getCurrentBook();
            var vol = book.volumes.find(function(v) { return v.id == sourceVolId; });
            if (!vol || !vol.chapters) return;
            
            var sourceIndex = vol.chapters.findIndex(function(c) { return c.id == sourceChapterId; });
            var targetIndex = vol.chapters.findIndex(function(c) { return c.id == targetChapterId; });
            
            if (sourceIndex === -1 || targetIndex === -1) return;
            
            // 移动章节
            var temp = vol.chapters[sourceIndex];
            vol.chapters.splice(sourceIndex, 1);
            vol.chapters.splice(targetIndex, 0, temp);
            
            saveAllData();
            renderVolumeList();
            renderCurrentChapter();
            renderBooks();
        });
    });
}

function bindDeleteChapterEvents() {
    var deleteBtns = document.querySelectorAll('.delete-chapter');
    for (var i = 0; i < deleteBtns.length; i++) {
        deleteBtns[i].onclick = function(e) {
            e.stopPropagation();
            var chapterId = parseInt(this.getAttribute('data-chapter-id'));
            var volId = parseInt(this.getAttribute('data-vol-id'));
            var book = getCurrentBook();
            var vol = book.volumes.find(function(v) { return v.id == volId; });
            if (vol && vol.chapters) {
                var ch = vol.chapters.find(function(c) { return c.id == chapterId; });
                if (ch) {
                    if (vol.chapters.length === 1) { alert('每个分卷至少保留一个章节'); return; }
                    if (confirm('确定删除章节 "' + ch.title + '" 吗？删除后可在回收站恢复')) {
                        moveChapterToTrash(volId, chapterId, ch.title, ch.content);
                        vol.chapters = vol.chapters.filter(function(c) { return c.id !== chapterId; });
                        if (currentChapterId === chapterId && currentVolumeId === volId) {
                            currentChapterId = vol.chapters[0] ? vol.chapters[0].id : null;
                        }
                        saveAllData();
                        renderVolumeList();
                        renderCurrentChapter();
                        renderBooks();
                        alert('已移至回收站');
                    }
                }
            }
        };
    }
}

function showVolumeMenu(volId) {
    var book = getCurrentBook();
    var vol = book.volumes.find(function(v) { return v.id == volId; });
    if (!vol) return;
    var menu = document.createElement('div');
    menu.style.cssText = 'position:fixed;background:#fff;border-radius:8px;padding:4px 0;box-shadow:0 2px 8px rgba(0,0,0,0.15);z-index:1000;min-width:100px;';
    menu.innerHTML = '<button class="rename-vol" style="display:block;width:100%;padding:8px 16px;border:none;background:none;cursor:pointer;">重命名</button><button class="delete-vol" style="display:block;width:100%;padding:8px 16px;border:none;background:none;cursor:pointer;">删除分卷</button>';
    document.body.appendChild(menu);
    var rect = event.target.getBoundingClientRect();
    menu.style.top = rect.bottom + 'px';
    menu.style.left = rect.left + 'px';
    menu.querySelector('.rename-vol').onclick = function() {
        if (vol) { var newName = prompt('请输入新名称', vol.name); if (newName) { vol.name = newName; saveAllData(); renderVolumeList(); renderBooks(); } }
        menu.remove();
    };
    menu.querySelector('.delete-vol').onclick = function() {
        if (book.volumes.length === 1) { alert('至少保留一个分卷'); menu.remove(); return; }
        book.volumes = book.volumes.filter(function(v) { return v.id != volId; });
        if (currentVolumeId == volId) {
            currentVolumeId = book.volumes[0] ? book.volumes[0].id : null;
            currentChapterId = (book.volumes[0] && book.volumes[0].chapters && book.volumes[0].chapters[0]) ? book.volumes[0].chapters[0].id : null;
        }
        saveAllData();
        renderVolumeList();
        renderCurrentChapter();
        renderBooks();
        menu.remove();
    };
    setTimeout(function() {
        document.addEventListener('click', function closeMenu(e) {
            if (!menu.contains(e.target)) { menu.remove(); document.removeEventListener('click', closeMenu); }
        });
    }, 100);
}

function renderCurrentChapter() {
    var ch = getCurrentChapter();
    var titleInput = document.getElementById('chapterTitle');
    var editor = document.getElementById('editor');
    if (!ch) {
        if (titleInput) titleInput.value = '';
        if (editor) editor.innerHTML = '<p>请选择一个章节</p>';
        updateWordCount();
        return;
    }
    if (titleInput) titleInput.value = ch.title || '';
    if (editor) editor.innerHTML = ch.content || '<p></p>';
    updateWordCount();
}

function updateWordCount() {
    var ch = getCurrentChapter();
    var text = ch ? (ch.content || '').replace(/<[^>]*>/g, '') : '';
    var wcSpan = document.getElementById('wordCount');
    if (wcSpan) wcSpan.innerText = text.length;
}

function saveCurrentChapter() {
    var ch = getCurrentChapter();
    if (!ch) return;
    var titleInput = document.getElementById('chapterTitle');
    var editor = document.getElementById('editor');
    if (titleInput) ch.title = titleInput.value;
    if (editor) ch.content = editor.innerHTML;
    ch.updatedTime = new Date().toISOString();
    saveAllData();
    renderVolumeList();
    updateWordCount();
    renderBooks();
    var statusSpan = document.getElementById('saveStatus');
    if (statusSpan) { statusSpan.textContent = '已保存'; setTimeout(function() { if (statusSpan.textContent === '已保存') statusSpan.textContent = '已同步'; }, 2000); }
}

function bindEditorEvents() {
    var addVolumeBtn = document.getElementById('addVolumeBtn');
    var addChapterBtn = document.getElementById('addChapterBtn');
    var titleInput = document.getElementById('chapterTitle');
    var editor = document.getElementById('editor');
    if (addVolumeBtn) {
        addVolumeBtn.onclick = function() {
            var book = getCurrentBook();
            var newNumber = (book.volumes ? book.volumes.length : 0) + 1;
            var newVol = new Volume(Date.now(), '第' + numberToChinese(newNumber) + '卷', [new Chapter(Date.now(), '第一章', '<p></p>')]);
            if (!book.volumes) book.volumes = [];
            book.volumes.push(newVol);
            currentVolumeId = newVol.id;
            currentChapterId = newVol.chapters[0].id;
            saveAllData();
            renderVolumeList();
            renderCurrentChapter();
            renderBooks();
        };
    }
    if (addChapterBtn) {
        addChapterBtn.onclick = function() {
            var vol = getCurrentVolume();
            if (!vol) { alert('请先创建分卷'); return; }
            var newNumber = (vol.chapters ? vol.chapters.length : 0) + 1;
            var newCh = new Chapter(Date.now(), '第' + numberToChinese(newNumber) + '章', '<p></p>');
            if (!vol.chapters) vol.chapters = [];
            vol.chapters.push(newCh);
            currentChapterId = newCh.id;
            saveAllData();
            renderVolumeList();
            renderCurrentChapter();
            renderBooks();
        };
    }
    if (titleInput) titleInput.oninput = function() { saveCurrentChapter(); };
    if (editor) {
        editor.oninput = function() {
            updateWordCount();
            clearTimeout(autoSaveTimer);
            autoSaveTimer = setTimeout(saveCurrentChapter, 1000);
        };
    }
}

function initRightSidebar() {
    if (document.getElementById('rightSidebar')) return;
    var sidebarHtml = '<div id="rightSidebar" class="right-sidebar"><div class="right-sidebar-content"><div class="sidebar-tool-item" data-tool="outline"><div class="sidebar-tool-icon">📋</div><div class="sidebar-tool-label">大纲</div></div><div class="sidebar-tool-item" data-tool="timeline"><div class="sidebar-tool-icon">⏱️</div><div class="sidebar-tool-label">时间线</div></div><div class="sidebar-tool-item" data-tool="characters"><div class="sidebar-tool-icon">👥</div><div class="sidebar-tool-label">角色</div></div><div class="sidebar-tool-item" data-tool="setting"><div class="sidebar-tool-icon">⚙️</div><div class="sidebar-tool-label">设定</div></div><div class="sidebar-tool-item" data-tool="relation"><div class="sidebar-tool-icon">🔗</div><div class="sidebar-tool-label">关系图</div></div><div class="sidebar-tool-item" data-tool="whiteboard"><div class="sidebar-tool-icon">📝</div><div class="sidebar-tool-label">无边记</div></div><div class="sidebar-tool-item" data-tool="namegen"><div class="sidebar-tool-icon">✏️</div><div class="sidebar-tool-label">起名</div></div><div class="sidebar-tool-item" data-tool="notes"><div class="sidebar-tool-icon">📓</div><div class="sidebar-tool-label">笔记</div></div></div></div>';
    document.body.insertAdjacentHTML('beforeend', sidebarHtml);
    
    var tools = document.querySelectorAll('.sidebar-tool-item');
    for (var i = 0; i < tools.length; i++) {
        tools[i].onclick = function() {
            var tool = this.getAttribute('data-tool');
            openSecondaryWindow(tool);
        };
    }
}

function openSecondaryWindow(tool) {
    var fileMap = {
        whiteboard: 'html/html/whiteboard.html',
        namegen: 'html/html/namegen.html',
        notes: 'html/html/notes.html',
        outline: 'html/html/outline.html',
        timeline: 'html/html/timeline.html',
        characters: 'html/html/characters.html',
        setting: 'html/html/setting.html',
        relation: 'html/html/relation.html'
    };
    var file = fileMap[tool];
    if (file) {
        window.open(file, '_blank', 'width=1000,height=750,left=100,top=50,resizable=yes');
    } else {
        alert(tool + '功能开发中');
    }
}

var chapterTrash = [];

function loadChapterTrash() {
    var saved = localStorage.getItem('chapter_trash');
    if (saved) { try { chapterTrash = JSON.parse(saved); } catch(e) {} }
    if (!chapterTrash) chapterTrash = [];
}

function saveChapterTrash() {
    localStorage.setItem('chapter_trash', JSON.stringify(chapterTrash));
}

function moveChapterToTrash(volId, chapterId, chapterTitle, chapterContent) {
    chapterTrash.unshift({ id: Date.now(), volId: volId, chapterId: chapterId, title: chapterTitle, content: chapterContent, deletedTime: new Date().toLocaleString() });
    if (chapterTrash.length > 50) chapterTrash.pop();
    saveChapterTrash();
}

function restoreChapterFromTrash(trashId) {
    var item = chapterTrash.find(function(t) { return t.id === trashId; });
    if (item) {
        var book = getCurrentBook();
        var vol = book.volumes.find(function(v) { return v.id == item.volId; });
        if (vol) {
            var newChapter = new Chapter(item.chapterId, item.title, item.content);
            if (!vol.chapters) vol.chapters = [];
            vol.chapters.push(newChapter);
            saveAllData();
            renderVolumeList();
            renderCurrentChapter();
        }
        chapterTrash = chapterTrash.filter(function(t) { return t.id !== trashId; });
        saveChapterTrash();
        if (typeof renderTrashPanel === 'function') renderTrashPanel();
        alert('已恢复章节: ' + item.title);
    }
}

function permanentDeleteChapter(trashId) {
    chapterTrash = chapterTrash.filter(function(t) { return t.id !== trashId; });
    saveChapterTrash();
    if (typeof renderTrashPanel === 'function') renderTrashPanel();
}

function openTrashPanel() {
    var panel = document.getElementById('chapterTrashPanel');
    if (panel) {
        panel.classList.toggle('open');
        if (panel.classList.contains('open')) renderTrashPanel();
        return;
    }
    var html = '<div id="chapterTrashPanel" class="right-slide-panel"><div class="right-slide-panel-header"><h3>章节回收站</h3><button class="right-slide-panel-close" onclick="document.getElementById(\'chapterTrashPanel\').classList.remove(\'open\')">✕</button></div><div class="right-slide-panel-content" id="trashContentList"><div style="text-align:center; color:#888; padding:20px;">暂无删除的章节</div></div></div>';
    document.body.insertAdjacentHTML('beforeend', html);
    renderTrashPanel();
    document.getElementById('chapterTrashPanel').classList.add('open');
}

function renderTrashPanel() {
    var container = document.getElementById('trashContentList');
    if (!container) return;
    if (chapterTrash.length === 0) {
        container.innerHTML = '<div style="text-align:center; color:#888; padding:20px;">暂无删除的章节</div>';
        return;
    }
    var html = '';
    for (var i = 0; i < chapterTrash.length; i++) {
        var item = chapterTrash[i];
        html += '<div class="chapter-trash-item" data-id="' + item.id + '"><div><div class="chapter-trash-title">' + escapeHtml(item.title) + '</div><div class="chapter-trash-time">删除于: ' + item.deletedTime + '</div></div><div><button class="restore-chapter-btn" data-id="' + item.id + '">恢复</button><button class="delete-chapter-permanent-btn" data-id="' + item.id + '">永久删除</button></div></div>';
    }
    container.innerHTML = html;
    var restoreBtns = container.querySelectorAll('.restore-chapter-btn');
    for (var i = 0; i < restoreBtns.length; i++) {
        restoreBtns[i].onclick = function(e) {
            e.stopPropagation();
            var id = parseInt(this.getAttribute('data-id'));
            restoreChapterFromTrash(id);
        };
    }
    var deleteBtns = container.querySelectorAll('.delete-chapter-permanent-btn');
    for (var i = 0; i < deleteBtns.length; i++) {
        deleteBtns[i].onclick = function(e) {
            e.stopPropagation();
            if (confirm('永久删除后无法恢复，确定吗？')) {
                var id = parseInt(this.getAttribute('data-id'));
                permanentDeleteChapter(id);
            }
        };
    }
}

loadChapterTrash();
window.saveCurrentChapter = saveCurrentChapter;
window.openBookTab = openBookTab;

// 确保右侧边栏只在书籍编辑页面显示，并且和编辑器拼接
function ensureRightSidebarPosition() {
    var rightSidebar = document.getElementById('rightSidebar');
    var detailEditor = document.querySelector('.detail-editor');
    var detailMain = document.querySelector('.detail-main');
    
    if (!rightSidebar || !detailMain) return;
    
    // 检查右侧边栏是否已经在 detail-main 内部
    if (rightSidebar.parentElement !== detailMain) {
        // 将右侧边栏移动到 detail-main 内部，放在 detail-editor 后面
        detailMain.appendChild(rightSidebar);
    }
    
    // 确保样式正确
    rightSidebar.style.display = 'flex';
}

// 重写 initRightSidebar 函数
var originalInitRightSidebar = initRightSidebar;
initRightSidebar = function() {
    if (document.getElementById('rightSidebar')) return;
    originalInitRightSidebar();
    setTimeout(ensureRightSidebarPosition, 100);
};
// ========== 状态栏功能 ==========

// 更新时间显示
function updateTimeDisplay() {
    var timeSpan = document.getElementById('currentTime');
    if (timeSpan) {
        var now = new Date();
        var year = now.getFullYear();
        var month = now.getMonth() + 1;
        var day = now.getDate();
        var hours = now.getHours().toString().padStart(2, '0');
        var minutes = now.getMinutes().toString().padStart(2, '0');
        var seconds = now.getSeconds().toString().padStart(2, '0');
        var timeStr = year + '年 ' + month + '月 ' + day + '日  ' + hours + ':' + minutes + ':' + seconds;
        timeSpan.textContent = timeStr;
    }
}

// 更新备份状态显示
function updateBackupStatus(message, isSuccess) {
    var backupSpan = document.getElementById('backupStatus');
    if (backupSpan) {
        backupSpan.textContent = message || (isSuccess ? '✅ 备份成功' : '⚠️ 备份失败');
        backupSpan.style.color = isSuccess ? '#28a745' : '#dc3545';
        setTimeout(function() {
            if (backupSpan) {
                backupSpan.textContent = '📦 备份待命';
                backupSpan.style.color = '';
            }
        }, 3000);
    }
}

// 更新保存状态显示
function updateSaveStatus(message, isAuto) {
    var saveSpan = document.getElementById('saveStatus');
    if (saveSpan) {
        saveSpan.textContent = message || (isAuto ? '⏳ 自动保存中...' : '✅ 已保存');
        if (!isAuto) {
            setTimeout(function() {
                if (saveSpan && saveSpan.textContent === '✅ 已保存') {
                    saveSpan.textContent = '已同步';
                }
            }, 2000);
        }
    }
}

// 模拟自动备份（每30秒检查一次）
var lastBackupTime = Date.now();
function checkAutoBackup() {
    var now = Date.now();
    var backupSpan = document.getElementById('backupStatus');
    if (backupSpan && (now - lastBackupTime) >= 30000) { // 30秒
        lastBackupTime = now;
        // 模拟备份
        updateBackupStatus('📦 自动备份中...', true);
        // 实际备份逻辑可以在这里添加
        setTimeout(function() {
            updateBackupStatus('✅ 自动备份成功', true);
        }, 500);
    }
}

// 未保存提示
var hasUnsavedChanges = false;
function markUnsaved() {
    hasUnsavedChanges = true;
    var saveSpan = document.getElementById('saveStatus');
    if (saveSpan) {
        saveSpan.textContent = '✏️ 未保存';
        saveSpan.style.color = '#ff9800';
    }
}

function clearUnsavedMark() {
    hasUnsavedChanges = false;
    var saveSpan = document.getElementById('saveStatus');
    if (saveSpan) {
        saveSpan.textContent = '已保存';
        saveSpan.style.color = '';
    }
}

// 修改 saveCurrentChapter 函数，添加标记清除
var originalSaveCurrentChapter = saveCurrentChapter;
if (originalSaveCurrentChapter) {
    saveCurrentChapter = function() {
        originalSaveCurrentChapter();
        clearUnsavedMark();
        updateSaveStatus('✅ 已保存', false);
    };
}

// 启动定时器
function startStatusBarTimers() {
    // 每秒更新时间
    setInterval(updateTimeDisplay, 1000);
    // 每10秒检查自动备份
    setInterval(checkAutoBackup, 10000);
    
    // 监听编辑器输入事件，标记未保存
    var editor = document.getElementById('editor');
    if (editor) {
        editor.addEventListener('input', function() {
            markUnsaved();
        });
    }
}
// ========== 书籍编辑面板 ==========
var currentEditBookId = null;

function openBookEditPanel(bookId) {
    currentEditBookId = bookId;
    var book = getBookById(bookId);
    if (!book) return;
    
    var panel = document.getElementById('bookEditSlidePanel');
    if (!panel) {
        var html = '<div id="bookEditSlidePanel" class="right-slide-panel" style="position:fixed; right:0; top:80px; width:360px; height:calc(100vh - 100px); background:rgba(255,255,255,0.95); backdrop-filter:blur(8px); box-shadow:-2px 0 12px rgba(0,0,0,0.15); transform:translateX(100%); transition:transform 0.3s ease; z-index:1000; display:flex; flex-direction:column;">' +
            '<div class="right-slide-panel-header" style="display:flex; justify-content:space-between; align-items:center; padding:16px; border-bottom:1px solid rgba(0,0,0,0.1);">' +
            '<h3 style="margin:0;">编辑书籍</h3>' +
            '<button class="right-slide-panel-close" style="background:none; border:none; font-size:20px; cursor:pointer;">✕</button>' +
            '</div>' +
            '<div class="right-slide-panel-content" style="flex:1; overflow-y:auto; padding:20px;">' +
            '<input type="text" id="editBookName" placeholder="书籍名称" style="width:100%; padding:12px; margin-bottom:16px; border:1px solid #ddd; border-radius:8px; box-sizing:border-box;">' +
            '<textarea id="editBookDesc" rows="4" placeholder="书籍简介" style="width:100%; padding:12px; margin-bottom:16px; border:1px solid #ddd; border-radius:8px; resize:vertical; box-sizing:border-box;"></textarea>' +
            '<div style="margin-bottom:16px;">' +
'<label style="display:block; margin-bottom:8px;">书籍封面</label>' +
'<input type="file" id="editBookCover" accept="image/*" style="margin-bottom:8px;">' +
'<div style="display:flex; gap:8px; margin-bottom:8px;">' +
'<button id="deleteCoverBtn" style="flex:1; padding:6px; background:#dc3545; color:white; border:none; border-radius:6px; cursor:pointer;">🗑️ 删除封面</button>' +
'</div>' +
'<div id="editBookCoverPreview" style="width:100%; height:120px; background:#f5f5f5; border-radius:8px; background-size:cover; background-position:center; border:1px solid #ddd;"></div>' +
'</div>' +
            '<button id="saveBookEditBtn" class="btn-primary" style="width:100%; padding:12px; margin-bottom:12px; background:#9b784e; color:white; border:none; border-radius:8px; cursor:pointer;">保存修改</button>' +
            '<button id="deleteBookEditBtn" class="btn-danger" style="width:100%; padding:12px; background:#dc3545; color:white; border:none; border-radius:8px; cursor:pointer;">删除书籍</button>' +
            '</div>' +
            '</div>';
        document.body.insertAdjacentHTML('beforeend', html);
        panel = document.getElementById('bookEditSlidePanel');
        
        document.querySelector('#bookEditSlidePanel .right-slide-panel-close').onclick = function() { closeBookEditPanel(); };
        document.getElementById('saveBookEditBtn').onclick = saveBookEdit;
        document.getElementById('deleteBookEditBtn').onclick = deleteBookFromEdit;
        document.getElementById('editBookCover').onchange = function(e) {
            var file = e.target.files[0];
            if (file) {
                var reader = new FileReader();
                reader.onload = function(ev) {
                    document.getElementById('editBookCoverPreview').style.backgroundImage = 'url(' + ev.target.result + ')';
                };
                reader.readAsDataURL(file);
            }
        };
    }
    
    // 填充数据
    document.getElementById('editBookName').value = book.title || '';
    document.getElementById('editBookDesc').value = book.desc || '';
    if (book.cover) {
        document.getElementById('editBookCoverPreview').style.backgroundImage = 'url(' + book.cover + ')';
    } else {
        document.getElementById('editBookCoverPreview').style.backgroundImage = '';
    }
    document.getElementById('editBookCover').value = '';
    // 删除封面按钮事件
    var deleteCoverBtn = document.getElementById('deleteCoverBtn');
    if (deleteCoverBtn) {
        // 移除旧事件避免重复
        var newDeleteBtn = deleteCoverBtn.cloneNode(true);
        deleteCoverBtn.parentNode.replaceChild(newDeleteBtn, deleteCoverBtn);
        deleteCoverBtn = newDeleteBtn;
        
        deleteCoverBtn.onclick = function(e) {
            e.preventDefault();
            e.stopPropagation();
            if (confirm('确定要删除书籍封面吗？')) {
                book.cover = null;
                document.getElementById('editBookCoverPreview').style.backgroundImage = '';
                // 立即保存
                saveAllData();
                renderBooks();
                // 更新标签页标题（如果需要）
                var tabId = 'book_' + bookId;
                for (var i = 0; i < openTabs.length; i++) {
                    if (openTabs[i].id === tabId) {
                        openTabs[i].title = book.title;
                        renderTabs();
                        break;
                    }
                }
                alert('封面已删除');
            }
        };
    }
    panel.classList.add('open');
    panel.style.transform = 'translateX(0)';
}

function closeBookEditPanel() {
    var panel = document.getElementById('bookEditSlidePanel');
    if (panel) {
        panel.style.transform = 'translateX(100%)';
        setTimeout(function() {
            panel.classList.remove('open');
        }, 300);
    }
    currentEditBookId = null;
}

function saveBookEdit() {
    var book = getBookById(currentEditBookId);
    if (!book) return;
    
    var newName = document.getElementById('editBookName').value.trim();
    if (!newName) { alert('请输入书籍名称'); return; }
    var newDesc = document.getElementById('editBookDesc').value;
    var coverFile = document.getElementById('editBookCover').files[0];
    
    // 使用压缩函数
    compressAndSaveBook(currentEditBookId, newName, newDesc, coverFile);
}

function saveBookWithCover(bookId, name, desc, coverDataUrl) {
    var book = getBookById(bookId);
    if (!book) return;
    
    book.title = name;
    book.desc = desc;
    if (coverDataUrl) {
        book.cover = coverDataUrl;
    }
    
    saveAllData();
    renderBooks();
    
    // 更新标签页标题
    var tabId = 'book_' + bookId;
    for (var i = 0; i < openTabs.length; i++) {
        if (openTabs[i].id === tabId) {
            openTabs[i].title = name;
            renderTabs();
            break;
        }
    }
    
    closeBookEditPanel();
    alert('书籍已更新');
}

function deleteBookFromEdit() {
    if (confirm('确定要删除这本书吗？书籍将移入回收站')) {
        var book = getBookById(currentEditBookId);
        if (book) {
            moveToTrash(book);
            books = books.filter(function(b) { return b.id !== currentEditBookId; });
            saveAllData();
            renderBooks();
            var tabId = 'book_' + currentEditBookId;
            for (var i = 0; i < openTabs.length; i++) {
                if (openTabs[i].id === tabId) {
                    closeTab(tabId);
                    break;
                }
            }
            closeBookEditPanel();
            alert('书籍已移入回收站');
        }
    }
}

// ========== 历史记录功能 ==========

var historyRecords = [];        // 历史记录数组
var historyIndex = -1;          // 当前所在位置
var maxHistorySize = 50;        // 最大历史记录数
var isUndoRedoAction = false;   // 防止操作时重复记录

// 历史记录类型
var HistoryTypes = {
    EDIT: 'edit',           // 编辑内容
    FORMAT: 'format',       // 排版
    CLEAN: 'clean',         // 清理
    SAVE: 'save',           // 保存
    DELETE_CHAPTER: 'delete_chapter',  // 删除章节
    ADD_CHAPTER: 'add_chapter',        // 添加章节
    RENAME_CHAPTER: 'rename_chapter',  // 重命名章节
    DELETE_VOLUME: 'delete_volume',    // 删除分卷
    ADD_VOLUME: 'add_volume',          // 添加分卷
    RENAME_VOLUME: 'rename_volume'     // 重命名分卷
};

// 添加历史记录
function addHistoryRecord(type, description, data) {
    if (isUndoRedoAction) return;
    
    // 如果当前不在最新位置，删除后面的记录
    if (historyIndex < historyRecords.length - 1) {
        historyRecords = historyRecords.slice(0, historyIndex + 1);
    }
    
    var record = {
        id: Date.now(),
        type: type,
        description: description,
        data: data ? JSON.parse(JSON.stringify(data)) : null,
        timestamp: new Date().toLocaleString(),
        bookId: currentBookId,
        chapterId: currentChapterId,
        volumeId: currentVolumeId
    };
    
    historyRecords.push(record);
    
    // 限制记录数量
    if (historyRecords.length > maxHistorySize) {
        historyRecords.shift();
    }
    
    historyIndex = historyRecords.length - 1;
    
    // 更新历史面板
    renderHistoryList();
    
    // 保存到 localStorage
    saveHistoryToLocal();
}

// 撤销
function undo() {
    if (historyIndex <= 0) {
        alert('没有可以撤销的操作');
        return;
    }
    
    isUndoRedoAction = true;
    historyIndex--;
    restoreFromHistory(historyRecords[historyIndex]);
    isUndoRedoAction = false;
    
    renderHistoryList();
}

// 恢复
function redo() {
    if (historyIndex >= historyRecords.length - 1) {
        alert('没有可以恢复的操作');
        return;
    }
    
    isUndoRedoAction = true;
    historyIndex++;
    restoreFromHistory(historyRecords[historyIndex]);
    isUndoRedoAction = false;
    
    renderHistoryList();
}

// 从历史记录恢复
function restoreFromHistory(record) {
    if (!record) return;
    
    var editor = document.getElementById('editor');
    var titleInput = document.getElementById('chapterTitle');
    
    switch (record.type) {
        case HistoryTypes.EDIT:
        case HistoryTypes.FORMAT:
        case HistoryTypes.CLEAN:
            if (editor && record.data && record.data.content !== undefined) {
                editor.innerHTML = record.data.content;
                if (titleInput && record.data.title) {
                    titleInput.value = record.data.title;
                }
                if (typeof saveCurrentChapter === 'function') {
                    saveCurrentChapter();
                }
            }
            break;
        case HistoryTypes.SAVE:
            // 保存操作通常不需要恢复
            break;
        default:
            // 其他操作需要重新加载书籍数据
            if (typeof renderVolumeList === 'function') {
                renderVolumeList();
            }
            if (typeof renderCurrentChapter === 'function') {
                renderCurrentChapter();
            }
            break;
    }
    
    // 更新字数统计
    if (typeof updateWordCount === 'function') {
        updateWordCount();
    }
}

// 清空历史记录
function clearHistory() {
    if (confirm('确定清空所有历史记录吗？')) {
        historyRecords = [];
        historyIndex = -1;
        renderHistoryList();
        saveHistoryToLocal();
        alert('历史记录已清空');
    }
}

// 保存历史记录到 localStorage
function saveHistoryToLocal() {
    var toSave = {
        records: historyRecords,
        index: historyIndex,
        bookId: currentBookId
    };
    localStorage.setItem('history_records_' + currentBookId, JSON.stringify(toSave));
}

// 加载历史记录
function loadHistoryFromLocal() {
    var saved = localStorage.getItem('history_records_' + currentBookId);
    if (saved) {
        try {
            var data = JSON.parse(saved);
            historyRecords = data.records || [];
            historyIndex = data.index !== undefined ? data.index : (historyRecords.length - 1);
            renderHistoryList();
        } catch(e) {
            console.error('加载历史记录失败', e);
        }
    }
}

// 渲染历史面板
function renderHistoryList() {
    var container = document.getElementById('historyList');
    if (!container) return;
    
    if (historyRecords.length === 0) {
        container.innerHTML = '<div style="text-align:center; padding:40px; color:#888;">暂无历史记录<br><span style="font-size:12px;">排版、编辑、保存等操作会被记录</span></div>';
        return;
    }
    
    var html = '';
    for (var i = historyRecords.length - 1; i >= 0; i--) {
        var record = historyRecords[i];
        var isCurrent = (i === historyIndex);
        var icon = getHistoryIcon(record.type);
        
        html += '<div class="history-item' + (isCurrent ? ' history-current' : '') + '" data-index="' + i + '" style="' +
            'padding: 12px; ' +
            'margin: 8px 0; ' +
            'background: ' + (isCurrent ? 'rgba(0,122,255,0.1)' : 'rgba(255,255,255,0.8)') + '; ' +
            'border-radius: 12px; ' +
            'cursor: pointer; ' +
            'transition: all 0.2s; ' +
            'border-left: 3px solid ' + (isCurrent ? '#007aff' : 'transparent') + ';' +
            '">' +
            '<div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">' +
            '<span style="font-size: 16px;">' + icon + '</span>' +
            '<span style="font-weight: 500; flex:1;">' + escapeHtml(record.description) + '</span>' +
            '<span style="font-size: 10px; color: #888;">' + record.timestamp + '</span>' +
            '</div>' +
            '<div style="font-size: 11px; color: #666; word-break: break-all;">' + 
            (record.data && record.data.preview ? escapeHtml(record.data.preview.substring(0, 50)) : '') + 
            '</div>' +
            '</div>';
    }
    container.innerHTML = html;
    
    // 绑定点击事件
    var items = container.querySelectorAll('.history-item');
    for (var i = 0; i < items.length; i++) {
        items[i].onclick = (function(idx) {
            return function() {
                var targetIndex = parseInt(this.getAttribute('data-index'));
                if (targetIndex !== historyIndex) {
                    if (confirm('恢复到这条记录？当前未保存的更改可能会丢失。')) {
                        historyIndex = targetIndex;
                        restoreFromHistory(historyRecords[historyIndex]);
                        renderHistoryList();
                        saveHistoryToLocal();
                    }
                }
            };
        })(i);
    }
}

function getHistoryIcon(type) {
    var icons = {
        'edit': '✏️',
        'format': '🧾',
        'clean': '🗑️',
        'save': '💾',
        'delete_chapter': '❌',
        'add_chapter': '➕',
        'rename_chapter': '📝',
        'delete_volume': '📂❌',
        'add_volume': '📂➕',
        'rename_volume': '📂✏️'
    };
    return icons[type] || '📋';
}

// 初始化历史面板
function initHistoryPanel() {
    var historyIcon = document.querySelector('.icon-sidebar-item[data-target="history"]');
    if (!historyIcon) return;
    
    historyIcon.onclick = function() {
        toggleHistoryPanel();
    };
    
    // 创建历史面板
    createHistoryPanel();
    
    // 加载历史记录
    loadHistoryFromLocal();
    
    // 监听编辑器内容变化（自动记录编辑）
    var editor = document.getElementById('editor');
    var titleInput = document.getElementById('chapterTitle');
    var lastContent = '';
    var lastTitle = '';
    var saveTimer = null;
    
    if (editor) {
        editor.addEventListener('input', function() {
            if (saveTimer) clearTimeout(saveTimer);
            saveTimer = setTimeout(function() {
                var currentContent = editor.innerHTML;
                var currentTitle = titleInput ? titleInput.value : '';
                if (currentContent !== lastContent || currentTitle !== lastTitle) {
                    addHistoryRecord(HistoryTypes.EDIT, '编辑内容', {
                        content: lastContent,
                        title: lastTitle,
                        preview: currentContent.substring(0, 100)
                    });
                    lastContent = currentContent;
                    lastTitle = currentTitle;
                }
            }, 3000);
        });
    }
}

// 创建历史面板
function createHistoryPanel() {
    // 检查是否已存在
    if (document.getElementById('historySidebar')) return;
    
    var detailMain = document.querySelector('.detail-main');
    if (!detailMain) return;
    
    var historyPanel = document.createElement('div');
    historyPanel.id = 'historySidebar';
    historyPanel.className = 'history-sidebar';
    historyPanel.style.cssText = 'width: 0; min-width: 0; max-width: 400px; background: rgba(255,255,255,0.95); backdrop-filter: blur(8px); border-right: 1px solid rgba(0,0,0,0.08); display: none; flex-direction: column; flex-shrink: 0; position: relative; overflow: visible; transition: width 0.2s ease;';
    
    historyPanel.innerHTML = 
        '<div class="history-sidebar-header" style="display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; background: rgba(0,0,0,0.03); border-bottom: 1px solid rgba(0,0,0,0.08);">' +
        '<span style="font-weight: 600;">⏱️ 历史记录</span>' +
        '<div style="display: flex; gap: 8px;">' +
        '<button id="undoBtn" title="撤销 (Ctrl+Z)" style="background: none; border: none; cursor: pointer; font-size: 16px; padding: 4px 8px;">↩️</button>' +
        '<button id="redoBtn" title="恢复 (Ctrl+Y)" style="background: none; border: none; cursor: pointer; font-size: 16px; padding: 4px 8px;">↪️</button>' +
        '<button id="clearHistoryBtn" title="清空历史" style="background: none; border: none; cursor: pointer; font-size: 16px; padding: 4px 8px;">🗑️</button>' +
        '<button class="history-close-btn" style="background: none; border: none; cursor: pointer; font-size: 16px; padding: 4px 8px;">✕</button>' +
        '</div>' +
        '</div>' +
        '<div id="historyList" class="history-sidebar-content" style="flex: 1; overflow-y: auto; padding: 12px;"></div>';
    
    // 插入到编辑器左侧
    var iconSidebar = document.querySelector('.icon-sidebar');
    if (iconSidebar && iconSidebar.nextSibling) {
        detailMain.insertBefore(historyPanel, iconSidebar.nextSibling);
    } else {
        detailMain.insertBefore(historyPanel, detailMain.firstChild);
    }
    
    // 添加拖动条
    addHistoryResizeHandle();
    
    // 绑定按钮事件
    document.getElementById('undoBtn').onclick = undo;
    document.getElementById('redoBtn').onclick = redo;
    document.getElementById('clearHistoryBtn').onclick = clearHistory;
    document.querySelector('.history-close-btn').onclick = function() {
        closeHistoryPanel();
    };
    
    // 键盘快捷键
    document.addEventListener('keydown', function(e) {
        if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
            e.preventDefault();
            undo();
        } else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.shiftKey && e.key === 'Z'))) {
            e.preventDefault();
            redo();
        }
    });
}

// 切换历史面板
function toggleHistoryPanel() {
    var historyPanel = document.getElementById('historySidebar');
    if (!historyPanel) {
        createHistoryPanel();
        historyPanel = document.getElementById('historySidebar');
    }
    
    if (historyPanel.style.display === 'flex') {
        closeHistoryPanel();
    } else {
        openHistoryPanel();
    }
}

function openHistoryPanel() {
    var historyPanel = document.getElementById('historySidebar');
    if (!historyPanel) return;
    
    var savedWidth = localStorage.getItem('history_width');
    var width = savedWidth ? parseInt(savedWidth) : 280;
    
    historyPanel.style.display = 'flex';
    historyPanel.style.width = width + 'px';
    historyPanel.style.minWidth = width + 'px';
    
    renderHistoryList();
}

function closeHistoryPanel() {
    var historyPanel = document.getElementById('historySidebar');
    if (!historyPanel) return;
    
    historyPanel.style.display = 'none';
    historyPanel.style.width = '0';
    historyPanel.style.minWidth = '0';
}

// 添加历史面板拖动条
function addHistoryResizeHandle() {
    var historyPanel = document.getElementById('historySidebar');
    if (!historyPanel) return;
    
    var existingHandle = document.getElementById('historyResizeHandle');
    if (existingHandle) existingHandle.remove();
    
    historyPanel.style.position = 'relative';
    historyPanel.style.overflow = 'visible';
    
    var handle = document.createElement('div');
    handle.id = 'historyResizeHandle';
    handle.style.cssText = 'position: absolute; right: -4px; top: 0; width: 6px; height: 100%; cursor: ew-resize; background: transparent; z-index: 10000; transition: background 0.2s;';
    
    historyPanel.appendChild(handle);
    
    var isResizing = false;
    var startX = 0;
    var startWidth = 0;
    
    handle.addEventListener('mouseenter', function() {
        this.style.background = 'rgba(0, 122, 255, 0.5)';
    });
    
    handle.addEventListener('mouseleave', function() {
        if (!isResizing) this.style.background = 'transparent';
    });
    
    handle.addEventListener('mousedown', function(e) {
        e.preventDefault();
        e.stopPropagation();
        isResizing = true;
        startX = e.clientX;
        startWidth = historyPanel.offsetWidth;
        
        document.body.style.cursor = 'ew-resize';
        document.body.classList.add('resizing');
        
        function onMouseMove(e) {
            if (!isResizing) return;
            var deltaX = e.clientX - startX;
            var newWidth = startWidth + deltaX;
            if (newWidth < 180) newWidth = 180;
            if (newWidth > 400) newWidth = 400;
            historyPanel.style.width = newWidth + 'px';
            historyPanel.style.minWidth = newWidth + 'px';
            localStorage.setItem('history_width', newWidth);
        }
        
        function onMouseUp() {
            isResizing = false;
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
            document.body.style.cursor = '';
            document.body.classList.remove('resizing');
            handle.style.background = 'transparent';
        }
        
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    });
}
// ========== 批量操作功能 ==========

// 添加批量操作按钮到章节栏头部
function addBatchActionButtons() {
    var chaptersHeader = document.querySelector('.chapters-header');
    if (!chaptersHeader) return;
    
    // 检查是否已经添加了批量操作按钮 - 使用更精确的选择器
    var existingBatch = chaptersHeader.querySelector('.batch-actions');
    if (existingBatch) {
        console.log('批量操作按钮已存在，跳过添加');
        return;
    }
    
    var batchDiv = document.createElement('div');
    batchDiv.className = 'batch-actions';
    batchDiv.style.cssText = 'margin-top: 12px; padding-top: 8px; border-top: 1px solid rgba(0,0,0,0.1); display: flex; gap: 8px; flex-wrap: wrap;';
    
    batchDiv.innerHTML = `
        <button id="selectAllChaptersBtn" style="padding: 4px 10px; font-size: 12px; background: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer;">☑ 全选</button>
        <button id="deselectAllChaptersBtn" style="padding: 4px 10px; font-size: 12px; background: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer;">☐ 取消全选</button>
        <button id="batchDeleteChaptersBtn" style="padding: 4px 10px; font-size: 12px; background: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer;">🗑 批量删除</button>
        <button id="batchMoveChaptersBtn" style="padding: 4px 10px; font-size: 12px; background: #007aff; color: white; border: none; border-radius: 4px; cursor: pointer;">📂 批量移动</button>
    `;
    
    chaptersHeader.appendChild(batchDiv);
    
    // 绑定事件
    document.getElementById('selectAllChaptersBtn').onclick = selectAllChapters;
    document.getElementById('deselectAllChaptersBtn').onclick = deselectAllChapters;
    document.getElementById('batchDeleteChaptersBtn').onclick = batchDeleteChapters;
    document.getElementById('batchMoveChaptersBtn').onclick = batchMoveChapters;
    
    console.log('批量操作按钮已添加');
}

// 获取所有选中的章节
function getSelectedChapters() {
    var checkboxes = document.querySelectorAll('.chapter-checkbox:checked');
    var selected = [];
    for (var i = 0; i < checkboxes.length; i++) {
        var cb = checkboxes[i];
        selected.push({
            chapterId: parseInt(cb.getAttribute('data-chapter-id')),
            volumeId: parseInt(cb.getAttribute('data-vol-id'))
        });
    }
    return selected;
}

// 全选章节
function selectAllChapters() {
    var checkboxes = document.querySelectorAll('.chapter-checkbox');
    for (var i = 0; i < checkboxes.length; i++) {
        checkboxes[i].checked = true;
    }
    updateBatchButtonState();
}

// 取消全选
function deselectAllChapters() {
    var checkboxes = document.querySelectorAll('.chapter-checkbox');
    for (var i = 0; i < checkboxes.length; i++) {
        checkboxes[i].checked = false;
    }
    updateBatchButtonState();
}

// 更新批量按钮状态（显示选中数量）
function updateBatchButtonState() {
    var selected = getSelectedChapters();
    var batchDeleteBtn = document.getElementById('batchDeleteChaptersBtn');
    var batchMoveBtn = document.getElementById('batchMoveChaptersBtn');
    
    if (batchDeleteBtn) {
        if (selected.length > 0) {
            batchDeleteBtn.innerHTML = '🗑 批量删除 (' + selected.length + ')';
            batchMoveBtn.innerHTML = '📂 批量移动 (' + selected.length + ')';
        } else {
            batchDeleteBtn.innerHTML = '🗑 批量删除';
            batchMoveBtn.innerHTML = '📂 批量移动';
        }
    }
}

// 批量删除章节
function batchDeleteChapters() {
    var selected = getSelectedChapters();
    if (selected.length === 0) {
        alert('请先选择要删除的章节');
        return;
    }
    
    if (confirm('确定要删除选中的 ' + selected.length + ' 个章节吗？\n\n删除后可以在回收站恢复。')) {
        var book = getCurrentBook();
        var deletedCount = 0;
        
        for (var i = 0; i < selected.length; i++) {
            var sel = selected[i];
            var vol = book.volumes.find(function(v) { return v.id === sel.volumeId; });
            if (vol && vol.chapters) {
                var chIndex = vol.chapters.findIndex(function(c) { return c.id === sel.chapterId; });
                if (chIndex !== -1) {
                    var ch = vol.chapters[chIndex];
                    // 检查是否是分卷的最后一个章节
                    if (vol.chapters.length === 1) {
                        alert('分卷 "' + vol.name + '" 至少保留一个章节，跳过删除');
                        continue;
                    }
                    moveChapterToTrash(sel.volumeId, sel.chapterId, ch.title, ch.content);
                    vol.chapters.splice(chIndex, 1);
                    deletedCount++;
                }
            }
        }
        
        if (deletedCount > 0) {
            // 如果当前章节被删除，重新设置当前章节
            var currentStillExists = false;
            for (var v = 0; v < book.volumes.length; v++) {
                var vol = book.volumes[v];
                if (vol.chapters) {
                    for (var c = 0; c < vol.chapters.length; c++) {
                        if (vol.chapters[c].id === currentChapterId && vol.id === currentVolumeId) {
                            currentStillExists = true;
                            break;
                        }
                    }
                }
            }
            if (!currentStillExists) {
                // 找到第一个可用的章节
                var firstChapter = null;
                for (var v = 0; v < book.volumes.length; v++) {
                    var vol = book.volumes[v];
                    if (vol.chapters && vol.chapters.length > 0) {
                        firstChapter = { volId: vol.id, chId: vol.chapters[0].id };
                        break;
                    }
                }
                if (firstChapter) {
                    currentVolumeId = firstChapter.volId;
                    currentChapterId = firstChapter.chId;
                } else {
                    currentVolumeId = null;
                    currentChapterId = null;
                }
            }
            
            saveAllData();
            renderVolumeList();
            renderCurrentChapter();
            renderBooks();
            alert('已删除 ' + deletedCount + ' 个章节，可到回收站恢复');
        } else {
            alert('没有章节被删除（可能是每个分卷都需要保留至少一个章节）');
        }
    }
}

// 批量移动章节
function batchMoveChapters() {
    var selected = getSelectedChapters();
    if (selected.length === 0) {
        alert('请先选择要移动的章节');
        return;
    }
    
    var book = getCurrentBook();
    // 获取所有分卷列表
    var volumeOptions = '';
    for (var i = 0; i < book.volumes.length; i++) {
        var vol = book.volumes[i];
        volumeOptions += '<option value="' + vol.id + '">' + escapeHtml(vol.name) + '</option>';
    }
    
    // 创建选择对话框
    var modal = document.createElement('div');
    modal.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); z-index: 20000; display: flex; align-items: center; justify-content: center;';
    modal.innerHTML = 
        '<div style="background: #fff; border-radius: 12px; padding: 24px; width: 320px; box-shadow: 0 4px 20px rgba(0,0,0,0.2);">' +
        '<h3 style="margin: 0 0 16px 0;">移动选中章节</h3>' +
        '<p style="margin-bottom: 12px; color: #666;">共选中 ' + selected.length + ' 个章节</p>' +
        '<label style="display: block; margin-bottom: 8px;">目标分卷：</label>' +
        '<select id="targetVolumeSelect" style="width: 100%; padding: 8px; border-radius: 6px; border: 1px solid #ddd; margin-bottom: 20px;">' + volumeOptions + '</select>' +
        '<div style="display: flex; gap: 12px; justify-content: flex-end;">' +
        '<button id="cancelMoveBtn" style="padding: 8px 16px; background: #6c757d; color: white; border: none; border-radius: 6px; cursor: pointer;">取消</button>' +
        '<button id="confirmMoveBtn" style="padding: 8px 16px; background: #007aff; color: white; border: none; border-radius: 6px; cursor: pointer;">确认移动</button>' +
        '</div>' +
        '</div>';
    
    document.body.appendChild(modal);
    
    document.getElementById('cancelMoveBtn').onclick = function() { modal.remove(); };
    document.getElementById('confirmMoveBtn').onclick = function() {
        var targetVolId = parseInt(document.getElementById('targetVolumeSelect').value);
        var targetVol = book.volumes.find(function(v) { return v.id === targetVolId; });
        
        if (!targetVol) {
            alert('目标分卷不存在');
            modal.remove();
            return;
        }
        
        // 按原顺序移动章节
        var chaptersToMove = [];
        for (var i = 0; i < selected.length; i++) {
            var sel = selected[i];
            var sourceVol = book.volumes.find(function(v) { return v.id === sel.volumeId; });
            if (sourceVol) {
                var ch = sourceVol.chapters.find(function(c) { return c.id === sel.chapterId; });
                if (ch) {
                    chaptersToMove.push({
                        chapter: ch,
                        sourceVolId: sel.volumeId
                    });
                }
            }
        }
        
        // 从原分卷中删除并添加到目标分卷
        for (var i = 0; i < chaptersToMove.length; i++) {
            var item = chaptersToMove[i];
            var sourceVol = book.volumes.find(function(v) { return v.id === item.sourceVolId; });
            if (sourceVol) {
                // 从原分卷删除
                var chIndex = sourceVol.chapters.findIndex(function(c) { return c.id === item.chapter.id; });
                if (chIndex !== -1) {
                    sourceVol.chapters.splice(chIndex, 1);
                }
            }
            // 添加到目标分卷
            targetVol.chapters.push(item.chapter);
        }
        
        // 重新排序目标分卷的章节
        for (var i = 0; i < targetVol.chapters.length; i++) {
            targetVol.chapters[i].order = i;
        }
        
        // 清理空分卷
        for (var i = book.volumes.length - 1; i >= 0; i--) {
            var vol = book.volumes[i];
            if (vol.chapters.length === 0 && book.volumes.length > 1) {
                if (confirm('分卷 "' + vol.name + '" 已为空，是否删除？')) {
                    book.volumes.splice(i, 1);
                }
            }
        }
        
        saveAllData();
        renderVolumeList();
        renderCurrentChapter();
        renderBooks();
        modal.remove();
        alert('已移动 ' + chaptersToMove.length + ' 个章节');
    };
}

// 监听复选框变化，更新按钮状态
function bindCheckboxEvents() {
    var checkboxes = document.querySelectorAll('.chapter-checkbox');
    for (var i = 0; i < checkboxes.length; i++) {
        checkboxes[i].onchange = function() {
            updateBatchButtonState();
        };
    }
}

// 在 renderVolumeList 调用后重新绑定复选框事件
var originalRenderVolumeList = renderVolumeList;
renderVolumeList = function() {
    originalRenderVolumeList();
    setTimeout(function() {
        bindCheckboxEvents();
        updateBatchButtonState();
    }, 100);
};
// ========== 稿费计算和显示 ==========

// 计算当前书籍的总字数
function calculateTotalWords(book) {
    var total = 0;
    if (book && book.volumes) {
        for (var v = 0; v < book.volumes.length; v++) {
            var vol = book.volumes[v];
            if (vol && vol.chapters) {
                for (var c = 0; c < vol.chapters.length; c++) {
                    var ch = vol.chapters[c];
                    if (ch && ch.content) {
                        total += ch.content.replace(/<[^>]*>/g, '').length;
                    }
                }
            }
        }
    }
    return total;
}

// 获取当前书籍的稿费设置
function getBookRateSettings(book) {
    if (!book) return { ratePerThousand: 10, targetWords: 200000 };
    return {
        ratePerThousand: book.ratePerThousand !== undefined ? book.ratePerThousand : 10,
        targetWords: book.targetWords !== undefined ? book.targetWords : 200000
    };
}

// 计算当前章节稿费
function calculateChapterFee(book, chapterWords) {
    var settings = getBookRateSettings(book);
    var fee = (chapterWords / 1000) * settings.ratePerThousand;
    return Math.round(fee * 100) / 100;
}

// 计算全书稿费
function calculateTotalFee(book, totalWords) {
    var settings = getBookRateSettings(book);
    var fee = (totalWords / 1000) * settings.ratePerThousand;
    return Math.round(fee * 100) / 100;
}

// 更新状态栏的稿费显示
function updateFeeDisplay() {
    var book = getCurrentBook();
    if (!book) return;
    
    var totalWords = calculateTotalWords(book);
    var settings = getBookRateSettings(book);
    var targetWords = settings.targetWords;
    var ratePerThousand = settings.ratePerThousand;
    
    var currentChapter = getCurrentChapter();
    var currentChapterWords = currentChapter ? currentChapter.content.replace(/<[^>]*>/g, '').length : 0;
    
    var chapterFee = calculateChapterFee(book, currentChapterWords);
    var totalFee = calculateTotalFee(book, totalWords);
    
    var progressPercent = Math.min(100, Math.floor((totalWords / targetWords) * 100));
    var remainingWords = Math.max(0, targetWords - totalWords);
    var remainingFee = Math.round((remainingWords / 1000) * ratePerThousand * 100) / 100;
    
    // 获取或创建稿费显示区域
    var statusBar = document.querySelector('.status-bar > div');
    if (statusBar) {
        // 检查是否已有稿费显示
        var existingFeeSpan = document.getElementById('feeDisplay');
        if (existingFeeSpan) {
            existingFeeSpan.remove();
        }
        
        // 创建稿费显示
        var feeSpan = document.createElement('span');
        feeSpan.id = 'feeDisplay';
        feeSpan.style.cssText = 'background: linear-gradient(135deg, #f5e6d3, #ecd9c0); padding: 4px 12px; border-radius: 20px; font-weight: 500; color: #9b784e;';
        
        // 根据进度显示不同表情
        var emoji = '';
        if (progressPercent >= 100) {
            emoji = '🏆';
        } else if (progressPercent >= 75) {
            emoji = '🚀';
        } else if (progressPercent >= 50) {
            emoji = '📈';
        } else if (progressPercent >= 25) {
            emoji = '✍️';
        } else {
            emoji = '💪';
        }
        
        feeSpan.innerHTML = `${emoji} 本章稿费: ¥${chapterFee} | 全书稿费: ¥${totalFee} | 目标: ${(targetWords/10000).toFixed(0)}万字 (${progressPercent}%) | 剩余稿费: ¥${remainingFee}`;
        
        statusBar.appendChild(feeSpan);
    }
}

// 修改 updateWordCount 函数，添加稿费更新
var originalUpdateWordCount = updateWordCount;
if (typeof originalUpdateWordCount === 'function') {
    updateWordCount = function() {
        originalUpdateWordCount();
        updateFeeDisplay();
    };
} else {
    // 如果 updateWordCount 还没定义，先定义
    function updateWordCount() {
        var ch = getCurrentChapter();
        var text = ch ? (ch.content || '').replace(/<[^>]*>/g, '') : '';
        var wcSpan = document.getElementById('wordCount');
        if (wcSpan) wcSpan.innerText = text.length;
        updateFeeDisplay();
    }
}

// 在章节切换时也更新稿费显示
var originalRenderCurrentChapter = renderCurrentChapter;
if (typeof originalRenderCurrentChapter === 'function') {
    renderCurrentChapter = function() {
        originalRenderCurrentChapter();
        setTimeout(updateFeeDisplay, 100);
    };
}

// 在保存章节时更新稿费
var originalSaveCurrentChapterForFee = saveCurrentChapter;
if (typeof originalSaveCurrentChapterForFee === 'function') {
    saveCurrentChapter = function() {
        originalSaveCurrentChapterForFee();
        updateFeeDisplay();
    };
}