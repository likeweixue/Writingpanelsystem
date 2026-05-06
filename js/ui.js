function escapeHtml(t) { 
  if (!t) return ''; 
  var d = document.createElement('div'); 
  d.textContent = t; 
  return d.innerHTML; 
}

// 根据主题和书名生成封面颜色
function getCoverColorByThemeAndTitle(title) {
  var currentTheme = settings && settings.theme ? settings.theme : 'default';
  var colorsByTheme = {
    'default': ['#e8e8e8', '#d0d0d0', '#c0c0c0', '#b0b0b0'],
    'eye': ['#b8cab5', '#a8b8a5', '#98a895', '#88a885'],
    'warm': ['#cfc5ad', '#bfb59d', '#afa58d', '#9f957d'],
    'dark': ['#2a2a3a', '#3a3a4a', '#4a4a5a', '#5a5a6a']
  };
  
  var themeColors = colorsByTheme[currentTheme];
  if (!themeColors) themeColors = colorsByTheme['default'];
  
  if (!title) return themeColors[0];
  var hash = 0;
  for (var i = 0; i < title.length; i++) {
    hash = ((hash << 5) - hash) + title.charCodeAt(i);
  }
  return themeColors[Math.abs(hash % themeColors.length)];
}

function showGroupMenu(groupId, btnElement) {
  var existingMenu = document.querySelector('.group-context-menu');
  if (existingMenu) existingMenu.remove();
  
  var menu = document.createElement('div');
  menu.className = 'group-context-menu';
  menu.style.cssText = 'position: fixed; background: white; border: 1px solid #ddd; border-radius: 8px; padding: 4px 0; box-shadow: 0 2px 8px rgba(0,0,0,0.15); z-index: 1000; min-width: 120px;';
  menu.innerHTML = '<button class="rename-group" data-id="' + groupId + '" style="display: block; width: 100%; padding: 8px 16px; border: none; background: none; cursor: pointer; text-align: left;">✏️ 重命名分组</button>' +
    '<button class="delete-group" data-id="' + groupId + '" style="display: block; width: 100%; padding: 8px 16px; border: none; background: none; cursor: pointer; text-align: left;">🗑️ 删除分组</button>';
  
  var rect = btnElement.getBoundingClientRect();
  menu.style.top = rect.bottom + 'px';
  menu.style.left = rect.left + 'px';
  document.body.appendChild(menu);
  
  menu.querySelector('.rename-group').onclick = function() {
    renameGroupById(groupId);
    menu.remove();
  };
  
  menu.querySelector('.delete-group').onclick = function() {
    deleteGroupById(groupId);
    menu.remove();
  };
  
  setTimeout(function() {
    document.addEventListener('click', function closeMenu(e) {
      if (!menu.contains(e.target)) { if(menu.parentNode) menu.remove(); document.removeEventListener('click', closeMenu); }
    });
  }, 100);
}

function renameGroupById(groupId) {
  var group = null;
  for (var i = 0; i < groups.length; i++) {
    if (groups[i].id === groupId) { group = groups[i]; break; }
  }
  if (group) {
    var newName = prompt('请输入新分组名称', group.name);
    if (newName && newName.trim()) {
      group.name = newName.trim();
      if (typeof saveGroups === 'function') saveGroups();
      renderBooks();
      alert('重命名成功');
    }
  }
}

function deleteGroupById(groupId) {
  var group = null;
  for (var i = 0; i < groups.length; i++) {
    if (groups[i].id === groupId) { group = groups[i]; break; }
  }
  if (!group) return;
  
  if (group.name === '默认分组') {
    alert('默认分组不能删除');
    return;
  }
  
  if (confirm('确定要删除分组 "' + group.name + '" 吗？该分组下的书籍将移动到"默认分组"')) {
    // 找到默认分组
    var defaultGroup = null;
    for (var i = 0; i < groups.length; i++) {
      if (groups[i].name === '默认分组') {
        defaultGroup = groups[i];
        break;
      }
    }
    if (!defaultGroup) {
      defaultGroup = { id: 'default', name: '默认分组', books: [] };
      groups.push(defaultGroup);
    }
    
    // 将该分组下的所有书籍移动到默认分组
    for (var i = 0; i < books.length; i++) {
      if (books[i].groupId === groupId) {
        books[i].groupId = defaultGroup.id;
      }
    }
    
    // 删除分组
    var newGroups = [];
    for (var i = 0; i < groups.length; i++) {
      if (groups[i].id !== groupId) {
        newGroups.push(groups[i]);
      }
    }
    groups = newGroups;
    
    if (typeof saveGroups === 'function') saveGroups();
    saveAllData();
    renderBooks();
    alert('分组已删除，书籍已移至默认分组');
  }
}

function renderBooks() {
  var container = document.getElementById('booksContainer');
  if (!container) return;
  
  if (typeof loadGroups === 'function') loadGroups();
  if (!groups || groups.length === 0) {
    groups = [{ id: 'default', name: '默认分组', books: [] }];
  }
  
  container.innerHTML = '';
  
  // 按分组显示书籍（包括空分组）
  for (var g = 0; g < groups.length; g++) {
    var group = groups[g];
    var groupBooks = [];
    for (var i = 0; i < books.length; i++) {
      if (books[i].groupId === group.id || (!books[i].groupId && group.id === 'default')) {
        groupBooks.push(books[i]);
      }
    }
    
    var groupSection = document.createElement('div');
    groupSection.className = 'group-section';
    groupSection.style.marginBottom = '30px';
    
    var groupHeader = document.createElement('div');
    groupHeader.style.cssText = 'display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; padding-bottom: 8px; border-bottom: 2px solid rgba(0,0,0,0.1);';
    
    var leftPart = document.createElement('div');
    leftPart.style.cssText = 'display: flex; align-items: center; gap: 12px;';
    
    if (group.cover) {
      leftPart.innerHTML = '<div style="width: 32px; height: 32px; border-radius: 8px; background-image: url(\'' + group.cover + '\'); background-size: cover;"></div>';
    } else {
      leftPart.innerHTML = '<div style="font-size: 24px;"></div>';
    }
    leftPart.innerHTML += '<h3 style="margin:0;">' + escapeHtml(group.name) + ' <span style="font-size: 12px; font-weight: normal; opacity: 0.6;">(' + groupBooks.length + '本书)</span></h3>';
    
    // 添加分组菜单按钮（三个点）
    var menuBtn = document.createElement('div');
    menuBtn.className = 'group-menu-btn';
    menuBtn.setAttribute('data-id', group.id);
    menuBtn.innerHTML = '⋯';
    menuBtn.style.cssText = 'cursor: pointer; font-size: 20px; padding: 0 8px; opacity: 0.6; transition: opacity 0.2s;';
    menuBtn.onmouseover = function() { this.style.opacity = '1'; };
    menuBtn.onmouseout = function() { this.style.opacity = '0.6'; };
    menuBtn.onclick = function(e) {
      e.stopPropagation();
      var groupId = this.getAttribute('data-id');
      showGroupMenu(groupId, this);
    };
    
    groupHeader.appendChild(leftPart);
    groupHeader.appendChild(menuBtn);
    groupSection.appendChild(groupHeader);
    
    if (groupBooks.length === 0) {
      var emptyDiv = document.createElement('div');
      emptyDiv.style.cssText = 'padding: 30px; text-align: center; color: #888; background: rgba(0,0,0,0.02); border-radius: 8px; border: 1px dashed #ccc;';
      emptyDiv.innerHTML = '📭 暂无书籍，点击"新建书籍"添加或从其他分组移动书籍到这里';
      groupSection.appendChild(emptyDiv);
    } else {
      var grid = document.createElement('div');
      grid.className = 'books-grid';
      
      for (var i = 0; i < groupBooks.length; i++) {
        var book = groupBooks[i];
        var totalWords = 0, totalChapters = 0;
        if (book.volumes) {
          for (var j = 0; j < book.volumes.length; j++) {
            var v = book.volumes[j];
            if (v && v.chapters) {
              totalChapters += v.chapters.length;
              for (var k = 0; k < v.chapters.length; k++) {
                var c = v.chapters[k];
                if (c && c.content) totalWords += c.content.replace(/<[^>]*>/g, '').length;
              }
            }
          }
        }
        
        var card = document.createElement('div');
        card.className = 'book-card';
        card.style.position = 'relative';
        card.style.cursor = 'pointer';
        card.style.borderRadius = '8px';
        card.style.overflow = 'hidden';
        card.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
        card.style.transition = 'transform 0.2s, box-shadow 0.2s';
        card.style.backgroundColor = '#f5f5f5';
        card.style.width = '100%';
        
        var menuHtml = '<div class="book-menu-btn" data-id="' + book.id + '" style="position: absolute; top: 8px; right: 8px; z-index: 10; background: rgba(0,0,0,0.5); border-radius: 50%; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: white; font-size: 18px;">⋯</div>';
        
        var coverColor = getCoverColorByThemeAndTitle(book.title);
        
        if (book.cover && book.cover !== '') {
          card.innerHTML = menuHtml +
            '<div style="background-image: url(\'' + book.cover + '\'); background-size: cover; background-position: center; aspect-ratio: 1/1.4; display: flex; flex-direction: column; justify-content: flex-end; padding: 16px;">' +
            '<div style="background: rgba(0,0,0,0.5); display: inline-block; padding: 4px 8px; border-radius: 4px; color: white; text-align: center;">' + escapeHtml(book.title || '未命名') + '</div>' +
            '<div style="background: rgba(0,0,0,0.5); display: inline-block; padding: 2px 6px; border-radius: 4px; color: white; font-size: 11px; margin-top: 8px; text-align: center;">' + (book.volumes ? book.volumes.length : 0) + '卷 · ' + totalChapters + '章 · ' + totalWords + '字</div>' +
            '</div>';
        } else {
          card.innerHTML = menuHtml +
            '<div style="background: ' + coverColor + '; aspect-ratio: 1/1.4; display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 16px;">' +
            '<div style="font-size: 48px; margin-bottom: 12px; opacity: 0.7;"></div>' +
            '<div style="font-size: 16px; font-weight: 600; text-align: center; color: white; text-shadow: 0 1px 2px rgba(0,0,0,0.2);">' + escapeHtml(book.title || '未命名') + '</div>' +
            '<div style="font-size: 11px; margin-top: 8px; text-align: center; color: rgba(255,255,255,0.8);">' + (book.volumes ? book.volumes.length : 0) + '卷 · ' + totalChapters + '章 · ' + totalWords + '字</div>' +
            '</div>';
        }
        
        card.onclick = (function(id) {
          return function(e) {
            if (e.target.classList && e.target.classList.contains('book-menu-btn')) return;
            if (typeof openBookTab === 'function') openBookTab(id);
          };
        })(book.id);
        
        grid.appendChild(card);
      }
      groupSection.appendChild(grid);
    }
    container.appendChild(groupSection);
  }
  
  // 绑定书籍菜单按钮事件
  var menuBtns = document.querySelectorAll('.book-menu-btn');
  for (var i = 0; i < menuBtns.length; i++) {
    menuBtns[i].onclick = function(e) {
      e.stopPropagation();
      var bookId = parseInt(this.getAttribute('data-id'));
      showBookMenu(bookId, this);
    };
  }
}

function showBookMenu(bookId, btnElement) {
  var existingMenu = document.querySelector('.book-context-menu');
  if (existingMenu) existingMenu.remove();
  
  var menu = document.createElement('div');
  menu.className = 'book-context-menu';
  menu.style.cssText = 'position: fixed; background: white; border: 1px solid #ddd; border-radius: 8px; padding: 4px 0; box-shadow: 0 2px 8px rgba(0,0,0,0.15); z-index: 1000; min-width: 120px;';
  menu.innerHTML = '<button class="set-cover" data-id="' + bookId + '" style="display: block; width: 100%; padding: 8px 16px; border: none; background: none; cursor: pointer; text-align: left;">设置封面</button>' +
    '<button class="rename-book" data-id="' + bookId + '" style="display: block; width: 100%; padding: 8px 16px; border: none; background: none; cursor: pointer; text-align: left;">重命名</button>' +
    '<button class="move-book" data-id="' + bookId + '" style="display: block; width: 100%; padding: 8px 16px; border: none; background: none; cursor: pointer; text-align: left;"> 移动到分组</button>' +
    '<button class="delete-book" data-id="' + bookId + '" style="display: block; width: 100%; padding: 8px 16px; border: none; background: none; cursor: pointer; text-align: left;"> 删除书籍</button>';
  
  var rect = btnElement.getBoundingClientRect();
  menu.style.top = rect.bottom + 'px';
  menu.style.left = rect.left + 'px';
  document.body.appendChild(menu);
  
  menu.querySelector('.set-cover').onclick = function() {
    setBookCover(bookId);
    menu.remove();
  };
  
  menu.querySelector('.rename-book').onclick = function() {
    renameBookById(bookId);
    menu.remove();
  };
  
  menu.querySelector('.move-book').onclick = function() {
    showMoveToGroupMenu(bookId, menu);
  };
  
  menu.querySelector('.delete-book').onclick = function() {
    deleteBookById(bookId);
    menu.remove();
  };
  
  setTimeout(function() {
    document.addEventListener('click', function closeMenu(e) {
      if (!menu.contains(e.target)) { if(menu.parentNode) menu.remove(); document.removeEventListener('click', closeMenu); }
    });
  }, 100);
}

function setBookCover(bookId) {
  var book = null;
  for (var i = 0; i < books.length; i++) {
    if (books[i].id === bookId) { book = books[i]; break; }
  }
  if (!book) return;
  
  var input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.onchange = function(e) {
    var file = e.target.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function(ev) {
      book.cover = ev.target.result;
      saveAllData();
      renderBooks();
      alert('封面设置成功！');
    };
    reader.readAsDataURL(file);
  };
  input.click();
}

function renameBookById(bookId) {
  var book = null;
  for (var i = 0; i < books.length; i++) {
    if (books[i].id === bookId) { book = books[i]; break; }
  }
  if (book) {
    var newName = prompt('请输入新名称', book.title);
    if (newName && newName.trim()) {
      book.title = newName.trim();
      saveAllData();
      renderBooks();
      var tabId = 'book_' + bookId;
      for (var i = 0; i < openTabs.length; i++) {
        if (openTabs[i].id === tabId) {
          openTabs[i].title = newName.trim();
          renderTabs();
          break;
        }
      }
      alert('重命名成功');
    }
  }
}

function deleteBookById(bookId) {
  if (confirm('确定要删除这本书吗？书籍将移入回收站')) {
    var bookToDelete = null;
    for (var i = 0; i < books.length; i++) {
      if (books[i].id === bookId) {
        bookToDelete = books[i];
        break;
      }
    }
    if (bookToDelete) {
      if (typeof moveToTrash === 'function') moveToTrash(bookToDelete);
      var newBooks = [];
      for (var i = 0; i < books.length; i++) {
        if (books[i].id !== bookId) newBooks.push(books[i]);
      }
      books = newBooks;
      saveAllData();
      renderBooks();
      var tabToClose = 'book_' + bookId;
      for (var i = 0; i < openTabs.length; i++) {
        if (openTabs[i].id === tabToClose) {
          closeTab(tabToClose);
          break;
        }
      }
      alert('书籍已移入回收站');
    }
  }
}

function showMoveToGroupMenu(bookId, parentMenu) {
  parentMenu.innerHTML = '<div style="padding: 8px 12px; font-weight: 500; border-bottom: 1px solid #eee;">移动到分组</div>';
  
  if (typeof loadGroups === 'function') loadGroups();
  if (!groups || groups.length === 0) { groups = [{ id: 'default', name: '默认分组', books: [] }]; }
  
  for (var i = 0; i < groups.length; i++) {
    var group = groups[i];
    var btn = document.createElement('button');
    btn.textContent = group.name;
    btn.style.cssText = 'display: block; width: 100%; padding: 8px 16px; border: none; background: none; cursor: pointer; text-align: left;';
    btn.onclick = (function(gid, gname) {
      return function() {
        moveBookToGroup(bookId, gid);
        if(parentMenu.parentNode) parentMenu.remove();
        alert('已移动到 "' + gname + '" 分组');
      };
    })(group.id, group.name);
    parentMenu.appendChild(btn);
  }
  
  var addGroupBtn = document.createElement('button');
  addGroupBtn.textContent = '+ 新建分组';
  addGroupBtn.style.cssText = 'display: block; width: 100%; padding: 8px 16px; border: none; background: none; cursor: pointer; text-align: left; border-top: 1px solid #eee; color: #007aff;';
  addGroupBtn.onclick = function() {
    if (typeof openNewGroupDrawer === 'function') openNewGroupDrawer();
  };
  parentMenu.appendChild(addGroupBtn);
}

function moveBookToGroup(bookId, groupId) {
  var book = null;
  for (var i = 0; i < books.length; i++) {
    if (books[i].id === bookId) { book = books[i]; break; }
  }
  if (book) {
    book.groupId = groupId;
    saveAllData();
    renderBooks();
  }
}

function renderTabs() {
  var container = document.getElementById('tabsContainer');
  if (!container) return;
  container.innerHTML = '';
  
  var winControls = document.createElement('div');
  winControls.className = 'window-controls';
  winControls.innerHTML = '<div class="window-btn close" title="关闭"></div>' +
    '<div class="window-btn minimize" title="最小化"></div>' +
    '<div class="window-btn maximize" title="最大化"></div>';
  container.appendChild(winControls);
  
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
  newBtn.innerHTML = '+';
  newBtn.id = 'newTabBtn';
  container.appendChild(newBtn);
  
  var tabs = document.querySelectorAll('.tab');
  for (var i = 0; i < tabs.length; i++) {
    tabs[i].onclick = function(e) {
      if (e.target.classList.contains('tab-close')) return;
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
}

function closeTab(tabId) {
  for (var i = 0; i < openTabs.length; i++) {
    if (openTabs[i].id === tabId) { openTabs.splice(i, 1); break; }
  }
  var page = document.querySelector('.book-page[data-page="' + tabId + '"]');
  if (page) page.remove();
  if (activeTabId === tabId) {
    activeTabId = openTabs.length > 0 ? openTabs[openTabs.length - 1].id : 'home';
  }
  renderTabs();
  var activePage = document.querySelector('.book-page[data-page="' + activeTabId + '"]');
  if (activePage) activePage.classList.add('active');
}

function renderTrashContent() {
  if (typeof loadTrash === 'function') loadTrash();
  var container = document.getElementById('trashContent');
  if (!container) return;
  if (!trashBooks || trashBooks.length === 0) {
    container.innerHTML = '<div style="padding: 40px; text-align: center; opacity: 0.6;">回收站为空</div>';
    return;
  }
  var html = '<div style="display: flex; flex-wrap: wrap; gap: 16px;">';
  for (var i = 0; i < trashBooks.length; i++) {
    var book = trashBooks[i];
    html += '<div class="book-card" style="padding: 16px; text-align: center; border: 1px solid #ddd; border-radius: 8px; width: 180px;">' +
      '<div style="font-size: 48px;"></div>' +
      '<div style="font-weight: bold;">' + escapeHtml(book.title) + '</div>' +
      '<div style="font-size: 12px; color: #888;">删除于: ' + new Date(book.deletedTime).toLocaleString() + '</div>' +
      '<div><button class="restore-book-btn" data-id="' + book.id + '" style="margin: 8px; padding: 4px 12px; background: #28a745; color: white; border: none; border-radius: 4px;">恢复</button>' +
      '<button class="permanent-delete-btn" data-id="' + book.id + '" style="padding: 4px 12px; background: #dc3545; color: white; border: none; border-radius: 4px;">永久删除</button></div></div>';
  }
  html += '</div>';
  container.innerHTML = html;
  
  var restoreBtns = document.querySelectorAll('.restore-book-btn');
  for (var i = 0; i < restoreBtns.length; i++) {
    restoreBtns[i].onclick = function(e) {
      e.stopPropagation();
      var bookId = parseInt(this.getAttribute('data-id'));
      if (typeof restoreFromTrash === 'function') {
        var restored = restoreFromTrash(bookId);
        if (restored) { saveAllData(); renderBooks(); if (typeof openTrashTab === 'function') openTrashTab(); alert('书籍已恢复'); }
      }
    };
  }
  var permanentBtns = document.querySelectorAll('.permanent-delete-btn');
  for (var i = 0; i < permanentBtns.length; i++) {
    permanentBtns[i].onclick = function(e) {
      e.stopPropagation();
      if (confirm('确定要永久删除吗？')) {
        var bookId = parseInt(this.getAttribute('data-id'));
        if (typeof permanentDeleteBook === 'function') { permanentDeleteBook(bookId); if (typeof openTrashTab === 'function') openTrashTab(); alert('已永久删除'); }
      }
    };
  }
}

// 拖拽功能
var dragSourceBookId = null;

function enableDragAndDrop() {
  var bookCards = document.querySelectorAll('.book-card');
  for (var i = 0; i < bookCards.length; i++) {
    var card = bookCards[i];
    card.setAttribute('draggable', 'true');
    
    card.ondragstart = function(e) {
      var bookId = this.querySelector('.book-menu-btn') ? 
        this.querySelector('.book-menu-btn').getAttribute('data-id') : null;
      if (bookId) {
        dragSourceBookId = parseInt(bookId);
        e.dataTransfer.setData('text/plain', bookId);
        e.dataTransfer.effectAllowed = 'move';
        this.style.opacity = '0.5';
      }
    };
    
    card.ondragend = function(e) {
      this.style.opacity = '1';
      dragSourceBookId = null;
    };
  }
  
  var groupHeaders = document.querySelectorAll('.group-section');
  for (var i = 0; i < groupHeaders.length; i++) {
    var header = groupHeaders[i];
    
    header.ondragover = function(e) {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      this.style.backgroundColor = 'rgba(0,122,255,0.1)';
    };
    
    header.ondragleave = function(e) {
      this.style.backgroundColor = '';
    };
    
    header.ondrop = function(e) {
      e.preventDefault();
      this.style.backgroundColor = '';
      
      if (!dragSourceBookId) return;
      
      var groupSection = this.closest('.group-section');
      var groupTitle = groupSection.querySelector('h3');
      var groupName = groupTitle ? groupTitle.innerText.split(' (')[0] : '';
      
      var targetGroup = null;
      for (var j = 0; j < groups.length; j++) {
        if (groups[j].name === groupName) {
          targetGroup = groups[j];
          break;
        }
      }
      
      if (targetGroup && dragSourceBookId) {
        var book = null;
        for (var k = 0; k < books.length; k++) {
          if (books[k].id === dragSourceBookId) {
            book = books[k];
            break;
          }
        }
        
        if (book) {
          book.groupId = targetGroup.id;
          saveAllData();
          renderBooks();
          setTimeout(enableDragAndDrop, 100);
          alert('已将 "' + book.title + '" 移动到 "' + targetGroup.name + '" 分组');
        }
      }
      
      dragSourceBookId = null;
    };
  }
}

var originalRenderBooks = renderBooks;
renderBooks = function() {
  originalRenderBooks();
  setTimeout(enableDragAndDrop, 100);
};

window.renderBooks = renderBooks;
window.switchToTab = switchToTab;
window.closeTab = closeTab;
window.renderTrashContent = renderTrashContent;
window.enableDragAndDrop = enableDragAndDrop;
window.showGroupMenu = showGroupMenu;
window.renameGroupById = renameGroupById;
window.deleteGroupById = deleteGroupById;

// 确保分组菜单函数暴露到全局
window.renameGroupById = renameGroupById;
window.deleteGroupById = deleteGroupById;
window.showGroupMenu = showGroupMenu;

// 重命名分组函数
function renameGroupById(groupId) {
  console.log('重命名分组:', groupId);
  var group = null;
  for (var i = 0; i < groups.length; i++) {
    if (groups[i].id == groupId) { group = groups[i]; break; }
  }
  if (group) {
    var newName = prompt('请输入新分组名称', group.name);
    if (newName && newName.trim()) {
      group.name = newName.trim();
      if (typeof saveGroups === 'function') saveGroups();
      renderBooks();
      alert('重命名成功');
    }
  } else {
    console.error('找不到分组:', groupId);
  }
}

// 删除分组函数
function deleteGroupById(groupId) {
  console.log('删除分组:', groupId);
  var group = null;
  for (var i = 0; i < groups.length; i++) {
    if (groups[i].id == groupId) { group = groups[i]; break; }
  }
  if (!group) return;
  
  if (group.name === '默认分组') {
    alert('默认分组不能删除');
    return;
  }
  
  if (confirm('确定要删除分组 "' + group.name + '" 吗？该分组下的书籍将移动到"默认分组"')) {
    var defaultGroup = null;
    for (var i = 0; i < groups.length; i++) {
      if (groups[i].name === '默认分组') {
        defaultGroup = groups[i];
        break;
      }
    }
    if (!defaultGroup) {
      defaultGroup = { id: 'default', name: '默认分组', books: [] };
      groups.push(defaultGroup);
    }
    
    for (var i = 0; i < books.length; i++) {
      if (books[i].groupId == groupId) {
        books[i].groupId = defaultGroup.id;
      }
    }
    
    var newGroups = [];
    for (var i = 0; i < groups.length; i++) {
      if (groups[i].id != groupId) {
        newGroups.push(groups[i]);
      }
    }
    groups = newGroups;
    
    if (typeof saveGroups === 'function') saveGroups();
    saveAllData();
    renderBooks();
    alert('分组已删除，书籍已移至默认分组');
  }
}

// 显示分组菜单
function showGroupMenu(groupId, btnElement) {
  var existingMenu = document.querySelector('.group-context-menu');
  if (existingMenu) existingMenu.remove();
  
  var menu = document.createElement('div');
  menu.className = 'group-context-menu';
  menu.style.cssText = 'position: fixed; background: white; border: 1px solid #ddd; border-radius: 8px; padding: 4px 0; box-shadow: 0 2px 8px rgba(0,0,0,0.15); z-index: 1000; min-width: 120px;';
  menu.innerHTML = '<button class="rename-group" data-id="' + groupId + '" style="display: block; width: 100%; padding: 8px 16px; border: none; background: none; cursor: pointer; text-align: left;">✏️ 重命名分组</button>' +
    '<button class="delete-group" data-id="' + groupId + '" style="display: block; width: 100%; padding: 8px 16px; border: none; background: none; cursor: pointer; text-align: left;">🗑️ 删除分组</button>';
  
  var rect = btnElement.getBoundingClientRect();
  menu.style.top = rect.bottom + 'px';
  menu.style.left = rect.left + 'px';
  document.body.appendChild(menu);
  
  menu.querySelector('.rename-group').onclick = function() {
    renameGroupById(groupId);
    menu.remove();
  };
  
  menu.querySelector('.delete-group').onclick = function() {
    deleteGroupById(groupId);
    menu.remove();
  };
  
  setTimeout(function() {
    document.addEventListener('click', function closeMenu(e) {
      if (!menu.contains(e.target)) {
        if(menu.parentNode) menu.remove();
        document.removeEventListener('click', closeMenu);
      }
    });
  }, 100);
}

// 确保函数暴露到全局
window.renameGroupById = renameGroupById;
window.deleteGroupById = deleteGroupById;
window.showGroupMenu = showGroupMenu;
