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
