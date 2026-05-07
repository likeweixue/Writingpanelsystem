// 数字转中文
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

function getBookById(bookId) { 
  for (var i = 0; i < books.length; i++) {
    if (books[i].id == bookId) return books[i];
  }
  return null;
}
function getCurrentBook() { 
  for (var i = 0; i < books.length; i++) {
    if (books[i].id === currentBookId) return books[i];
  }
  return null;
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

function openExportPanel() {
  var panel = document.getElementById('exportPanel');
  if (panel) panel.classList.add('open');
}
function closeExportPanel() {
  var panel = document.getElementById('exportPanel');
  if (panel) panel.classList.remove('open');
}
function openFindPanel() {
  var panel = document.getElementById('findPanel');
  if (panel) panel.classList.add('open');
}
function openNewBookDrawer() {
  var drawer = document.getElementById('newBookDrawer');
  if (drawer) drawer.classList.add('open');
}
function closeNewBookDrawer() {
  var drawer = document.getElementById('newBookDrawer');
  if (drawer) drawer.classList.remove('open');
}
function createNewBook() {
  var nameInput = document.getElementById('newBookName');
  var name = nameInput ? nameInput.value.trim() : '';
  if (!name) { alert('请输入书籍名称'); return; }
  
  var coverFile = document.getElementById('bookCoverInput').files[0];
  var coverData = null;
  if (coverFile) {
    var reader = new FileReader();
    reader.onload = function(e) { createBookWithCover(name, e.target.result); };
    reader.readAsDataURL(coverFile);
  } else {
    createBookWithCover(name, null);
  }
}
function createBookWithCover(name, coverData) {
  var newChapter = new Chapter(Date.now(), '第一章', '<p></p>');
  var newVolume = new Volume(Date.now(), '第一卷', [newChapter]);
  var newBook = new Book(Date.now(), name, [newVolume]);
  if (coverData) newBook.cover = coverData;
  books.push(newBook);
  saveAllData();
  renderBooks();
  closeNewBookDrawer();
  openBookTab(newBook.id);
  document.getElementById('newBookName').value = '';
  document.getElementById('bookCoverInput').value = '';
  document.getElementById('coverPreview').style.display = 'none';
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
  pageDiv.className = 'book-page';
  pageDiv.setAttribute('data-page', tabId);
  pageDiv.innerHTML = '<div class="book-detail-page" data-book-id="' + bookId + '">' +
    '<div class="book-detail-header">' +
    '<div class="right-tools">' +
    '<button id="findReplaceBtn" class="tool-icon">F 查找替换</button>' +
    '<button id="fullscreenBtn" class="tool-icon">❐ 全屏</button>' +
    '<button id="formatBtn" class="tool-icon">↹ 排版</button>' +
    '<button id="focusBtn" class="tool-icon">⍁ 闭关</button>' +
    '<button id="importBtn" class="tool-icon">↙ 导入</button>' +
    '<button id="exportBtn" class="tool-icon">↗ 导出</button>' +
    '<button id="styleBtn" class="tool-icon">◑ 主题</button><button id="sidebarToggleBtn" class="tool-icon" style="margin-left: 4px;"> 侧栏</button>' +
    '</div>' +
    '</div>' +
    '<div class="detail-main">' +
    '<div class="detail-chapters" id="chaptersPanel">' +
    '<div class="resize-handle" id="resizeHandle"></div>' +
    '<div class="chapters-header">' +
    '<span id="currentBookTitle"> ' + escapeHtml(book.title) + '</span>' +
    '</div>' +
    '<div class="chapters-header">' +
    '<button id="addVolumeBtn">+ 分卷</button>' +
    '<button id="addChapterBtn">+ 章节</button>' +
    '</div>' +
    '<div id="volumeList" class="volume-list"></div>' +
    '</div>' +
    '<div class="detail-editor">' +
    '<input type="text" id="chapterTitle" placeholder="章节标题" class="title-input">' +
    '<div id="editor" contenteditable="true" class="editor-content"><p>开始写作...</p></div>' +
    '<div class="status-bar-bottom">' +
    '<span><span id="wordCount">0</span> 字</span>' +
    '<span id="saveStatus">已保存</span>' +
    '</div>' +
    '</div>' +
    '<div class="detail-sidebar" id="detailSidebar">' +
    '<div class="sidebar-header">' +
    '<h3>写作助手</h3>' +
    '<button id="toggleSidebarBtn" class="tool-icon">✕</button>' +
    '</div>' +
    '<div class="sidebar-content">' +
    '<div class="sidebar-section">' +
    '<div class="sidebar-item" data-tool="outline"><span class="sidebar-label">大纲</span></div>' +
    '<div class="sidebar-item" data-tool="timeline"><span class="sidebar-label">时间线</span></div>' +
    '<div class="sidebar-item" data-tool="characters"><span class="sidebar-label">角色</span></div>' +
    '<div class="sidebar-item" data-tool="setting"><span class="sidebar-label">设定</span></div>' +
    '<div class="sidebar-item" data-tool="proofread"><span class="sidebar-label">校对</span></div>' +
    '<div class="sidebar-item" data-tool="namegen"><span class="sidebar-label">取名</span></div>' +
    '<div class="sidebar-item" data-tool="map"><span class="sidebar-label">地图</span></div>' +
    '</div>' +
    '</div>' +
    '</div>' +
    '</div>' +
    '</div>';
  pagesContainer.appendChild(pageDiv);
  initBookPage(tabId, bookId);
  switchToTab(tabId);
  document.querySelector('.app-container').classList.add('editing-mode');
}

function initBookPage(tabId, bookId) {
  var pageDiv = document.querySelector('.book-page[data-page="' + tabId + '"]');
  if (!pageDiv) return;
  currentBookId = bookId;
  var book = getCurrentBook();
  if (book && book.volumes && book.volumes.length > 0) {
    currentVolumeId = book.volumes[0].id;
    if (book.volumes[0].chapters && book.volumes[0].chapters.length > 0) {
      currentChapterId = book.volumes[0].chapters[0].id;
    }
  }
  
  function renderVolumes() {
    var container = pageDiv.querySelector('#volumeList');
    var book = getCurrentBook();
    if (!container || !book) return;
    container.innerHTML = '';
    if (!book.volumes || book.volumes.length === 0) {
      container.innerHTML = '<div style="padding:20px;text-align:center;opacity:0.6;">暂无分卷，点击"分卷"创建</div>';
      return;
    }
    for (var v = 0; v < book.volumes.length; v++) {
      var vol = book.volumes[v];
      var chapterCount = (vol.chapters ? vol.chapters.length : 0);
      var volDiv = document.createElement('div');
      volDiv.className = 'volume-item';
      volDiv.innerHTML = '<div class="volume-title">' +
        '<div class="volume-title-left">' +
        '<span> ' + escapeHtml(vol.name || '未命名') + '</span>' +
        '<span class="volume-count">(' + chapterCount + '章)</span>' +
        '</div>' +
        '<button class="volume-more" data-id="' + vol.id + '">⋯</button>' +
        '</div>' +
        '<div class="chapter-list-inner" data-volume="' + vol.id + '"></div>';
      var chapterContainer = volDiv.querySelector('.chapter-list-inner');
      if (vol.chapters && vol.chapters.length > 0) {
        for (var c = 0; c < vol.chapters.length; c++) {
          var ch = vol.chapters[c];
          var chDiv = document.createElement('div');
          var isActive = (ch.id === currentChapterId && vol.id === currentVolumeId);
          chDiv.className = 'chapter-list-item';
          if (isActive) chDiv.className += ' active';
          chDiv.innerHTML = '<span> ' + escapeHtml(ch.title || '无标题') + '</span><button class="delete-chapter" data-id="' + ch.id + '">✖</button>';
          chDiv.querySelector('span').onclick = (function(volId, chId) { return function() { currentVolumeId = volId; currentChapterId = chId; renderVolumes(); renderCurrentChapter(); }; })(vol.id, ch.id);
          chDiv.querySelector('.delete-chapter').onclick = (function(volId, chId, chArray) { return function(e) { e.stopPropagation(); if (chArray.length === 1) { alert('每个分卷至少保留一个章节'); return; } var newChapters = []; for (var i = 0; i < chArray.length; i++) { if (chArray[i].id !== chId) newChapters.push(chArray[i]); } vol.chapters = newChapters; if (currentChapterId === chId && currentVolumeId === volId) { currentChapterId = vol.chapters[0] ? vol.chapters[0].id : null; } renderVolumes(); renderCurrentChapter(); saveAllData(); renderBooks(); }; })(vol.id, ch.id, vol.chapters);
          chapterContainer.appendChild(chDiv);
        }
      } else {
        chapterContainer.innerHTML = '<div style="padding:8px;opacity:0.6;font-size:12px;">暂无章节</div>';
      }
      volDiv.querySelector('.volume-title').onclick = function(volId) { return function(e) { if (e.target.classList && e.target.classList.contains('volume-more')) return; if (e.target.tagName === 'BUTTON') return; currentVolumeId = volId; renderVolumes(); }; }(vol.id);
      volDiv.querySelector('.volume-more').onclick = function(volId, bookObj) { return function(e) { e.stopPropagation(); showVolumeMenu(volId, bookObj, function() { renderVolumes(); saveAllData(); renderBooks(); }); }; }(vol.id, book);
      container.appendChild(volDiv);
    }
  }
  function showVolumeMenu(volId, bookObj, onClose) {
    var existingMenu = document.querySelector('.volume-menu');
    if (existingMenu) existingMenu.remove();
    var menu = document.createElement('div');
    menu.className = 'volume-menu';
    menu.innerHTML = '<button class="rename-volume">重命名</button><button class="delete-volume">删除分卷</button>';
    var rect = event.target.getBoundingClientRect();
    menu.style.top = rect.bottom + 'px';
    menu.style.left = rect.left + 'px';
    document.body.appendChild(menu);
    menu.children[0].onclick = function() { var vol = null; for (var i = 0; i < bookObj.volumes.length; i++) { if (bookObj.volumes[i].id === volId) { vol = bookObj.volumes[i]; break; } } if (vol) { var newName = prompt('请输入新名称', vol.name); if (newName) { vol.name = newName; saveAllData(); renderBooks(); if(onClose) onClose(); } } menu.remove(); };
    menu.children[1].onclick = function() { if (bookObj.volumes.length === 1) { alert('至少保留一个分卷'); menu.remove(); return; } var newVolumes = []; for (var i = 0; i < bookObj.volumes.length; i++) { if (bookObj.volumes[i].id !== volId) newVolumes.push(bookObj.volumes[i]); } bookObj.volumes = newVolumes; if (currentVolumeId === volId) { currentVolumeId = bookObj.volumes[0] ? bookObj.volumes[0].id : null; currentChapterId = (bookObj.volumes[0] && bookObj.volumes[0].chapters && bookObj.volumes[0].chapters[0]) ? bookObj.volumes[0].chapters[0].id : null; } saveAllData(); renderBooks(); if(onClose) onClose(); menu.remove(); };
    setTimeout(function() { document.addEventListener('click', function closeMenu(e) { if (!menu.contains(e.target)) { if(menu.parentNode) menu.remove(); document.removeEventListener('click', closeMenu); } }); }, 100);
  }
  function renderCurrentChapter() {
    var ch = getCurrentChapter();
    var titleInput = pageDiv.querySelector('#chapterTitle');
    var editor = pageDiv.querySelector('#editor');
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
    var wcSpan = pageDiv.querySelector('#wordCount');
    if (wcSpan) wcSpan.innerText = text.length;
  }
  function saveCurrentChapter() {
    var ch = getCurrentChapter();
    if (!ch) return;
    var titleInput = pageDiv.querySelector('#chapterTitle');
    var editor = pageDiv.querySelector('#editor');
    if (titleInput) ch.title = titleInput.value;
    if (editor) ch.content = editor.innerHTML;
    ch.updatedTime = new Date().toISOString();
    renderVolumes();
    updateWordCount();
    saveAllData();
    renderBooks();
    var statusSpan = pageDiv.querySelector('#saveStatus');
    if (statusSpan) { statusSpan.textContent = '已保存'; setTimeout(function() { if (statusSpan.textContent === '已保存') statusSpan.textContent = '已同步'; }, 2000); }
  }
  var addVolumeBtn = pageDiv.querySelector('#addVolumeBtn');
  if (addVolumeBtn) { addVolumeBtn.onclick = function() { var book = getCurrentBook(); var volumeCount = book.volumes ? book.volumes.length : 0; var newNumber = volumeCount + 1; var volumeName = '第' + numberToChinese(newNumber) + '卷'; var newChapter = new Chapter(Date.now(), '第一章', '<p></p>'); var newVol = new Volume(Date.now(), volumeName, [newChapter]); if (!book.volumes) book.volumes = []; book.volumes.push(newVol); currentVolumeId = newVol.id; currentChapterId = newChapter.id; saveAllData(); renderVolumes(); renderCurrentChapter(); renderBooks(); }; }
  var addChapterBtn = pageDiv.querySelector('#addChapterBtn');
  if (addChapterBtn) { addChapterBtn.onclick = function() { var vol = getCurrentVolume(); if (!vol) { alert('请先创建分卷'); return; } var chapterCount = vol.chapters ? vol.chapters.length : 0; var newNumber = chapterCount + 1; var chapterName = '第' + numberToChinese(newNumber) + '章'; var newCh = new Chapter(Date.now(), chapterName, '<p></p>'); if (!vol.chapters) vol.chapters = []; vol.chapters.push(newCh); currentChapterId = newCh.id; saveAllData(); renderVolumes(); renderCurrentChapter(); renderBooks(); }; }
  var titleInput = pageDiv.querySelector('#chapterTitle');
  var editor = pageDiv.querySelector('#editor');
  if (titleInput) titleInput.oninput = function() { saveCurrentChapter(); };
  if (editor) { editor.oninput = function() { updateWordCount(); clearTimeout(autoSaveTimer); autoSaveTimer = setTimeout(saveCurrentChapter, 1000); }; }
  var findBtn = pageDiv.querySelector('#findReplaceBtn');
  if (findBtn) findBtn.onclick = function() { openFindPanel(); };
  var formatBtn = pageDiv.querySelector('#formatBtn');
  if (formatBtn) { formatBtn.onclick = function() { var html = editor.innerHTML; html = html.replace(/<p><br><\/p>/g, '<p></p>'); html = html.replace(/([。！？；])([^"'])/g, '$1<br>$2'); editor.innerHTML = html; saveCurrentChapter(); }; }
  var fullscreenBtn = pageDiv.querySelector('#fullscreenBtn');
  if (fullscreenBtn) { fullscreenBtn.onclick = function() { if (!document.fullscreenElement) document.documentElement.requestFullscreen(); else document.exitFullscreen(); }; }
  var focusMode = false;
  var focusBtn = pageDiv.querySelector('#focusBtn');
  if (focusBtn) { focusBtn.onclick = function() { focusMode = !focusMode; if (focusMode) { editor.style.fontSize = '20px'; var chaptersPanel = pageDiv.querySelector('#chaptersPanel'); if (chaptersPanel) chaptersPanel.style.opacity = '0.3'; } else { editor.style.fontSize = ''; var chaptersPanel = pageDiv.querySelector('#chaptersPanel'); if (chaptersPanel) chaptersPanel.style.opacity = ''; } }; }
  var importBtn = pageDiv.querySelector('#importBtn');
  if (importBtn) { importBtn.onclick = function() { var input = document.createElement('input'); input.type = 'file'; input.accept = '.txt'; input.onchange = function(e) { var file = e.target.files[0]; if (!file) return; var reader = new FileReader(); reader.onload = function(event) { var ch = getCurrentChapter(); if (ch) { ch.content = '<p>' + escapeHtml(event.target.result).replace(/\n/g, '<br>') + '</p>'; saveCurrentChapter(); alert('导入成功！'); } }; reader.readAsText(file, 'UTF-8'); }; input.click(); }; }
  var exportBtn = pageDiv.querySelector('#exportBtn');
  if (exportBtn) { exportBtn.onclick = function(e) { e.stopPropagation(); openExportPanel(); }; }
  var styleBtn = pageDiv.querySelector('#styleBtn');
  if (styleBtn) { styleBtn.onclick = function() { var menu = document.getElementById('slideMenu'); if (menu) menu.classList.toggle('open'); }; }
  var handle = pageDiv.querySelector('#resizeHandle');
  var panel = pageDiv.querySelector('#chaptersPanel');
  if (handle && panel) {
    var isResizing = false;
    handle.addEventListener('mousedown', function(e) { isResizing = true; document.addEventListener('mousemove', onMouseMove); document.addEventListener('mouseup', function() { isResizing = false; document.removeEventListener('mousemove', onMouseMove); }); });
    function onMouseMove(e) { if (!isResizing) return; var newWidth = e.clientX; if (newWidth < 200) newWidth = 200; if (newWidth > 500) newWidth = 500; panel.style.width = newWidth + 'px'; }
  }
  renderVolumes();
  renderCurrentChapter();

  // 侧边栏开关按钮
  var sidebarToggleBtn = document.getElementById('sidebarToggleBtn');
  if (sidebarToggleBtn) {
    sidebarToggleBtn.onclick = function() {
      var sidebar = document.getElementById('detailSidebar');
      if (sidebar) {
        sidebar.classList.toggle('hidden');
        var toggleBtn = document.getElementById('toggleSidebarBtn');
        if (toggleBtn) {
          toggleBtn.textContent = sidebar.classList.contains('hidden') ? '☰' : '✕';
        }
      }
    };
  }

  // 初始化右侧功能栏
  setTimeout(function() {
    var toggleBtn = document.getElementById('toggleSidebarBtn');
    var sidebar = document.getElementById('detailSidebar');
    
    if (toggleBtn && sidebar) {
      toggleBtn.onclick = function() {
        sidebar.classList.toggle('hidden');
        toggleBtn.textContent = sidebar.classList.contains('hidden') ? '☰' : '✕';
      };
    }
    
    var sidebarItems = document.querySelectorAll('.sidebar-item');
    for (var i = 0; i < sidebarItems.length; i++) {
      sidebarItems[i].onclick = function(e) {
        var tool = this.getAttribute('data-tool');
        var label = this.querySelector('.sidebar-label')?.innerText || tool;
        alert('「' + label + '」功能正在开发中，敬请期待！');
      };
    }
  }, 100);

}
function newBook() { openNewBookDrawer(); }
function switchPage(pageId) {
  var pageTitles = { 'stats': '数据', 'settings': '设置', 'about': '关于','bbs': '江湖'  };
  var title = pageTitles[pageId] || pageId;
  var tabId = 'page_' + pageId;
  for (var i = 0; i < openTabs.length; i++) { if (openTabs[i].id === tabId) { switchToTab(tabId); return; } }
  openPageTab(pageId, title, tabId);
}
function openPageTab(pageId, title, tabId) {
  openTabs.push({ id: tabId, title: title, type: 'page', pageId: pageId });
  renderTabs();
  var pagesContainer = document.getElementById('pagesContainer');
  var pageDiv = document.createElement('div');
  pageDiv.className = 'book-page';
  pageDiv.setAttribute('data-page', tabId);
  var sourcePage = document.getElementById(pageId + 'PageSource');
  if (sourcePage) { var clonedContent = sourcePage.cloneNode(true); clonedContent.style.display = 'block'; pageDiv.appendChild(clonedContent); }
  else { pageDiv.innerHTML = '<div style="padding:20px;">页面内容加载中...</div>'; }
  pagesContainer.appendChild(pageDiv);
  switchToTab(tabId);
}
function createPages() {
  var pagesContainer = document.getElementById('pagesContainer');
  if (!pagesContainer) return;
  var existingPages = document.querySelectorAll('#statsPageSource, #settingsPageSource, #aboutPageSource');
  for (var i = 0; i < existingPages.length; i++) { if (existingPages[i].parentNode) existingPages[i].parentNode.removeChild(existingPages[i]); }
  var statsPageSource = document.createElement('div');
  statsPageSource.id = 'statsPageSource';
  statsPageSource.style.display = 'none';
  statsPageSource.innerHTML = '<div style="max-width: 900px; margin: 0 auto;"><div class="stats-cards"><div class="stat-card"><h3>今日</h3><p class="stat-number" id="todayWords">0</p></div><div class="stat-card"><h3>昨天</h3><p class="stat-number" id="yesterdayWords">0</p></div><div class="stat-card"><h3>本周</h3><p class="stat-number" id="weekWords">0</p></div><div class="stat-card"><h3>本月</h3><p class="stat-number" id="monthWords">0</p></div><div class="stat-card"><h3>总计</h3><p class="stat-number" id="totalWords">0</p></div></div><div class="calendar-container"><div class="calendar-header"><button id="prevMonthBtn">‹</button><h3 id="calendarMonth"></h3><button id="nextMonthBtn">›</button></div><div class="calendar-weekdays"><span>日</span><span>一</span><span>二</span><span>三</span><span>四</span><span>五</span><span>六</span></div><div id="calendarDays" class="calendar-days"></div></div><div class="writing-detail"><h4 id="selectedDate">点击日期查看详情</h4><div id="writingDetailList" class="detail-list"><div style="text-align:center; padding:20px; color:#888;">请点击日历中的日期</div></div></div><div class="goal-setting"><h3>写作目标</h3><div style="margin: 8px 0;"><label>每日目标 (字)</label><input type="number" id="dailyGoal" placeholder="2000" style="margin-left: 12px; padding: 4px 8px; width: 100px;"><button id="setDailyGoal" class="small-btn" style="margin-left: 12px;">设置</button></div><div class="progress-bar"><div class="progress-fill"></div></div><p id="goalMessage"></p></div></div>';
  var settingsPageSource = document.createElement('div');
  settingsPageSource.id = 'settingsPageSource';
  settingsPageSource.style.display = 'none';
  settingsPageSource.innerHTML = '<div class="settings-container"><div class="settings-item"><h4>密码保护</h4><p style="font-size:12px; color:#888; margin-bottom:12px;">设置启动密码，保护您的作品隐私</p><button id="passwordSettingsBtn" class="small-btn" style="width:100%;">设置密码保护</button></div><div class="settings-item"><h4>备份策略</h4><label style="margin-right: 16px;"><input type="radio" name="backupType" value="auto" checked> 定时自动备份</label><label><input type="radio" name="backupType" value="manual"> 仅手动备份</label><div style="margin-top:12px;"><button id="manualBackupBtn" class="small-btn">立即备份</button><button id="restoreBackupBtn" class="small-btn" style="margin-left: 8px;">恢复备份</button></div></div><div class="settings-item"><h4>备份文件位置</h4><p style="font-size:12px; color:#888; margin-bottom:12px;">设置备份文件保存的文件夹</p><button id="backupPathBtn" class="small-btn" style="width:100%;">设置备份路径</button></div><div class="settings-item"><h4> 密保问题</h4><p style="font-size:12px; color:#888; margin-bottom:12px;">设置密保问题，用于找回密码</p><button id="securityQuestionsBtn" class="small-btn" style="width:100%;">设置密保问题</button></div></div>';
  var aboutPageSource = document.createElement('div');
  aboutPageSource.id = 'aboutPageSource';
  aboutPageSource.style.display = 'none';
  aboutPageSource.innerHTML = '<div class="about-content"><h2>写作帮手</h2><p><strong>免费，开源，自由的写作软件</strong></p><p>版本 0.2.3 Beta 测试版</p><p>GitHub: <a href="https://github.com/likeweixue/word" target="_blank">github.com/likeweixue/word</a></p></div>';
  pagesContainer.appendChild(statsPageSource);
  pagesContainer.appendChild(settingsPageSource);
  pagesContainer.appendChild(aboutPageSource);
}
function ensureHomePage() {
  var homePage = document.querySelector('.book-page[data-page="home"]');
  if (!homePage) {
    var pagesContainer = document.getElementById('pagesContainer');
    var homeDiv = document.createElement('div');
    homeDiv.className = 'book-page';
    homeDiv.setAttribute('data-page', 'home');
    homeDiv.innerHTML = '<div class="books-header" style="padding: 16px 24px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(0,0,0,0.1);"><h2 style="margin:0;">我的书籍</h2><button id="newBookBtn" class="primary-btn">+ 新建书籍</button></div><div id="booksContainer" class="books-container"></div>';
    pagesContainer.appendChild(homeDiv);
  }
}
function loadAllData() {
  var raw = localStorage.getItem('wps_data');
  if (!raw) { 
    var sampleChapter = new Chapter(Date.now(), '第一章', '<p>这里是属于斗气的世界...</p>');
    var sampleVolume = new Volume(Date.now(), '第一卷', [sampleChapter]);
    var sampleBook = new Book(Date.now(), '斗破苍穹', [sampleVolume]);
    books = [sampleBook]; 
    saveAllData(); 
  } else { 
    try { 
      var d = JSON.parse(raw); 
      books = d.books || []; 
      settings = { theme: 'default', showGrid: false, fontFamily: 'system-ui', lineHeight: '1.8' };
      if (d.settings) { for (var key in d.settings) { if (d.settings.hasOwnProperty(key)) settings[key] = d.settings[key]; } }
      if (books.length === 0) {
        var sampleChapter = new Chapter(Date.now(), '第一章', '<p>开始写作...</p>');
        var sampleVolume = new Volume(Date.now(), '第一卷', [sampleChapter]);
        var sampleBook = new Book(Date.now(), '我的作品', [sampleVolume]);
        books = [sampleBook];
      }
    } catch(e) { console.error(e); }
  }
  if (typeof loadGroups === 'function') loadGroups();
  if (typeof loadTrash === 'function') loadTrash();
  applyTheme(settings.theme);
  applyGridLine(settings.showGrid);
  applyFontFamily(settings.fontFamily);
  applyLineHeight(settings.lineHeight);
  renderBooks();
  setTimeout(function() {
    var prevBtn = document.getElementById('prevMonthBtn');
    var nextBtn = document.getElementById('nextMonthBtn');
    if (prevBtn) prevBtn.onclick = function() { prevMonth(); renderCalendar(); };
    if (nextBtn) nextBtn.onclick = function() { nextMonth(); renderCalendar(); };
  }, 100);
}
function bindEvents() {
  var menuItems = document.querySelectorAll('.menu-item');
  for (var i = 0; i < menuItems.length; i++) {
    menuItems[i].onclick = (function(page) { return function() { if (page === 'books') { switchToTab('home'); } else { switchPage(page); } }; })(menuItems[i].getAttribute('data-page'));
  }
  var newBookBtn = document.getElementById('newBookBtn');
  if (newBookBtn) newBookBtn.onclick = function() { openNewBookDrawer(); };
  var closeDrawerBtn = document.getElementById('closeDrawerBtn');
  if (closeDrawerBtn) closeDrawerBtn.onclick = function() { closeNewBookDrawer(); };
  var confirmNewBookBtn = document.getElementById('confirmNewBookBtn');
  if (confirmNewBookBtn) confirmNewBookBtn.onclick = function() { createNewBook(); };
  var newGroupBtn = document.getElementById('newGroupBtn');
  if (newGroupBtn) newGroupBtn.onclick = function() { if (typeof openNewGroupDrawer === 'function') openNewGroupDrawer(); };
  var closeGroupDrawerBtn = document.getElementById('closeGroupDrawerBtn');
  if (closeGroupDrawerBtn) closeGroupDrawerBtn.onclick = function() { if (typeof closeNewGroupDrawer === 'function') closeNewGroupDrawer(); };
  var confirmNewGroupBtn = document.getElementById('confirmNewGroupBtn');
  if (confirmNewGroupBtn) confirmNewGroupBtn.onclick = function() { if (typeof createNewGroup === 'function') createNewGroup(); };
  var trashBtn = document.getElementById('trashBtn');
  if (trashBtn) trashBtn.onclick = function() { if (typeof openTrashTab === 'function') openTrashTab(); };
  var closeSlideMenu = document.getElementById('closeSlideMenu');
  if (closeSlideMenu) closeSlideMenu.onclick = function() { var menu = document.getElementById('slideMenu'); if (menu) menu.classList.remove('open'); };
  var closeExportPanel = document.getElementById('closeExportPanel');
  if (closeExportPanel) closeExportPanel.onclick = function() { var panel = document.getElementById('exportPanel'); if (panel) panel.classList.remove('open'); };
  var closeFindPanel = document.getElementById('closeFindPanel');
  if (closeFindPanel) closeFindPanel.onclick = function() { var panel = document.getElementById('findPanel'); if (panel) panel.classList.remove('open'); };
  if (typeof bindGroupCoverPreview === 'function') bindGroupCoverPreview();
}
window.saveCurrentChapter = function() {
  var ch = getCurrentChapter();
  if (!ch) return;
  var titleInput = document.getElementById('chapterTitle');
  var editor = document.getElementById('editor');
  if (titleInput) ch.title = titleInput.value;
  if (editor) ch.content = editor.innerHTML;
  ch.updatedTime = new Date().toISOString();
  saveAllData();
  renderBooks();
};
window.openNewGroupDrawer = function() {
  var drawer = document.getElementById('newGroupDrawer');
  if (drawer) drawer.classList.add('open');
};
window.closeNewGroupDrawer = function() {
  var drawer = document.getElementById('newGroupDrawer');
  if (drawer) drawer.classList.remove('open');
};
window.createNewGroup = function() {
  var nameInput = document.getElementById('newGroupName');
  var name = nameInput ? nameInput.value.trim() : '';
  if (!name) { alert('请输入分组名称'); return; }
  var newGroup = { id: Date.now(), name: name, books: [], cover: null };
  groups.push(newGroup);
  if (typeof saveGroups === 'function') saveGroups();
  alert('分组 "' + name + '" 创建成功');
  window.closeNewGroupDrawer();
};
window.bindGroupCoverPreview = function() {
  var coverInput = document.getElementById('groupCoverInput');
  if (coverInput) {
    coverInput.onchange = function(e) {
      var file = e.target.files[0];
      if (file) {
        var reader = new FileReader();
        reader.onload = function(ev) {
          var preview = document.getElementById('groupCoverPreview');
          if (preview) {
            preview.style.backgroundImage = 'url(' + ev.target.result + ')';
            preview.style.backgroundSize = 'cover';
            preview.style.display = 'block';
          }
        };
        reader.readAsDataURL(file);
      }
    };
  }
};
window.openTrashTab = function() {
  var tabId = 'trash_can';
  for (var i = 0; i < openTabs.length; i++) {
    if (openTabs[i].id === tabId) { switchToTab(tabId); return; }
  }
  if (typeof loadTrash === 'function') loadTrash();
  openTabs.push({ id: tabId, title: '回收站', type: 'trash' });
  renderTabs();
  var pagesContainer = document.getElementById('pagesContainer');
  var pageDiv = document.createElement('div');
  pageDiv.className = 'book-page';
  pageDiv.setAttribute('data-page', tabId);
  pageDiv.innerHTML = '<div style="padding: 20px;"><h2> 回收站</h2><div id="trashContent" class="books-grid"></div></div>';
  pagesContainer.appendChild(pageDiv);
  switchToTab(tabId);
  if (typeof renderTrashContent === 'function') renderTrashContent();
};

ensureHomePage();
createPages();
loadAllData();
bindEvents();
renderTabs();
switchToTab('home');

// 确保页面切换时菜单栏状态正确
window.switchToTab = function(tabId) {
  activeTabId = tabId;
  renderTabs();
  
  var bookPages = document.querySelectorAll('.book-page');
  for (var i = 0; i < bookPages.length; i++) {
    bookPages[i].classList.remove('active');
  }
  
  var targetPage = document.querySelector('.book-page[data-page="' + tabId + '"]');
  if (targetPage) {
    targetPage.classList.add('active');
  }
  
  var appContainer = document.querySelector('.app-container');
  if (appContainer) {
    if (tabId !== 'home' && tabId.indexOf('book_') === 0) {
      appContainer.classList.add('editing-mode');
    } else {
      appContainer.classList.remove('editing-mode');
    }
  }
};

// ========== 主题切换函数 ==========
function applyTheme(theme) {
  console.log('切换主题:', theme);
  
  // 切换主题 CSS 文件
  var themeLink = document.getElementById('themeStyle');
  if (themeLink) {
    themeLink.href = 'themes/' + theme + '.css';
  }
  
  // 更新按钮激活状态
  var presets = document.querySelectorAll('.color-preset');
  for (var i = 0; i < presets.length; i++) {
    if (presets[i].dataset.theme === theme) {
      presets[i].classList.add('active');
    } else {
      presets[i].classList.remove('active');
    }
  }
  
  // 保存设置
  if (typeof settings !== 'undefined') {
    settings.theme = theme;
    if (typeof saveAllData === 'function') saveAllData();
  }
  
  console.log('主题已切换到:', theme);
}

function applyGridLine(show) {
  var editor = document.getElementById('editor');
  if (editor) {
    if (show) editor.classList.add('show-grid');
    else editor.classList.remove('show-grid');
  }
  var checkbox = document.getElementById('gridLinesCheckbox');
  if (checkbox) checkbox.checked = show;
  if (typeof settings !== 'undefined') {
    settings.showGrid = show;
    if (typeof saveAllData === 'function') saveAllData();
  }
}

function applyFontFamily(font) {
  var editor = document.getElementById('editor');
  if (editor) editor.style.fontFamily = font;
  var options = document.querySelectorAll('.font-option');
  for (var i = 0; i < options.length; i++) {
    if (options[i].dataset.font === font) options[i].classList.add('active');
    else options[i].classList.remove('active');
  }
  if (typeof settings !== 'undefined') {
    settings.fontFamily = font;
    if (typeof saveAllData === 'function') saveAllData();
  }
}

function applyLineHeight(height) {
  var editor = document.getElementById('editor');
  if (editor) editor.style.lineHeight = height;
  var select = document.getElementById('lineHeightSelect');
  if (select) select.value = height;
  if (typeof settings !== 'undefined') {
    settings.lineHeight = height;
    if (typeof saveAllData === 'function') saveAllData();
  }
}

// 确保函数暴露到全局
window.applyTheme = applyTheme;
window.applyGridLine = applyGridLine;
window.applyFontFamily = applyFontFamily;
window.applyLineHeight = applyLineHeight;

// 重新绑定主题按钮事件
function bindThemeButtons() {
  var presets = document.querySelectorAll('.color-preset');
  console.log('找到主题按钮:', presets.length);
  for (var i = 0; i < presets.length; i++) {
    presets[i].onclick = function(e) {
      var theme = this.getAttribute('data-theme');
      console.log('点击主题按钮:', theme);
      applyTheme(theme);
    };
  }
}

// 延迟绑定，确保 DOM 加载完成
setTimeout(bindThemeButtons, 500);

// ========== 分组抽屉函数 ==========
function openNewGroupDrawer() {
  var drawer = document.getElementById('newGroupDrawer');
  if (drawer) {
    drawer.classList.add('open');
    var nameInput = document.getElementById('newGroupName');
    if (nameInput) nameInput.value = '';
    var coverInput = document.getElementById('groupCoverInput');
    if (coverInput) coverInput.value = '';
    var preview = document.getElementById('groupCoverPreview');
    if (preview) preview.style.display = 'none';
  }
}

function closeNewGroupDrawer() {
  var drawer = document.getElementById('newGroupDrawer');
  if (drawer) drawer.classList.remove('open');
}

function createNewGroup() {
  var nameInput = document.getElementById('newGroupName');
  var name = nameInput ? nameInput.value.trim() : '';
  if (!name) {
    alert('请输入分组名称');
    return;
  }
  
  var coverFile = document.getElementById('groupCoverInput').files[0];
  
  if (coverFile) {
    var reader = new FileReader();
    reader.onload = function(e) {
      createGroupWithCover(name, e.target.result);
    };
    reader.readAsDataURL(coverFile);
  } else {
    createGroupWithCover(name, null);
  }
}

function createGroupWithCover(name, coverData) {
  var newGroup = { 
    id: Date.now(), 
    name: name, 
    books: [],
    cover: coverData
  };
  groups.push(newGroup);
  if (typeof saveGroups === 'function') saveGroups();
  renderBooks();
  closeNewGroupDrawer();
  alert('分组 "' + name + '" 创建成功');
}

function bindGroupCoverPreview() {
  var coverInput = document.getElementById('groupCoverInput');
  if (coverInput) {
    coverInput.onchange = function(e) {
      var file = e.target.files[0];
      if (file) {
        var reader = new FileReader();
        reader.onload = function(ev) {
          var preview = document.getElementById('groupCoverPreview');
          if (preview) {
            preview.style.backgroundImage = 'url(' + ev.target.result + ')';
            preview.style.backgroundSize = 'cover';
            preview.style.backgroundPosition = 'center';
            preview.style.display = 'block';
          }
        };
        reader.readAsDataURL(file);
      }
    };
  }
}

// 确保函数暴露到全局
window.openNewGroupDrawer = openNewGroupDrawer;
window.closeNewGroupDrawer = closeNewGroupDrawer;
window.createNewGroup = createNewGroup;
window.bindGroupCoverPreview = bindGroupCoverPreview;

// ========== 分组抽屉函数 ==========
function openNewGroupDrawer() {
  var drawer = document.getElementById('newGroupDrawer');
  if (drawer) {
    drawer.classList.add('open');
    var nameInput = document.getElementById('newGroupName');
    if (nameInput) nameInput.value = '';
    var coverInput = document.getElementById('groupCoverInput');
    if (coverInput) coverInput.value = '';
    var preview = document.getElementById('groupCoverPreview');
    if (preview) preview.style.display = 'none';
  }
}

function closeNewGroupDrawer() {
  var drawer = document.getElementById('newGroupDrawer');
  if (drawer) drawer.classList.remove('open');
}

function createNewGroup() {
  var nameInput = document.getElementById('newGroupName');
  var name = nameInput ? nameInput.value.trim() : '';
  if (!name) {
    alert('请输入分组名称');
    return;
  }
  
  var coverFile = document.getElementById('groupCoverInput').files[0];
  
  if (coverFile) {
    var reader = new FileReader();
    reader.onload = function(e) {
      createGroupWithCover(name, e.target.result);
    };
    reader.readAsDataURL(coverFile);
  } else {
    createGroupWithCover(name, null);
  }
}

function createGroupWithCover(name, coverData) {
  var newGroup = { 
    id: Date.now(), 
    name: name, 
    books: [],
    cover: coverData
  };
  groups.push(newGroup);
  if (typeof saveGroups === 'function') saveGroups();
  renderBooks();
  closeNewGroupDrawer();
  alert('分组 "' + name + '" 创建成功');
}

function bindGroupCoverPreview() {
  var coverInput = document.getElementById('groupCoverInput');
  if (coverInput) {
    coverInput.onchange = function(e) {
      var file = e.target.files[0];
      if (file) {
        var reader = new FileReader();
        reader.onload = function(ev) {
          var preview = document.getElementById('groupCoverPreview');
          if (preview) {
            preview.style.backgroundImage = 'url(' + ev.target.result + ')';
            preview.style.backgroundSize = 'cover';
            preview.style.display = 'block';
          }
        };
        reader.readAsDataURL(file);
      }
    };
  }
}

// 确保函数暴露到全局
window.openNewGroupDrawer = openNewGroupDrawer;
window.closeNewGroupDrawer = closeNewGroupDrawer;
window.createNewGroup = createNewGroup;
window.bindGroupCoverPreview = bindGroupCoverPreview;

// 重新绑定分组按钮事件（在 bindEvents 函数末尾添加）
// 新建分组按钮
var newGroupBtn = document.getElementById('newGroupBtn');
if (newGroupBtn) {
  newGroupBtn.onclick = function() {
    openNewGroupDrawer();
  };
}

// 分组抽屉关闭按钮
var closeGroupDrawerBtn = document.getElementById('closeGroupDrawerBtn');
if (closeGroupDrawerBtn) {
  closeGroupDrawerBtn.onclick = function() {
    closeNewGroupDrawer();
  };
}

// 确认创建分组按钮
var confirmNewGroupBtn = document.getElementById('confirmNewGroupBtn');
if (confirmNewGroupBtn) {
  confirmNewGroupBtn.onclick = function() {
    createNewGroup();
  };
}

// 分组封面预览
if (typeof bindGroupCoverPreview === 'function') {
  bindGroupCoverPreview();
}

// ========== 分组抽屉函数 ==========
function openNewGroupDrawer() {
  console.log('打开分组抽屉');
  var drawer = document.getElementById('newGroupDrawer');
  if (drawer) {
    drawer.classList.add('open');
    var nameInput = document.getElementById('newGroupName');
    if (nameInput) nameInput.value = '';
    var coverInput = document.getElementById('groupCoverInput');
    if (coverInput) coverInput.value = '';
    var preview = document.getElementById('groupCoverPreview');
    if (preview) preview.style.display = 'none';
  }
}

function closeNewGroupDrawer() {
  console.log('关闭分组抽屉');
  var drawer = document.getElementById('newGroupDrawer');
  if (drawer) drawer.classList.remove('open');
}

function createNewGroup() {
  console.log('创建分组');
  var nameInput = document.getElementById('newGroupName');
  var name = nameInput ? nameInput.value.trim() : '';
  if (!name) {
    alert('请输入分组名称');
    return;
  }
  
  var coverFile = document.getElementById('groupCoverInput').files[0];
  
  if (coverFile) {
    var reader = new FileReader();
    reader.onload = function(e) {
      createGroupWithCover(name, e.target.result);
    };
    reader.readAsDataURL(coverFile);
  } else {
    createGroupWithCover(name, null);
  }
}

function createGroupWithCover(name, coverData) {
  var newGroup = { 
    id: Date.now(), 
    name: name, 
    books: [],
    cover: coverData
  };
  groups.push(newGroup);
  if (typeof saveGroups === 'function') saveGroups();
  renderBooks();
  closeNewGroupDrawer();
  alert('分组 "' + name + '" 创建成功');
}

function bindGroupCoverPreview() {
  var coverInput = document.getElementById('groupCoverInput');
  if (coverInput) {
    coverInput.onchange = function(e) {
      var file = e.target.files[0];
      if (file) {
        var reader = new FileReader();
        reader.onload = function(ev) {
          var preview = document.getElementById('groupCoverPreview');
          if (preview) {
            preview.style.backgroundImage = 'url(' + ev.target.result + ')';
            preview.style.backgroundSize = 'cover';
            preview.style.backgroundPosition = 'center';
            preview.style.display = 'block';
          }
        };
        reader.readAsDataURL(file);
      }
    };
  }
}

// 确保函数暴露到全局
window.openNewGroupDrawer = openNewGroupDrawer;
window.closeNewGroupDrawer = closeNewGroupDrawer;
window.createNewGroup = createNewGroup;
window.bindGroupCoverPreview = bindGroupCoverPreview;

// 重新绑定分组按钮事件（在页面加载完成后）
function bindGroupButtons() {
  console.log('绑定分组按钮事件');
  
  var newGroupBtn = document.getElementById('newGroupBtn');
  if (newGroupBtn) {
    newGroupBtn.onclick = function() {
      openNewGroupDrawer();
    };
    console.log('新建分组按钮已绑定');
  }
  
  var closeGroupDrawerBtn = document.getElementById('closeGroupDrawerBtn');
  if (closeGroupDrawerBtn) {
    closeGroupDrawerBtn.onclick = function() {
      closeNewGroupDrawer();
    };
    console.log('关闭分组按钮已绑定');
  }
  
  var confirmNewGroupBtn = document.getElementById('confirmNewGroupBtn');
  if (confirmNewGroupBtn) {
    confirmNewGroupBtn.onclick = function() {
      createNewGroup();
    };
    console.log('确认创建分组按钮已绑定');
  }
  
  bindGroupCoverPreview();
}

// 在页面加载完成后绑定分组按钮
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bindGroupButtons);
} else {
  setTimeout(bindGroupButtons, 100);
}

// ========== 编辑器增强功能 ==========
// 在 initBookPage 函数中添加以下功能，需要在创建编辑器后调用

function enhanceEditor(editor) {
  if (!editor) return;
  
  // 功能1：首行自动缩进2字符
  editor.addEventListener('keydown', function(e) {
    // 检查是否是第一个字符（当前内容为空或只有空白）
    var currentText = editor.innerText;
    var isEmpty = !currentText || currentText.trim() === '';
    
    // 如果按的是普通字符键（不是回车、删除等）
    if (isEmpty && e.key && e.key.length === 1 && !e.ctrlKey && !e.metaKey && e.key !== ' ' && e.key !== 'Enter') {
      // 阻止默认输入
      e.preventDefault();
      // 插入两个空格 + 当前字符
      var selection = window.getSelection();
      var range = selection.getRangeAt(0);
      var textNode = document.createTextNode('  ' + e.key);
      range.insertNode(textNode);
      range.collapse(false);
      selection.removeAllRanges();
      selection.addRange(range);
      // 触发保存
      if (typeof saveCurrentChapter === 'function') saveCurrentChapter();
      return;
    }
  });
  
  // 功能2：回车自动空一行（增加段落间距）
  editor.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      
      // 获取当前光标位置
      var selection = window.getSelection();
      var range = selection.getRangeAt(0);
      
      // 创建新的段落
      var br = document.createElement('br');
      var p = document.createElement('p');
      p.appendChild(br);
      
      // 插入新段落
      range.insertNode(p);
      
      // 移动光标到新段落
      range.setStart(p, 0);
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);
      
      // 触发保存
      if (typeof saveCurrentChapter === 'function') saveCurrentChapter();
    }
  });
  
  // 功能3：自动修复首行缩进（每段开头自动加两个空格）
  function autoIndentParagraphs() {
    var paragraphs = editor.querySelectorAll('p');
    for (var i = 0; i < paragraphs.length; i++) {
      var p = paragraphs[i];
      var text = p.textContent || '';
      // 如果段落内容不为空且不以空格开头，添加两个空格
      if (text.trim() !== '' && !text.startsWith('  ')) {
        p.innerHTML = '  ' + p.innerHTML;
      }
    }
  }
  
  // 在保存时自动格式化段落
  var originalSave = window.saveCurrentChapter;
  if (originalSave) {
    window.saveCurrentChapter = function() {
      autoIndentParagraphs();
      originalSave();
    };
  }
  
  console.log('编辑器增强功能已启用：首行缩进2字符 + 回车自动空行');
}

// 在 initBookPage 中调用这个函数
// 需要在创建 editor 元素后调用 enhanceEditor(editor)

// ========== 大纲数据结构 ==========
// 每个书籍的大纲数据存储在 localStorage 中
function getOutlineKey(bookId) {
  return 'outline_' + bookId;
}

// 默认大纲结构
function getDefaultOutline() {
  return {
    id: 'root',
    title: '大纲根节点',
    content: '',
    children: [
      {
        id: 'chapter1',
        title: '第一章',
        content: '',
        children: []
      }
    ]
  };
}

// 加载大纲
function loadOutline(bookId) {
  var key = getOutlineKey(bookId);
  var saved = localStorage.getItem(key);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch(e) {}
  }
  return getDefaultOutline();
}

// 保存大纲
function saveOutline(bookId, outline) {
  var key = getOutlineKey(bookId);
  localStorage.setItem(key, JSON.stringify(outline));
}

// 查找节点
function findOutlineNode(node, nodeId) {
  if (node.id === nodeId) return node;
  if (node.children) {
    for (var i = 0; i < node.children.length; i++) {
      var found = findOutlineNode(node.children[i], nodeId);
      if (found) return found;
    }
  }
  return null;
}

// 添加子节点
function addOutlineChild(outline, parentId) {
  var parent = findOutlineNode(outline, parentId);
  if (parent) {
    var newNode = {
      id: Date.now() + '_' + Math.random(),
      title: '新节点',
      content: '',
      children: []
    };
    if (!parent.children) parent.children = [];
    parent.children.push(newNode);
    return newNode;
  }
  return null;
}

// 删除节点
function deleteOutlineNode(outline, nodeId) {
  if (outline.id === nodeId) return false; // 不能删除根节点
  function removeNode(parent) {
    if (parent.children) {
      for (var i = 0; i < parent.children.length; i++) {
        if (parent.children[i].id === nodeId) {
          parent.children.splice(i, 1);
          return true;
        }
        if (removeNode(parent.children[i])) return true;
      }
    }
    return false;
  }
  return removeNode(outline);
}

// 渲染大纲树
function renderOutlineTree(container, node, currentNodeId, onSelect) {
  container.innerHTML = '';
  function renderNode(parentEl, nodeData, level) {
    var div = document.createElement('div');
    div.className = 'tree-node';
    
    var itemDiv = document.createElement('div');
    itemDiv.className = 'tree-node-item';
    if (nodeData.id === currentNodeId) itemDiv.classList.add('active');
    
    var expandIcon = document.createElement('span');
    expandIcon.className = 'tree-expand-icon';
    var hasChildren = nodeData.children && nodeData.children.length > 0;
    expandIcon.textContent = hasChildren ? '▼' : '　';
    expandIcon.onclick = function(e) {
      e.stopPropagation();
      var childrenDiv = div.querySelector('.tree-children');
      if (childrenDiv) {
        if (childrenDiv.style.display === 'none') {
          childrenDiv.style.display = 'block';
          expandIcon.textContent = '▼';
        } else {
          childrenDiv.style.display = 'none';
          expandIcon.textContent = '▶';
        }
      }
    };
    
    var labelSpan = document.createElement('span');
    labelSpan.className = 'tree-node-label';
    labelSpan.textContent = nodeData.title;
    labelSpan.onclick = function(e) {
      e.stopPropagation();
      onSelect(nodeData.id);
    };
    
    itemDiv.appendChild(expandIcon);
    itemDiv.appendChild(labelSpan);
    div.appendChild(itemDiv);
    
    if (hasChildren) {
      var childrenDiv = document.createElement('div');
      childrenDiv.className = 'tree-children';
      for (var i = 0; i < nodeData.children.length; i++) {
        renderNode(childrenDiv, nodeData.children[i], level + 1);
      }
      div.appendChild(childrenDiv);
    }
    
    parentEl.appendChild(div);
  }
  
  renderNode(container, node, 0);
}

// 打开大纲面板
function openOutlinePanel(bookId) {
  var panel = document.getElementById('outlinePanel');
  if (!panel) return;
  
  panel.classList.add('open');
  panel.setAttribute('data-book-id', bookId);
  
  var outline = loadOutline(bookId);
  var currentNodeId = outline.id;
  
  // 渲染树
  var treeContainer = document.getElementById('outlineTree');
  var titleInput = document.getElementById('outlineNodeTitle');
  var contentTextarea = document.getElementById('outlineNodeContent');
  var saveStatus = document.getElementById('outlineSaveStatus');
  
  function renderCurrentNode(nodeId) {
    var node = findOutlineNode(outline, nodeId);
    if (node) {
      titleInput.value = node.title || '';
      contentTextarea.value = node.content || '';
      currentNodeId = nodeId;
      renderOutlineTree(treeContainer, outline, currentNodeId, function(selectedId) {
        renderCurrentNode(selectedId);
      });
    }
  }
  
  renderCurrentNode(currentNodeId);
  
  // 保存当前节点
  var saveNode = function() {
    var node = findOutlineNode(outline, currentNodeId);
    if (node) {
      node.title = titleInput.value;
      node.content = contentTextarea.value;
      saveOutline(bookId, outline);
      saveStatus.textContent = '已保存';
      setTimeout(function() {
        if (saveStatus.textContent === '已保存') saveStatus.textContent = '已同步';
      }, 2000);
      renderCurrentNode(currentNodeId);
    }
  };
  
  titleInput.oninput = saveNode;
  contentTextarea.oninput = saveNode;
  
  // 添加子节点
  document.getElementById('addChildNodeBtn').onclick = function() {
    var newNode = addOutlineChild(outline, currentNodeId);
    if (newNode) {
      saveOutline(bookId, outline);
      renderCurrentNode(newNode.id);
    }
  };
  
  // 删除节点
  document.getElementById('deleteNodeBtn').onclick = function() {
    if (currentNodeId === outline.id) {
      alert('根节点不能删除');
      return;
    }
    if (confirm('确定要删除这个节点吗？')) {
      deleteOutlineNode(outline, currentNodeId);
      saveOutline(bookId, outline);
      renderCurrentNode(outline.id);
    }
  };
}

// 关闭大纲面板
function closeOutlinePanel() {
  var panel = document.getElementById('outlinePanel');
  if (panel) panel.classList.remove('open');
}

// 绑定大纲按钮事件
function bindOutlineButton() {
  var outlineBtn = document.querySelector('.sidebar-item[data-tool="outline"]');
  if (outlineBtn) {
    outlineBtn.onclick = function() {
      var bookId = currentBookId;
      if (bookId) {
        openOutlinePanel(bookId);
      } else {
        alert('请先打开一本书籍');
      }
    };
  }
  
  var closeBtn = document.getElementById('closeOutlinePanel');
  if (closeBtn) {
    closeBtn.onclick = closeOutlinePanel;
  }
}

// 在页面加载后绑定
setTimeout(bindOutlineButton, 500);

// 重新绑定侧边栏按钮事件（确保每次打开书籍后都能工作）
window.bindSidebarButtons = function() {
  console.log('绑定侧边栏按钮');
  
  var outlineBtn = document.querySelector('.sidebar-item[data-tool="outline"]');
  if (outlineBtn) {
    outlineBtn.onclick = function() {
      var bookId = currentBookId;
      if (bookId) {
        if (typeof openOutlinePanel === 'function') {
          openOutlinePanel(bookId);
        } else {
          alert('大纲功能加载中，请稍后');
        }
      } else {
        alert('请先打开一本书籍');
      }
    };
  }
  
  var timelineBtn = document.querySelector('.sidebar-item[data-tool="timeline"]');
  if (timelineBtn) {
    timelineBtn.onclick = function() { alert('时间线功能开发中...'); };
  }
  
  var charactersBtn = document.querySelector('.sidebar-item[data-tool="characters"]');
  if (charactersBtn) {
    charactersBtn.onclick = function() { alert('角色功能开发中...'); };
  }
  
  var settingBtn = document.querySelector('.sidebar-item[data-tool="setting"]');
  if (settingBtn) {
    settingBtn.onclick = function() { alert('设定功能开发中...'); };
  }
  
  var proofreadBtn = document.querySelector('.sidebar-item[data-tool="proofread"]');
  if (proofreadBtn) {
    proofreadBtn.onclick = function() { alert('校对功能开发中...'); };
  }
  
  var namegenBtn = document.querySelector('.sidebar-item[data-tool="namegen"]');
  if (namegenBtn) {
    namegenBtn.onclick = function() { alert('取名功能开发中...'); };
  }
  
  var mapBtn = document.querySelector('.sidebar-item[data-tool="map"]');
  if (mapBtn) {
    mapBtn.onclick = function() { alert('地图功能开发中...'); };
  }
};

// 在书籍页面加载时调用
if (typeof initSidebar === 'function') {
  var originalInitSidebar = initSidebar;
  window.initSidebar = function() {
    originalInitSidebar();
    setTimeout(window.bindSidebarButtons, 200);
  };
} else {
  setTimeout(window.bindSidebarButtons, 1000);
}

// 在 initBookPage 函数末尾添加按钮绑定（直接追加到文件末尾，需要手动放入函数内）
// 由于 sed 修改复杂，我们直接在 app.js 末尾添加一个监听器
setTimeout(function() {
  // 监听书籍页面切换，每次切换时重新绑定侧边栏按钮
  var observer = new MutationObserver(function() {
    var activePage = document.querySelector('.book-page.active');
    if (activePage && activePage.querySelector('.detail-sidebar')) {
      bindSidebarButtonsDirect();
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
}, 1000);

function bindSidebarButtonsDirect() {
  console.log('直接绑定侧边栏按钮');
  
  var outlineBtn = document.querySelector('.sidebar-item[data-tool="outline"]');
  if (outlineBtn && !outlineBtn.hasAttribute('data-bound')) {
    outlineBtn.setAttribute('data-bound', 'true');
    outlineBtn.onclick = function() {
      var bookId = currentBookId;
      if (bookId) {
        if (typeof openOutlinePanel === 'function') {
          openOutlinePanel(bookId);
        } else {
          alert('大纲功能加载中，请稍后');
        }
      } else {
        alert('请先打开一本书籍');
      }
    };
    console.log('大纲按钮已绑定');
  }
  
  var btns = ['timeline', 'characters', 'setting', 'proofread', 'namegen', 'map'];
  for (var i = 0; i < btns.length; i++) {
    var btn = document.querySelector('.sidebar-item[data-tool="' + btns[i] + '"]');
    if (btn && !btn.hasAttribute('data-bound')) {
      btn.setAttribute('data-bound', 'true');
      btn.onclick = function(tool) {
        return function() { alert(tool + '功能开发中...'); };
      }(btns[i]);
    }
  }
}

// 立即执行一次
setTimeout(bindSidebarButtonsDirect, 500);

// ========== 设定功能 ==========
function getSettingKey(bookId) {
  return 'setting_' + bookId;
}

function getDefaultSetting() {
  return {
    id: 'root',
    title: '世界观设定',
    content: '',
    children: [
      {
        id: 'world_' + Date.now(),
        title: '世界背景',
        content: '',
        children: []
      },
      {
        id: 'magic_' + Date.now(),
        title: '力量体系',
        content: '',
        children: []
      },
      {
        id: 'history_' + Date.now(),
        title: '历史事件',
        content: '',
        children: []
      }
    ]
  };
}

function loadSetting(bookId) {
  var key = getSettingKey(bookId);
  var saved = localStorage.getItem(key);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch(e) {}
  }
  return getDefaultSetting();
}

function saveSetting(bookId, setting) {
  var key = getSettingKey(bookId);
  localStorage.setItem(key, JSON.stringify(setting));
}

function findSettingNode(node, nodeId) {
  if (node.id === nodeId) return node;
  if (node.children) {
    for (var i = 0; i < node.children.length; i++) {
      var found = findSettingNode(node.children[i], nodeId);
      if (found) return found;
    }
  }
  return null;
}

function addSettingChild(setting, parentId) {
  var parent = findSettingNode(setting, parentId);
  if (parent) {
    var newNode = {
      id: Date.now() + '_' + Math.random(),
      title: '新设定',
      content: '',
      children: []
    };
    if (!parent.children) parent.children = [];
    parent.children.push(newNode);
    return newNode;
  }
  return null;
}

function deleteSettingNode(setting, nodeId) {
  if (setting.id === nodeId) return false;
  function removeNode(parent) {
    if (parent.children) {
      for (var i = 0; i < parent.children.length; i++) {
        if (parent.children[i].id === nodeId) {
          parent.children.splice(i, 1);
          return true;
        }
        if (removeNode(parent.children[i])) return true;
      }
    }
    return false;
  }
  return removeNode(setting);
}

function renderSettingTree(container, node, currentNodeId, onSelect) {
  container.innerHTML = '';
  function renderNode(parentEl, nodeData, level) {
    var div = document.createElement('div');
    div.className = 'tree-node';
    
    var itemDiv = document.createElement('div');
    itemDiv.className = 'tree-node-item';
    if (nodeData.id === currentNodeId) itemDiv.classList.add('active');
    
    var expandIcon = document.createElement('span');
    expandIcon.className = 'tree-expand-icon';
    var hasChildren = nodeData.children && nodeData.children.length > 0;
    expandIcon.textContent = hasChildren ? '▼' : '　';
    expandIcon.onclick = function(e) {
      e.stopPropagation();
      var childrenDiv = div.querySelector('.tree-children');
      if (childrenDiv) {
        if (childrenDiv.style.display === 'none') {
          childrenDiv.style.display = 'block';
          expandIcon.textContent = '▼';
        } else {
          childrenDiv.style.display = 'none';
          expandIcon.textContent = '▶';
        }
      }
    };
    
    var labelSpan = document.createElement('span');
    labelSpan.className = 'tree-node-label';
    labelSpan.textContent = nodeData.title;
    labelSpan.onclick = function(e) {
      e.stopPropagation();
      onSelect(nodeData.id);
    };
    
    itemDiv.appendChild(expandIcon);
    itemDiv.appendChild(labelSpan);
    div.appendChild(itemDiv);
    
    if (hasChildren) {
      var childrenDiv = document.createElement('div');
      childrenDiv.className = 'tree-children';
      for (var i = 0; i < nodeData.children.length; i++) {
        renderNode(childrenDiv, nodeData.children[i], level + 1);
      }
      div.appendChild(childrenDiv);
    }
    
    parentEl.appendChild(div);
  }
  
  renderNode(container, node, 0);
}

function openSettingPanel(bookId) {
  var panel = document.getElementById('settingPanel');
  if (!panel) return;
  
  panel.classList.add('open');
  panel.setAttribute('data-book-id', bookId);
  
  var setting = loadSetting(bookId);
  var currentNodeId = setting.id;
  
  var treeContainer = document.getElementById('settingTree');
  var titleInput = document.getElementById('settingNodeTitle');
  var contentTextarea = document.getElementById('settingNodeContent');
  var saveStatus = document.getElementById('settingSaveStatus');
  
  function renderCurrentNode(nodeId) {
    var node = findSettingNode(setting, nodeId);
    if (node) {
      titleInput.value = node.title || '';
      contentTextarea.value = node.content || '';
      currentNodeId = nodeId;
      renderSettingTree(treeContainer, setting, currentNodeId, function(selectedId) {
        renderCurrentNode(selectedId);
      });
    }
  }
  
  renderCurrentNode(currentNodeId);
  
  function saveCurrentNode() {
    var node = findSettingNode(setting, currentNodeId);
    if (node) {
      node.title = titleInput.value;
      node.content = contentTextarea.value;
      saveSetting(bookId, setting);
      saveStatus.textContent = '已保存';
      setTimeout(function() {
        if (saveStatus.textContent === '已保存') saveStatus.textContent = '已同步';
      }, 2000);
      renderCurrentNode(currentNodeId);
    }
  }
  
  titleInput.oninput = saveCurrentNode;
  contentTextarea.oninput = saveCurrentNode;
  
  document.getElementById('addSettingChildBtn').onclick = function() {
    var newNode = addSettingChild(setting, currentNodeId);
    if (newNode) {
      saveSetting(bookId, setting);
      renderCurrentNode(newNode.id);
    }
  };
  
  document.getElementById('deleteSettingNodeBtn').onclick = function() {
    if (currentNodeId === setting.id) {
      alert('根节点不能删除');
      return;
    }
    if (confirm('确定要删除这个设定吗？')) {
      deleteSettingNode(setting, currentNodeId);
      saveSetting(bookId, setting);
      renderCurrentNode(setting.id);
    }
  };
  
  var saveBtn = document.getElementById('saveSettingNodeBtn');
  if (saveBtn) saveBtn.onclick = saveCurrentNode;
}

function closeSettingPanel() {
  var panel = document.getElementById('settingPanel');
  if (panel) panel.classList.remove('open');
}

// 绑定设定按钮
function bindSettingButton() {
  var settingBtn = document.querySelector('.sidebar-item[data-tool="setting"]');
  if (settingBtn && !settingBtn.hasAttribute('data-bound')) {
    settingBtn.setAttribute('data-bound', 'true');
    settingBtn.onclick = function() {
      var bookId = currentBookId;
      if (bookId) {
        openSettingPanel(bookId);
      } else {
        alert('请先打开一本书籍');
      }
    };
    console.log('设定按钮已绑定');
  }
  
  var closeSettingBtn = document.getElementById('closeSettingPanel');
  if (closeSettingBtn) {
    closeSettingBtn.onclick = closeSettingPanel;
  }
}

// 在绑定函数中添加设定按钮
var originalBindSidebar = window.bindSidebarButtonsDirect;
if (originalBindSidebar) {
  window.bindSidebarButtonsDirect = function() {
    if (originalBindSidebar) originalBindSidebar();
    bindSettingButton();
  };
} else {
  setTimeout(function() {
    bindSettingButton();
  }, 500);
}

// 更新绑定函数，包含设定按钮
setTimeout(function() {
  var settingBtn = document.querySelector('.sidebar-item[data-tool="setting"]');
  if (settingBtn && !settingBtn.hasAttribute('data-bound')) {
    settingBtn.setAttribute('data-bound', 'true');
    settingBtn.onclick = function() {
      var bookId = currentBookId;
      if (bookId) {
        openSettingPanel(bookId);
      } else {
        alert('请先打开一本书籍');
      }
    };
    console.log('设定按钮已绑定（延迟）');
  }
}, 1000);

// ========== 角色功能 ==========
function getCharacterKey(bookId) {
  return 'character_' + bookId;
}

function getDefaultCharacter() {
  return {
    id: 'root',
    title: '角色列表',
    content: '',
    fields: { age: '', gender: '', race: '', occupation: '' },
    children: [
      {
        id: 'protagonist_' + Date.now(),
        title: '主角',
        content: '',
        fields: { age: '', gender: '', race: '', occupation: '' },
        children: []
      },
      {
        id: 'supporting_' + Date.now(),
        title: '配角',
        content: '',
        fields: { age: '', gender: '', race: '', occupation: '' },
        children: []
      },
      {
        id: 'antagonist_' + Date.now(),
        title: '反派',
        content: '',
        fields: { age: '', gender: '', race: '', occupation: '' },
        children: []
      }
    ]
  };
}

function loadCharacter(bookId) {
  var key = getCharacterKey(bookId);
  var saved = localStorage.getItem(key);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch(e) {}
  }
  return getDefaultCharacter();
}

function saveCharacter(bookId, character) {
  var key = getCharacterKey(bookId);
  localStorage.setItem(key, JSON.stringify(character));
}

function findCharacterNode(node, nodeId) {
  if (node.id === nodeId) return node;
  if (node.children) {
    for (var i = 0; i < node.children.length; i++) {
      var found = findCharacterNode(node.children[i], nodeId);
      if (found) return found;
    }
  }
  return null;
}

function addCharacterChild(character, parentId) {
  var parent = findCharacterNode(character, parentId);
  if (parent) {
    var newNode = {
      id: Date.now() + '_' + Math.random(),
      title: '新角色',
      content: '',
      fields: { age: '', gender: '', race: '', occupation: '' },
      children: []
    };
    if (!parent.children) parent.children = [];
    parent.children.push(newNode);
    return newNode;
  }
  return null;
}

function deleteCharacterNode(character, nodeId) {
  if (character.id === nodeId) return false;
  function removeNode(parent) {
    if (parent.children) {
      for (var i = 0; i < parent.children.length; i++) {
        if (parent.children[i].id === nodeId) {
          parent.children.splice(i, 1);
          return true;
        }
        if (removeNode(parent.children[i])) return true;
      }
    }
    return false;
  }
  return removeNode(character);
}

function renderCharacterTree(container, node, currentNodeId, onSelect) {
  container.innerHTML = '';
  function renderNode(parentEl, nodeData, level) {
    var div = document.createElement('div');
    div.className = 'tree-node';
    
    var itemDiv = document.createElement('div');
    itemDiv.className = 'tree-node-item';
    if (nodeData.id === currentNodeId) itemDiv.classList.add('active');
    
    var expandIcon = document.createElement('span');
    expandIcon.className = 'tree-expand-icon';
    var hasChildren = nodeData.children && nodeData.children.length > 0;
    expandIcon.textContent = hasChildren ? '▼' : '　';
    expandIcon.onclick = function(e) {
      e.stopPropagation();
      var childrenDiv = div.querySelector('.tree-children');
      if (childrenDiv) {
        if (childrenDiv.style.display === 'none') {
          childrenDiv.style.display = 'block';
          expandIcon.textContent = '▼';
        } else {
          childrenDiv.style.display = 'none';
          expandIcon.textContent = '▶';
        }
      }
    };
    
    var labelSpan = document.createElement('span');
    labelSpan.className = 'tree-node-label';
    labelSpan.textContent = nodeData.title;
    labelSpan.onclick = function(e) {
      e.stopPropagation();
      onSelect(nodeData.id);
    };
    
    itemDiv.appendChild(expandIcon);
    itemDiv.appendChild(labelSpan);
    div.appendChild(itemDiv);
    
    if (hasChildren) {
      var childrenDiv = document.createElement('div');
      childrenDiv.className = 'tree-children';
      for (var i = 0; i < nodeData.children.length; i++) {
        renderNode(childrenDiv, nodeData.children[i], level + 1);
      }
      div.appendChild(childrenDiv);
    }
    
    parentEl.appendChild(div);
  }
  
  renderNode(container, node, 0);
}

function openCharacterPanel(bookId) {
  var panel = document.getElementById('characterPanel');
  if (!panel) return;
  
  panel.classList.add('open');
  panel.setAttribute('data-book-id', bookId);
  
  var character = loadCharacter(bookId);
  var currentNodeId = character.id;
  
  var treeContainer = document.getElementById('characterTree');
  var titleInput = document.getElementById('characterNodeTitle');
  var contentTextarea = document.getElementById('characterNodeContent');
  var ageInput = document.getElementById('characterAge');
  var genderInput = document.getElementById('characterGender');
  var raceInput = document.getElementById('characterRace');
  var occupationInput = document.getElementById('characterOccupation');
  var saveStatus = document.getElementById('characterSaveStatus');
  
  function renderCurrentNode(nodeId) {
    var node = findCharacterNode(character, nodeId);
    if (node) {
      titleInput.value = node.title || '';
      contentTextarea.value = node.content || '';
      if (node.fields) {
        ageInput.value = node.fields.age || '';
        genderInput.value = node.fields.gender || '';
        raceInput.value = node.fields.race || '';
        occupationInput.value = node.fields.occupation || '';
      } else {
        ageInput.value = '';
        genderInput.value = '';
        raceInput.value = '';
        occupationInput.value = '';
      }
      currentNodeId = nodeId;
      renderCharacterTree(treeContainer, character, currentNodeId, function(selectedId) {
        renderCurrentNode(selectedId);
      });
    }
  }
  
  renderCurrentNode(currentNodeId);
  
  function saveCurrentNode() {
    var node = findCharacterNode(character, currentNodeId);
    if (node) {
      node.title = titleInput.value;
      node.content = contentTextarea.value;
      node.fields = {
        age: ageInput.value,
        gender: genderInput.value,
        race: raceInput.value,
        occupation: occupationInput.value
      };
      saveCharacter(bookId, character);
      saveStatus.textContent = '已保存';
      setTimeout(function() {
        if (saveStatus.textContent === '已保存') saveStatus.textContent = '已同步';
      }, 2000);
      renderCurrentNode(currentNodeId);
    }
  }
  
  titleInput.oninput = saveCurrentNode;
  contentTextarea.oninput = saveCurrentNode;
  ageInput.oninput = saveCurrentNode;
  genderInput.oninput = saveCurrentNode;
  raceInput.oninput = saveCurrentNode;
  occupationInput.oninput = saveCurrentNode;
  
  document.getElementById('addCharacterChildBtn').onclick = function() {
    var newNode = addCharacterChild(character, currentNodeId);
    if (newNode) {
      saveCharacter(bookId, character);
      renderCurrentNode(newNode.id);
    }
  };
  
  document.getElementById('deleteCharacterNodeBtn').onclick = function() {
    if (currentNodeId === character.id) {
      alert('根节点不能删除');
      return;
    }
    if (confirm('确定要删除这个角色吗？')) {
      deleteCharacterNode(character, currentNodeId);
      saveCharacter(bookId, character);
      renderCurrentNode(character.id);
    }
  };
  
  var saveBtn = document.getElementById('saveCharacterNodeBtn');
  if (saveBtn) saveBtn.onclick = saveCurrentNode;
}

function closeCharacterPanel() {
  var panel = document.getElementById('characterPanel');
  if (panel) panel.classList.remove('open');
}

// 绑定角色按钮
function bindCharacterButton() {
  var characterBtn = document.querySelector('.sidebar-item[data-tool="characters"]');
  if (characterBtn && !characterBtn.hasAttribute('data-bound')) {
    characterBtn.setAttribute('data-bound', 'true');
    characterBtn.onclick = function() {
      var bookId = currentBookId;
      if (bookId) {
        openCharacterPanel(bookId);
      } else {
        alert('请先打开一本书籍');
      }
    };
    console.log('角色按钮已绑定');
  }
  
  var closeCharacterBtn = document.getElementById('closeCharacterPanel');
  if (closeCharacterBtn) {
    closeCharacterBtn.onclick = closeCharacterPanel;
  }
}

// 延迟绑定角色按钮
setTimeout(function() {
  bindCharacterButton();
}, 500);

// 重新定义 bindSidebarButtonsDirect 函数，移除旧的提示覆盖
window.bindSidebarButtonsDirect = function() {
  console.log('直接绑定侧边栏按钮');
  
  // 大纲按钮
  var outlineBtn = document.querySelector('.sidebar-item[data-tool="outline"]');
  if (outlineBtn && !outlineBtn.hasAttribute('data-bound')) {
    outlineBtn.setAttribute('data-bound', 'true');
    outlineBtn.onclick = function() {
      var bookId = currentBookId;
      if (bookId && typeof openOutlinePanel === 'function') {
        openOutlinePanel(bookId);
      } else if (bookId) {
        alert('大纲功能加载中，请稍后');
      } else {
        alert('请先打开一本书籍');
      }
    };
    console.log('大纲按钮已绑定');
  }
  
  // 设定按钮
  var settingBtn = document.querySelector('.sidebar-item[data-tool="setting"]');
  if (settingBtn && !settingBtn.hasAttribute('data-bound')) {
    settingBtn.setAttribute('data-bound', 'true');
    settingBtn.onclick = function() {
      var bookId = currentBookId;
      if (bookId && typeof openSettingPanel === 'function') {
        openSettingPanel(bookId);
      } else if (bookId) {
        alert('设定功能加载中，请稍后');
      } else {
        alert('请先打开一本书籍');
      }
    };
    console.log('设定按钮已绑定');
  }
  
  // 角色按钮
  var characterBtn = document.querySelector('.sidebar-item[data-tool="characters"]');
  if (characterBtn && !characterBtn.hasAttribute('data-bound')) {
    characterBtn.setAttribute('data-bound', 'true');
    characterBtn.onclick = function() {
      var bookId = currentBookId;
      if (bookId && typeof openCharacterPanel === 'function') {
        openCharacterPanel(bookId);
      } else if (bookId) {
        alert('角色功能加载中，请稍后');
      } else {
        alert('请先打开一本书籍');
      }
    };
    console.log('角色按钮已绑定');
  }
  
  // 时间线、校对、取名、地图按钮
  var otherTools = ['timeline', 'proofread', 'namegen', 'map'];
  for (var i = 0; i < otherTools.length; i++) {
    var btn = document.querySelector('.sidebar-item[data-tool="' + otherTools[i] + '"]');
    if (btn && !btn.hasAttribute('data-bound')) {
      btn.setAttribute('data-bound', 'true');
      btn.onclick = (function(tool) {
        return function() { alert(tool + '功能开发中...'); };
      })(otherTools[i]);
    }
  }
};

// 执行绑定
setTimeout(function() {
  if (typeof window.bindSidebarButtonsDirect === 'function') {
    window.bindSidebarButtonsDirect();
  }
}, 500);

// ========== 永久修复侧边栏按钮 ==========
(function() {
  function fixAllSidebarButtons() {
    // 大纲按钮
    var outlineBtn = document.querySelector('.sidebar-item[data-tool="outline"]');
    if (outlineBtn && !outlineBtn.hasAttribute('data-fixed')) {
      outlineBtn.setAttribute('data-fixed', 'true');
      outlineBtn.onclick = function(e) {
        e.stopPropagation();
        var bookId = currentBookId;
        if (bookId && typeof openOutlinePanel === 'function') {
          openOutlinePanel(bookId);
        } else if (bookId) {
          alert('大纲功能加载中，请稍后再试');
        } else {
          alert('请先打开一本书籍');
        }
      };
    }
    
    // 设定按钮
    var settingBtn = document.querySelector('.sidebar-item[data-tool="setting"]');
    if (settingBtn && !settingBtn.hasAttribute('data-fixed')) {
      settingBtn.setAttribute('data-fixed', 'true');
      settingBtn.onclick = function(e) {
        e.stopPropagation();
        var bookId = currentBookId;
        if (bookId && typeof openSettingPanel === 'function') {
          openSettingPanel(bookId);
        } else if (bookId) {
          alert('设定功能加载中，请稍后再试');
        } else {
          alert('请先打开一本书籍');
        }
      };
    }
    
    // 角色按钮
    var characterBtn = document.querySelector('.sidebar-item[data-tool="characters"]');
    if (characterBtn && !characterBtn.hasAttribute('data-fixed')) {
      characterBtn.setAttribute('data-fixed', 'true');
      characterBtn.onclick = function(e) {
        e.stopPropagation();
        var bookId = currentBookId;
        if (bookId && typeof openCharacterPanel === 'function') {
          openCharacterPanel(bookId);
        } else if (bookId) {
          alert('角色功能加载中，请稍后再试');
        } else {
          alert('请先打开一本书籍');
        }
      };
    }
  }
  
  // 页面加载后执行
  setTimeout(fixAllSidebarButtons, 1000);
  setTimeout(fixAllSidebarButtons, 3000);
  
  // 监听书籍页面切换
  var observer = new MutationObserver(function() {
    var activePage = document.querySelector('.book-page.active');
    if (activePage) {
      setTimeout(fixAllSidebarButtons, 200);
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
})();

// ========== 修复面板关闭按钮 ==========
function fixPanelCloseButtons() {
  // 设定面板关闭按钮
  var closeSettingBtn = document.getElementById('closeSettingPanel');
  if (closeSettingBtn && !closeSettingBtn.hasAttribute('data-fixed')) {
    closeSettingBtn.setAttribute('data-fixed', 'true');
    closeSettingBtn.onclick = function() {
      var panel = document.getElementById('settingPanel');
      if (panel) panel.classList.remove('open');
    };
    console.log('设定面板关闭按钮已绑定');
  }
  
  // 大纲面板关闭按钮
  var closeOutlineBtn = document.getElementById('closeOutlinePanel');
  if (closeOutlineBtn && !closeOutlineBtn.hasAttribute('data-fixed')) {
    closeOutlineBtn.setAttribute('data-fixed', 'true');
    closeOutlineBtn.onclick = function() {
      var panel = document.getElementById('outlinePanel');
      if (panel) panel.classList.remove('open');
    };
    console.log('大纲面板关闭按钮已绑定');
  }
  
  // 角色面板关闭按钮
  var closeCharacterBtn = document.getElementById('closeCharacterPanel');
  if (closeCharacterBtn && !closeCharacterBtn.hasAttribute('data-fixed')) {
    closeCharacterBtn.setAttribute('data-fixed', 'true');
    closeCharacterBtn.onclick = function() {
      var panel = document.getElementById('characterPanel');
      if (panel) panel.classList.remove('open');
    };
    console.log('角色面板关闭按钮已绑定');
  }
}

// 延迟执行
setTimeout(fixPanelCloseButtons, 500);
setTimeout(fixPanelCloseButtons, 1000);

// ========== 取名面板功能 ==========
var nameHistory = [];

function loadNameHistory() {
  var saved = localStorage.getItem('name_history');
  if (saved) {
    try {
      nameHistory = JSON.parse(saved);
    } catch(e) {}
  }
  if (!nameHistory) nameHistory = [];
}

function saveNameHistory() {
  localStorage.setItem('name_history', JSON.stringify(nameHistory));
}

function addToHistory(category, name) {
  nameHistory.unshift({ category: category, name: name, time: new Date().toLocaleString() });
  if (nameHistory.length > 50) nameHistory.pop();
  saveNameHistory();
  renderHistoryList();
}

function renderHistoryList() {
  var container = document.getElementById('historyList');
  if (!container) return;
  if (nameHistory.length === 0) {
    container.innerHTML = '<div style="text-align:center; color:#888; padding:20px;">暂无历史记录</div>';
    return;
  }
  var html = '';
  for (var i = 0; i < nameHistory.length; i++) {
    var item = nameHistory[i];
    var categoryName = getCategoryName(item.category);
    html += '<div style="padding: 8px; border-bottom: 1px solid #eee; cursor: pointer;" onclick="copyToClipboard(\'' + escapeHtml(item.name) + '\')">' +
      '<span style="font-size: 12px; color: #888;">[' + categoryName + ']</span> ' +
      '<span style="font-weight: 500;">' + escapeHtml(item.name) + '</span>' +
      '<span style="font-size: 11px; color: #aaa; float: right;">' + item.time + '</span>' +
      '</div>';
  }
  container.innerHTML = html;
}

function getCategoryName(category) {
  var names = {
    person: '人物', place: '地名', power: '实力', skill: '招式',
    equipment: '装备', monster: '怪物', item: '道具'
  };
  return names[category] || category;
}

function openNamegenPanel() {
  var panel = document.getElementById('namegenPanel');
  if (!panel) return;
  panel.classList.add('open');
  loadNameHistory();
  renderHistoryList();
  
  // 绑定生成按钮事件
  var generateBtn = document.getElementById('generateNameBtn');
  var categorySelect = document.getElementById('nameCategory');
  var resultDiv = document.getElementById('nameResult');
  
  if (generateBtn && !generateBtn.hasAttribute('data-bound')) {
    generateBtn.setAttribute('data-bound', 'true');
    generateBtn.onclick = function() {
      var category = categorySelect.value;
      var newName = generateName(category);
      resultDiv.innerHTML = newName;
      addToHistory(category, newName);
    };
  }
  
  // 复制按钮
  var copyBtn = document.getElementById('copyNameBtn');
  if (copyBtn && !copyBtn.hasAttribute('data-bound')) {
    copyBtn.setAttribute('data-bound', 'true');
    copyBtn.onclick = function() {
      var name = resultDiv.innerText;
      if (name && name !== '点击生成') {
        copyToClipboard(name);
        alert('已复制: ' + name);
      } else {
        alert('请先生成一个名字');
      }
    };
  }
  
  // 清空历史按钮
  var clearHistoryBtn = document.getElementById('clearHistoryBtn');
  if (clearHistoryBtn && !clearHistoryBtn.hasAttribute('data-bound')) {
    clearHistoryBtn.setAttribute('data-bound', 'true');
    clearHistoryBtn.onclick = function() {
      if (confirm('确定要清空所有历史记录吗？')) {
        nameHistory = [];
        saveNameHistory();
        renderHistoryList();
      }
    };
  }
  
  // 首次自动生成一个
  if (resultDiv.innerText === '点击生成') {
    var firstCategory = categorySelect.value;
    resultDiv.innerHTML = generateName(firstCategory);
  }
}

function closeNamegenPanel() {
  var panel = document.getElementById('namegenPanel');
  if (panel) panel.classList.remove('open');
}

function copyToClipboard(text) {
  var textarea = document.createElement('textarea');
  textarea.value = text;
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand('copy');
  document.body.removeChild(textarea);
}

// 绑定取名按钮
function bindNamegenButton() {
  var namegenBtn = document.querySelector('.sidebar-item[data-tool="namegen"]');
  if (namegenBtn && !namegenBtn.hasAttribute('data-bound')) {
    namegenBtn.setAttribute('data-bound', 'true');
    namegenBtn.onclick = function() {
      openNamegenPanel();
    };
    console.log('取名按钮已绑定');
  }
  
  var closeNamegenBtn = document.getElementById('closeNamegenPanel');
  if (closeNamegenBtn && !closeNamegenBtn.hasAttribute('data-bound')) {
    closeNamegenBtn.setAttribute('data-bound', 'true');
    closeNamegenBtn.onclick = closeNamegenPanel;
  }
}

// 延迟绑定
setTimeout(bindNamegenButton, 500);

// ========== 强制绑定取名按钮 ==========
setTimeout(function() {
  var namegenBtn = document.querySelector('.sidebar-item[data-tool="namegen"]');
  if (namegenBtn) {
    // 移除旧的事件
    namegenBtn.onclick = null;
    // 绑定新事件
    namegenBtn.onclick = function(e) {
      e.stopPropagation();
      console.log('点击取名按钮');
      if (typeof openNamegenPanel === 'function') {
        openNamegenPanel();
      } else {
        console.error('openNamegenPanel 未定义');
        alert('取名功能加载中，请稍后再试');
      }
    };
    namegenBtn.setAttribute('data-bound', 'force');
    console.log('取名按钮强制绑定完成');
  } else {
    console.log('找不到取名按钮');
  }
}, 1000);

// ========== 永久强力绑定侧边栏按钮 ==========
(function() {
  function bindAllSidebarButtons() {
    console.log('执行强力绑定...');
    
    // 取名按钮
    var namegenBtn = document.querySelector('.sidebar-item[data-tool="namegen"]');
    if (namegenBtn) {
      // 移除所有已有事件
      namegenBtn.onclick = null;
      namegenBtn.onclick = function(e) {
        e.stopPropagation();
        if (typeof openNamegenPanel === 'function') {
          openNamegenPanel();
        } else {
          console.error('openNamegenPanel 未定义');
          alert('取名功能加载中，请稍后再试');
        }
      };
      console.log('取名按钮已绑定');
    }
    
    // 大纲按钮
    var outlineBtn = document.querySelector('.sidebar-item[data-tool="outline"]');
    if (outlineBtn) {
      outlineBtn.onclick = null;
      outlineBtn.onclick = function(e) {
        e.stopPropagation();
        if (currentBookId && typeof openOutlinePanel === 'function') {
          openOutlinePanel(currentBookId);
        } else {
          alert('请先打开一本书籍');
        }
      };
      console.log('大纲按钮已绑定');
    }
    
    // 设定按钮
    var settingBtn = document.querySelector('.sidebar-item[data-tool="setting"]');
    if (settingBtn) {
      settingBtn.onclick = null;
      settingBtn.onclick = function(e) {
        e.stopPropagation();
        if (currentBookId && typeof openSettingPanel === 'function') {
          openSettingPanel(currentBookId);
        } else {
          alert('请先打开一本书籍');
        }
      };
      console.log('设定按钮已绑定');
    }
    
    // 角色按钮
    var characterBtn = document.querySelector('.sidebar-item[data-tool="characters"]');
    if (characterBtn) {
      characterBtn.onclick = null;
      characterBtn.onclick = function(e) {
        e.stopPropagation();
        if (currentBookId && typeof openCharacterPanel === 'function') {
          openCharacterPanel(currentBookId);
        } else {
          alert('请先打开一本书籍');
        }
      };
      console.log('角色按钮已绑定');
    }
  }
  
  // 页面加载完成后执行
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      setTimeout(bindAllSidebarButtons, 500);
    });
  } else {
    setTimeout(bindAllSidebarButtons, 500);
  }
  
  // 监听动态内容变化（打开书籍时重新绑定）
  var observer = new MutationObserver(function() {
    var activePage = document.querySelector('.book-page.active');
    if (activePage) {
      setTimeout(bindAllSidebarButtons, 200);
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
})();

// ========== 时间线功能 ==========
function getTimelineKey(bookId) {
  return 'timeline_' + bookId;
}

function getDefaultTimeline() {
  return [
    {
      id: Date.now() + '_1',
      title: '故事开端',
      chapter: '第一章',
      order: 1,
      content: '主角登场，故事开始...'
    },
    {
      id: Date.now() + '_2',
      title: '初次冒险',
      chapter: '第二章',
      order: 2,
      content: '主角踏上征程...'
    }
  ];
}

function loadTimeline(bookId) {
  var key = getTimelineKey(bookId);
  var saved = localStorage.getItem(key);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch(e) {}
  }
  return getDefaultTimeline();
}

function saveTimeline(bookId, timeline) {
  var key = getTimelineKey(bookId);
  localStorage.setItem(key, JSON.stringify(timeline));
}

function renderTimelineEventList(container, timeline, currentEventId, onSelect) {
  if (!container) return;
  if (!timeline || timeline.length === 0) {
    container.innerHTML = '<div style="text-align:center; padding:20px; color:#888;">暂无事件，点击"添加事件"创建</div>';
    return;
  }
  
  // 按 order 排序
  timeline.sort(function(a, b) { return a.order - b.order; });
  
  var html = '';
  for (var i = 0; i < timeline.length; i++) {
    var event = timeline[i];
    var activeClass = (event.id === currentEventId) ? 'active' : '';
    html += '<div class="timeline-event-item ' + activeClass + '" data-id="' + event.id + '">' +
      '<div class="timeline-event-title">' + escapeHtml(event.title) + '</div>' +
      '<div class="timeline-event-meta">' +
      '<span class="timeline-event-chapter"> ' + escapeHtml(event.chapter || '未设置') + '</span>' +
      '<span>#' + event.order + '</span>' +
      '</div>' +
      '</div>';
  }
  container.innerHTML = html;
  
  // 绑定点击事件
  var items = container.querySelectorAll('.timeline-event-item');
  for (var i = 0; i < items.length; i++) {
    items[i].onclick = function(e) {
      var id = this.getAttribute('data-id');
      onSelect(id);
    };
  }
}

function openTimelinePanel(bookId) {
  var panel = document.getElementById('timelinePanel');
  if (!panel) return;
  
  panel.classList.add('open');
  panel.setAttribute('data-book-id', bookId);
  
  var timeline = loadTimeline(bookId);
  var currentEventId = timeline.length > 0 ? timeline[0].id : null;
  
  var eventList = document.getElementById('timelineEventList');
  var titleInput = document.getElementById('timelineEventTitle');
  var chapterInput = document.getElementById('timelineEventChapter');
  var orderInput = document.getElementById('timelineEventOrder');
  var contentTextarea = document.getElementById('timelineEventContent');
  var saveStatus = document.getElementById('timelineSaveStatus');
  
  function renderCurrentEvent(eventId) {
    var event = null;
    for (var i = 0; i < timeline.length; i++) {
      if (timeline[i].id === eventId) {
        event = timeline[i];
        break;
      }
    }
    if (event) {
      titleInput.value = event.title || '';
      chapterInput.value = event.chapter || '';
      orderInput.value = event.order || '';
      contentTextarea.value = event.content || '';
      currentEventId = eventId;
      renderTimelineEventList(eventList, timeline, currentEventId, function(selectedId) {
        renderCurrentEvent(selectedId);
      });
    } else if (timeline.length > 0) {
      renderCurrentEvent(timeline[0].id);
    } else {
      titleInput.value = '';
      chapterInput.value = '';
      orderInput.value = '';
      contentTextarea.value = '';
      renderTimelineEventList(eventList, timeline, null, function(selectedId) {
        renderCurrentEvent(selectedId);
      });
    }
  }
  
  renderCurrentEvent(currentEventId);
  
  function saveCurrentEvent() {
    if (!currentEventId && timeline.length === 0) {
      // 没有事件时，创建新事件
      return;
    }
    var event = null;
    for (var i = 0; i < timeline.length; i++) {
      if (timeline[i].id === currentEventId) {
        event = timeline[i];
        break;
      }
    }
    if (event) {
      event.title = titleInput.value;
      event.chapter = chapterInput.value;
      event.order = parseInt(orderInput.value) || 1;
      event.content = contentTextarea.value;
      saveTimeline(bookId, timeline);
      saveStatus.textContent = '已保存';
      setTimeout(function() {
        if (saveStatus.textContent === '已保存') saveStatus.textContent = '已同步';
      }, 2000);
      renderCurrentEvent(currentEventId);
    }
  }
  
  titleInput.oninput = saveCurrentEvent;
  chapterInput.oninput = saveCurrentEvent;
  orderInput.oninput = saveCurrentEvent;
  contentTextarea.oninput = saveCurrentEvent;
  
  // 添加事件
  document.getElementById('addTimelineEventBtn').onclick = function() {
    var newOrder = timeline.length + 1;
    var newEvent = {
      id: Date.now() + '_' + Math.random(),
      title: '新事件',
      chapter: '第' + newOrder + '章',
      order: newOrder,
      content: ''
    };
    timeline.push(newEvent);
    saveTimeline(bookId, timeline);
    renderCurrentEvent(newEvent.id);
  };
  
  // 删除事件
  document.getElementById('deleteTimelineEventBtn').onclick = function() {
    if (!currentEventId) return;
    if (timeline.length === 1) {
      alert('至少保留一个事件');
      return;
    }
    if (confirm('确定要删除这个事件吗？')) {
      var newTimeline = [];
      for (var i = 0; i < timeline.length; i++) {
        if (timeline[i].id !== currentEventId) {
          newTimeline.push(timeline[i]);
        }
      }
      // 重新排序
      for (var i = 0; i < newTimeline.length; i++) {
        newTimeline[i].order = i + 1;
      }
      timeline = newTimeline;
      saveTimeline(bookId, timeline);
      renderCurrentEvent(timeline.length > 0 ? timeline[0].id : null);
    }
  };
  
  var saveBtn = document.getElementById('saveTimelineEventBtn');
  if (saveBtn) saveBtn.onclick = saveCurrentEvent;
}

function closeTimelinePanel() {
  var panel = document.getElementById('timelinePanel');
  if (panel) panel.classList.remove('open');
}

// 绑定时间线按钮
function bindTimelineButton() {
  var timelineBtn = document.querySelector('.sidebar-item[data-tool="timeline"]');
  if (timelineBtn && !timelineBtn.hasAttribute('data-bound')) {
    timelineBtn.setAttribute('data-bound', 'true');
    timelineBtn.onclick = function(e) {
      e.stopPropagation();
      var bookId = currentBookId;
      if (bookId && typeof openTimelinePanel === 'function') {
        openTimelinePanel(bookId);
      } else if (bookId) {
        alert('时间线功能加载中，请稍后再试');
      } else {
        alert('请先打开一本书籍');
      }
    };
    console.log('时间线按钮已绑定');
  }
  
  var closeTimelineBtn = document.getElementById('closeTimelinePanel');
  if (closeTimelineBtn && !closeTimelineBtn.hasAttribute('data-bound')) {
    closeTimelineBtn.setAttribute('data-bound', 'true');
    closeTimelineBtn.onclick = closeTimelinePanel;
  }
}

// 延迟绑定
setTimeout(bindTimelineButton, 500);

// 在强力绑定函数中添加时间线按钮
// 更新 bindAllSidebarButtons 函数
(function() {
  var originalBind = window.bindAllSidebarButtons;
  window.bindAllSidebarButtons = function() {
    if (originalBind) originalBind();
    
    // 时间线按钮
    var timelineBtn = document.querySelector('.sidebar-item[data-tool="timeline"]');
    if (timelineBtn) {
      timelineBtn.onclick = null;
      timelineBtn.onclick = function(e) {
        e.stopPropagation();
        if (currentBookId && typeof openTimelinePanel === 'function') {
          openTimelinePanel(currentBookId);
        } else {
          alert('请先打开一本书籍');
        }
      };
      console.log('时间线按钮已强力绑定');
    }
  };
})();

// ========== 强力修复时间线按钮 ==========
setTimeout(function() {
  var timelineBtn = document.querySelector('.sidebar-item[data-tool="timeline"]');
  if (timelineBtn) {
    timelineBtn.onclick = function(e) {
      e.stopPropagation();
      e.preventDefault();
      console.log('强力点击: 时间线');
      if (currentBookId && typeof openTimelinePanel === 'function') {
        openTimelinePanel(currentBookId);
      } else if (currentBookId) {
        alert('时间线功能加载中，请稍后再试');
      } else {
        alert('请先打开一本书籍');
      }
    };
    timelineBtn.setAttribute('data-bound', 'strong');
    console.log('时间线按钮已强力绑定');
  }
}, 1000);

// ========== 校对功能 ==========
// 预设错别字库
var typoDatabase = {
  '的': ['地', '得', '底'],
  '地': ['的', '得', '底'],
  '得': ['的', '地', '底'],
  '在': ['再', '灾'],
  '再': ['在', '载'],
  '做': ['作', '坐'],
  '作': ['做', '坐'],
  '坐': ['做', '作'],
  '像': ['象', '向'],
  '象': ['像', '向'],
  '向': ['像', '象'],
  '那': ['哪', '拿'],
  '哪': ['那', '拿'],
  '已': ['以', '己'],
  '以': ['已', '己'],
  '己': ['已', '以'],
  '须': ['需', '需'],
  '需': ['须'],
  '副': ['幅', '福'],
  '幅': ['副', '福'],
  '度': ['渡', '镀'],
  '渡': ['度', '镀'],
  '形': ['型'],
  '型': ['形'],
  '应': ['因'],
  '因': ['应'],
  '只': ['之', '知'],
  '之': ['只', '知'],
  '知': ['只', '之'],
  '他': ['她', '它'],
  '她': ['他', '它'],
  '它': ['他', '她'],
  '你': ['您'],
  '您': ['你']
};

// 自定义违禁词库（按书籍存储）
function getCustomWordsKey(bookId) {
  return 'custom_words_' + bookId;
}

function loadCustomWords(bookId) {
  var key = getCustomWordsKey(bookId);
  var saved = localStorage.getItem(key);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch(e) {}
  }
  return [];
}

function saveCustomWords(bookId, words) {
  var key = getCustomWordsKey(bookId);
  localStorage.setItem(key, JSON.stringify(words));
}

function addCustomWord(bookId, word) {
  var words = loadCustomWords(bookId);
  if (!words.includes(word)) {
    words.push(word);
    saveCustomWords(bookId, words);
  }
}

function removeCustomWord(bookId, word) {
  var words = loadCustomWords(bookId);
  var newWords = [];
  for (var i = 0; i < words.length; i++) {
    if (words[i] !== word) newWords.push(words[i]);
  }
  saveCustomWords(bookId, newWords);
}

// 校对函数
function proofreadText(text, bookId) {
  var issues = [];
  
  // 1. 检查错别字
  for (var wrong in typoDatabase) {
    var regex = new RegExp(wrong, 'g');
    var match;
    while ((match = regex.exec(text)) !== null) {
      issues.push({
        type: 'typo',
        word: wrong,
        position: match.index,
        suggestion: typoDatabase[wrong][0],
        message: '疑似错别字："' + wrong + '"，建议改为："' + typoDatabase[wrong][0] + '"'
      });
    }
  }
  
  // 2. 检查自定义词
  var customWords = loadCustomWords(bookId);
  for (var i = 0; i < customWords.length; i++) {
    var word = customWords[i];
    var regex = new RegExp(word, 'g');
    var match;
    while ((match = regex.exec(text)) !== null) {
      issues.push({
        type: 'custom',
        word: word,
        position: match.index,
        suggestion: '请检查此词是否符合语境',
        message: '自定义提醒词："' + word + '"'
      });
    }
  }
  
  // 3. 检查常见病句模式
  var patterns = [
    { regex: /因为[\s\S]*?所以[\s\S]*?因为/, message: '可能存在因果关系混乱' },
    { regex: /虽然[\s\S]*?但是[\s\S]*?虽然/, message: '转折关系可能有问题' },
    { regex: /，[\s]*，/, message: '存在连续逗号，建议检查' },
    { regex: /。。/, message: '存在连续句号' },
    { regex: /的的/, message: '重复的"的"字' },
    { regex: /了了/, message: '重复的"了"字' }
  ];
  
  for (var i = 0; i < patterns.length; i++) {
    if (patterns[i].regex.test(text)) {
      issues.push({
        type: 'grammar',
        word: '',
        position: -1,
        suggestion: '',
        message: patterns[i].message
      });
    }
  }
  
  // 去重（按位置和词去重）
  var uniqueIssues = [];
  for (var i = 0; i < issues.length; i++) {
    var isDuplicate = false;
    for (var j = 0; j < uniqueIssues.length; j++) {
      if (uniqueIssues[j].word === issues[i].word && 
          Math.abs(uniqueIssues[j].position - issues[i].position) < 5) {
        isDuplicate = true;
        break;
      }
    }
    if (!isDuplicate) {
      uniqueIssues.push(issues[i]);
    }
  }
  
  return uniqueIssues;
}

function openProofreadPanel() {
  var panel = document.getElementById('proofreadPanel');
  if (!panel) return;
  panel.classList.add('open');
  
  var resultContainer = document.getElementById('proofreadResult');
  var checkBtn = document.getElementById('checkTextBtn');
  
  if (checkBtn && !checkBtn.hasAttribute('data-bound')) {
    checkBtn.setAttribute('data-bound', 'true');
    checkBtn.onclick = function() {
      var editor = document.getElementById('editor');
      if (!editor) {
        resultContainer.innerHTML = '<div style="text-align:center; color:#ff6b6b; padding:20px;">未找到编辑器内容</div>';
        return;
      }
      
      var text = editor.innerText;
      if (!text || text.trim() === '') {
        resultContainer.innerHTML = '<div style="text-align:center; color:#888; padding:20px;">当前章节内容为空，请先写一些内容</div>';
        return;
      }
      
      resultContainer.innerHTML = '<div style="text-align:center; padding:20px;">正在校对中...</div>';
      
      setTimeout(function() {
        var issues = proofreadText(text, currentBookId);
        renderProofreadResult(issues, resultContainer);
      }, 100);
    };
  }
  
  // 添加自定义词按钮
  var addCustomBtn = document.getElementById('addCustomWordBtn');
  if (addCustomBtn && !addCustomBtn.hasAttribute('data-bound')) {
    addCustomBtn.setAttribute('data-bound', 'true');
    addCustomBtn.onclick = function() {
      var word = prompt('请输入要添加的自定义提醒词：');
      if (word && word.trim()) {
        addCustomWord(currentBookId, word.trim());
        alert('已添加词：' + word);
      }
    };
  }
  
  // 管理词库按钮
  var manageBtn = document.getElementById('manageWordsBtn');
  if (manageBtn && !manageBtn.hasAttribute('data-bound')) {
    manageBtn.setAttribute('data-bound', 'true');
    manageBtn.onclick = function() {
      openWordManagerModal();
    };
  }
}

function renderProofreadResult(issues, container) {
  if (!container) return;
  if (issues.length === 0) {
    container.innerHTML = '<div style="text-align:center; color:#4caf50; padding:20px;">✅ 校对完成！没有发现问题</div>';
    return;
  }
  
  var html = '<div style="margin-bottom: 12px; color:#ff6b6b;">发现 ' + issues.length + ' 个问题：</div>';
  for (var i = 0; i < issues.length; i++) {
    var issue = issues[i];
    var typeLabel = issue.type === 'typo' ? '🔴 错别字' : (issue.type === 'custom' ? '🟡 自定义词' : '🟠 病句');
    html += '<div style="background: rgba(0,0,0,0.03); border-radius: 8px; padding: 12px; margin-bottom: 12px;">' +
      '<div style="font-weight: 600; margin-bottom: 6px;">' + typeLabel + '</div>' +
      '<div>' + issue.message + '</div>';
    if (issue.suggestion) {
      html += '<div style="color: #007aff; font-size: 12px; margin-top: 6px;">💡 建议：' + issue.suggestion + '</div>';
    }
    html += '</div>';
  }
  container.innerHTML = html;
}

function openWordManagerModal() {
  var modal = document.getElementById('wordManagerModal');
  if (!modal) return;
  
  modal.style.display = 'flex';
  
  var words = loadCustomWords(currentBookId);
  renderCustomWordList(words);
  
  // 添加词按钮
  var addWordBtn = document.getElementById('addWordBtn');
  if (addWordBtn) {
    addWordBtn.onclick = function() {
      var input = document.getElementById('newCustomWord');
      var word = input.value.trim();
      if (word) {
        addCustomWord(currentBookId, word);
        input.value = '';
        var newWords = loadCustomWords(currentBookId);
        renderCustomWordList(newWords);
      } else {
        alert('请输入词语');
      }
    };
  }
  
  // 关闭按钮
  var closeBtn = document.getElementById('closeWordModal');
  if (closeBtn) {
    closeBtn.onclick = function() {
      modal.style.display = 'none';
    };
  }
  
  // 点击遮罩关闭
  modal.onclick = function(e) {
    if (e.target === modal) {
      modal.style.display = 'none';
    }
  };
}

function renderCustomWordList(words) {
  var container = document.getElementById('customWordList');
  if (!container) return;
  
  if (!words || words.length === 0) {
    container.innerHTML = '<div style="text-align:center; color:#888; padding:20px;">暂无自定义词</div>';
    return;
  }
  
  var html = '';
  for (var i = 0; i < words.length; i++) {
    html += '<div style="display: flex; justify-content: space-between; align-items: center; padding: 8px; border-bottom: 1px solid #eee;">' +
      '<span>' + escapeHtml(words[i]) + '</span>' +
      '<button class="delete-word-btn" data-word="' + escapeHtml(words[i]) + '" style="background: none; border: none; color: #ff6b6b; cursor: pointer;">删除</button>' +
      '</div>';
  }
  container.innerHTML = html;
  
  // 绑定删除按钮
  var deleteBtns = container.querySelectorAll('.delete-word-btn');
  for (var i = 0; i < deleteBtns.length; i++) {
    deleteBtns[i].onclick = function() {
      var word = this.getAttribute('data-word');
      if (confirm('确定要删除 "' + word + '" 吗？')) {
        removeCustomWord(currentBookId, word);
        var newWords = loadCustomWords(currentBookId);
        renderCustomWordList(newWords);
      }
    };
  }
}

function closeProofreadPanel() {
  var panel = document.getElementById('proofreadPanel');
  if (panel) panel.classList.remove('open');
  
  var modal = document.getElementById('wordManagerModal');
  if (modal) modal.style.display = 'none';
}

// 绑定校对按钮
function bindProofreadButton() {
  var proofreadBtn = document.querySelector('.sidebar-item[data-tool="proofread"]');
  if (proofreadBtn && !proofreadBtn.hasAttribute('data-bound')) {
    proofreadBtn.setAttribute('data-bound', 'true');
    proofreadBtn.onclick = function(e) {
      e.stopPropagation();
      if (currentBookId && typeof openProofreadPanel === 'function') {
        openProofreadPanel();
      } else if (currentBookId) {
        alert('校对功能加载中，请稍后再试');
      } else {
        alert('请先打开一本书籍');
      }
    };
    console.log('校对按钮已绑定');
  }
  
  var closeProofreadBtn = document.getElementById('closeProofreadPanel');
  if (closeProofreadBtn && !closeProofreadBtn.hasAttribute('data-bound')) {
    closeProofreadBtn.setAttribute('data-bound', 'true');
    closeProofreadBtn.onclick = closeProofreadPanel;
  }
}

// 延迟绑定
setTimeout(bindProofreadButton, 500);

// ========== 永久修复校对按钮 ==========
(function() {
  function fixProofreadButton() {
    var proofreadBtn = document.querySelector('.sidebar-item[data-tool="proofread"]');
    if (proofreadBtn) {
      proofreadBtn.onclick = function(e) {
        e.stopPropagation();
        e.preventDefault();
        console.log('点击校对按钮');
        if (currentBookId && typeof openProofreadPanel === 'function') {
          openProofreadPanel();
        } else if (currentBookId) {
          alert('校对功能加载中，请稍后再试');
        } else {
          alert('请先打开一本书籍');
        }
      };
      proofreadBtn.setAttribute('data-proofread-fixed', 'true');
      console.log('✅ 校对按钮已永久修复');
    }
  }
  
  // 页面加载后执行
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      setTimeout(fixProofreadButton, 500);
    });
  } else {
    setTimeout(fixProofreadButton, 500);
  }
  
  // 监听书籍页面切换
  var observer = new MutationObserver(function() {
    var activePage = document.querySelector('.book-page.active');
    if (activePage) {
      setTimeout(fixProofreadButton, 200);
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
})();

// ========== 永久修复地图按钮 ==========
(function() {
  function fixMapButton() {
    var mapBtn = document.querySelector('.sidebar-item[data-tool="map"]');
    if (mapBtn) {
      mapBtn.onclick = function(e) {
        e.stopPropagation();
        alert('地图功能开发中，敬请期待！');
      };
      mapBtn.setAttribute('data-map-fixed', 'true');
      console.log('✅ 地图按钮已修复');
    }
  }
  
  setTimeout(fixMapButton, 500);
  setTimeout(fixMapButton, 1000);
})();

// 修复侧边栏关闭按钮功能
(function fixSidebarToggle() {
  var toggleSidebarBtn = document.getElementById('toggleSidebarBtn');
  var sidebar = document.getElementById('detailSidebar');
  var topSidebarBtn = document.getElementById('sidebarToggleBtn');
  
  if (toggleSidebarBtn && sidebar) {
    // 移除旧的事件（如果有）
    toggleSidebarBtn.onclick = null;
    // 绑定新的事件
    toggleSidebarBtn.onclick = function(e) {
      e.stopPropagation();
      sidebar.classList.toggle('hidden');
      // 更新按钮文字
      if (sidebar.classList.contains('hidden')) {
        toggleSidebarBtn.textContent = '☰';
      } else {
        toggleSidebarBtn.textContent = '✕';
      }
      // 同步顶部按钮的状态（可选）
      if (topSidebarBtn) {
        topSidebarBtn.textContent = sidebar.classList.contains('hidden') ? '☰ 侧栏' : '✕ 侧栏';
      }
    };
    console.log('侧边栏关闭按钮已修复');
  }
  
  // 确保顶部按钮也正常工作
  if (topSidebarBtn && sidebar) {
    var originalClick = topSidebarBtn.onclick;
    topSidebarBtn.onclick = function(e) {
      e.stopPropagation();
      sidebar.classList.toggle('hidden');
      if (sidebar.classList.contains('hidden')) {
        topSidebarBtn.textContent = '☰ 侧栏';
        if (toggleSidebarBtn) toggleSidebarBtn.textContent = '☰';
      } else {
        topSidebarBtn.textContent = '✕ 侧栏';
        if (toggleSidebarBtn) toggleSidebarBtn.textContent = '✕';
      }
    };
    console.log('顶部侧边栏按钮已修复');
  }
})();

// ========== 强制修复侧边栏按钮 ==========
(function forceFixSidebarButtons() {
  function fixButtons() {
    var sidebar = document.getElementById('detailSidebar');
    var toggleBtn = document.getElementById('toggleSidebarBtn');
    var topBtn = document.getElementById('sidebarToggleBtn');
    
    if (!sidebar || !toggleBtn) {
      setTimeout(fixButtons, 200);
      return;
    }
    
    // 移除所有旧的事件监听器（通过替换元素的方式）
    var newToggleBtn = toggleBtn.cloneNode(true);
    toggleBtn.parentNode.replaceChild(newToggleBtn, toggleBtn);
    
    if (topBtn) {
      var newTopBtn = topBtn.cloneNode(true);
      topBtn.parentNode.replaceChild(newTopBtn, topBtn);
    }
    
    // 重新获取元素
    var finalToggleBtn = document.getElementById('toggleSidebarBtn');
    var finalTopBtn = document.getElementById('sidebarToggleBtn');
    var finalSidebar = document.getElementById('detailSidebar');
    
    // 定义切换函数
    function toggleSidebar() {
      if (finalSidebar.classList.contains('hidden')) {
        finalSidebar.classList.remove('hidden');
        if (finalToggleBtn) finalToggleBtn.textContent = '✕';
        if (finalTopBtn) finalTopBtn.textContent = '✕ 侧栏';
      } else {
        finalSidebar.classList.add('hidden');
        if (finalToggleBtn) finalToggleBtn.textContent = '☰';
        if (finalTopBtn) finalTopBtn.textContent = '☰ 侧栏';
      }
    }
    
    if (finalToggleBtn) {
      finalToggleBtn.onclick = function(e) {
        e.stopPropagation();
        toggleSidebar();
      };
    }
    
    if (finalTopBtn) {
      finalTopBtn.onclick = function(e) {
        e.stopPropagation();
        toggleSidebar();
      };
    }
  }
  
  // 页面加载时执行
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fixButtons);
  } else {
    fixButtons();
  }
  
  // 打开新书籍时重新绑定
  var oldOpenBookTab = window.openBookTab;
  if (oldOpenBookTab) {
    window.openBookTab = function(bookId) {
      oldOpenBookTab(bookId);
      setTimeout(fixButtons, 500);
    };
  }
})();

// 修复 switchPage 函数，为 bbs 添加页面
var originalSwitchPage = window.switchPage;
if (originalSwitchPage) {
  window.switchPage = function(pageId) {
    var pageTitles = { 'stats': '数据', 'settings': '设置', 'about': '关于', 'bbs': '江湖' };
    var title = pageTitles[pageId] || pageId;
    var tabId = 'page_' + pageId;
    
    // 检查是否已经打开
    for (var i = 0; i < openTabs.length; i++) {
      if (openTabs[i].id === tabId) {
        switchToTab(tabId);
        return;
      }
    }
    
    openPageTab(pageId, title, tabId);
  };
}

// 创建 bbs 江湖页面
function createBbsPage() {
  var existingPage = document.getElementById('bbsPageSource');
  if (existingPage) return;
  
  var pagesContainer = document.getElementById('pagesContainer');
  var bbsPageSource = document.createElement('div');
  bbsPageSource.id = 'bbsPageSource';
  bbsPageSource.style.display = 'none';
  bbsPageSource.innerHTML = `
  <div id="jianghuPage" style="padding: 30px; overflow-y: auto; height: 100%; background: inherit;">
    <div style="max-width: 900px; margin: 0 auto;">
      <h2 style="margin-bottom: 8px; text-align: center;">江湖</h2>
      <p style="text-align: center; color: #666; margin-bottom: 30px;">与写作帮手的朋友们一起交流</p>
      
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 20px;">
        
        <div onclick="window.open('https://qm.qq.com/q/你的QQ群链接', '_blank')" style="background: #fff; border-radius: 12px; padding: 20px; text-align: center; cursor: pointer; transition: all 0.2s; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
          <div style="font-size: 48px; margin-bottom: 12px;">💬</div>
          <div style="font-weight: 600; font-size: 16px; margin-bottom: 6px;">QQ交流群</div>
          <div style="font-size: 12px; color: #888;">与作者们实时交流</div>
        </div>
        
        <div onclick="window.open('https://你的论坛地址.com', '_blank')" style="background: #fff; border-radius: 12px; padding: 20px; text-align: center; cursor: pointer; transition: all 0.2s; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
          <div style="font-size: 48px; margin-bottom: 12px;"></div>
          <div style="font-weight: 600; font-size: 16px; margin-bottom: 6px;">官方论坛</div>
          <div style="font-size: 12px; color: #888;">分享作品与技巧</div>
        </div>
        
        <div onclick="window.open('https://github.com/likeweixue/word', '_blank')" style="background: #fff; border-radius: 12px; padding: 20px; text-align: center; cursor: pointer; transition: all 0.2s; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
          <div style="font-size: 48px; margin-bottom: 12px;">🐙</div>
          <div style="font-weight: 600; font-size: 16px; margin-bottom: 6px;">GitHub</div>
          <div style="font-size: 12px; color: #888;">查看源码与反馈</div>
        </div>
        
        <div onclick="window.open('https://你的教程链接.com', '_blank')" style="background: #fff; border-radius: 12px; padding: 20px; text-align: center; cursor: pointer; transition: all 0.2s; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
          <div style="font-size: 48px; margin-bottom: 12px;">📖</div>
          <div style="font-weight: 600; font-size: 16px; margin-bottom: 6px;">使用教程</div>
          <div style="font-size: 12px; color: #888;">快速上手写作帮手</div>
        </div>
        
        <div onclick="window.open('https://你的反馈链接.com', '_blank')" style="background: #fff; border-radius: 12px; padding: 20px; text-align: center; cursor: pointer; transition: all 0.2s; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
          <div style="font-size: 48px; margin-bottom: 12px;">💡</div>
          <div style="font-weight: 600; font-size: 16px; margin-bottom: 6px;">意见反馈</div>
          <div style="font-size: 12px; color: #888;">告诉我们你的想法</div>
        </div>
        
        <div onclick="alert('即将发布，敬请期待！')" style="background: #fff; border-radius: 12px; padding: 20px; text-align: center; cursor: pointer; transition: all 0.2s; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
          <div style="font-size: 48px; margin-bottom: 12px;">📢</div>
          <div style="font-weight: 600; font-size: 16px; margin-bottom: 6px;">更新日志</div>
          <div style="font-size: 12px; color: #888;">v0.2.1 Beta版本</div>
        </div>
      </div>
      
      <div style="margin-top: 30px; padding: 16px; background: #f0f7ff; border-radius: 12px; text-align: center; font-size: 13px; color: #666;">
        写作帮手 · 免费开源 · 数据本地存储 · 祝大家墨香
      </div>
    </div>
  </div>
  `;
  
  pagesContainer.appendChild(bbsPageSource);
}

// 在 createPages 函数中添加 bbs 页面
var originalCreatePages = window.createPages;
if (originalCreatePages) {
  window.createPages = function() {
    originalCreatePages();
    createBbsPage();
  };
} else {
  createBbsPage();
}

// 确保江湖按钮点击时打开 bbs 页面
setTimeout(function() {
  var bbsBtn = document.querySelector('.menu-item[data-page="bbs"]');
  if (bbsBtn) {
    bbsBtn.onclick = function(e) {
      e.stopPropagation();
      switchPage('bbs');
    };
  }
}, 500);

// 创建江湖页面内容
function createBbsContent() {
  var bbsSource = document.getElementById('bbsPageSource');
  if (!bbsSource) {
    var pagesContainer = document.getElementById('pagesContainer');
    bbsSource = document.createElement('div');
    bbsSource.id = 'bbsPageSource';
    bbsSource.style.display = 'none';
    pagesContainer.appendChild(bbsSource);
  }
  
  bbsSource.innerHTML = `
  <div style="padding: 30px; overflow-y: auto; height: 100%;">
    <div style="max-width: 900px; margin: 0 auto;">
      <h2 style="margin-bottom: 8px; text-align: center;">江湖</h2>
      <p style="text-align: center; color: #666; margin-bottom: 30px;">与写作帮手的朋友们一起交流</p>
      
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 20px;">
        
        <div onclick="window.open('https://qm.qq.com/q/你的QQ群链接', '_blank')" style="background: #fff; border-radius: 12px; padding: 20px; text-align: center; cursor: pointer; transition: all 0.2s; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
          <div style="font-size: 36px; margin-bottom: 12px;">QQ</div>
          <div style="font-weight: 600; font-size: 16px; margin-bottom: 6px;">QQ交流群</div>
          <div style="font-size: 12px; color: #888;">与作者们实时交流</div>
        </div>
        
        <div onclick="window.open('https://github.com/likeweixue/word', '_blank')" style="background: #fff; border-radius: 12px; padding: 20px; text-align: center; cursor: pointer; transition: all 0.2s; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
          <div style="font-size: 36px; margin-bottom: 12px;">GH</div>
          <div style="font-weight: 600; font-size: 16px; margin-bottom: 6px;">GitHub</div>
          <div style="font-size: 12px; color: #888;">查看源码与反馈</div>
        </div>
        
        <div onclick="window.open('https://你的论坛地址.com', '_blank')" style="background: #fff; border-radius: 12px; padding: 20px; text-align: center; cursor: pointer; transition: all 0.2s; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
          <div style="font-size: 36px; margin-bottom: 12px;">BBS</div>
          <div style="font-weight: 600; font-size: 16px; margin-bottom: 6px;">官方论坛</div>
          <div style="font-size: 12px; color: #888;">分享作品与技巧</div>
        </div>
        
        <div onclick="window.open('https://你的教程链接.com', '_blank')" style="background: #fff; border-radius: 12px; padding: 20px; text-align: center; cursor: pointer; transition: all 0.2s; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
          <div style="font-size: 36px; margin-bottom: 12px;">DOC</div>
          <div style="font-weight: 600; font-size: 16px; margin-bottom: 6px;">使用教程</div>
          <div style="font-size: 12px; color: #888;">快速上手写作帮手</div>
        </div>
        
        <div onclick="window.open('https://你的反馈链接.com', '_blank')" style="background: #fff; border-radius: 12px; padding: 20px; text-align: center; cursor: pointer; transition: all 0.2s; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
          <div style="font-size: 36px; margin-bottom: 12px;">FB</div>
          <div style="font-weight: 600; font-size: 16px; margin-bottom: 6px;">意见反馈</div>
          <div style="font-size: 12px; color: #888;">告诉我们你的想法</div>
        </div>
        
        <div onclick="alert('即将发布，敬请期待')" style="background: #fff; border-radius: 12px; padding: 20px; text-align: center; cursor: pointer; transition: all 0.2s; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
          <div style="font-size: 36px; margin-bottom: 12px;">NEW</div>
          <div style="font-weight: 600; font-size: 16px; margin-bottom: 6px;">更新日志</div>
          <div style="font-size: 12px; color: #888;">v0.2.1 Beta版本</div>
        </div>
      </div>
      
      <div style="margin-top: 30px; padding: 16px; background: #f0f7ff; border-radius: 12px; text-align: center; font-size: 13px; color: #666;">
        写作帮手 · 免费开源 · 数据本地存储 · 祝大家墨香
      </div>
    </div>
  </div>
  `;
  
  console.log('江湖页面内容已更新');
}

// 修改 switchPage 函数，为 bbs 创建内容
var oldSwitchPage = window.switchPage;
if (oldSwitchPage) {
  window.switchPage = function(pageId) {
    if (pageId === 'bbs') {
      createBbsContent();
    }
    oldSwitchPage(pageId);
  };
}

// 立即创建内容
createBbsContent();

// 重新绑定江湖按钮
setTimeout(function() {
  var bbsBtn = document.querySelector('.menu-item[data-page="bbs"]');
  if (bbsBtn) {
    bbsBtn.onclick = function(e) {
      e.stopPropagation();
      window.switchPage('bbs');
    };
    console.log('江湖按钮已重新绑定');
  }
}, 500);

// 更新江湖页面内容，添加主题适配的class
function updateBbsWithTheme() {
  var bbsSource = document.getElementById('bbsPageSource');
  if (!bbsSource) return;
  
  bbsSource.innerHTML = `
  <div style="padding: 30px; overflow-y: auto; height: 100%;">
    <div style="max-width: 900px; margin: 0 auto;">
      <h2 style="margin-bottom: 8px; text-align: center;">江湖</h2>
      <p style="text-align: center; color: #666; margin-bottom: 30px;">与写作帮手的朋友们一起交流</p>
      
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 20px;">
        
        <div class="jianghu-card" onclick="window.open('https://qm.qq.com/q/你的QQ群链接', '_blank')">
          <div class="card-icon" style="font-size: 36px; margin-bottom: 12px;">QQ</div>
          <div style="font-weight: 600; font-size: 16px; margin-bottom: 6px;">QQ交流群</div>
          <div style="font-size: 12px; opacity: 0.7;">与作者们实时交流</div>
        </div>
        
        <div class="jianghu-card" onclick="window.open('https://github.com/likeweixue/word', '_blank')">
          <div class="card-icon" style="font-size: 36px; margin-bottom: 12px;">GH</div>
          <div style="font-weight: 600; font-size: 16px; margin-bottom: 6px;">GitHub</div>
          <div style="font-size: 12px; opacity: 0.7;">查看源码与反馈</div>
        </div>
        
        <div class="jianghu-card" onclick="window.open('https://你的论坛地址.com', '_blank')">
          <div class="card-icon" style="font-size: 36px; margin-bottom: 12px;">BBS</div>
          <div style="font-weight: 600; font-size: 16px; margin-bottom: 6px;">官方论坛</div>
          <div style="font-size: 12px; opacity: 0.7;">分享作品与技巧</div>
        </div>
        
        <div class="jianghu-card" onclick="window.open('https://你的教程链接.com', '_blank')">
          <div class="card-icon" style="font-size: 36px; margin-bottom: 12px;">DOC</div>
          <div style="font-weight: 600; font-size: 16px; margin-bottom: 6px;">使用教程</div>
          <div style="font-size: 12px; opacity: 0.7;">快速上手写作帮手</div>
        </div>
        
        <div class="jianghu-card" onclick="window.open('https://你的反馈链接.com', '_blank')">
          <div class="card-icon" style="font-size: 36px; margin-bottom: 12px;">FB</div>
          <div style="font-weight: 600; font-size: 16px; margin-bottom: 6px;">意见反馈</div>
          <div style="font-size: 12px; opacity: 0.7;">告诉我们你的想法</div>
        </div>
        
        <div class="jianghu-card" onclick="alert('即将发布，敬请期待')">
          <div class="card-icon" style="font-size: 36px; margin-bottom: 12px;">NEW</div>
          <div style="font-weight: 600; font-size: 16px; margin-bottom: 6px;">更新日志</div>
          <div style="font-size: 12px; opacity: 0.7;">v0.2.1 Beta版本</div>
        </div>
      </div>
      
      <div class="jianghu-footer" style="margin-top: 30px; padding: 16px; border-radius: 12px; text-align: center; font-size: 13px;">
        写作帮手 · 免费开源 · 数据本地存储 · 祝大家墨香
      </div>
    </div>
  </div>
  `;
}

// 替换原来的创建函数
window.createBbsContent = updateBbsWithTheme;
updateBbsWithTheme();
