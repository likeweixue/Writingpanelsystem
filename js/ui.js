// ========== 浏览器风格标签页 & 页面切换 ==========

var TOOL_TYPE_ICONS = {
    book: 'book-open', character: 'users', dictionary: 'library', namegen: 'pen-line',
    note: 'notebook', outline: 'list-tree', relation: 'network', setting: 'wrench',
    timeline: 'clock', whiteboard: 'grid-2x2', dialogue: 'message-circle', trash: 'trash-2'
};

var WORKSPACE_TYPES = ['book', 'character', 'dictionary', 'namegen', 'note', 'outline',
    'relation', 'setting', 'timeline', 'whiteboard', 'dialogue'];

var PAGE_META = {
    stats: { title: '数据', icon: 'chart-no-axes-column' },
    settings: { title: '设置', icon: 'settings' },
    about: { title: '关于', icon: 'info' },
    jianghu: { title: '江湖', icon: 'compass' },
    xuefu: { title: '学府', icon: 'graduation-cap' }
};

function getTabById(tabId) {
    for (var i = 0; i < openTabs.length; i++) {
        if (openTabs[i].id === tabId) return openTabs[i];
    }
    return null;
}

function getTabIconName(tab) {
    if (!tab) return 'house';
    if (tab.icon) return tab.icon;
    if (tab.type === 'book') return 'book-open';
    if (TOOL_TYPE_ICONS[tab.type]) return TOOL_TYPE_ICONS[tab.type];
    if (tab.type === 'home') return 'house';
    if (tab.pageId && PAGE_META[tab.pageId]) return PAGE_META[tab.pageId].icon;
    return 'file-text';
}

function cleanTabTitle(title) {
    var text = String(title == null ? '' : title);
    // 标签页已经用图标表达类型，不再需要标题开头的 Emoji
    text = text.replace(/^[\s\u2190-\u21FF\u2300-\u27BF\u2B00-\u2BFF\uFE0F\u200D\u{1F000}-\u{1FAFF}]+/u, '');
    return text.trim() || '未命名';
}

function iconHtml(name) {
    return (typeof WPS !== 'undefined' && WPS.icon) ? WPS.icon(name) : '';
}

function renderTabs() {
    var container = document.getElementById('tabsContainer');
    if (!container) return;
    var scrollLeft = container.scrollLeft;

    container.innerHTML = '';
    container.setAttribute('role', 'tablist');

    for (var i = 0; i < openTabs.length; i++) {
        var tab = openTabs[i];
        var tabEl = document.createElement('div');
        tabEl.className = 'tab' + (tab.id === activeTabId ? ' active' : '');
        tabEl.setAttribute('data-tab', tab.id);
        tabEl.setAttribute('role', 'tab');
        tabEl.setAttribute('aria-selected', tab.id === activeTabId ? 'true' : 'false');
        tabEl.setAttribute('title', tab.title || '');
        tabEl.setAttribute('draggable', 'true');

        if (tab.id === activeTabId) {
            // 浏览器标签底部向外翻的圆弧（左右各一个）
            var flareLeft = document.createElement('span');
            flareLeft.className = 'tab-flare tab-flare-left';
            flareLeft.setAttribute('aria-hidden', 'true');
            tabEl.appendChild(flareLeft);
            var flareRight = document.createElement('span');
            flareRight.className = 'tab-flare tab-flare-right';
            flareRight.setAttribute('aria-hidden', 'true');
            tabEl.appendChild(flareRight);
        }

        var icon = document.createElement('span');
        icon.className = 'tab-icon';
        icon.innerHTML = iconHtml(getTabIconName(tab));
        tabEl.appendChild(icon);

        var title = document.createElement('span');
        title.className = 'tab-title';
        title.textContent = cleanTabTitle(tab.title);
        tabEl.appendChild(title);

        if (tab.type !== 'home') {
            var closeSpan = document.createElement('span');
            closeSpan.className = 'tab-close';
            closeSpan.setAttribute('data-id', tab.id);
            closeSpan.setAttribute('role', 'button');
            closeSpan.setAttribute('aria-label', '关闭标签页');
            closeSpan.innerHTML = iconHtml('x');
            closeSpan.onclick = function (e) {
                e.stopPropagation();
                closeTab(this.getAttribute('data-id'));
            };
            tabEl.appendChild(closeSpan);
        }

        tabEl.onclick = function (e) {
            if (e.target.closest && e.target.closest('.tab-close')) return;
            switchToTab(this.getAttribute('data-tab'));
        };
        tabEl.onauxclick = function (e) {
            if (e.button !== 1) return;
            e.preventDefault();
            closeTab(this.getAttribute('data-tab'));
        };
        tabEl.oncontextmenu = function (e) {
            e.preventDefault();
            e.stopPropagation();
            showTabMenu(this.getAttribute('data-tab'), e.clientX, e.clientY);
        };
        bindTabDrag(tabEl);
        container.appendChild(tabEl);
    }

    var newBtn = document.createElement('button');
    newBtn.className = 'new-tab-btn';
    newBtn.id = 'newTabBtn';
    newBtn.type = 'button';
    newBtn.title = '新建标签页';
    newBtn.innerHTML = iconHtml('plus');
    newBtn.onclick = function () { switchToTab('home'); };
    container.appendChild(newBtn);

    var filler = document.createElement('div');
    filler.className = 'tab-strip-filler';
    container.appendChild(filler);

    container.scrollLeft = scrollLeft;
    var activeEl = container.querySelector('.tab.active');
    if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    }
}

// ========== 拖动排序 ==========

var tabDragId = null;

function bindTabDrag(tabEl) {
    tabEl.ondragstart = function (e) {
        tabDragId = this.getAttribute('data-tab');
        e.dataTransfer.effectAllowed = 'move';
        try { e.dataTransfer.setData('text/plain', tabDragId); } catch (err) {}
        this.classList.add('dragging');
    };
    tabEl.ondragend = function () {
        tabDragId = null;
        var tabs = document.querySelectorAll('.tab');
        for (var i = 0; i < tabs.length; i++) {
            tabs[i].classList.remove('dragging', 'drag-over-left', 'drag-over-right');
        }
    };
    tabEl.ondragover = function (e) {
        if (!tabDragId || tabDragId === this.getAttribute('data-tab')) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        var rect = this.getBoundingClientRect();
        var after = (e.clientX - rect.left) > rect.width / 2;
        this.classList.toggle('drag-over-left', !after);
        this.classList.toggle('drag-over-right', after);
    };
    tabEl.ondragleave = function () {
        this.classList.remove('drag-over-left', 'drag-over-right');
    };
    tabEl.ondrop = function (e) {
        e.preventDefault();
        var targetId = this.getAttribute('data-tab');
        var sourceId = tabDragId || e.dataTransfer.getData('text/plain');
        var rect = this.getBoundingClientRect();
        var after = (e.clientX - rect.left) > rect.width / 2;
        this.classList.remove('drag-over-left', 'drag-over-right');
        moveTab(sourceId, targetId, after);
    };
}

function moveTab(sourceId, targetId, after) {
    if (!sourceId || !targetId || sourceId === targetId) return;
    var sourceIndex = -1;
    var targetIndex = -1;
    for (var i = 0; i < openTabs.length; i++) {
        if (openTabs[i].id === sourceId) sourceIndex = i;
        if (openTabs[i].id === targetId) targetIndex = i;
    }
    if (sourceIndex < 0 || targetIndex < 0) return;
    var moved = openTabs.splice(sourceIndex, 1)[0];
    targetIndex = -1;
    for (var j = 0; j < openTabs.length; j++) {
        if (openTabs[j].id === targetId) { targetIndex = j; break; }
    }
    if (targetIndex < 0) targetIndex = openTabs.length;
    openTabs.splice(after ? targetIndex + 1 : targetIndex, 0, moved);
    renderTabs();
}

// ========== 标签页右键菜单 ==========

function closeTabMenu() {
    var menu = document.getElementById('wpsTabMenu');
    if (menu) menu.remove();
}

function showTabMenu(tabId, x, y) {
    closeTabMenu();
    var tab = getTabById(tabId);
    if (!tab) return;
    var menu = document.createElement('div');
    menu.id = 'wpsTabMenu';
    menu.className = 'wps-tab-menu';
    menu.style.left = Math.min(x, window.innerWidth - 170) + 'px';
    menu.style.top = Math.min(y, window.innerHeight - 120) + 'px';

    var items = [];
    if (tab.type !== 'home') items.push({ label: '关闭标签页', icon: 'x', action: function () { closeTab(tabId); } });
    items.push({ label: '关闭其他标签页', icon: 'panel-right', action: function () { closeOtherTabs(tabId); } });
    items.push({ label: '关闭右侧标签页', icon: 'chevron-right', action: function () { closeTabsToRight(tabId); } });

    items.forEach(function (item) {
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.innerHTML = iconHtml(item.icon) + '<span>' + item.label + '</span>';
        btn.onclick = function () {
            closeTabMenu();
            item.action();
        };
        menu.appendChild(btn);
    });
    document.body.appendChild(menu);
    setTimeout(function () {
        document.addEventListener('click', closeTabMenu, { once: true });
    }, 0);
}

function closeOtherTabs(keepId) {
    var keep = getTabById(keepId);
    if (!keep) return;
    var doomed = openTabs.filter(function (t) { return t.id !== keepId && t.type !== 'home'; });
    doomed.forEach(removeTabDom);
    openTabs = openTabs.filter(function (t) { return t.id === keepId || t.type === 'home'; });
    if (activeTabId !== keepId && !getTabById(activeTabId)) activeTabId = keepId;
    switchToTab(activeTabId);
}

function closeTabsToRight(tabId) {
    var index = -1;
    for (var i = 0; i < openTabs.length; i++) {
        if (openTabs[i].id === tabId) { index = i; break; }
    }
    if (index < 0) return;
    var doomed = openTabs.slice(index + 1);
    doomed.forEach(removeTabDom);
    openTabs = openTabs.slice(0, index + 1);
    if (!getTabById(activeTabId)) activeTabId = tabId;
    switchToTab(activeTabId);
}

function removeTabDom(tab) {
    var page = document.querySelector('.page[data-page="' + tab.id + '"]');
    if (page) page.remove();
}

// ========== 切换 / 关闭 ==========

function switchToTab(tabId) {
    var tab = getTabById(tabId);
    if (!tab) {
        tab = getTabById('home');
        tabId = 'home';
    }
    if (!tab) return;

    // 离开书籍编辑器前先把当前章节落盘，避免刚输入就切标签导致丢字
    if (tab.id !== activeTabId) {
        var activePage = document.querySelector('.page.active');
        if (activePage && String(activePage.getAttribute('data-page') || '').indexOf('book_') === 0 &&
            typeof saveCurrentChapter === 'function') {
            try { saveCurrentChapter(); } catch (e) { console.warn('切换标签前保存失败:', e); }
        }
    }

    // 书籍编辑器只保留一个页面 DOM；切换到另一本书时先保存再重建，避免重复 id 串数据
    if (tab.type === 'book' && typeof ensureBookPage === 'function') {
        try {
            ensureBookPage(tab);
        } catch (e) {
            console.error('打开书籍页面失败:', e);
        }
    } else if (tab.bookId) {
        // 工具标签页记录了自己所属的书籍，切回来时恢复上下文
        currentBookId = tab.bookId;
    }

    activeTabId = tabId;
    var pages = document.querySelectorAll('.page');
    for (var i = 0; i < pages.length; i++) {
        var page = pages[i];
        var isActive = page.getAttribute('data-page') === tabId;
        page.classList.toggle('active', isActive);
        // 兼容旧代码留下的内联 display:none，避免页面被永久隐藏
        if (page.style.display) page.style.display = '';
    }

    renderTabs();
    updateSidebarVisibility();
    updateMenuState();
    if (typeof updateToolbarForPage === 'function') updateToolbarForPage();

    // 切换标签时关闭浮层，但不隐藏编辑器右侧工具栏
    if (typeof closeFloatingPanel === 'function' && document.getElementById('floatingToolPanel')) {
        closeFloatingPanel();
    }
    var slidePanels = document.querySelectorAll('.right-slide-panel.open');
    for (var s = 0; s < slidePanels.length; s++) slidePanels[s].classList.remove('open');
}

function closeTab(tabId) {
    if (!tabId || tabId === 'home') return;
    var index = -1;
    for (var i = 0; i < openTabs.length; i++) {
        if (openTabs[i].id === tabId) { index = i; break; }
    }
    if (index < 0) return;

    var tab = openTabs[index];
    var wasActive = activeTabId === tabId;
    var page = document.querySelector('.page[data-page="' + tabId + '"]');
    if (page && wasActive) {
        if (tab.type === 'book' && typeof saveCurrentChapter === 'function') {
            try { saveCurrentChapter(); } catch (e) { console.warn('关闭标签前保存失败:', e); }
        }
        page.remove();
    }

    openTabs.splice(index, 1);
    if (wasActive) {
        var next = openTabs[index] || openTabs[index - 1] || openTabs[0];
        switchToTab(next ? next.id : 'home');
    } else {
        renderTabs();
    }
}

// ========== 页面 / 侧边栏状态 ==========

function updateSidebarVisibility() {
    var sidebar = document.querySelector('.sidebar-menu');
    if (!sidebar) return;
    var tab = getTabById(activeTabId);
    var isWorkspace = !!(tab && WORKSPACE_TYPES.indexOf(tab.type) !== -1);
    sidebar.style.display = isWorkspace ? 'none' : 'flex';
}

function updateMenuState() {
    var tab = getTabById(activeTabId);
    var page = '';
    if (activeTabId === 'home' || (tab && (tab.type === 'book' || tab.bookId || tab.type === 'trash'))) page = 'books';
    else if (tab && tab.pageId) page = tab.pageId;
    else if (activeTabId.indexOf('page_') === 0) page = activeTabId.slice(5);

    var items = document.querySelectorAll('.menu-item');
    for (var i = 0; i < items.length; i++) {
        var isActive = items[i].getAttribute('data-page') === page;
        items[i].classList.toggle('active', isActive);
    }
}

// ========== 打开页面标签 ==========

function switchPage(pageId) {
    var meta = PAGE_META[pageId] || { title: pageId, icon: 'file-text' };
    var tabId = 'page_' + pageId;
    var existing = getTabById(tabId);

    if (existing) {
        switchToTab(tabId);
        refreshPageTab(pageId);
        return;
    }

    openTabs.push({
        id: tabId,
        title: meta.title,
        icon: meta.icon,
        type: 'page',
        pageId: pageId
    });
    renderTabs();

    var pagesContainer = document.getElementById('pagesContainer');
    var pageDiv = document.createElement('div');
    pageDiv.className = 'page';
    pageDiv.setAttribute('data-page', tabId);

    if (pageId === 'stats') {
        pageDiv.style.padding = '0';
        pageDiv.style.background = 'var(--panel-bg, rgba(255,255,255,0.95))';
        pageDiv.innerHTML = '<div id="statsContainer" style="height:100%; overflow:auto;"></div>';
        pagesContainer.appendChild(pageDiv);
        switchToTab(tabId);
        setTimeout(function () {
            if (typeof renderStatsPage === 'function') renderStatsPage();
        }, 50);
        return;
    }

    if (pageId === 'settings') {
        pageDiv.style.padding = '0';
        pageDiv.innerHTML = '<div id="settingsContainer" style="height:100%; overflow:auto;"></div>';
        pagesContainer.appendChild(pageDiv);
        switchToTab(tabId);
        setTimeout(function () {
            settingsInitialized = false;
            if (typeof renderSettingsPage === 'function') renderSettingsPage();
        }, 30);
        return;
    }

    if (pageId === 'about') {
        pageDiv.innerHTML = renderAboutPage();
        pagesContainer.appendChild(pageDiv);
        switchToTab(tabId);
        return;
    }

    if (pageId === 'jianghu') {
        pageDiv.innerHTML = '<div id="jianghuContainer" style="height:100%; overflow:auto;"></div>';
        pagesContainer.appendChild(pageDiv);
        switchToTab(tabId);
        setTimeout(function () {
            if (typeof loadJianghuPageContent === 'function') loadJianghuPageContent();
        }, 50);
        return;
    }

    if (pageId === 'xuefu') {
        pageDiv.innerHTML = '<div id="xuefuContainer" style="height:100%; overflow:auto;"></div>';
        pagesContainer.appendChild(pageDiv);
        switchToTab(tabId);
        setTimeout(function () {
            if (typeof loadXuefuPage === 'function') loadXuefuPage();
        }, 50);
        return;
    }

    pageDiv.innerHTML = '<div style="padding:40px; text-align:center; color:#888;">页面不存在</div>';
    pagesContainer.appendChild(pageDiv);
    switchToTab(tabId);
}

function refreshPageTab(pageId) {
    if (pageId === 'stats') {
        setTimeout(function () {
            if (typeof renderStatsPage === 'function') renderStatsPage();
        }, 30);
    } else if (pageId === 'settings') {
        setTimeout(function () {
            settingsInitialized = false;
            if (typeof renderSettingsPage === 'function') renderSettingsPage();
        }, 30);
    }
}

function renderAboutPage() {
    var version = (window.electron && window.electron.appVersion) || '1.13.1';
    return '<div class="about-content" style="padding:40px; max-width:620px; margin:0 auto;">' +
        '<h2 style="font-size:24px; margin-bottom:8px;">写作面板系统 WritingPanelSystem</h2>' +
        '<p style="color:#888; margin-bottom:4px;">免费，开源，自由的写作软件</p>' +
        '<p style="color:#888; margin-bottom:4px;">软件官网 WritingPanelSystem.com</p>' +
        '<p style="color:#888; margin-bottom:4px;">版本 v ' + version + ' 正式版</p>' +
        '<p style="color:#888; margin-bottom:20px;">GitHub: <a href="https://github.com/likeweixue/Writingpanelsystem" target="_blank" rel="noopener" style="color:#007aff; text-decoration:none;">https://github.com/likeweixue/Writingpanelsystem</a></p>' +
        '<div style="margin-top:30px; padding-top:20px; border-top:1px solid rgba(0,0,0,0.1);">' +
        '<h3 style="font-size:16px; margin-bottom:8px;">感谢以下作者</h3>' +
        '<p style="font-size:14px; line-height:1.8; color:#555;">风吹屁屁凉，泽墨川，【女频写手】长兮常相忆，读者读者读者读者读者读者读者作者男生，岚音</p>' +
        '</div>' +
        '<div style="margin-top:20px; padding-top:20px; border-top:1px solid rgba(0,0,0,0.1);">' +
        '<h3 style="font-size:16px; margin-bottom:8px;">写作面板系统寄语</h3>' +
        '<p style="font-size:14px; line-height:1.8; text-align:left; color:#555;">这里借用马克·扎克伯格（Facebook 创始人）的话，想法一开始并不是完美的，没有人一开始就会，都是在做的过程中不断遇到与解决问题，我们要做的是迈出第一步，所以，开始书写故事吧！</p>' +
        '</div></div>';
}
