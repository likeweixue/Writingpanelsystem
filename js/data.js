// 数据模型
function Volume(id, name, chapters) {
  this.id = id;
  this.name = name;
  this.chapters = chapters || [];
}

function Chapter(id, title, content) { 
  this.id = id; 
  this.title = title; 
  this.content = content; 
  this.createdTime = new Date().toISOString(); 
  this.updatedTime = new Date().toISOString(); 
}

function Book(id, title, volumes) { 
  this.id = id; 
  this.title = title; 
  this.volumes = volumes || [];
  this.createdAt = new Date().toISOString(); 
}

// 全局变量
var books = [];
var settings = { theme: 'default', showGrid: false, fontFamily: 'system-ui', lineHeight: '1.8' };
var openTabs = [{ id: 'home', title: '首页', type: 'home' }];
var activeTabId = 'home';
var currentBookId = null, currentVolumeId = null, currentChapterId = null;
var autoSaveTimer = null;

// 分组
var groups = [];
function loadGroups() {
  var saved = localStorage.getItem('wps_groups');
  if (saved) {
    try { groups = JSON.parse(saved); } catch(e) {}
  }
  if (!groups || groups.length === 0) { groups = [{ id: 'default', name: '默认分组', books: [] }]; }
}
function saveGroups() { localStorage.setItem('wps_groups', JSON.stringify(groups)); }

// 回收站
var trashBooks = [];
function loadTrash() {
  var saved = localStorage.getItem('wps_trash');
  if (saved) {
    try { trashBooks = JSON.parse(saved); } catch(e) {}
  }
  if (!trashBooks) trashBooks = [];
}
function saveTrash() { localStorage.setItem('wps_trash', JSON.stringify(trashBooks)); }
function moveToTrash(book) { book.deletedTime = new Date().toISOString(); trashBooks.push(book); saveTrash(); }
function restoreFromTrash(bookId) {
  for (var i = 0; i < trashBooks.length; i++) {
    if (trashBooks[i].id == bookId) {
      var book = trashBooks[i];
      trashBooks.splice(i, 1);
      books.push(book);
      saveTrash();
      saveAllData();
      return book;
    }
  }
  return null;
}
function permanentDeleteBook(bookId) {
  trashBooks = trashBooks.filter(function(b) { return b.id != bookId; });
  saveTrash();
}

function saveAllData() { 
  localStorage.setItem('wps_data', JSON.stringify({ books: books, settings: settings })); 
}
