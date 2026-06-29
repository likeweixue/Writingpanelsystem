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
    
    // ===== 关键修复：切换到首页时，隐藏其他页面 =====
    if (tabId === 'home') {
        // 隐藏所有 page 元素，只显示 home
        var allPages = document.querySelectorAll('.page');
        for (var i = 0; i < allPages.length; i++) {
            var page = allPages[i];
            if (page.getAttribute('data-page') !== 'home') {
                page.style.display = 'none';
            } else {
                page.style.display = 'block';
            }
        }
        // 确保 home 页面激活
        var homePage = document.querySelector('.page[data-page="home"]');
        if (homePage) {
            homePage.classList.add('active');
            homePage.style.display = 'block';
        }
    } else {
        // 切换到其他页面时，显示所有页面（让 active 控制显示）
        var allPages = document.querySelectorAll('.page');
        for (var i = 0; i < allPages.length; i++) {
            allPages[i].style.display = '';
        }
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
    var titles = { stats: '📊 数据', settings: '⚙️ 设置', about: '关于', jianghu: '江湖', xuefu: '学府' };
    var title = titles[pageId] || pageId;
    var tabId = 'page_' + pageId;
    
    // 检查是否已经打开
    for (var i = 0; i < openTabs.length; i++) {
        if (openTabs[i].id === tabId) { 
            switchToTab(tabId); 
            // 如果已经打开，刷新内容
            if (pageId === 'stats') {
                setTimeout(function() {
                    if (typeof renderStatsPage === 'function') {
                        renderStatsPage();
                    }
                }, 100);
            } else if (pageId === 'settings') {
                setTimeout(function() {
                    settingsInitialized = false;
                    if (typeof renderSettingsPage === 'function') {
                        renderSettingsPage();
                    }
                }, 100);
            }
            return; 
        }
    }
    
    openTabs.push({ id: tabId, title: title, type: 'page', pageId: pageId });
    renderTabs();
    
    var pagesContainer = document.getElementById('pagesContainer');
    
    // ===== 检查是否已存在对应的页面元素 =====
    var existingPage = pagesContainer.querySelector('.page[data-page="' + tabId + '"]');
    if (existingPage) {
        switchToTab(tabId);
        return;
    }
    
    var pageDiv = document.createElement('div');
    pageDiv.className = 'page';
    pageDiv.setAttribute('data-page', tabId);
    pageDiv.style.display = 'none'; // 默认隐藏，由 switchToTab 控制
    
    // ===== 数据页面 - 使用 statsContainer =====
if (pageId === 'stats') {
    // 检查是否已经存在 statsContainer
    var existingContainer = document.getElementById('statsContainer');
    if (existingContainer) {
        // 如果已存在，直接使用
        pageDiv = existingContainer.closest('.page');
        if (pageDiv) {
            pageDiv.setAttribute('data-page', tabId);
            // 确保容器有内容
            if (existingContainer.innerHTML.trim() === '') {
                if (typeof renderStatsPage === 'function') {
                    renderStatsPage();
                }
            }
        }
        switchToTab(tabId);
        setTimeout(function() {
            if (typeof renderStatsPage === 'function') {
                renderStatsPage();
            }
        }, 100);
        return;
    }
    
    // 如果不存在，创建新的
    pageDiv.innerHTML = '<div id="statsContainer" style="height:100%; overflow:auto; padding:0;"></div>';
    pagesContainer.appendChild(pageDiv);
    switchToTab(tabId);
    setTimeout(function() {
        if (typeof renderStatsPage === 'function') {
            renderStatsPage();
        }
    }, 100);
    return;
}
    // ===== 设置页面 - 使用 settingsContainer =====
    else if (pageId === 'settings') {
        pageDiv.innerHTML = '<div id="settingsContainer" style="height:100%; min-height:400px; overflow:auto; background:var(--panel-bg, rgba(255,255,255,0.95));"></div>';
        pagesContainer.appendChild(pageDiv);
        switchToTab(tabId);
        setTimeout(function() {
            var container = document.getElementById('settingsContainer');
            if (container) {
                var parentPage = container.closest('.page');
                if (parentPage) {
                    parentPage.style.height = '100%';
                    parentPage.style.display = 'block';
                    parentPage.style.position = 'absolute';
                    parentPage.style.top = '0';
                    parentPage.style.left = '0';
                    parentPage.style.right = '0';
                    parentPage.style.bottom = '0';
                    parentPage.style.overflow = 'hidden';
                    parentPage.style.padding = '0';
                }
                container.style.height = '100%';
                container.style.minHeight = '400px';
                container.style.display = 'block';
                
                settingsInitialized = false;
                if (typeof renderSettingsPage === 'function') {
                    renderSettingsPage();
                }
            }
        }, 200);
        return;
    }
    else if (pageId === 'about') {
    pageDiv.innerHTML = `
        <div class="about-content" style="padding:40px; max-width:600px; margin:0 auto;">
            <h2 style="font-size:24px; margin-bottom:8px;">写作面板系统 WritingPanelSystem</h2>
            <p style="color:#888; margin-bottom:4px;">免费，开源，自由的写作软件</p>
            <p style="color:#888; margin-bottom:4px;">软件官网 WritingPanelSystem.com</p>
            <p style="color:#888; margin-bottom:4px;">版本 v 1.12.0 正式版</p>
            <p style="color:#888; margin-bottom:20px;">GitHub: <a href="https://github.com/likeweixue/Writingpanelsystem" target="_blank" style="color:#007aff; text-decoration:none;">https://github.com/likeweixue/Writingpanelsystem</a></p>
            
            <div style="margin-top:30px; padding-top:20px; border-top:1px solid rgba(0,0,0,0.1);">
                <h3 style="font-size:16px; margin-bottom:8px;">感谢以下作者</h3>
                <p style="font-size:14px; line-height:1.8; color:#555;">风吹屁屁凉，泽墨川，【女频写手】长兮常相忆，读者读者读者读者读者读者读者读者作者男生，岚音</p>
            </div>
            
            <div style="margin-top:20px; padding-top:20px; border-top:1px solid rgba(0,0,0,0.1);">
                <h3 style="font-size:16px; margin-bottom:8px;">写作面板系统寄语</h3>
                <p style="font-size:14px; line-height:1.8; text-align:left; color:#555;">这里借用马克·扎克伯格（Facebook 创始人）的话，想法一开始并不是完美的，没有人一开始就会，都是在做的过程中不断遇到与解决问题，我们要做的是迈出第一步，所以，开始书写故事吧！</p>
            </div>
        </div>
    `;
    pagesContainer.appendChild(pageDiv);
    switchToTab(tabId);
    return;
} 
    else if (pageId === 'jianghu') {
        pageDiv.innerHTML = '<div id="jianghuContainer" style="height:100%; overflow:auto;"></div>';
        pagesContainer.appendChild(pageDiv);
        switchToTab(tabId);
        setTimeout(function() {
            if (typeof loadJianghuPageContent === 'function') {
                loadJianghuPageContent();
            }
        }, 100);
        return;
    } 
    else if (pageId === 'xuefu') {
        pageDiv.innerHTML = '<div id="xuefuContainer" style="height:100%; overflow:auto;"></div>';
        pagesContainer.appendChild(pageDiv);
        switchToTab(tabId);
        setTimeout(function() {
            if (typeof loadXuefuPage === 'function') {
                loadXuefuPage();
            }
        }, 100);
        return;
    } 
    else {
        pageDiv.innerHTML = '<div style="padding:40px; text-align:center; color:#888;">页面加载中...</div>';
        pagesContainer.appendChild(pageDiv);
        switchToTab(tabId);
        return;
    }
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
