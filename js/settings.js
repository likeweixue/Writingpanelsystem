// ========== 设置界面 - 合并备份和安全（胶囊风格） ==========

var settingsData = {
    theme: 'default',
    bgImage: null,
    bgOpacity: 30,
    customCss: '',
    globalTextColor: '#333333'
};

function loadSettings() {
    var saved = localStorage.getItem('app_settings');
    if (saved) {
        try { var data = JSON.parse(saved); settingsData = data; } catch(e) {}
    }
    applyTheme(settingsData.theme);
    applyBackground();
    applyCustomCss();
    applyGlobalTextColor();
}

function saveSettings() {
    localStorage.setItem('app_settings', JSON.stringify(settingsData));
}

function applyTheme(theme) {
    var link = document.getElementById('themeStyle');
    if (link) link.href = 'themes/' + theme + '.css';
    document.body.classList.remove('theme-default', 'theme-eye', 'theme-warm', 'theme-dark', 'theme-open');
    document.body.classList.add('theme-' + theme);
    settingsData.theme = theme;
    saveSettings();
}

function applyBackground() {
    var oldStyle = document.getElementById('user-bg-style');
    if (oldStyle) oldStyle.remove();
    if (settingsData.bgImage) {
        var style = document.createElement('style');
        style.id = 'user-bg-style';
        style.textContent = 'body::before { content: ""; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background-image: url(' + JSON.stringify(settingsData.bgImage) + '); background-size: cover; background-position: center; opacity: ' + (settingsData.bgOpacity / 100) + '; z-index: -1; pointer-events: none; } .page, .sidebar-menu, .main-content, .book-detail-page { background: transparent !important; }';
        document.head.appendChild(style);
    }
}

function applyCustomCss() {
    var oldStyle = document.getElementById('user-css-style');
    if (oldStyle) oldStyle.remove();
    if (settingsData.customCss && settingsData.customCss.trim()) {
        var style = document.createElement('style');
        style.id = 'user-css-style';
        style.textContent = settingsData.customCss;
        document.head.appendChild(style);
    }
}

function applyGlobalTextColor() {
    var oldStyle = document.getElementById('global-text-style');
    if (oldStyle) oldStyle.remove();
    if (settingsData.globalTextColor) {
        var style = document.createElement('style');
        style.id = 'global-text-style';
        style.textContent = '* { color: ' + settingsData.globalTextColor + ' !important; }';
        document.head.appendChild(style);
    }
}

// ========== 备份功能 ==========
var backupSettings = {
    autoBackup: true,
    backupPath: '',
    backupInterval: 5
};

function loadBackupSettings() {
    var saved = localStorage.getItem('openwrite_backup_settings');
    if (saved) {
        try { backupSettings = JSON.parse(saved); } catch(e) {}
    }
    if (!backupSettings.backupPath) {
        backupSettings.backupPath = '~/Documents/写作帮手备份';
    }
}

function saveBackupSettings() {
    localStorage.setItem('openwrite_backup_settings', JSON.stringify(backupSettings));
}

function performBackup() {
    if (!books || books.length === 0) {
        // 静默处理，不弹出提示
        console.log('没有书籍需要备份');
        return;
    }
    
    if (window.electron && window.electron.backupAllBooks) {
        // 静默备份，不显示提示框
        window.electron.backupAllBooks(books).then(function(results) {
            var successCount = 0;
            for (var i = 0; i < results.length; i++) {
                if (results[i].success) successCount++;
            }
            // 只在控制台输出，不弹窗
            console.log('备份完成，成功 ' + successCount + '/' + results.length + ' 本书籍');
        }).catch(function(err) {
            console.error('备份失败:', err);
        });
    } else {
        // 网页版备份 - 静默
        var today = new Date();
        var dateFolder = today.getFullYear() + '' + String(today.getMonth() + 1).padStart(2,'0') + String(today.getDate()).padStart(2,'0');
        var backupData = { backupTime: new Date().toISOString(), books: books, groups: groups };
        localStorage.setItem('openwrite_backup_' + dateFolder, JSON.stringify(backupData));
        console.log('备份完成，备份时间：' + new Date().toLocaleString());
    }
}

function openBackupFolder() {
    if (window.electron && window.electron.openBackupFolder) {
        window.electron.openBackupFolder().then(result => {
            if (!result.success) {
                alert('备份文件夹不存在，请先执行备份');
            }
        });
    } else {
        alert('此功能仅在桌面应用中可用');
    }
}

function refreshBackupList() {
    var container = document.getElementById('backupList');
    if (!container) return;
    var backups = [];
    for (var i = 0; i < localStorage.length; i++) {
        var key = localStorage.key(i);
        if (key && key.indexOf('openwrite_backup_') === 0 && key !== 'openwrite_backup_settings') {
            try { var data = JSON.parse(localStorage.getItem(key)); backups.push({ key: key, time: data.backupTime }); } catch(e) {}
        }
    }
    if (backups.length === 0) {
        container.innerHTML = '<p style="color: #888; text-align: center; padding: 20px;">暂无备份记录</p>';
        return;
    }
    backups.sort(function(a, b) { return new Date(b.time) - new Date(a.time); });
    var html = '';
    for (var i = 0; i < backups.length; i++) {
        var date = new Date(backups[i].time).toLocaleString();
        html += '<div style="display: flex; justify-content: space-between; align-items: center; padding: 8px; border-bottom: 1px solid #eee;"><span>备份时间：' + date + '</span><button class="restore-backup-btn" data-key="' + backups[i].key + '" style="padding: 4px 12px; background: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer;">恢复</button></div>';
    }
    container.innerHTML = html;
    var restoreBtns = document.querySelectorAll('.restore-backup-btn');
    for (var i = 0; i < restoreBtns.length; i++) {
        restoreBtns[i].onclick = function() { restoreBackup(this.getAttribute('data-key')); };
    }
}

function restoreBackup(key) {
    if (confirm('确定要恢复这个备份吗？当前数据将被覆盖！')) {
        var data = JSON.parse(localStorage.getItem(key));
        if (data && data.books) {
            books = data.books;
            if (data.groups) groups = data.groups;
            saveAllData();
            renderBooks();
            alert('备份恢复成功');
        }
    }
}

var autoBackupTimer = null;
function startAutoBackup() {
    if (autoBackupTimer) clearInterval(autoBackupTimer);
    autoBackupTimer = setInterval(function() { performBackup(); }, backupSettings.backupInterval * 60 * 1000);
}
function stopAutoBackup() {
    if (autoBackupTimer) { clearInterval(autoBackupTimer); autoBackupTimer = null; }
}
if (backupSettings.autoBackup) startAutoBackup();

// ========== 密码保护功能 ==========
var passwordSettings = { enabled: false, password: '', question: '', answer: '' };
function loadPasswordSettings() {
    var saved = localStorage.getItem('openwrite_password_settings');
    if (saved) { try { passwordSettings = JSON.parse(saved); } catch(e) {} }
}
function savePasswordSettings() { localStorage.setItem('openwrite_password_settings', JSON.stringify(passwordSettings)); }
function checkPassword() {
    if (!passwordSettings.enabled) return true;
    var input = prompt('请输入密码：');
    if (input === passwordSettings.password) return true;
    alert('密码错误');
    return false;
}
setTimeout(function() { loadPasswordSettings(); if (passwordSettings.enabled) checkPassword(); }, 100);

// ========== 渲染设置页面（合并版） ==========
function renderSettingsPage() {
    var container = document.getElementById('settingsContainer');
    if (!container) return;
    
    loadBackupSettings();
    loadPasswordSettings();
    
    container.innerHTML = `
        <div style="height: 100%; background: transparent; padding: 24px; overflow-y: auto;">
            <!-- 标题卡片 - 胶囊风格 -->
            <div style="background: rgba(255,255,255,0.6); backdrop-filter: blur(10px); border-radius: 28px; padding: 16px 20px; margin-bottom: 20px;">
                <h2 style="font-size: 20px; margin-bottom: 4px;">⚙️ 设置</h2>
                <p style="color: #888; font-size: 13px;">个性化设置和数据管理</p>
            </div>
            
            <!-- 备份设置卡片 -->
            <div style="background: rgba(255,255,255,0.6); backdrop-filter: blur(10px); border-radius: 28px; padding: 20px; margin-bottom: 20px;">
                <h3 style="font-size: 18px; margin-bottom: 16px;">💾 备份设置</h3>
                <div style="background: #fff; border-radius: 24px; padding: 20px;">
                    <div style="margin-bottom: 20px;">
                        <label style="display: flex; align-items: center; gap: 12px; cursor: pointer;">
                            <input type="checkbox" id="autoBackupCheckbox" ${backupSettings.autoBackup ? 'checked' : ''} style="width: 18px; height: 18px;">
                            <span style="font-weight: 500;">启用自动备份</span>
                        </label>
                    </div>
                    <div style="margin-bottom: 20px;">
                        <label style="display: block; margin-bottom: 8px; font-weight: 500;">备份间隔</label>
                        <select id="backupIntervalSelect" style="width: 100%; padding: 12px; border-radius: 40px; border: 1px solid #ddd; background: #f8f8f8;">
                            <option value="5" ${backupSettings.backupInterval === 5 ? 'selected' : ''}>5分钟</option>
                            <option value="10" ${backupSettings.backupInterval === 10 ? 'selected' : ''}>10分钟</option>
                            <option value="30" ${backupSettings.backupInterval === 30 ? 'selected' : ''}>30分钟</option>
                            <option value="60" ${backupSettings.backupInterval === 60 ? 'selected' : ''}>1小时</option>
                        </select>
                    </div>
                    <button id="manualBackupBtn" style="width: 100%; padding: 12px; background: #9b784e; color: white; border: none; border-radius: 40px; cursor: pointer; margin-bottom: 12px;">📦 立即备份</button>
                    <button id="openBackupFolderBtn" style="width: 100%; padding: 12px; background: #6c757d; color: white; border: none; border-radius: 40px; cursor: pointer;">📁 打开备份文件夹</button>
                </div>
            </div>
            
            <!-- 恢复备份卡片 -->
            <div style="background: rgba(255,255,255,0.6); backdrop-filter: blur(10px); border-radius: 28px; padding: 20px; margin-bottom: 20px;">
                <h3 style="font-size: 18px; margin-bottom: 16px;">🔄 恢复备份</h3>
                <div style="background: #fff; border-radius: 24px; padding: 20px;">
                    <div id="backupList" style="margin-bottom: 16px; max-height: 200px; overflow-y: auto;">
                        <p style="color: #888; text-align: center; padding: 20px;">暂无备份记录</p>
                    </div>
                    <button id="refreshBackupListBtn" style="width: 100%; padding: 12px; background: #6c757d; color: white; border: none; border-radius: 40px; cursor: pointer;">🔄 刷新列表</button>
                </div>
            </div>
            
            <!-- 安全设置卡片 -->
            <div style="background: rgba(255,255,255,0.6); backdrop-filter: blur(10px); border-radius: 28px; padding: 20px;">
                <h3 style="font-size: 18px; margin-bottom: 16px;">🔒 安全设置</h3>
                <div style="background: #fff; border-radius: 24px; padding: 20px;">
                    <div style="margin-bottom: 20px;">
                        <label style="display: flex; align-items: center; gap: 12px; cursor: pointer; margin-bottom: 16px;">
                            <input type="checkbox" id="enablePasswordCheckbox" ${passwordSettings.enabled ? 'checked' : ''} style="width: 18px; height: 18px;">
                            <span style="font-weight: 500;">启用启动密码</span>
                        </label>
                        <div id="passwordSettingsDiv" style="${passwordSettings.enabled ? 'display: block;' : 'display: none;'}">
                            <label style="display: block; margin-bottom: 8px; font-weight: 500;">设置密码</label>
                            <input type="password" id="passwordInput" value="${passwordSettings.password}" placeholder="请输入密码" style="width: 100%; padding: 12px; border-radius: 40px; border: 1px solid #ddd; background: #f8f8f8;">
                        </div>
                    </div>
                    
                    <div style="margin-bottom: 20px;">
                        <label style="display: block; margin-bottom: 8px; font-weight: 500;">密保问题</label>
                        <input type="text" id="securityQuestionInput" value="${passwordSettings.question}" placeholder="例如：你的出生地是？" style="width: 100%; padding: 12px; border-radius: 40px; border: 1px solid #ddd; margin-bottom: 16px; background: #f8f8f8;">
                        
                        <label style="display: block; margin-bottom: 8px; font-weight: 500;">密保答案</label>
                        <input type="text" id="securityAnswerInput" value="${passwordSettings.answer}" placeholder="请输入答案" style="width: 100%; padding: 12px; border-radius: 40px; border: 1px solid #ddd; margin-bottom: 24px; background: #f8f8f8;">
                    </div>
                    
                    <button id="saveSecurityBtn" style="width: 100%; padding: 12px; background: #9b784e; color: white; border: none; border-radius: 40px; cursor: pointer; margin-bottom: 12px;">💾 保存设置</button>
                    <button id="forgotPasswordBtn" style="width: 100%; padding: 12px; background: #6c757d; color: white; border: none; border-radius: 40px; cursor: pointer;">❓ 忘记密码</button>
                </div>
            </div>
        </div>
    `;
    
    // 绑定备份事件
    var autoCheckbox = document.getElementById('autoBackupCheckbox');
    var intervalSelect = document.getElementById('backupIntervalSelect');
    var manualBtn = document.getElementById('manualBackupBtn');
    var refreshBtn = document.getElementById('refreshBackupListBtn');
    var openFolderBtn = document.getElementById('openBackupFolderBtn');
    
    if (autoCheckbox) {
        autoCheckbox.onchange = function(e) {
            backupSettings.autoBackup = e.target.checked;
            saveBackupSettings();
            if (backupSettings.autoBackup) startAutoBackup();
            else stopAutoBackup();
        };
    }
    if (intervalSelect) {
        intervalSelect.onchange = function(e) {
            backupSettings.backupInterval = parseInt(e.target.value);
            saveBackupSettings();
            stopAutoBackup();
            if (backupSettings.autoBackup) startAutoBackup();
        };
    }
    if (manualBtn) manualBtn.onclick = performBackup;
    if (refreshBtn) refreshBtn.onclick = refreshBackupList;
    if (openFolderBtn && typeof openBackupFolder === 'function') openFolderBtn.onclick = openBackupFolder;
    
    // 绑定安全事件
    var enableCheckbox = document.getElementById('enablePasswordCheckbox');
    var passwordDiv = document.getElementById('passwordSettingsDiv');
    var passwordInput = document.getElementById('passwordInput');
    var questionInput = document.getElementById('securityQuestionInput');
    var answerInput = document.getElementById('securityAnswerInput');
    var saveSecurityBtn = document.getElementById('saveSecurityBtn');
    var forgotBtn = document.getElementById('forgotPasswordBtn');
    
    if (enableCheckbox) {
        enableCheckbox.onchange = function(e) {
            if (passwordDiv) passwordDiv.style.display = e.target.checked ? 'block' : 'none';
            passwordSettings.enabled = e.target.checked;
            savePasswordSettings();
        };
    }
    if (saveSecurityBtn) {
        saveSecurityBtn.onclick = function() {
            if (enableCheckbox.checked && passwordInput.value) {
                passwordSettings.enabled = true;
                passwordSettings.password = passwordInput.value;
            } else {
                passwordSettings.enabled = false;
                passwordSettings.password = '';
            }
            passwordSettings.question = questionInput ? questionInput.value : '';
            passwordSettings.answer = answerInput ? answerInput.value : '';
            savePasswordSettings();
            alert('安全设置已保存');
        };
    }
    if (forgotBtn) {
        forgotBtn.onclick = function() {
            if (passwordSettings.question && passwordSettings.answer) {
                var answer = prompt('密保问题：' + passwordSettings.question);
                if (answer === passwordSettings.answer) {
                    var newPassword = prompt('请输入新密码：');
                    if (newPassword) {
                        passwordSettings.password = newPassword;
                        if (passwordInput) passwordInput.value = newPassword;
                        savePasswordSettings();
                        alert('密码已重置');
                    }
                } else alert('答案错误');
            } else alert('请先设置密保问题');
        };
    }
    
    refreshBackupList();
}

loadSettings();
setTimeout(renderSettingsPage, 100);