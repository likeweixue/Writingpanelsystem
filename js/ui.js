// ========== UI 渲染和页面切换 ==========

function renderTabs() {
    var container = document.getElementById('tabsContainer');
    if (!container) return;
    container.innerHTML = '';
    for (var i = 0; i < openTabs.length; i++) {
        var tab = openTabs[i];
        var tabEl = document.createElement('div');
        tabEl.className = 'tab';
        if (tab.id === activeTabId) tabEl.classList.add('active');
        tabEl.setAttribute('data-tab', tab.id);
        tabEl.innerHTML = '<span class="tab-title">' + escapeHtml(tab.title) + '</span>';
        if (tab.type !== 'home') {
            var closeSpan = document.createElement('span');
            closeSpan.className = 'tab-close';
            closeSpan.setAttribute('data-id', tab.id);
            closeSpan.innerHTML = '×';
            tabEl.appendChild(closeSpan);
        }
        container.appendChild(tabEl);
    }
    var newBtn = document.createElement('button');
    newBtn.className = 'new-tab-btn';
    newBtn.id = 'newTabBtn';
    newBtn.innerHTML = '+';
    container.appendChild(newBtn);
    
    var tabs = document.querySelectorAll('.tab');
    for (var i = 0; i < tabs.length; i++) {
        tabs[i].onclick = function(e) {
            if (e.target.classList && e.target.classList.contains('tab-close')) return;
            switchToTab(this.getAttribute('data-tab'));
        };
        var closeBtn = tabs[i].querySelector('.tab-close');
        if (closeBtn) {
            closeBtn.onclick = function(e) {
                e.stopPropagation();
                closeTab(this.getAttribute('data-id'));
            };
        }
    }
    document.getElementById('newTabBtn').onclick = function() { switchToTab('home'); };
}

function switchToTab(tabId) {
    activeTabId = tabId;
    renderTabs();
    var pages = document.querySelectorAll('.page');
    for (var i = 0; i < pages.length; i++) {
        pages[i].classList.remove('active');
    }
    var targetPage = document.querySelector('.page[data-page="' + tabId + '"]');
    if (targetPage) {
        targetPage.classList.add('active');
    } else if (tabId.indexOf('book_') === 0) {
        var bookPage = document.querySelector('.page[data-page="' + tabId + '"]');
        if (bookPage) bookPage.classList.add('active');
    }
    var sidebar = document.querySelector('.sidebar-menu');
    if (sidebar) {
        sidebar.style.display = (tabId === 'home') ? 'flex' : 'none';
    }
    closeAllRightPanels();
}

function closeTab(tabId) {
    for (var i = 0; i < openTabs.length; i++) {
        if (openTabs[i].id === tabId) { openTabs.splice(i, 1); break; }
    }
    var page = document.querySelector('.page[data-page="' + tabId + '"]');
    if (page) page.remove();
    if (activeTabId === tabId) {
        activeTabId = openTabs.length > 0 ? openTabs[openTabs.length - 1].id : 'home';
    }
    renderTabs();
    var activePage = document.querySelector('.page[data-page="' + activeTabId + '"]');
    if (activePage) activePage.classList.add('active');
    var sidebar = document.querySelector('.sidebar-menu');
    if (sidebar) {
        sidebar.style.display = (activeTabId === 'home') ? 'flex' : 'none';
    }
    closeAllRightPanels();
}

function switchPage(pageId) {
    var titles = { stats: '数据', settings: '设置', about: '关于', jianghu: '江湖', xuefu: '学府' };
    var title = titles[pageId] || pageId;
    var tabId = 'page_' + pageId;
    
    // 检查是否已经打开
    for (var i = 0; i < openTabs.length; i++) {
        if (openTabs[i].id === tabId) { 
            switchToTab(tabId); 
            return; 
        }
    }
    
    openTabs.push({ id: tabId, title: title, type: 'page', pageId: pageId });
    renderTabs();
    
    // 直接使用 index.html 中已存在的页面，而不是重新创建
    var existingPage = document.querySelector('.page[data-page="' + pageId + '"]');
    if (existingPage) {
        // 复制现有的页面并赋予新的 data-page 属性
        var clonedPage = existingPage.cloneNode(true);
        clonedPage.setAttribute('data-page', tabId);
        document.getElementById('pagesContainer').appendChild(clonedPage);
        switchToTab(tabId);
        
        // 如果是设置页面，重新渲染设置内容
        if (pageId === 'settings') {
            setTimeout(function() {
                if (typeof renderSettingsPage === 'function') {
                    renderSettingsPage();
                }
            }, 100);
        }
        // 如果是江湖页面，重新加载
        else if (pageId === 'jianghu' && typeof loadJianghuPageContent === 'function') {
            setTimeout(loadJianghuPageContent, 100);
        }
        // 如果是学府页面，重新加载
        else if (pageId === 'xuefu' && typeof loadXuefuPage === 'function') {
            setTimeout(loadXuefuPage, 100);
        }
        return;
    }
    
    // 如果没有现有页面，则创建
    var pagesContainer = document.getElementById('pagesContainer');
    var pageDiv = document.createElement('div');
    pageDiv.className = 'page';
    pageDiv.setAttribute('data-page', tabId);
    
    if (pageId === 'stats') {
    pageDiv.innerHTML = '<iframe src="html/html/stats.html" style="width:100%; height:100%; border:none; background:#e9e3d7;"></iframe>';
    } 
    else if (pageId === 'settings') {
    pageDiv.innerHTML = '<div class="settings-container" id="settingsContainer" style="height:100%; overflow:auto;"></div>';
    setTimeout(function() {
        if (typeof renderSettingsPage === 'function') {
            renderSettingsPage();
        }
    }, 100);
}
    else if (pageId === 'about') {
        pageDiv.innerHTML = '<div class="about-content"></div>';
        setTimeout(function() {
            var aboutContent = pageDiv.querySelector('.about-content');
            if (aboutContent) {
                aboutContent.innerHTML = '<h2>📝 写作帮手 OpenWrite</h2><p>免费，开源，自由的写作软件</p><p>软件官网 openwrite.team</p><p>版本 0.3.7 发布前瞻版</p><p>GitHub: <a href="https://github.com/likeweixue/openwrite" target="_blank">https://github.com/likeweixue/openwrite</a></p>';
            }
        }, 100);
    } 
    else if (pageId === 'jianghu') {
        pageDiv.innerHTML = '<div id="jianghuContainer" style="height:100%; overflow:auto;"></div>';
        setTimeout(function() {
            if (typeof loadJianghuPageContent === 'function') {
                loadJianghuPageContent();
            }
        }, 100);
    } 
    else if (pageId === 'xuefu') {
        pageDiv.innerHTML = '<div id="xuefuContainer" style="height:100%; overflow:auto;"></div>';
        setTimeout(function() {
            if (typeof loadXuefuPage === 'function') {
                loadXuefuPage();
            }
        }, 100);
    } 
    else {
        pageDiv.innerHTML = '<div style="padding:20px;">页面加载中...</div>';
    }
    
    pagesContainer.appendChild(pageDiv);
    switchToTab(tabId);
}

function closeAllRightPanels() {
    var panels = document.querySelectorAll('.right-slide-panel.open, .right-panel.open');
    for (var i = 0; i < panels.length; i++) {
        panels[i].classList.remove('open');
    }
    var rightSidebar = document.getElementById('rightSidebar');
    if (rightSidebar) {
        rightSidebar.classList.add('hidden');
    }
    var themePanel = document.getElementById('themeSlidePanel');
    if (themePanel) themePanel.classList.remove('open');
    var fontPanel = document.getElementById('fontSlidePanel');
    if (fontPanel) fontPanel.classList.remove('open');
    var findPanel = document.getElementById('findSlidePanel');
    if (findPanel) findPanel.classList.remove('open');
    var exportPanel = document.getElementById('exportSlidePanel');
    if (exportPanel) exportPanel.classList.remove('open');
    var seclusionPanel = document.getElementById('seclusionSlidePanel');
    if (seclusionPanel) seclusionPanel.classList.remove('open');
}

function loadSettingsPage() {
    if (typeof renderSettingsPage === 'function') renderSettingsPage();
}
