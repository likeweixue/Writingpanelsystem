// ========== 设置界面 ==========
var settingsInitialized = false;
// ========== 设置数据存储 ==========

var appSettings = {
    // 安全设置
    security: {
        enabled: false,
        password: '',
        questions: [
            { id: 1, question: '', answer: '' },
            { id: 2, question: '', answer: '' },
            { id: 3, question: '', answer: '' }
        ]
    },
    // 主题设置
    theme: {
        customCss: ''
    },
    // 备份设置
    backup: {
        autoBackup: true,
        interval: 5, // 分钟
        path: '' // 备份路径
    }
};

// ========== 加载/保存设置 ==========

function loadAppSettings() {
    var saved = localStorage.getItem('app_settings_v2');
    if (saved) {
        try {
            var data = JSON.parse(saved);
            // 合并默认值，确保所有字段存在
            for (var key in appSettings) {
                if (data[key]) {
                    for (var subKey in appSettings[key]) {
                        if (data[key][subKey] !== undefined) {
                            appSettings[key][subKey] = data[key][subKey];
                        }
                    }
                }
            }
        } catch(e) {
            console.error('加载设置失败:', e);
        }
    }
    // 如果没有设置路径，使用默认路径
    if (!appSettings.backup.path) {
        appSettings.backup.path = getDefaultBackupPath();
    }
    return appSettings;
}

function saveAppSettings() {
    localStorage.setItem('app_settings_v2', JSON.stringify(appSettings));
    // 应用设置
    applySettings();
}

function getDefaultBackupPath() {
    // 根据平台返回默认备份路径
    var platform = navigator.platform;
    if (platform.indexOf('Win') !== -1) {
        return 'C:/Users/' + (process.env.USERNAME || 'User') + '/Documents/写作面板系统备份';
    } else if (platform.indexOf('Mac') !== -1) {
        return '~/Documents/写作面板系统备份';
    } else {
        return './备份';
    }
}

// ========== 应用设置 ==========

function applySettings() {
    // 应用自定义 CSS
    applyCustomCss(appSettings.theme.customCss);
    // 应用密码保护
    applyPasswordProtection();
    // 应用备份设置
    applyBackupSettings();
}

function applyCustomCss(css) {
    var oldStyle = document.getElementById('user-custom-css');
    if (oldStyle) oldStyle.remove();
    if (css && css.trim()) {
        var style = document.createElement('style');
        style.id = 'user-custom-css';
        style.textContent = css;
        document.head.appendChild(style);
    }
}

function applyPasswordProtection() {
    // 密码保护在打开软件时检查，这里只是保存设置
    if (appSettings.security.enabled) {
        // 标记已启用
        localStorage.setItem('password_enabled', 'true');
    } else {
        localStorage.removeItem('password_enabled');
    }
}

function applyBackupSettings() {
    // 备份设置在 main.js 中处理，这里保存
    if (appSettings.backup.autoBackup) {
        localStorage.setItem('auto_backup_enabled', 'true');
        localStorage.setItem('auto_backup_interval', appSettings.backup.interval);
    } else {
        localStorage.removeItem('auto_backup_enabled');
    }
}

// ========== 密码验证 ==========

function checkPassword() {
    if (!appSettings.security.enabled) return true;
    var password = prompt('请输入密码：');
    if (password === appSettings.security.password) return true;
    alert('密码错误');
    return false;
}

// 验证密码是否正确
function verifyPassword(input) {
    return input === appSettings.security.password;
}

// 验证密保答案
function verifySecurityAnswers(answers) {
    var questions = appSettings.security.questions;
    for (var i = 0; i < questions.length; i++) {
        if (questions[i].question && questions[i].answer) {
            if (answers[i] !== questions[i].answer) {
                return false;
            }
        }
    }
    return true;
}

// ========== 渲染设置页面 ==========

var settingsInitialized = false;  // 确保这个变量在文件顶部定义

function renderSettingsPage() {
    console.log('🔧 renderSettingsPage 被调用');
    
    // 防止重复渲染
    if (settingsInitialized) {
        console.log('⚠️ 设置面板已初始化，跳过重复渲染');
        return;
    }
    
    var container = document.getElementById('settingsContainer');
    if (!container) {
        console.warn('❌ settingsContainer 不存在');
        return;
    }
    
    console.log('✅ settingsContainer 找到:', container);
    
    // ===== 设置父容器高度 =====
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
        console.log('✅ 父容器 .page 高度已设置');
    }
    
    // 确保容器有高度
    container.style.height = '100%';
    container.style.minHeight = '400px';
    container.style.display = 'block';
    container.style.overflow = 'auto';
    container.style.position = 'relative';
    container.style.background = 'var(--panel-bg, rgba(255,255,255,0.95))';
    
    // 加载设置数据
    loadAppSettings();
    console.log('📦 设置数据已加载:', appSettings);
    
    // 清空容器
    container.innerHTML = '';
    
    try {
        var html = `
            <div style="display:flex; height:100%; min-height:400px; width:100%; background:var(--panel-bg, rgba(255,255,255,0.95));">
<div style="width:200px; min-width:160px; max-width:240px; background:rgba(0,0,0,0.02); border-right:1px solid var(--border-color, rgba(0,0,0,0.06)); display:flex; flex-direction:column; flex-shrink:0; overflow-y:auto; padding:16px 0;">
    <div style="padding:0 16px 12px 16px; border-bottom:1px solid var(--border-color, rgba(0,0,0,0.06));">
        <div style="font-size:16px; font-weight:700; color:var(--text-color, #333);">⚙️ 设置</div>
        <div style="font-size:11px; color:#888; margin-top:2px;">个性化配置</div>
    </div>
    
    <div style="padding:12px 0;">
        <div class="settings-menu-item active" data-tab="security" style="display:flex; align-items:center; gap:10px; padding:10px 16px; cursor:pointer; transition:all 0.2s; border-right:3px solid #007aff; background:rgba(0,122,255,0.06);">
            <img src="icons/Fingerprint.svg" width="20" height="20" style="flex-shrink:0;" alt="安全">
            <span style="font-size:14px; font-weight:500;">安全</span>
        </div>
        <div class="settings-menu-item" data-tab="theme" style="display:flex; align-items:center; gap:10px; padding:10px 16px; cursor:pointer; transition:all 0.2s; border-right:3px solid transparent;">
            <img src="icons/topic.svg" width="20" height="20" style="flex-shrink:0;" alt="主题">
            <span style="font-size:14px; font-weight:500;">主题</span>
        </div>
        <div class="settings-menu-item" data-tab="backup" style="display:flex; align-items:center; gap:10px; padding:10px 16px; cursor:pointer; transition:all 0.2s; border-right:3px solid transparent;">
            <img src="icons/toolbar.svg" width="20" height="20" style="flex-shrink:0;" alt="备份">
            <span style="font-size:14px; font-weight:500;">备份</span>
        </div>
    </div>
    
    <div style="margin-top:auto; padding:12px 16px; border-top:1px solid var(--border-color, rgba(0,0,0,0.06));">
        <div style="font-size:11px; color:#888;">💡 设置自动保存</div>
                    </div>
                </div>
                
                <!-- ===== 右侧内容区 ===== -->
                <div id="settingsContent" style="flex:1; overflow-y:auto; padding:24px 32px;">
                    <!-- 由 JavaScript 动态渲染 -->
                    <div style="padding:40px; text-align:center; color:#888;">加载中...</div>
                </div>
                
            </div>
        `;
        
        container.innerHTML = html;
        console.log('✅ HTML 已设置');
        
        // 绑定菜单切换事件
        var menuItems = container.querySelectorAll('.settings-menu-item');
        console.log('📋 找到菜单项:', menuItems.length);
        for (var i = 0; i < menuItems.length; i++) {
            menuItems[i].onclick = function() {
                var tab = this.getAttribute('data-tab');
                console.log('🔀 切换到:', tab);
                switchSettingsTab(tab);
            };
        }
        
        // 标记已初始化
        settingsInitialized = true;
        
        // 默认显示安全设置
        console.log('📌 默认显示安全设置');
        switchSettingsTab('security');
        
    } catch(e) {
        console.error('❌ renderSettingsPage 错误:', e);
        container.innerHTML = '<div style="padding:40px; text-align:center; color:#dc3545;">设置面板加载失败: ' + e.message + '</div>';
    }
}

// ========== 切换设置标签页 ==========

// ========== 切换设置标签页 ==========

function switchSettingsTab(tab) {
    console.log('🔄 switchSettingsTab 被调用, tab:', tab);
    
    // 更新菜单高亮
    var menuItems = document.querySelectorAll('.settings-menu-item');
    for (var i = 0; i < menuItems.length; i++) {
        var item = menuItems[i];
        item.classList.remove('active');
        item.style.background = '';
        item.style.borderRightColor = 'transparent';
        if (item.getAttribute('data-tab') === tab) {
            item.classList.add('active');
            item.style.background = 'rgba(0,122,255,0.06)';
            item.style.borderRightColor = '#007aff';
        }
    }
    
    // 渲染对应内容
    var content = document.getElementById('settingsContent');
    if (!content) {
        console.warn('❌ settingsContent 不存在');
        return;
    }
    
    console.log('✅ settingsContent 找到，开始渲染:', tab);
    
    switch(tab) {
        case 'security':
            content.innerHTML = renderSecurityTab();
            bindSecurityEvents();
            break;
        case 'theme':
            content.innerHTML = renderThemeTab();
            bindThemeEvents();
            break;
        case 'backup':
            content.innerHTML = renderBackupTab();
            bindBackupEvents();
            break;
        default:
            content.innerHTML = '<div style="padding:40px; text-align:center; color:#888;">页面建设中</div>';
    }
    
    console.log('✅ 标签页渲染完成:', tab);
}

// ============================================================
// ========== 安全设置 ==========
// ============================================================

function renderSecurityTab() {
    var sec = appSettings.security;
    
    // 生成密保问题输入框
    var questionsHtml = '';
    var questionLabels = ['密保问题 1', '密保问题 2', '密保问题 3'];
    for (var i = 0; i < 3; i++) {
        var q = sec.questions[i] || { question: '', answer: '' };
        questionsHtml += `
            <div style="margin-bottom:12px; padding:12px 16px; background:rgba(0,0,0,0.02); border-radius:8px; border:1px solid var(--border-color, rgba(0,0,0,0.04));">
                <div style="font-size:12px; color:#888; margin-bottom:4px;">${questionLabels[i]}</div>
                <input type="text" class="sec-question" data-index="${i}" value="${escapeHtml(q.question)}" placeholder="请输入密保问题..." style="width:100%; padding:6px 10px; border:1px solid var(--border-color, #ddd); border-radius:6px; font-size:13px; background:var(--input-bg, #f8f8f8); color:var(--text-color, #333); margin-bottom:6px;">
                <input type="text" class="sec-answer" data-index="${i}" value="${escapeHtml(q.answer)}" placeholder="请输入答案..." style="width:100%; padding:6px 10px; border:1px solid var(--border-color, #ddd); border-radius:6px; font-size:13px; background:var(--input-bg, #f8f8f8); color:var(--text-color, #333);">
            </div>
        `;
    }
    
    return `
        <div style="max-width:600px;">
            <div style="display:flex; align-items:center; gap:10px; margin-bottom:4px;">
                <img src="icons/Fingerprint.svg" width="24" height="24" alt="安全">
                <h3 style="font-size:18px; margin:0;">安全设置</h3>
            </div>
            <p style="font-size:13px; color:#888; margin-bottom:24px;">设置启动密码和密保问题，保护你的写作数据</p>
            
            <!-- 密码开关 -->
            <div style="background:rgba(255,255,255,0.6); border-radius:12px; padding:20px; border:1px solid var(--border-color, rgba(0,0,0,0.06)); margin-bottom:20px;">
                <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:16px;">
                    <div style="display:flex; align-items:center; gap:10px;">
                        <img src="icons/Fingerprint.svg" width="22" height="22" alt="启动密码">
                        <div>
                            <div style="font-weight:600; font-size:15px;">启动密码</div>
                            <div style="font-size:12px; color:#888;">开启后每次打开软件都需要输入密码</div>
                        </div>
                    </div>
                    <label style="position:relative; display:inline-block; width:48px; height:26px;">
                        <input type="checkbox" id="secEnabled" ${sec.enabled ? 'checked' : ''} style="opacity:0; width:0; height:0;">
                        <span style="position:absolute; cursor:pointer; top:0; left:0; right:0; bottom:0; background:${sec.enabled ? '#007aff' : '#ccc'}; border-radius:26px; transition:0.3s;">
                            <span style="position:absolute; content:''; height:20px; width:20px; left:3px; bottom:3px; background:white; border-radius:50%; transition:0.3s; transform:${sec.enabled ? 'translateX(22px)' : 'none'};"></span>
                        </span>
                    </label>
                </div>
                
                <div id="passwordSettingsDiv" style="${sec.enabled ? 'display:block;' : 'display:none;'}">
                    <div style="margin-bottom:12px;">
                        <label style="display:block; font-size:13px; font-weight:500; margin-bottom:4px; color:var(--text-color, #333);">设置密码</label>
                        <input type="password" id="secPassword" value="${sec.password}" placeholder="请输入密码..." style="width:100%; padding:8px 12px; border:1px solid var(--border-color, #ddd); border-radius:8px; font-size:14px; background:var(--input-bg, #f8f8f8); color:var(--text-color, #333);">
                        <div style="font-size:11px; color:#888; margin-top:4px;">💡 密码长度至少 4 位</div>
                    </div>
                    <div>
                        <label style="display:block; font-size:13px; font-weight:500; margin-bottom:4px; color:var(--text-color, #333);">确认密码</label>
                        <input type="password" id="secPasswordConfirm" value="${sec.password}" placeholder="请再次输入密码..." style="width:100%; padding:8px 12px; border:1px solid var(--border-color, #ddd); border-radius:8px; font-size:14px; background:var(--input-bg, #f8f8f8); color:var(--text-color, #333);">
                    </div>
                </div>
            </div>
            
            <!-- 密保问题 -->
            <div style="background:rgba(255,255,255,0.6); border-radius:12px; padding:20px; border:1px solid var(--border-color, rgba(0,0,0,0.06)); margin-bottom:20px;">
                <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:12px;">
                    <div>
                        <div style="font-weight:600; font-size:15px;">❓ 密保问题</div>
                        <div style="font-size:12px; color:#888;">忘记密码时用于验证身份</div>
                    </div>
                </div>
                ${questionsHtml}
                <div style="font-size:11px; color:#888; margin-top:4px;">💡 至少设置 2 个密保问题以便找回密码</div>
            </div>
            
            <!-- 保存按钮 -->
            <button id="saveSecurityBtn" style="width:100%; padding:12px; background:#007aff; color:white; border:none; border-radius:10px; font-size:15px; font-weight:600; cursor:pointer; transition:background 0.2s; display:flex; align-items:center; justify-content:center; gap:8px;">
                <img src="icons/check.svg" width="18" height="18" alt="保存">
                保存安全设置
            </button>
        </div>
    `;
}

function bindSecurityEvents() {
    var enabledCheckbox = document.getElementById('secEnabled');
    var passwordDiv = document.getElementById('passwordSettingsDiv');
    
    if (enabledCheckbox) {
        enabledCheckbox.onchange = function() {
            var isChecked = this.checked;
            passwordDiv.style.display = isChecked ? 'block' : 'none';
            // 更新开关样式
            var span = this.nextElementSibling;
            if (span) {
                span.style.background = isChecked ? '#007aff' : '#ccc';
                var dot = span.querySelector('span');
                if (dot) {
                    dot.style.transform = isChecked ? 'translateX(22px)' : 'none';
                }
            }
        };
    }
    
    var saveBtn = document.getElementById('saveSecurityBtn');
    if (saveBtn) {
        saveBtn.onclick = function() {
            saveSecuritySettings();
        };
    }
}

function saveSecuritySettings() {
    var enabled = document.getElementById('secEnabled').checked;
    var password = document.getElementById('secPassword').value.trim();
    var passwordConfirm = document.getElementById('secPasswordConfirm').value.trim();
    
    // 如果启用密码，验证密码
    if (enabled) {
        if (!password || password.length < 4) {
            alert('密码至少需要 4 位字符');
            return;
        }
        if (password !== passwordConfirm) {
            alert('两次输入的密码不一致');
            return;
        }
    }
    
    // 收集密保问题
    var questionInputs = document.querySelectorAll('.sec-question');
    var answerInputs = document.querySelectorAll('.sec-answer');
    var questions = [];
    var validCount = 0;
    
    for (var i = 0; i < 3; i++) {
        var q = questionInputs[i] ? questionInputs[i].value.trim() : '';
        var a = answerInputs[i] ? answerInputs[i].value.trim() : '';
        questions.push({ id: i + 1, question: q, answer: a });
        if (q && a) validCount++;
    }
    
    if (enabled && validCount < 2) {
        alert('启用密码时，至少需要设置 2 个密保问题');
        return;
    }
    
    // 保存设置
    appSettings.security.enabled = enabled;
    appSettings.security.password = password;
    appSettings.security.questions = questions;
    
    saveAppSettings();
    alert('✅ 安全设置已保存');
}

// ============================================================
// ========== 主题设置 ==========
// ============================================================

function renderThemeTab() {
    var customCss = appSettings.theme.customCss || '';
    
    return `
        <div style="max-width:700px;">
            <div style="display:flex; align-items:center; gap:10px; margin-bottom:4px;">
                <img src="icons/topic.svg" width="24" height="24" alt="主题">
                <h3 style="font-size:18px; margin:0;">主题设置</h3>
            </div>
            <p style="font-size:13px; color:#888; margin-bottom:24px;">自定义界面样式，在已有主题基础上添加额外样式</p>
            
            <!-- 预设主题快速切换 -->
            <div style="background:rgba(255,255,255,0.6); border-radius:12px; padding:20px; border:1px solid var(--border-color, rgba(0,0,0,0.06)); margin-bottom:20px;">
                <div style="font-weight:600; font-size:15px; margin-bottom:12px;">🎯 快速切换主题</div>
                <div style="display:flex; gap:10px; flex-wrap:wrap;">
                    <button class="theme-quick-btn" data-theme="default" style="padding:8px 18px; border:2px solid ${getCurrentTheme() === 'default' ? '#007aff' : '#ddd'}; border-radius:8px; cursor:pointer; background:#f5f5f5; color:#333; transition:all 0.2s;">🌞 默认</button>
                    <button class="theme-quick-btn" data-theme="eye" style="padding:8px 18px; border:2px solid ${getCurrentTheme() === 'eye' ? '#007aff' : '#ddd'}; border-radius:8px; cursor:pointer; background:#d4e6d1; color:#2c3e2f; transition:all 0.2s;">🌿 护眼绿</button>
                    <button class="theme-quick-btn" data-theme="warm" style="padding:8px 18px; border:2px solid ${getCurrentTheme() === 'warm' ? '#007aff' : '#ddd'}; border-radius:8px; cursor:pointer; background:#efe5cd; color:#4a3b2c; transition:all 0.2s;">📜 经典黄</button>
                    <button class="theme-quick-btn" data-theme="dark" style="padding:8px 18px; border:2px solid ${getCurrentTheme() === 'dark' ? '#007aff' : '#ddd'}; border-radius:8px; cursor:pointer; background:#2a2a3a; color:#e0e0e0; transition:all 0.2s;">🌙 暗夜黑</button>
                    <button class="theme-quick-btn" data-theme="open" style="padding:8px 18px; border:2px solid ${getCurrentTheme() === 'open' ? '#007aff' : '#ddd'}; border-radius:8px; cursor:pointer; background:#f5f5f7; color:#333; transition:all 0.2s;">🪟 Open圆润</button>
                </div>
            </div>
            
            <!-- 自定义 CSS -->
            <div style="background:rgba(255,255,255,0.6); border-radius:12px; padding:20px; border:1px solid var(--border-color, rgba(0,0,0,0.06)); margin-bottom:20px;">
                <div style="display:flex; align-items:center; gap:8px; margin-bottom:12px;">
                    <img src="icons/rename.svg" width="18" height="18" alt="自定义CSS">
                    <div>
                        <div style="font-weight:600; font-size:15px;">自定义 CSS</div>
                        <div style="font-size:12px; color:#888;">添加自定义样式覆盖默认主题</div>
                    </div>
                </div>
                <textarea id="customCssInput" style="width:100%; height:200px; padding:12px; border:1px solid var(--border-color, #ddd); border-radius:8px; font-size:13px; font-family:monospace; background:var(--input-bg, #f8f8f8); color:var(--text-color, #333); resize:vertical;" placeholder="/* 在这里输入自定义 CSS */&#10;&#10;/* 示例：修改标题颜色 */&#10;.book-cover h4 { color: #9b784e; }">${escapeHtml(customCss)}</textarea>
                <div style="font-size:11px; color:#888; margin-top:8px;">💡 修改后点击保存即可生效</div>
            </div>
            
            <!-- 保存按钮 -->
            <button id="saveThemeBtn" style="width:100%; padding:12px; background:#007aff; color:white; border:none; border-radius:10px; font-size:15px; font-weight:600; cursor:pointer; transition:background 0.2s; display:flex; align-items:center; justify-content:center; gap:8px;">
                <img src="icons/check.svg" width="18" height="18" alt="保存">
                保存主题设置
            </button>
        </div>
    `;
}

function getCurrentTheme() {
    return localStorage.getItem('app_theme') || 'default';
}

function bindThemeEvents() {
    // 快速切换主题
    var themeBtns = document.querySelectorAll('.theme-quick-btn');
    for (var i = 0; i < themeBtns.length; i++) {
        themeBtns[i].onclick = function() {
            var theme = this.getAttribute('data-theme');
            applyTheme(theme);
            // 更新按钮样式
            var allBtns = document.querySelectorAll('.theme-quick-btn');
            for (var j = 0; j < allBtns.length; j++) {
                allBtns[j].style.borderColor = '#ddd';
            }
            this.style.borderColor = '#007aff';
        };
    }
    
    var saveBtn = document.getElementById('saveThemeBtn');
    if (saveBtn) {
        saveBtn.onclick = function() {
            var css = document.getElementById('customCssInput').value;
            appSettings.theme.customCss = css;
            saveAppSettings();
            alert('✅ 主题设置已保存');
        };
    }
}

function applyTheme(theme) {
    var link = document.getElementById('themeStyle');
    if (link) {
        link.href = 'themes/' + theme + '.css';
    }
    document.body.classList.remove('theme-default', 'theme-eye', 'theme-warm', 'theme-dark', 'theme-open');
    document.body.classList.add('theme-' + theme);
    localStorage.setItem('app_theme', theme);
    // 重新应用自定义 CSS
    applyCustomCss(appSettings.theme.customCss);
}

// ============================================================
// ========== 备份设置 ==========
// ============================================================

function renderBackupTab() {
    var backup = appSettings.backup;
    
    return `
        <div style="max-width:600px;">
            <div style="display:flex; align-items:center; gap:10px; margin-bottom:4px;">
                <img src="icons/toolbar.svg" width="24" height="24" alt="备份">
                <h3 style="font-size:18px; margin:0;">备份设置</h3>
            </div>
            <p style="font-size:13px; color:#888; margin-bottom:24px;">配置数据备份，保护你的写作成果</p>
            
            <!-- 自动备份 -->
            <div style="background:rgba(255,255,255,0.6); border-radius:12px; padding:20px; border:1px solid var(--border-color, rgba(0,0,0,0.06)); margin-bottom:20px;">
                <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:16px;">
                    <div>
                        <div style="font-weight:600; font-size:15px;">🔄 自动备份</div>
                        <div style="font-size:12px; color:#888;">定期自动备份所有书籍数据</div>
                    </div>
                    <label style="position:relative; display:inline-block; width:48px; height:26px;">
                        <input type="checkbox" id="backupAuto" ${backup.autoBackup ? 'checked' : ''} style="opacity:0; width:0; height:0;">
                        <span style="position:absolute; cursor:pointer; top:0; left:0; right:0; bottom:0; background:${backup.autoBackup ? '#007aff' : '#ccc'}; border-radius:26px; transition:0.3s;">
                            <span style="position:absolute; content:''; height:20px; width:20px; left:3px; bottom:3px; background:white; border-radius:50%; transition:0.3s; transform:${backup.autoBackup ? 'translateX(22px)' : 'none'};"></span>
                        </span>
                    </label>
                </div>
                
                <div id="backupIntervalDiv" style="${backup.autoBackup ? 'display:block;' : 'display:none;'}">
                    <label style="display:block; font-size:13px; font-weight:500; margin-bottom:4px; color:var(--text-color, #333);">⏱️ 备份间隔</label>
                    <select id="backupInterval" style="width:100%; padding:8px 12px; border:1px solid var(--border-color, #ddd); border-radius:8px; font-size:14px; background:var(--input-bg, #f8f8f8); color:var(--text-color, #333);">
                        <option value="1" ${backup.interval === 1 ? 'selected' : ''}>1 分钟</option>
                        <option value="3" ${backup.interval === 3 ? 'selected' : ''}>3 分钟</option>
                        <option value="5" ${backup.interval === 5 ? 'selected' : ''}>5 分钟</option>
                        <option value="10" ${backup.interval === 10 ? 'selected' : ''}>10 分钟</option>
                        <option value="15" ${backup.interval === 15 ? 'selected' : ''}>15 分钟</option>
                        <option value="30" ${backup.interval === 30 ? 'selected' : ''}>30 分钟</option>
                        <option value="60" ${backup.interval === 60 ? 'selected' : ''}>60 分钟</option>
                    </select>
                    <div style="font-size:11px; color:#888; margin-top:4px;">💡 建议设置为 5-10 分钟，避免频繁写入</div>
                </div>
            </div>
            
            <!-- 备份路径 -->
            <div style="background:rgba(255,255,255,0.6); border-radius:12px; padding:20px; border:1px solid var(--border-color, rgba(0,0,0,0.06)); margin-bottom:20px;">
                <div style="font-weight:600; font-size:15px; margin-bottom:12px;">📁 备份位置</div>
                <div style="display:flex; gap:8px;">
                    <input type="text" id="backupPath" value="${escapeHtml(backup.path)}" placeholder="备份文件夹路径..." style="flex:1; padding:8px 12px; border:1px solid var(--border-color, #ddd); border-radius:8px; font-size:13px; background:var(--input-bg, #f8f8f8); color:var(--text-color, #333);">
                    <button id="browseBackupPath" style="padding:8px 16px; background:#6c757d; color:white; border:none; border-radius:8px; cursor:pointer; font-size:13px; white-space:nowrap;">📂 浏览</button>
                </div>
                <div style="font-size:11px; color:#888; margin-top:8px;">💡 点击"浏览"选择备份文件夹，或直接输入路径</div>
            </div>
            
            <!-- 手动备份 -->
            <div style="background:rgba(255,255,255,0.6); border-radius:12px; padding:20px; border:1px solid var(--border-color, rgba(0,0,0,0.06)); margin-bottom:20px;">
                <div style="display:flex; align-items:center; justify-content:space-between;">
                    <div>
                        <div style="font-weight:600; font-size:15px;">📦 立即备份</div>
                        <div style="font-size:12px; color:#888;">手动执行一次完整备份</div>
                    </div>
                    <button id="manualBackupBtn" style="padding:8px 20px; background:#28a745; color:white; border:none; border-radius:8px; cursor:pointer; font-size:14px;">🔄 立即备份</button>
                </div>
            </div>
            
            <!-- 保存按钮 -->
            <button id="saveBackupBtn" style="width:100%; padding:12px; background:#007aff; color:white; border:none; border-radius:10px; font-size:15px; font-weight:600; cursor:pointer; transition:background 0.2s; display:flex; align-items:center; justify-content:center; gap:8px;">
                <img src="icons/check.svg" width="18" height="18" alt="保存">
                保存备份设置
            </button>
        </div>
    `;
}

function bindBackupEvents() {
    var autoCheckbox = document.getElementById('backupAuto');
    var intervalDiv = document.getElementById('backupIntervalDiv');
    
    if (autoCheckbox) {
        autoCheckbox.onchange = function() {
            var isChecked = this.checked;
            intervalDiv.style.display = isChecked ? 'block' : 'none';
            var span = this.nextElementSibling;
            if (span) {
                span.style.background = isChecked ? '#007aff' : '#ccc';
                var dot = span.querySelector('span');
                if (dot) {
                    dot.style.transform = isChecked ? 'translateX(22px)' : 'none';
                }
            }
        };
    }
    
    // 浏览路径（在 Electron 中可用）
    var browseBtn = document.getElementById('browseBackupPath');
    if (browseBtn) {
        browseBtn.onclick = function() {
            if (window.electron && window.electron.openDirectoryDialog) {
                window.electron.openDirectoryDialog().then(function(result) {
                    if (result && result.filePaths && result.filePaths[0]) {
                        document.getElementById('backupPath').value = result.filePaths[0];
                    }
                });
            } else {
                alert('此功能仅在桌面应用中可用，请手动输入路径');
            }
        };
    }
    
    var manualBtn = document.getElementById('manualBackupBtn');
    if (manualBtn) {
        manualBtn.onclick = function() {
            if (typeof performBackup === 'function') {
                performBackup();
                alert('✅ 备份已执行');
            } else {
                alert('备份功能不可用');
            }
        };
    }
    
    var saveBtn = document.getElementById('saveBackupBtn');
    if (saveBtn) {
        saveBtn.onclick = function() {
            var auto = document.getElementById('backupAuto').checked;
            var interval = parseInt(document.getElementById('backupInterval').value) || 5;
            var path = document.getElementById('backupPath').value.trim() || getDefaultBackupPath();
            
            appSettings.backup.autoBackup = auto;
            appSettings.backup.interval = interval;
            appSettings.backup.path = path;
            
            saveAppSettings();
            alert('✅ 备份设置已保存');
        };
    }
}

// ============================================================
// ========== 工具函数 ==========
// ============================================================

function escapeHtml(str) {
    if (!str) return '';
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// ============================================================
// ========== 初始化 ==========
// ============================================================

// 加载设置并应用
loadAppSettings();
applySettings();

// 暴露到全局
window.renderSettingsPage = renderSettingsPage;
window.switchSettingsTab = switchSettingsTab;
window.loadAppSettings = loadAppSettings;
window.saveAppSettings = saveAppSettings;
window.appSettings = appSettings;

// ===== 移除自动初始化，让 switchPage 来控制 =====
// 不再自动渲染设置面板

// 密码检查（每次打开页面时执行）
setTimeout(function() {
    if (appSettings.security.enabled) {
        if (!checkPassword()) {
            console.log('密码验证失败');
        }
    }
}, 100);

console.log('⚙️ 设置面板已加载完成');
console.log('⚙️ settingsInitialized:', settingsInitialized);