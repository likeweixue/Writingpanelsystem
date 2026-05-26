function switchPage(pageId) {
    var titles = { stats: '数据', settings: '设置', about: '关于', jianghu: '江湖', xuefu: '学府' };
    var title = titles[pageId] || pageId;
    var tabId = 'page_' + pageId;
    
    for (var i = 0; i < openTabs.length; i++) {
        if (openTabs[i].id === tabId) { 
            switchToTab(tabId); 
            return; 
        }
    }
    
    openTabs.push({ id: tabId, title: title, type: 'page', pageId: pageId });
    renderTabs();
    
    var pagesContainer = document.getElementById('pagesContainer');
    var pageDiv = document.createElement('div');
    pageDiv.className = 'page';
    pageDiv.setAttribute('data-page', tabId);
    
    if (pageId === 'stats') {
        pageDiv.innerHTML = '<iframe src="stats.html" style="width:100%; height:100%; border:none; background:#e9e3d7;"></iframe>';
    } 
    else if (pageId === 'settings') {
        pageDiv.innerHTML = '<div class="settings-container" id="settingsContainer"></div>';
        setTimeout(function() {
            if (typeof renderSettingsPage === 'function') renderSettingsPage();
        }, 100);
    } 
    else if (pageId === 'about') {
        pageDiv.innerHTML = '<div class="about-content"></div>';
        setTimeout(function() {
            var aboutContent = document.querySelector('.page[data-page="' + tabId + '"] .about-content');
            if (aboutContent) {
                aboutContent.innerHTML = '<h2>📝 写作帮手 OpenWrite</h2><p>免费，开源，自由的写作软件</p><p>软件官网 openwrite.team</p><p>版本 0.3.6 发布前瞻版</p><p>GitHub: <a href="https://github.com/likeweixue/openwrite" target="_blank">https://github.com/likeweixue/openwrite</a></p>';
            }
        }, 100);
    } 
    else if (pageId === 'jianghu') {
        pageDiv.innerHTML = '<div id="jianghuContainer"></div>';
        setTimeout(function() {
            if (typeof loadJianghuPageContent === 'function') loadJianghuPageContent();
        }, 100);
    } 
    else if (pageId === 'xuefu') {
        pageDiv.innerHTML = '<div id="xuefuContainer"></div>';
        setTimeout(function() {
            if (typeof loadXuefuPage === 'function') loadXuefuPage();
        }, 100);
    } 
    else {
        pageDiv.innerHTML = '<div style="padding:20px;">页面加载中...</div>';
    }
    
    pagesContainer.appendChild(pageDiv);
    switchToTab(tabId);
}
