// 主题设置函数
function applyTheme(theme) {
  var themeLink = document.getElementById('themeStyle');
  if (themeLink) {
    themeLink.href = 'themes/' + theme + '.css';
  }
  
  // 更新预设按钮的激活状态
  var presets = document.querySelectorAll('.color-preset');
  for (var i = 0; i < presets.length; i++) {
    if (presets[i].dataset.theme === theme) {
      presets[i].classList.add('active');
    } else {
      presets[i].classList.remove('active');
    }
  }
  
  settings.theme = theme;
  saveAllData();
}

function applyGridLine(show) {
  var editor = document.getElementById('editor');
  if (editor) {
    if (show) editor.classList.add('show-grid');
    else editor.classList.remove('show-grid');
  }
  var checkbox = document.getElementById('gridLinesCheckbox');
  if (checkbox) checkbox.checked = show;
  settings.showGrid = show;
  saveAllData();
}

function applyFontFamily(font) {
  var editor = document.getElementById('editor');
  if (editor) editor.style.fontFamily = font;
  var options = document.querySelectorAll('.font-option');
  for (var i = 0; i < options.length; i++) {
    if (options[i].dataset.font === font) options[i].classList.add('active');
    else options[i].classList.remove('active');
  }
  settings.fontFamily = font;
  saveAllData();
}

function applyLineHeight(height) {
  var editor = document.getElementById('editor');
  if (editor) editor.style.lineHeight = height;
  var select = document.getElementById('lineHeightSelect');
  if (select) select.value = height;
  settings.lineHeight = height;
  saveAllData();
}

function manualBackup() { 
  var backup = localStorage.getItem('wps_data');
  if (backup) {
    localStorage.setItem('wps_backup', backup);
    alert('已备份到浏览器');
  }
}

function restoreBackup() { 
  var b = localStorage.getItem('wps_backup'); 
  if(b){ 
    localStorage.setItem('wps_data', b); 
    location.reload(); 
  } else alert('无备份'); 
}

function updateStats() {
  var now = new Date(), todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  var today = 0, week = 0, month = 0, total = 0;
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
  
  var goal = parseInt(localStorage.getItem('dailyGoal') || 0);
  if (goal > 0) {
    var percent = Math.min(100, (today / goal) * 100);
    var fillBar = document.querySelector('.progress-fill');
    if (fillBar) fillBar.style.width = percent + '%';
    var msgEl = document.getElementById('goalMessage');
    if (msgEl) msgEl.innerText = '今日 ' + today + '/' + goal + ' 字 (' + Math.floor(percent) + '%)';
  }
}

function prevMonth() {
  if (typeof window.currentCalendarDate !== 'undefined') {
    window.currentCalendarDate.setMonth(window.currentCalendarDate.getMonth() - 1);
    renderCalendar();
  }
}

function nextMonth() {
  if (typeof window.currentCalendarDate !== 'undefined') {
    window.currentCalendarDate.setMonth(window.currentCalendarDate.getMonth() + 1);
    renderCalendar();
  }
}

function renderCalendar() {
  if (!window.currentCalendarDate) return;
  var year = window.currentCalendarDate.getFullYear();
  var month = window.currentCalendarDate.getMonth();
  var monthNames = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
  var titleEl = document.getElementById('calendarMonth');
  if (titleEl) titleEl.innerText = year + '年 ' + monthNames[month];
}

// 确保函数暴露到全局
window.applyTheme = applyTheme;
window.applyGridLine = applyGridLine;
window.applyFontFamily = applyFontFamily;
window.applyLineHeight = applyLineHeight;
window.manualBackup = manualBackup;
window.restoreBackup = restoreBackup;
window.updateStats = updateStats;
window.prevMonth = prevMonth;
window.nextMonth = nextMonth;
window.renderCalendar = renderCalendar;
window.currentCalendarDate = new Date();

// 保存原始 applyTheme 函数
var originalApplyTheme = applyTheme;

// 重新定义 applyTheme，添加更新书籍封面功能
applyTheme = function(theme) {
  // 调用原始函数切换主题
  originalApplyTheme(theme);
  
  // 更新书籍封面颜色
  if (typeof updateBookCoverColors === 'function') {
    setTimeout(updateBookCoverColors, 100);
  }
  
  // 重新渲染书籍以确保颜色更新
  if (typeof renderBooks === 'function') {
    renderBooks();
  }
};

// 暴露到全局
window.applyTheme = applyTheme;
