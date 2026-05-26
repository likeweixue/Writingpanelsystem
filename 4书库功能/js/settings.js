// ========== 设置界面 - 左右布局 ==========

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
        alert('没有书籍需要备份');
        return;
    }
    
    // 检查是否在 Electron 环境中
    if (window.electron && window.electron.backupAllBooks) {
        // 使用 Electron 备份到文档文件夹
        alert('正在备份到文档文件夹，请稍候...');
        
        window.electron.backupAllBooks(books).then(results => {
            let successCount = 0;
            let message = '';
            for (var i = 0; i < results.length; i++) {
                var r = results[i];
                if (r.success) {
                    successCount++;
                    message += `✅ ${r.bookName}: ${r.chapterCount}章, ${r.totalWords}字\n`;
                } else {
                    message += `❌ ${r.bookName}: 备份失败\n`;
                }
            }
            alert(`备份完成！\n成功备份 ${successCount}/${results.length} 本书籍\n\n备份位置：~/Documents/写作帮手备份/\n\n${message}`);
        }).catch(err => {
            alert('备份失败：' + err.message);
        });
    } else {
        // 浏览器环境降级到 localStorage
        var today = new Date();
        var dateStr = today.getFullYear() + '年' + (today.getMonth() + 1) + '月' + today.getDate() + '日';
        var dateFolder = today.getFullYear() + '' + String(today.getMonth() + 1).padStart(2,'0') + String(today.getDate()).padStart(2,'0');
        var backupData = { backupTime: new Date().toISOString(), books: books, groups: groups };
        localStorage.setItem('openwrite_backup_' + dateFolder, JSON.stringify(backupData));
        alert('备份完成！备份时间：' + dateStr + '\n（存储在浏览器中，打包后会自动备份到文档文件夹）');
    }
}

// 添加打开备份文件夹的功能
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
        container.innerHTML = '<p style="color: #888;">暂无备份记录</p>';
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

// ========== 渲染各个标签页内容 ==========
function renderThemeUI() {
    var container = document.getElementById('settingsTabContent');
    if (!container) return;
    container.innerHTML = `
        <h3 style="margin-bottom: 20px;">预设主题</h3>
        <div style="display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 24px;">
            <button class="theme-preset-btn" data-theme="default" style="padding: 10px 20px; border-radius: 12px; background: #f0f0f0; border: none; cursor: pointer;">默认白</button>
            <button class="theme-preset-btn" data-theme="eye" style="padding: 10px 20px; border-radius: 12px; background: #C8DBC5; border: none; cursor: pointer;">护眼绿</button>
            <button class="theme-preset-btn" data-theme="warm" style="padding: 10px 20px; border-radius: 12px; background: #DFD5BD; border: none; cursor: pointer;">经典黄</button>
            <button class="theme-preset-btn" data-theme="dark" style="padding: 10px 20px; border-radius: 12px; background: #1e1e2e; color: white; border: none; cursor: pointer;">暗夜黑</button>
            <button class="theme-preset-btn" data-theme="open" style="padding: 10px 20px; border-radius: 24px; background: #f5f5f7; border: none; cursor: pointer;">Open圆润</button>
        </div>
        <h3 style="margin-bottom: 20px;">全局文字颜色</h3>
        <input type="color" id="globalTextColor" value="${settingsData.globalTextColor}" style="width: 60px; height: 40px; cursor: pointer;">
    `;
    var themeBtns = document.querySelectorAll('.theme-preset-btn');
    for (var i = 0; i < themeBtns.length; i++) {
        themeBtns[i].onclick = function() { applyTheme(this.getAttribute('data-theme')); };
    }
    var colorPicker = document.getElementById('globalTextColor');
    if (colorPicker) {
        colorPicker.onchange = function() {
            settingsData.globalTextColor = this.value;
            applyGlobalTextColor();
            saveSettings();
        };
    }
}

function renderBackgroundUI() {
    var container = document.getElementById('settingsTabContent');
    if (!container) return;
    container.innerHTML = `
        <h3 style="margin-bottom: 20px;">自定义背景图片</h3>
        <input type="file" id="bgUploadSetting" accept="image/*" style="margin-bottom: 16px;">
        <div id="bgPreviewSetting" style="width:100%; height:150px; background:#ddd; border-radius:12px; margin-bottom:16px; background-size:cover; background-position:center;"></div>
        <div style="margin-bottom: 16px;"><span>透明度: <span id="opacityValSetting">${settingsData.bgOpacity}</span>%</span><input type="range" id="opacitySliderSetting" min="0" max="100" value="${settingsData.bgOpacity}" style="width:100%; margin-top:8px;"></div>
        <button id="clearBgSettingBtn" class="btn-danger" style="padding: 8px 16px; background: #dc3545; color: white; border: none; border-radius: 8px; cursor: pointer;">清除背景</button>
    `;
    if (settingsData.bgImage) document.getElementById('bgPreviewSetting').style.backgroundImage = 'url(' + settingsData.bgImage + ')';
    document.getElementById('bgUploadSetting').onchange = function(e) {
        var file = e.target.files[0];
        if (file) {
            var reader = new FileReader();
            reader.onload = function(ev) {
                settingsData.bgImage = ev.target.result;
                document.getElementById('bgPreviewSetting').style.backgroundImage = 'url(' + settingsData.bgImage + ')';
                applyBackground();
                saveSettings();
            };
            reader.readAsDataURL(file);
        }
    };
    document.getElementById('opacitySliderSetting').oninput = function() {
        var val = parseInt(this.value);
        document.getElementById('opacityValSetting').innerText = val;
        settingsData.bgOpacity = val;
        applyBackground();
        saveSettings();
    };
    document.getElementById('clearBgSettingBtn').onclick = function() {
        settingsData.bgImage = null;
        document.getElementById('bgPreviewSetting').style.backgroundImage = '';
        applyBackground();
        saveSettings();
    };
}

function renderCssUI() {
    var container = document.getElementById('settingsTabContent');
    if (!container) return;
    container.innerHTML = `
        <h3 style="margin-bottom: 20px;">自定义CSS</h3>
        <textarea id="customCssSetting" rows="12" style="width:100%; padding:16px; font-family: monospace; border-radius: 12px; border: 1px solid #ddd; resize: vertical;">${settingsData.customCss.replace(/</g, '&lt;')}</textarea>
        <button id="saveCssSettingBtn" class="btn-primary" style="margin-top: 16px; padding: 10px 20px; background: #007aff; color: white; border: none; border-radius: 8px; cursor: pointer;">保存CSS</button>
    `;
    document.getElementById('saveCssSettingBtn').onclick = function() {
        settingsData.customCss = document.getElementById('customCssSetting').value;
        applyCustomCss();
        saveSettings();
        alert('CSS已保存');
    };
}

function renderBackupSettingsUI() {
    var container = document.getElementById('settingsTabContent');
    if (!container) return;
    loadBackupSettings();
    container.innerHTML = `
        <h3 style="margin-bottom: 20px;">备份设置</h3>
        <div style="margin-bottom: 24px; padding: 16px; background: rgba(0,0,0,0.03); border-radius: 12px;">
            <h4>自动备份</h4>
            <label style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;"><input type="checkbox" id="autoBackupCheckbox" ${backupSettings.autoBackup ? 'checked' : ''}><span>启用自动备份</span></label>
            <div style="margin-bottom: 12px;"><label>备份间隔（分钟）：</label><select id="backupIntervalSelect" style="width: 100%; padding: 8px; margin-top: 8px;"><option value="5" ${backupSettings.backupInterval === 5 ? 'selected' : ''}>5分钟</option><option value="10" ${backupSettings.backupInterval === 10 ? 'selected' : ''}>10分钟</option><option value="30" ${backupSettings.backupInterval === 30 ? 'selected' : ''}>30分钟</option><option value="60" ${backupSettings.backupInterval === 60 ? 'selected' : ''}>1小时</option></select></div>
            <button id="manualBackupBtn" class="btn-primary" style="margin-top: 12px; width:100%;">📦 立即备份</button>
            <button id="openBackupFolderBtn" class="btn-secondary" style="margin-top: 8px; width:100%; background:#6c757d;">📁 打开备份文件夹</button>
        </div>
        <div style="padding: 16px; background: rgba(0,0,0,0.03); border-radius: 12px;">
            <h4>恢复备份</h4>
            <div id="backupList" style="margin-bottom: 12px;"><p style="color: #888;">暂无备份记录</p></div>
            <button id="refreshBackupListBtn" class="btn-secondary">刷新列表</button>
        </div>
    `;
    
    document.getElementById('autoBackupCheckbox').onchange = function(e) {
        backupSettings.autoBackup = e.target.checked;
        saveBackupSettings();
        if (backupSettings.autoBackup) startAutoBackup();
        else stopAutoBackup();
    };
    document.getElementById('backupIntervalSelect').onchange = function(e) {
        backupSettings.backupInterval = parseInt(e.target.value);
        saveBackupSettings();
        stopAutoBackup();
        if (backupSettings.autoBackup) startAutoBackup();
    };
    document.getElementById('manualBackupBtn').onclick = performBackup;
    document.getElementById('refreshBackupListBtn').onclick = refreshBackupList;
    document.getElementById('openBackupFolderBtn').onclick = openBackupFolder;
    refreshBackupList();
}

function renderSecuritySettingsUI() {
    var container = document.getElementById('settingsTabContent');
    if (!container) return;
    loadPasswordSettings();
    container.innerHTML = `
        <h3 style="margin-bottom: 20px;">安全设置</h3>
        <div style="margin-bottom: 24px; padding: 16px; background: rgba(0,0,0,0.03); border-radius: 12px;">
            <h4>密码保护</h4>
            <label style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;"><input type="checkbox" id="enablePasswordCheckbox" ${passwordSettings.enabled ? 'checked' : ''}><span>启用启动密码</span></label>
            <div id="passwordSettingsDiv" style="${passwordSettings.enabled ? 'display: block;' : 'display: none;'}"><div style="margin-bottom: 12px;"><label>设置密码：</label><input type="password" id="passwordInput" value="${passwordSettings.password}" placeholder="请输入密码" style="width: 100%; padding: 8px; border-radius: 6px; border: 1px solid #ddd;"></div></div>
            <button id="savePasswordBtn" class="btn-primary" style="margin-top: 12px;">保存密码设置</button>
        </div>
        <div style="padding: 16px; background: rgba(0,0,0,0.03); border-radius: 12px;">
            <h4>密保问题</h4>
            <div style="margin-bottom: 12px;"><label>密保问题：</label><input type="text" id="securityQuestionInput" value="${passwordSettings.question}" placeholder="例如：你的出生地是？" style="width: 100%; padding: 8px; border-radius: 6px; border: 1px solid #ddd;"></div>
            <div style="margin-bottom: 12px;"><label>密保答案：</label><input type="text" id="securityAnswerInput" value="${passwordSettings.answer}" placeholder="请输入答案" style="width: 100%; padding: 8px; border-radius: 6px; border: 1px solid #ddd;"></div>
            <button id="saveSecurityBtn" class="btn-primary" style="margin-top: 12px;">保存密保设置</button>
            <button id="forgotPasswordBtn" class="btn-secondary" style="margin-top: 12px; margin-left: 12px;">忘记密码？</button>
        </div>
    `;
    var enableCheckbox = document.getElementById('enablePasswordCheckbox');
    var passwordDiv = document.getElementById('passwordSettingsDiv');
    var passwordInput = document.getElementById('passwordInput');
    if (enableCheckbox) {
        enableCheckbox.onchange = function(e) {
            passwordDiv.style.display = e.target.checked ? 'block' : 'none';
            passwordSettings.enabled = e.target.checked;
            savePasswordSettings();
        };
    }
    document.getElementById('savePasswordBtn').onclick = function() {
        if (enableCheckbox.checked && passwordInput.value) {
            passwordSettings.enabled = true;
            passwordSettings.password = passwordInput.value;
        } else {
            passwordSettings.enabled = false;
            passwordSettings.password = '';
        }
        savePasswordSettings();
        alert('密码设置已保存');
    };
    document.getElementById('saveSecurityBtn').onclick = function() {
        passwordSettings.question = document.getElementById('securityQuestionInput').value;
        passwordSettings.answer = document.getElementById('securityAnswerInput').value;
        savePasswordSettings();
        alert('密保问题已保存');
    };
    document.getElementById('forgotPasswordBtn').onclick = function() {
        if (passwordSettings.question && passwordSettings.answer) {
            var answer = prompt('密保问题：' + passwordSettings.question);
            if (answer === passwordSettings.answer) {
                var newPassword = prompt('请输入新密码：');
                if (newPassword) {
                    passwordSettings.password = newPassword;
                    savePasswordSettings();
                    alert('密码已重置');
                }
            } else alert('答案错误');
        } else alert('请先设置密保问题');
    };
}

function renderSettingsPage() {
    var container = document.getElementById('settingsContainer');
    if (!container) return;
    
        // 菜单分类：只保留备份和安全
    var categories = [
        { id: 'backup', name: '备份', icon: '💾' },
        { id: 'security', name: '安全', icon: '🔒' }
    ];
    var activeCategory = localStorage.getItem('settings_active_tab') || 'backup';
    
    container.innerHTML = `
        <div style="display: flex; height: 100%; min-height: 500px; background: #fff; border-radius: 16px; overflow: hidden;">
            <div style="width: 160px; background: #f8f6f2; border-right: 1px solid #eee; padding: 20px 0;">
                ${categories.map(cat => `
                    <div class="settings-tab" data-tab="${cat.id}" style="padding: 12px 20px; cursor: pointer; ${activeCategory === cat.id ? 'background: #e8e0d4; font-weight: 600; border-left: 3px solid #ceb087;' : 'color: #666;'}">
                        ${cat.icon} ${cat.name}
                    </div>
                `).join('')}
            </div>
            <div id="settingsTabContent" style="flex: 1; padding: 24px; overflow-y: auto;">
                加载中...
            </div>
        </div>
    `;
    
    // 定义子菜单
        // 定义子菜单（备份和安全）
    var subMenus = {
        backup: [
            { id: 'backup_main', name: '备份设置', render: renderBackupSettingsUI }
        ],
        security: [
            { id: 'security_main', name: '安全设置', render: renderSecuritySettingsUI }
        ]
    };
    
    var currentSub = localStorage.getItem('settings_sub_tab') || 'theme';
    
    function renderSubMenu() {
        var subs = subMenus[activeCategory] || [];
        var subContainer = document.createElement('div');
        subContainer.style.cssText = 'width: 140px; border-right: 1px solid #eee; padding: 16px 0;';
        subContainer.innerHTML = subs.map(sub => `
            <div class="settings-sub-tab" data-sub="${sub.id}" style="padding: 10px 16px; cursor: pointer; ${currentSub === sub.id ? 'background: #e8e0d4; font-weight: 500; border-left: 2px solid #ceb087;' : 'color: #666;'}">
                ${sub.name}
            </div>
        `).join('');
        
        var contentArea = document.getElementById('settingsTabContent');
        var oldSubMenu = contentArea.querySelector('.settings-sub-menu');
        if (oldSubMenu) oldSubMenu.remove();
        
        contentArea.insertBefore(subContainer, contentArea.firstChild);
        subContainer.className = 'settings-sub-menu';
        
        var subBtns = document.querySelectorAll('.settings-sub-tab');
        for (var i = 0; i < subBtns.length; i++) {
            subBtns[i].onclick = function() {
                var subId = this.getAttribute('data-sub');
                localStorage.setItem('settings_sub_tab', subId);
                var sub = subs.find(function(s) { return s.id === subId; });
                if (sub && sub.render) {
                    renderContentArea(sub.render);
                }
                var allSubs = document.querySelectorAll('.settings-sub-tab');
                for (var j = 0; j < allSubs.length; j++) {
                    allSubs[j].style.background = '';
                    allSubs[j].style.borderLeft = '';
                    allSubs[j].style.fontWeight = 'normal';
                    allSubs[j].style.color = '#666';
                }
                this.style.background = '#e8e0d4';
                this.style.borderLeft = '2px solid #ceb087';
                this.style.fontWeight = '500';
                this.style.color = '#333';
            };
        }
    }
    
    function renderContentArea(renderFunc) {
        var container = document.getElementById('settingsTabContent');
        var oldContent = container.querySelector('.settings-content-area');
        if (oldContent) oldContent.remove();
        
        var contentDiv = document.createElement('div');
        contentDiv.className = 'settings-content-area';
        contentDiv.style.cssText = 'flex: 1; padding: 0 20px;';
        container.appendChild(contentDiv);
        
        var tempContainer = { innerHTML: '' };
        var originalContainer = document.getElementById('settingsTabContent');
        var tempId = 'temp-settings-container';
        var tempDiv = document.createElement('div');
        tempDiv.id = tempId;
        tempDiv.style.display = 'none';
        document.body.appendChild(tempDiv);
        
        var oldGetElement = document.getElementById;
        document.getElementById = function(id) {
            if (id === 'settingsTabContent') return tempDiv;
            return oldGetElement.call(document, id);
        };
        
        renderFunc();
        
        document.getElementById = oldGetElement;
        contentDiv.innerHTML = tempDiv.innerHTML;
        tempDiv.remove();
        
        // 重新绑定事件
        if (renderFunc === renderThemeUI) {
            var themeBtns = contentDiv.querySelectorAll('.theme-preset-btn');
            for (var i = 0; i < themeBtns.length; i++) {
                themeBtns[i].onclick = function() { applyTheme(this.getAttribute('data-theme')); };
            }
            var colorPicker = contentDiv.querySelector('#globalTextColor');
            if (colorPicker) {
                colorPicker.onchange = function() {
                    settingsData.globalTextColor = this.value;
                    applyGlobalTextColor();
                    saveSettings();
                };
            }
        } else if (renderFunc === renderBackgroundUI) {
            var bgUpload = contentDiv.querySelector('#bgUploadSetting');
            var bgPreview = contentDiv.querySelector('#bgPreviewSetting');
            if (bgUpload) {
                bgUpload.onchange = function(e) {
                    var file = e.target.files[0];
                    if (file) {
                        var reader = new FileReader();
                        reader.onload = function(ev) {
                            settingsData.bgImage = ev.target.result;
                            if (bgPreview) bgPreview.style.backgroundImage = 'url(' + settingsData.bgImage + ')';
                            applyBackground();
                            saveSettings();
                        };
                        reader.readAsDataURL(file);
                    }
                };
            }
            var opacitySlider = contentDiv.querySelector('#opacitySliderSetting');
            if (opacitySlider) {
                opacitySlider.oninput = function() {
                    var val = parseInt(this.value);
                    var opacityVal = contentDiv.querySelector('#opacityValSetting');
                    if (opacityVal) opacityVal.innerText = val;
                    settingsData.bgOpacity = val;
                    applyBackground();
                    saveSettings();
                };
            }
            var clearBtn = contentDiv.querySelector('#clearBgSettingBtn');
            if (clearBtn) {
                clearBtn.onclick = function() {
                    settingsData.bgImage = null;
                    if (bgPreview) bgPreview.style.backgroundImage = '';
                    applyBackground();
                    saveSettings();
                };
            }
        } else if (renderFunc === renderCssUI) {
            var saveCssBtn = contentDiv.querySelector('#saveCssSettingBtn');
            var cssTextarea = contentDiv.querySelector('#customCssSetting');
            if (saveCssBtn && cssTextarea) {
                saveCssBtn.onclick = function() {
                    settingsData.customCss = cssTextarea.value;
                    applyCustomCss();
                    saveSettings();
                    alert('CSS已保存');
                };
            }
        } else if (renderFunc === renderBackupSettingsUI) {
            var manualBtn = contentDiv.querySelector('#manualBackupBtn');
            if (manualBtn) manualBtn.onclick = performBackup;
            var refreshBtn = contentDiv.querySelector('#refreshBackupListBtn');
            if (refreshBtn) refreshBtn.onclick = refreshBackupList;
        } else if (renderFunc === renderSecuritySettingsUI) {
            var enableCheckbox = contentDiv.querySelector('#enablePasswordCheckbox');
            var passwordDiv = contentDiv.querySelector('#passwordSettingsDiv');
            var passwordInput = contentDiv.querySelector('#passwordInput');
            if (enableCheckbox) {
                enableCheckbox.onchange = function(e) {
                    if (passwordDiv) passwordDiv.style.display = e.target.checked ? 'block' : 'none';
                    passwordSettings.enabled = e.target.checked;
                    savePasswordSettings();
                };
            }
            var savePwdBtn = contentDiv.querySelector('#savePasswordBtn');
            if (savePwdBtn) {
                savePwdBtn.onclick = function() {
                    if (enableCheckbox.checked && passwordInput.value) {
                        passwordSettings.enabled = true;
                        passwordSettings.password = passwordInput.value;
                    } else {
                        passwordSettings.enabled = false;
                        passwordSettings.password = '';
                    }
                    savePasswordSettings();
                    alert('密码设置已保存');
                };
            }
            var saveSecBtn = contentDiv.querySelector('#saveSecurityBtn');
            if (saveSecBtn) {
                saveSecBtn.onclick = function() {
                    passwordSettings.question = contentDiv.querySelector('#securityQuestionInput').value;
                    passwordSettings.answer = contentDiv.querySelector('#securityAnswerInput').value;
                    savePasswordSettings();
                    alert('密保问题已保存');
                };
            }
            var forgotBtn = contentDiv.querySelector('#forgotPasswordBtn');
            if (forgotBtn) {
                forgotBtn.onclick = function() {
                    if (passwordSettings.question && passwordSettings.answer) {
                        var answer = prompt('密保问题：' + passwordSettings.question);
                        if (answer === passwordSettings.answer) {
                            var newPassword = prompt('请输入新密码：');
                            if (newPassword) {
                                passwordSettings.password = newPassword;
                                savePasswordSettings();
                                alert('密码已重置');
                            }
                        } else alert('答案错误');
                    } else alert('请先设置密保问题');
                };
            }
        }
    }
    
    renderSubMenu();
    var defaultSub = subMenus[activeCategory] ? subMenus[activeCategory][0] : null;
    if (defaultSub && defaultSub.render) {
        renderContentArea(defaultSub.render);
    }
    
    // 绑定分类切换事件
    var tabs = document.querySelectorAll('.settings-tab');
    for (var i = 0; i < tabs.length; i++) {
        tabs[i].onclick = function() {
            var tab = this.getAttribute('data-tab');
            localStorage.setItem('settings_active_tab', tab);
            
            activeCategory = tab;
            currentSub = localStorage.getItem('settings_sub_tab') || 'theme';
            
            renderSubMenu();
            
            var subs = subMenus[tab] || [];
            if (subs.length > 0) {
                var firstSub = subs[0];
                localStorage.setItem('settings_sub_tab', firstSub.id);
                if (firstSub && firstSub.render) {
                    renderContentArea(firstSub.render);
                }
            }
            
            var allTabs = document.querySelectorAll('.settings-tab');
            for (var j = 0; j < allTabs.length; j++) {
                allTabs[j].style.background = '';
                allTabs[j].style.borderLeft = '';
                allTabs[j].style.fontWeight = 'normal';
                allTabs[j].style.color = '#666';
            }
            this.style.background = '#e8e0d4';
            this.style.borderLeft = '3px solid #ceb087';
            this.style.fontWeight = '600';
            this.style.color = '#333';
        };
    }
}

loadSettings();
setTimeout(renderSettingsPage, 500);
