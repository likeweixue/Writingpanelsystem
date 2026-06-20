// ========== 应用主入口 ==========

function init() {
    loadAllData();
    bindMenuEvents();
    bindButtons();
    renderTabs();
    renderBooks();
    switchToTab('home');
    loadSettings();
    initEditorToolbar();
}

function loadAllData() {
    var raw = localStorage.getItem('wps_data');
    if (!raw) {
        var sampleChapter = new Chapter(Date.now(), '第一章', '<p>这里是一个开始...</p>');
        var sampleVolume = new Volume(Date.now(), '第一卷', [sampleChapter]);
        var sampleBook = new Book(Date.now(), '我的作品', [sampleVolume]);
        books = [sampleBook];
        saveAllData();
    } else {
        try {
            var d = JSON.parse(raw);
            books = d.books || [];
            if (books.length === 0) {
                var sampleChapter = new Chapter(Date.now(), '第一章', '<p>开始写作...</p>');
                var sampleVolume = new Volume(Date.now(), '第一卷', [sampleChapter]);
                var sampleBook = new Book(Date.now(), '我的作品', [sampleVolume]);
                books = [sampleBook];
                saveAllData();
            }
        } catch(e) { console.error(e); }
    }
    loadGroups();
    loadTrash();
    var savedTheme = localStorage.getItem('app_theme');
    if (savedTheme) applyTheme(savedTheme);
}

function bindMenuEvents() {
    var menuItems = document.querySelectorAll('.menu-item');
    for (var i = 0; i < menuItems.length; i++) {
        menuItems[i].onclick = (function(page) {
            return function() {
                if (page === 'books') {
                    switchToTab('home');
                } else {
                    switchPage(page);
                }
                var allItems = document.querySelectorAll('.menu-item');
                for (var j = 0; j < allItems.length; j++) {
                    allItems[j].classList.remove('active');
                }
                this.classList.add('active');
                updateSidebarVisibility();
            };
        })(menuItems[i].getAttribute('data-page'));
    }
}

function updateSidebarVisibility() {
    var sidebar = document.querySelector('.sidebar-menu');
    var isEditing = document.querySelector('.book-detail-page') !== null;
    if (isEditing) {
        sidebar.style.display = 'none';
    } else {
        sidebar.style.display = 'flex';
    }
}

function bindButtons() {
    var newBookBtn = document.getElementById('newBookBtn');
    var newGroupBtn = document.getElementById('newGroupBtn');
    var trashBtn = document.getElementById('trashBtn');
    var closeBookDrawer = document.getElementById('closeBookDrawer');
    var confirmNewBook = document.getElementById('confirmNewBookBtn');
    var closeGroupDrawer = document.getElementById('closeGroupDrawer');
    var confirmNewGroup = document.getElementById('confirmNewGroupBtn');
    if (newBookBtn) newBookBtn.onclick = function() { openDrawer('newBookDrawer'); };
    if (newGroupBtn) newGroupBtn.onclick = function() { openDrawer('newGroupDrawer'); };
    if (trashBtn) trashBtn.onclick = function() { openTrashTab(); };
    if (closeBookDrawer) closeBookDrawer.onclick = function() { closeDrawer('newBookDrawer'); };
    if (confirmNewBook) confirmNewBook.onclick = createNewBook;
    if (closeGroupDrawer) closeGroupDrawer.onclick = function() { closeDrawer('newGroupDrawer'); };
    if (confirmNewGroup) confirmNewGroup.onclick = createNewGroup;
}

function openDrawer(id) {
    var drawer = document.getElementById(id);
    if (drawer) drawer.classList.add('open');
}
function closeDrawer(id) {
    var drawer = document.getElementById(id);
    if (drawer) drawer.classList.remove('open');
}

function createNewBook() {
    var nameInput = document.getElementById('newBookName');
    var name = nameInput ? nameInput.value.trim() : '';
    if (!name) { alert('请输入书籍名称'); return; }
    var defaultGroup = groups.find(function(g) { return g.name === '默认分组'; });
    var groupId = defaultGroup ? defaultGroup.id : 'default';
    var newChapter = new Chapter(Date.now(), '第一章', '<p></p>');
    var newVolume = new Volume(Date.now(), '第一卷', [newChapter]);
    var newBook = new Book(Date.now(), name, [newVolume]);
    newBook.groupId = groupId;
    books.push(newBook);
    saveAllData();
    renderBooks();
    closeDrawer('newBookDrawer');
    openBookTab(newBook.id);
    nameInput.value = '';
}

function createNewGroup() {
    var nameInput = document.getElementById('newGroupName');
    var name = nameInput ? nameInput.value.trim() : '';
    if (!name) { alert('请输入分组名称'); return; }
    groups.push({ id: Date.now().toString(), name: name });
    saveGroups();
    renderBooks();
    closeDrawer('newGroupDrawer');
    nameInput.value = '';
    alert('分组创建成功');
}

function openTrashTab() {
    var tabId = 'trash';
    // 检查是否已经打开了回收站标签页
    for (var i = 0; i < openTabs.length; i++) {
        if (openTabs[i].id === tabId) { 
            switchToTab(tabId); 
            // 如果已经打开，重新刷新回收站内容
            renderTrashList();
            return; 
        }
    }
    openTabs.push({ id: tabId, title: '回收站', type: 'trash' });
    renderTabs();
    var pagesContainer = document.getElementById('pagesContainer');
    var pageDiv = document.createElement('div');
    pageDiv.className = 'page';
    pageDiv.setAttribute('data-page', tabId);
    pageDiv.innerHTML = '<div style="padding:20px;"><h2>回收站</h2><div id="trashList"></div></div>';
    pagesContainer.appendChild(pageDiv);
    renderTrashList();
    switchToTab(tabId);
}

function renderTrashList() {
    var container = document.getElementById('trashList');
    if (!container) return;
    
    // 确保 trashBooks 是最新的（从 localStorage 重新加载）
    loadTrash();
    
    if (!trashBooks || trashBooks.length === 0) {
        container.innerHTML = '<div style="text-align:center;padding:40px;">回收站为空</div>';
        return;
    }
    
    var html = '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:16px;">';
    for (var i = 0; i < trashBooks.length; i++) {
        var book = trashBooks[i];
        var deleteDate = book.deletedTime ? new Date(book.deletedTime).toLocaleDateString() : '未知时间';
        html += '<div style="background:#fff;border-radius:8px;padding:16px;text-align:center;">' +
            '<div style="font-size:48px;">📖</div>' +
            '<div style="font-weight:bold;">' + escapeHtml(book.title) + '</div>' +
            '<div style="font-size:12px;color:#888;">删除于: ' + deleteDate + '</div>' +
            '<div style="margin-top:12px;">' +
            '<button class="restore-book" data-id="' + book.id + '" style="padding:4px 12px;background:#28a745;color:white;border:none;border-radius:4px;margin-right:8px;cursor:pointer;">恢复</button>' +
            '<button class="permanent-delete" data-id="' + book.id + '" style="padding:4px 12px;background:#dc3545;color:white;border:none;border-radius:4px;cursor:pointer;">永久删除</button>' +
            '</div>' +
            '</div>';
    }
    html += '</div>';
    container.innerHTML = html;
    
    // 绑定恢复按钮事件
    var restoreBtns = container.querySelectorAll('.restore-book');
    for (var i = 0; i < restoreBtns.length; i++) {
        restoreBtns[i].onclick = function() {
            var id = parseInt(this.getAttribute('data-id'));
            var restored = restoreFromTrash(id);
            if (restored) { 
                renderBooks(); 
                renderTrashList(); 
                alert('书籍已恢复'); 
            } else {
                alert('恢复失败');
            }
        };
    }
    
    // 绑定永久删除按钮事件
    var deleteBtns = container.querySelectorAll('.permanent-delete');
    for (var i = 0; i < deleteBtns.length; i++) {
        deleteBtns[i].onclick = function() {
            if (confirm('确定永久删除吗？此操作不可恢复！')) {
                var id = parseInt(this.getAttribute('data-id'));
                permanentDeleteBook(id);
                renderTrashList();
                alert('已永久删除');
            }
        };
    }
}

function initEditorToolbar() {}

function updateToolbarForPage() {
    var toolbar = document.getElementById('mainToolbar');
    if (!toolbar) return;
    var bookPages = document.querySelectorAll('.page[data-page^="book_"]');
    var hasBookEditor = false;
    for (var i = 0; i < bookPages.length; i++) {
        if (bookPages[i].classList.contains('active')) {
            hasBookEditor = true;
            break;
        }
    }
    if (hasBookEditor) {
        toolbar.classList.add('visible');
    } else {
        toolbar.classList.remove('visible');
    }
}

setTimeout(updateToolbarForPage, 500);

function renderJianghuContent() {
    var container = document.getElementById('jianghuContainer');
    if (!container) return;
    container.innerHTML = '<div style="padding:20px;"><h2>江湖</h2><p>加载中...</p></div>';
    if (typeof loadJianghuPageContent === 'function') {
        loadJianghuPageContent();
    }
}

function renderXuefuContent() {
    var container = document.getElementById('xuefuContainer');
    if (!container) return;
    if (typeof loadXuefuPage === 'function') {
        loadXuefuPage();
    } else {
        container.innerHTML = '<div style="padding:20px;"><h2>学府</h2><p>加载中...</p></div>';
    }
}

function updateStats() {
    var today = 0, week = 0, month = 0, total = 0;
    var now = new Date();
    var todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    var weekStart = todayStart - 6 * 86400000;
    var monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    for (var i = 0; i < books.length; i++) {
        var book = books[i];
        if (book && book.volumes) {
            for (var j = 0; j < book.volumes.length; j++) {
                var vol = book.volumes[j];
                if (vol && vol.chapters) {
                    for (var k = 0; k < vol.chapters.length; k++) {
                        var ch = vol.chapters[k];
                        if (ch && ch.content) {
                            var words = ch.content.replace(/<[^>]*>/g, '').length;
                            var t = new Date(ch.updatedTime || ch.createdTime).getTime();
                            total += words;
                            if (t >= todayStart) today += words;
                            if (t >= weekStart) week += words;
                            if (t >= monthStart) month += words;
                        }
                    }
                }
            }
        }
    }
    var todayEl = document.getElementById('todayWords');
    var weekEl = document.getElementById('weekWords');
    var monthEl = document.getElementById('monthWords');
    var totalEl = document.getElementById('totalWords');
    if (todayEl) todayEl.innerText = today;
    if (weekEl) weekEl.innerText = week;
    if (monthEl) monthEl.innerText = month;
    if (totalEl) totalEl.innerText = total;
}

function fixToolbarVisibility() {
    var toolbar = document.getElementById('mainToolbar');
    if (!toolbar) return;
    var activePage = document.querySelector('.page.active');
    var isEditing = activePage && activePage.getAttribute('data-page') && activePage.getAttribute('data-page').indexOf('book_') === 0;
    if (isEditing) {
        toolbar.classList.add('visible');
    } else {
        toolbar.classList.remove('visible');
    }
}

var originalSwitchToTab = window.switchToTab;
if (originalSwitchToTab) {
    window.switchToTab = function(tabId) {
        originalSwitchToTab(tabId);
        setTimeout(fixToolbarVisibility, 50);
    };
}

var originalCloseTab = window.closeTab;
if (originalCloseTab) {
    window.closeTab = function(tabId) {
        originalCloseTab(tabId);
        setTimeout(fixToolbarVisibility, 50);
    };
}

var originalOpenBookTab = window.openBookTab;
if (originalOpenBookTab) {
    window.openBookTab = function(bookId) {
        originalOpenBookTab(bookId);
        setTimeout(fixToolbarVisibility, 100);
    };
}

setTimeout(fixToolbarVisibility, 100);

init();

// ========== 快捷键系统 ==========

var shortcutKeys = {
    // 全局
    'Ctrl+N': function() { openNewBookPanelV2(); },
    'Ctrl+O': function() { switchToTab('home'); },
    'Ctrl+W': function() { 
        if (activeTabId && activeTabId !== 'home') {
            closeTab(activeTabId);
        }
    },
    'Ctrl+Tab': function(e) { 
        e.preventDefault();
        switchToNextTab();
    },
    'Ctrl+Shift+Tab': function(e) { 
        e.preventDefault();
        switchToPrevTab();
    },
    // 编辑器
    'Ctrl+S': function(e) { 
        e.preventDefault();
        if (typeof saveCurrentChapter === 'function') {
            saveCurrentChapter();
            showShortcutToast('💾 已保存');
        }
    },
    'Ctrl+F': function(e) { 
        e.preventDefault();
        // 检查是否在书籍编辑页面
        var activePage = document.querySelector('.page.active');
        if (activePage && activePage.getAttribute('data-page') && activePage.getAttribute('data-page').indexOf('book_') === 0) {
            // 优先聚焦章节搜索框
            var searchInput = document.getElementById('chapterSearchInput');
            if (searchInput) {
                searchInput.focus();
                searchInput.select();
                showShortcutToast('🔍 搜索章节');
                return;
            }
        }
        openFindReplacePanel();
    },
    'Ctrl+H': function(e) { 
        e.preventDefault();
        openFindReplacePanel();
        var replaceInput = document.getElementById('replaceTextFloat');
        if (replaceInput) {
            setTimeout(function() { replaceInput.focus(); }, 100);
        }
    },
    'Ctrl+Z': function(e) { 
        e.preventDefault();
        if (typeof undo === 'function') {
            undo();
        }
    },
    'Ctrl+Y': function(e) { 
        e.preventDefault();
        if (typeof redo === 'function') {
            redo();
        }
    },
    // 工具快捷键
    'Ctrl+Shift+O': function(e) { 
        e.preventDefault();
        toggleTool('outline', openOutlineSidebar, closeOutlineFloatingPanel);
    },
    'Ctrl+Shift+T': function(e) { 
        e.preventDefault();
        toggleTool('timeline', openTimelineSidebar, closeTimelineFloatingPanel);
    },
    'Ctrl+Shift+R': function(e) { 
        e.preventDefault();
        toggleTool('characters', openCharacterSidebar, closeCharacterFloatingPanel);
    },
    'Ctrl+Shift+E': function(e) { 
        e.preventDefault();
        toggleTool('setting', openSettingSidebar, closeSettingFloatingPanel);
    },
    'Ctrl+Shift+G': function(e) { 
        e.preventDefault();
        toggleTool('relation', openRelationSidebar, closeRelationFloatingPanel);
    },
    'Ctrl+Shift+W': function(e) { 
        e.preventDefault();
        toggleTool('whiteboard', openWhiteboardSidebar, closeWhiteboardFloatingPanel);
    },
    'Ctrl+Shift+N': function(e) { 
        e.preventDefault();
        toggleTool('namegen', openNameGenSidebar, closeNameGenFloatingPanel);
    },
    'Ctrl+Shift+M': function(e) { 
        e.preventDefault();
        toggleTool('notes', openNoteSidebar, closeNoteFloatingPanel);
    },
    'Ctrl+Shift+D': function(e) { 
        e.preventDefault();
        toggleTool('dictionary', openDictionarySidebar, closeDictionaryFloatingPanel);
    },
    // 视图
    'F11': function(e) { 
        e.preventDefault();
        toggleFullscreen();
    },
    'Ctrl+Shift+L': function(e) { 
        e.preventDefault();
        toggleDualMode();
    },
    // 关闭面板
    'Escape': function(e) {
        var panel = document.getElementById('floatingToolPanel');
        if (panel) {
            if (typeof closeFloatingPanel === 'function') {
                closeFloatingPanel();
                showShortcutToast('已关闭面板');
            }
        }
        // 如果有搜索框聚焦，清空搜索
        var searchInput = document.getElementById('chapterSearchInput');
        if (searchInput && document.activeElement === searchInput) {
            searchInput.value = '';
            searchInput.oninput();
            searchInput.blur();
        }
    }
};

// 切换工具（打开/关闭）
function toggleTool(tool, openFn, closeFn) {
    var panel = document.getElementById('floatingToolPanel');
    if (panel) {
        var panelTool = panel.getAttribute('data-tool');
        if (panelTool === tool) {
            if (typeof closeFn === 'function') {
                closeFn();
                showShortcutToast('已关闭 ' + getToolName(tool));
            }
            return;
        } else {
            // 关闭当前面板，打开新的
            if (typeof closeFloatingPanel === 'function') {
                closeFloatingPanel();
            }
        }
    }
    if (typeof openFn === 'function') {
        openFn();
        showShortcutToast('已打开 ' + getToolName(tool));
    }
}

function getToolName(tool) {
    var names = {
        'outline': '大纲',
        'timeline': '时间线',
        'characters': '角色',
        'setting': '设定',
        'relation': '关系图',
        'whiteboard': '无边记',
        'namegen': '起名',
        'notes': '笔记',
        'dictionary': '词典'
    };
    return names[tool] || tool;
}

// 切换标签页
function switchToNextTab() {
    if (openTabs.length <= 1) return;
    var currentIndex = -1;
    for (var i = 0; i < openTabs.length; i++) {
        if (openTabs[i].id === activeTabId) {
            currentIndex = i;
            break;
        }
    }
    if (currentIndex === -1) return;
    var nextIndex = (currentIndex + 1) % openTabs.length;
    switchToTab(openTabs[nextIndex].id);
}

function switchToPrevTab() {
    if (openTabs.length <= 1) return;
    var currentIndex = -1;
    for (var i = 0; i < openTabs.length; i++) {
        if (openTabs[i].id === activeTabId) {
            currentIndex = i;
            break;
        }
    }
    if (currentIndex === -1) return;
    var prevIndex = (currentIndex - 1 + openTabs.length) % openTabs.length;
    switchToTab(openTabs[prevIndex].id);
}

// 显示快捷键提示
function showShortcutToast(message) {
    var existing = document.getElementById('shortcutToast');
    if (existing) {
        existing.remove();
    }
    var toast = document.createElement('div');
    toast.id = 'shortcutToast';
    toast.style.cssText = 'position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:rgba(0,0,0,0.8);color:white;padding:8px 20px;border-radius:20px;font-size:14px;z-index:99999;pointer-events:none;transition:opacity 0.3s;backdrop-filter:blur(10px);';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(function() {
        toast.style.opacity = '0';
        setTimeout(function() {
            if (toast.parentNode) toast.remove();
        }, 300);
    }, 1200);
}

// ========== 快捷键事件监听 ==========

document.addEventListener('keydown', function(e) {
    // 如果输入框或文本区获得焦点，不触发快捷键（除了特定的组合）
    var activeElement = document.activeElement;
    var isInputFocused = activeElement && (
        activeElement.tagName === 'INPUT' || 
        activeElement.tagName === 'TEXTAREA' || 
        activeElement.tagName === 'SELECT' ||
        activeElement.getAttribute('contenteditable') === 'true'
    );
    
    // 构建快捷键字符串
    var key = '';
    var ctrl = e.ctrlKey || e.metaKey;
    var shift = e.shiftKey;
    var alt = e.altKey;
    
    if (ctrl) key += 'Ctrl+';
    if (shift) key += 'Shift+';
    key += e.key;
    
    // 特殊处理 F11（没有 Ctrl 前缀）
    if (e.key === 'F11') {
        key = 'F11';
    }
    
    // 特殊处理 Escape
    if (e.key === 'Escape') {
        key = 'Escape';
    }
    
    // 特殊处理 Ctrl+Tab 和 Ctrl+Shift+Tab
    if (ctrl && e.key === 'Tab' && !shift) {
        key = 'Ctrl+Tab';
    }
    if (ctrl && e.key === 'Tab' && shift) {
        key = 'Ctrl+Shift+Tab';
    }
    
    // 查找快捷键
    var handler = shortcutKeys[key];
    if (handler) {
        // 对于编辑器快捷键，即使在输入框中也可以触发
        var editorShortcuts = ['Ctrl+S', 'Ctrl+F', 'Ctrl+H', 'Ctrl+Z', 'Ctrl+Y', 'Ctrl+B', 'Ctrl+I', 'Ctrl+U', 'Ctrl+Shift+F', 'Ctrl+Shift+C', 'Ctrl+Shift+P'];
        var globalShortcuts = ['Ctrl+N', 'Ctrl+O', 'Ctrl+W', 'Ctrl+Tab', 'Ctrl+Shift+Tab', 'F11', 'Escape', 'Ctrl+Shift+L'];
        var toolShortcuts = ['Ctrl+Shift+O', 'Ctrl+Shift+T', 'Ctrl+Shift+R', 'Ctrl+Shift+E', 'Ctrl+Shift+G', 'Ctrl+Shift+W', 'Ctrl+Shift+N', 'Ctrl+Shift+M', 'Ctrl+Shift+D'];
        
        // 如果是编辑器快捷键，即使在输入框中也可以触发（Ctrl+S 等）
        if (editorShortcuts.indexOf(key) !== -1 || toolShortcuts.indexOf(key) !== -1 || globalShortcuts.indexOf(key) !== -1) {
            handler(e);
            return;
        }
        
        // 如果是在输入框中，不触发其他快捷键
        if (isInputFocused) {
            return;
        }
        
        handler(e);
    }
});

// ========== 快捷键帮助面板 ==========

function showShortcutHelp() {
    var existing = document.getElementById('shortcutHelpPanel');
    if (existing) {
        existing.remove();
        return;
    }
    
    var panel = document.createElement('div');
    panel.id = 'shortcutHelpPanel';
    panel.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);width:600px;max-height:80vh;overflow-y:auto;background:rgba(255,255,255,0.98);backdrop-filter:blur(20px);border-radius:20px;box-shadow:0 20px 60px rgba(0,0,0,0.3);z-index:100000;padding:24px;';
    
    var html = `
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
            <h2 style="margin:0;">⌨️ 快捷键</h2>
            <button onclick="this.closest('#shortcutHelpPanel').remove()" style="background:none;border:none;font-size:24px;cursor:pointer;">✕</button>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
            <div>
                <h4 style="margin:0 0 8px 0;color:#9b784e;">📁 全局</h4>
                <div style="font-size:13px;line-height:2;">
                    <div><kbd style="background:#f0f0f0;padding:2px 8px;border-radius:4px;font-size:12px;">Ctrl+N</kbd> 新建书籍</div>
                    <div><kbd style="background:#f0f0f0;padding:2px 8px;border-radius:4px;font-size:12px;">Ctrl+O</kbd> 打开首页</div>
                    <div><kbd style="background:#f0f0f0;padding:2px 8px;border-radius:4px;font-size:12px;">Ctrl+W</kbd> 关闭标签页</div>
                    <div><kbd style="background:#f0f0f0;padding:2px 8px;border-radius:4px;font-size:12px;">Ctrl+Tab</kbd> 切换标签页</div>
                    <div><kbd style="background:#f0f0f0;padding:2px 8px;border-radius:4px;font-size:12px;">Esc</kbd> 关闭面板/清空搜索</div>
                </div>
            </div>
            <div>
                <h4 style="margin:0 0 8px 0;color:#9b784e;">✏️ 编辑器</h4>
                <div style="font-size:13px;line-height:2;">
                    <div><kbd style="background:#f0f0f0;padding:2px 8px;border-radius:4px;font-size:12px;">Ctrl+S</kbd> 保存章节</div>
                    <div><kbd style="background:#f0f0f0;padding:2px 8px;border-radius:4px;font-size:12px;">Ctrl+F</kbd> 查找替换</div>
                    <div><kbd style="background:#f0f0f0;padding:2px 8px;border-radius:4px;font-size:12px;">Ctrl+Z</kbd> 撤销</div>
                    <div><kbd style="background:#f0f0f0;padding:2px 8px;border-radius:4px;font-size:12px;">Ctrl+Y</kbd> 恢复</div>
                    <div><kbd style="background:#f0f0f0;padding:2px 8px;border-radius:4px;font-size:12px;">Ctrl+Shift+F</kbd> 排版</div>
                    <div><kbd style="background:#f0f0f0;padding:2px 8px;border-radius:4px;font-size:12px;">Ctrl+Shift+C</kbd> 清理</div>
                </div>
            </div>
            <div>
                <h4 style="margin:0 0 8px 0;color:#9b784e;">🛠️ 工具</h4>
                <div style="font-size:13px;line-height:2;">
                    <div><kbd style="background:#f0f0f0;padding:2px 8px;border-radius:4px;font-size:12px;">Ctrl+Shift+O</kbd> 大纲</div>
                    <div><kbd style="background:#f0f0f0;padding:2px 8px;border-radius:4px;font-size:12px;">Ctrl+Shift+T</kbd> 时间线</div>
                    <div><kbd style="background:#f0f0f0;padding:2px 8px;border-radius:4px;font-size:12px;">Ctrl+Shift+R</kbd> 角色</div>
                    <div><kbd style="background:#f0f0f0;padding:2px 8px;border-radius:4px;font-size:12px;">Ctrl+Shift+E</kbd> 设定</div>
                    <div><kbd style="background:#f0f0f0;padding:2px 8px;border-radius:4px;font-size:12px;">Ctrl+Shift+G</kbd> 关系图</div>
                    <div><kbd style="background:#f0f0f0;padding:2px 8px;border-radius:4px;font-size:12px;">Ctrl+Shift+W</kbd> 无边记</div>
                    <div><kbd style="background:#f0f0f0;padding:2px 8px;border-radius:4px;font-size:12px;">Ctrl+Shift+N</kbd> 起名</div>
                    <div><kbd style="background:#f0f0f0;padding:2px 8px;border-radius:4px;font-size:12px;">Ctrl+Shift+M</kbd> 笔记</div>
                    <div><kbd style="background:#f0f0f0;padding:2px 8px;border-radius:4px;font-size:12px;">Ctrl+Shift+D</kbd> 词典</div>
                </div>
            </div>
            <div>
                <h4 style="margin:0 0 8px 0;color:#9b784e;">👁️ 视图</h4>
                <div style="font-size:13px;line-height:2;">
                    <div><kbd style="background:#f0f0f0;padding:2px 8px;border-radius:4px;font-size:12px;">F11</kbd> 全屏</div>
                    <div><kbd style="background:#f0f0f0;padding:2px 8px;border-radius:4px;font-size:12px;">Ctrl+Shift+L</kbd> 双栏模式</div>
                </div>
                <h4 style="margin:16px 0 8px 0;color:#9b784e;">📖 章节</h4>
                <div style="font-size:13px;line-height:2;">
                    <div><kbd style="background:#f0f0f0;padding:2px 8px;border-radius:4px;font-size:12px;">Ctrl+F</kbd> 搜索章节</div>
                </div>
            </div>
        </div>
        <div style="margin-top:16px;padding-top:16px;border-top:1px solid #eee;text-align:center;font-size:12px;color:#888;">
            💡 按 <kbd style="background:#f0f0f0;padding:2px 8px;border-radius:4px;font-size:12px;">Esc</kbd> 关闭此面板
        </div>
    `;
    
    panel.innerHTML = html;
    document.body.appendChild(panel);
    
    // 点击外部关闭
    panel.addEventListener('click', function(e) {
        if (e.target === panel) {
            panel.remove();
        }
    });
    
    // Esc 关闭
    document.addEventListener('keydown', function closeHelp(e) {
        if (e.key === 'Escape') {
            var helpPanel = document.getElementById('shortcutHelpPanel');
            if (helpPanel) {
                helpPanel.remove();
                document.removeEventListener('keydown', closeHelp);
            }
        }
    });
}

// 添加快捷键帮助的触发（Ctrl+/ 或 Cmd+/）
document.addEventListener('keydown', function(e) {
    if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault();
        showShortcutHelp();
    }
});

console.log('⌨️ 快捷键系统已加载');