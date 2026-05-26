// ========== 工具栏功能 ==========

function handleToolbarAction(action) {
    console.log('点击:', action);
    switch(action) {
        case 'import': importFile(); break;
        case 'fullscreen': toggleFullscreen(); break;
        case 'theme': openThemePanel(); break;
        case 'font': openFontPanel(); break;
        case 'format': autoFormat(); break;
        case 'find': openFindReplacePanel(); break;
        case 'proofread': proofread(); break;
        case 'dual': toggleDualMode(); break;
        case 'seclusion': openSeclusionPanel(); break;
        case 'memo': toggleMemoMode(); break;
        case 'save': if (typeof saveCurrentChapter === 'function') { saveCurrentChapter(); alert('已保存'); } break;
        case 'export': openExportPanel(); break;
        case 'sidebar': if (typeof toggleRightSidebar === 'function') toggleRightSidebar(); break;
        default: console.log('未知:', action);
        case 'clean': quickClean(); break;
    }
}

function closePanel(panelId) {
    var panel = document.getElementById(panelId);
    if (panel) panel.remove();
}

function importFile() {
    var input = document.createElement('input');
    input.type = 'file';
    input.accept = '.txt';
    input.onchange = function(e) {
        var file = e.target.files[0];
        if (file) {
            var reader = new FileReader();
            reader.onload = function(ev) {
                var ch = typeof getCurrentChapter === 'function' ? getCurrentChapter() : null;
                if (ch) {
                    ch.content = '<p>' + escapeHtml(ev.target.result).replace(/\n/g, '<br>') + '</p>';
                    if (typeof saveCurrentChapter === 'function') saveCurrentChapter();
                    if (typeof renderCurrentChapter === 'function') renderCurrentChapter();
                    alert('导入成功');
                } else {
                    alert('请先打开一本书籍');
                }
            };
            reader.readAsText(file, 'UTF-8');
        }
    };
    input.click();
}

function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
    } else {
        document.exitFullscreen();
    }
}

function autoFormat() {
    var editor = document.getElementById('editor');
    if (!editor) {
        alert('请先打开一个章节');
        return;
    }
    
    // 获取当前内容
    var content = editor.innerHTML;
    
    // 1. 提取纯文本（去除 HTML 标签）
    var tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
    var text = tempDiv.innerText;
    
    // 2. 处理文本格式
    var lines = text.split(/\r?\n/);
    var formattedLines = [];
    
    for (var i = 0; i < lines.length; i++) {
        var line = lines[i];
        
        // 去除每行开头和结尾的多余空格
        line = line.trim();
        
        // 跳过空行
        if (line === '') continue;
        
        // 检查是否是段落开头（中文标点符号开头的不缩进）
        var firstChar = line.charAt(0);
        var isPunctuation = ['，', '。', '！', '？', '；', '：', '”', '’', '》', '】', '、'].indexOf(firstChar) !== -1;
        
        if (!isPunctuation && line.length > 0) {
            // 首行缩进两个字符（使用两个全角空格）
            line = '　　' + line;
        }
        
        formattedLines.push(line);
    }
    
    // 3. 重新组合，段落之间空一行
    var formattedText = formattedLines.join('\n\n');
    
    // 4. 处理标点符号换行问题（防止引号、括号等被单独换行）
    formattedText = formattedText.replace(/([“”‘’《》【】])/g, function(match) {
        return match;
    });
    
    // 5. 将处理后的文本转换回 HTML
    var formattedHtml = formattedText.replace(/\n/g, '<br>');
    
    // 6. 处理段落（将连续的 br 转换为 p 标签）
    formattedHtml = formattedHtml.replace(/(<br>)+/g, '</p><p>');
    formattedHtml = '<p>' + formattedHtml + '</p>';
    formattedHtml = formattedHtml.replace(/<p><\/p>/g, '');
    formattedHtml = formattedHtml.replace(/<p><br><\/p>/g, '<p></p>');
    
    // 7. 应用格式化后的内容
    editor.innerHTML = formattedHtml;
    
    // 8. 保存章节
    if (typeof saveCurrentChapter === 'function') {
        saveCurrentChapter();
    }
    
    alert('排版完成：已删除多余空格，段落首行缩进2字符，段落之间空一行');
}

// 快速清理功能（只删除多余空格，不改变格式）
function quickClean() {
    var editor = document.getElementById('editor');
    if (!editor) {
        alert('请先打开一个章节');
        return;
    }
    
    // 获取当前内容
    var content = editor.innerHTML;
    var tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
    var text = tempDiv.innerText;
    
    // 清理多余空行（多个连续换行变成两个）
    text = text.replace(/\n{3,}/g, '\n\n');
    
    // 清理行首行尾空格
    var lines = text.split('\n');
    for (var i = 0; i < lines.length; i++) {
        lines[i] = lines[i].trim();
    }
    text = lines.join('\n');
    
    // 转回 HTML
    var formattedHtml = text.replace(/\n/g, '<br>');
    formattedHtml = '<p>' + formattedHtml.replace(/<br><br>/g, '</p><p>') + '</p>';
    formattedHtml = formattedHtml.replace(/<p><\/p>/g, '');
    
    editor.innerHTML = formattedHtml;
    
    if (typeof saveCurrentChapter === 'function') {
        saveCurrentChapter();
    }
    
    alert('清理完成：已删除多余空格和空行');
}

function proofread() {
    var editor = document.getElementById('editor');
    if (!editor) return;
    var text = editor.innerText;
    var commonErrors = [
        { find: '的的', replace: '的' },
        { find: '了了', replace: '了' },
        { find: '，，', replace: '，' },
        { find: '。。', replace: '。' }
    ];
    var changed = false;
    for (var i = 0; i < commonErrors.length; i++) {
        if (text.indexOf(commonErrors[i].find) !== -1) {
            text = text.split(commonErrors[i].find).join(commonErrors[i].replace);
            changed = true;
        }
    }
    if (changed) {
        editor.innerText = text;
        if (typeof saveCurrentChapter === 'function') saveCurrentChapter();
        alert('已修复常见错误');
    } else {
        alert('未发现明显错误');
    }
}

// ========== 主题面板（从右边栏左侧滑出） ==========
function openThemePanel() {
    var panel = document.getElementById('themeSlidePanel');
    if (panel) {
        panel.remove();
        return;
    }
    
    var rightSidebar = document.getElementById('rightSidebar');
    var rightSidebarRect = rightSidebar ? rightSidebar.getBoundingClientRect() : null;
    var leftPos = rightSidebarRect ? (rightSidebarRect.left - 340) : (window.innerWidth - 380);
    var topPos = 80;
    var topPos = 80;
    
    // 获取当前背景设置
    var currentBgImage = localStorage.getItem('custom_bg_image') || '';
    var currentBgOpacity = localStorage.getItem('custom_bg_opacity') || '30';
    
    var html = '<div id="themeSlidePanel" style="position: fixed; left: ' + leftPos + 'px; top: ' + topPos + 'px; width: 340px; height: calc(100vh - 80px); background: var(--panel-bg, rgba(255, 255, 255, 0.95)); backdrop-filter: blur(8px); border-radius: 0px; box-shadow: -2px 0 12px rgba(0,0,0,0.15); z-index: 1000; display: flex; flex-direction: column;">' +
        '<div class="right-slide-panel-header" style="padding: 16px; border-bottom: 1px solid var(--border-color, rgba(0,0,0,0.1)); display: flex; justify-content: space-between; align-items: center;">' +
        '<h3 style="margin:0;">主题设置</h3>' +
        '<button class="right-slide-panel-close" style="background:none; border:none; font-size:20px; cursor:pointer; color: var(--text-color, #333);">✕</button>' +
        '</div>' +
        '<div class="right-slide-panel-content" style="flex:1; overflow-y:auto; padding: 20px;">' +
        
        // 预设主题部分
        '<h5 style="margin-bottom:12px;">🎨 预设主题</h5>' +
        '<div style="display:flex; gap:8px; flex-wrap:wrap; margin-bottom:24px;">' +
        '<button data-theme="default" class="theme-preset-btn" style="padding:8px 16px; border-radius:8px; background:#f0f0f0; border:none; cursor:pointer;">默认白</button>' +
        '<button data-theme="eye" class="theme-preset-btn" style="padding:8px 16px; border-radius:8px; background:#C8DBC5; border:none; cursor:pointer;">护眼绿</button>' +
        '<button data-theme="warm" class="theme-preset-btn" style="padding:8px 16px; border-radius:8px; background:#DFD5BD; border:none; cursor:pointer;">经典黄</button>' +
        '<button data-theme="dark" class="theme-preset-btn" style="padding:8px 16px; border-radius:8px; background:#1e1e2e; color:white; border:none; cursor:pointer;">暗夜黑</button>' +
        '<button data-theme="open" class="theme-preset-btn" style="padding:8px 16px; border-radius:8px; background:#f5f5f7; border:none; cursor:pointer;">Open圆润</button>' +
        '</div>' +
        
        // 分隔线
        '<div style="height:1px; background:var(--border-color, #eee); margin:16px 0;"></div>' +
        
        // 自定义背景图片
        '<h5 style="margin-bottom:12px;">🖼️ 自定义背景图片</h5>' +
        '<input type="file" id="customBgUpload" accept="image/*" style="width:100%; margin-bottom:12px; padding:6px;">' +
        '<div id="customBgPreview" style="width:100%; height:100px; background:#f0f0f0; border-radius:8px; background-size:cover; background-position:center; margin-bottom:12px; border:1px solid var(--border-color, #ddd);"></div>' +
        
        // 透明度滑块
        '<div style="margin-bottom:16px;">' +
        '<label style="display:flex; justify-content:space-between; margin-bottom:8px;">' +
        '<span>🔆 背景透明度</span>' +
        '<span id="opacityValueDisplay" style="color:var(--text-color, #666);">' + currentBgOpacity + '%</span>' +
        '</label>' +
        '<input type="range" id="customBgOpacity" min="0" max="100" value="' + currentBgOpacity + '" style="width:100%; cursor:pointer;">' +
        '</div>' +
        
        // 清除背景按钮
        '<button id="clearCustomBgBtn" style="width:100%; padding:8px; background:#dc3545; color:white; border:none; border-radius:6px; cursor:pointer; margin-bottom:16px;">🗑️ 清除背景图片</button>' +
        
        // 全局文字颜色
        '<div style="height:1px; background:var(--border-color, #eee); margin:16px 0;"></div>' +
        '<h5 style="margin-bottom:12px;">✏️ 全局文字颜色</h5>' +
        '<input type="color" id="globalTextColorSlide" value="#333333" style="width:100%; height:40px; cursor:pointer; border:none;">' +
        '</div></div>';
    
    document.body.insertAdjacentHTML('beforeend', html);
    
    var panelEl = document.getElementById('themeSlidePanel');
    
    // 关闭按钮
    panelEl.querySelector('.right-slide-panel-close').onclick = function() { panelEl.remove(); };
    
    // 预设主题切换
    panelEl.querySelectorAll('.theme-preset-btn').forEach(btn => {
        btn.onclick = function() {
            var theme = this.getAttribute('data-theme');
            var link = document.getElementById('themeStyle');
            if (link) link.href = 'themes/' + theme + '.css';
            document.body.classList.remove('theme-default', 'theme-eye', 'theme-warm', 'theme-dark', 'theme-open');
            document.body.classList.add('theme-' + theme);
            localStorage.setItem('app_theme', theme);
            // 清除自定义背景，恢复主题默认背景
            clearCustomBackground();
            panelEl.remove();
        };
    });
    
    // 全局文字颜色
    panelEl.querySelector('#globalTextColorSlide').onchange = function() {
        var style = document.getElementById('global-color-style');
        if (style) style.remove();
        var newStyle = document.createElement('style');
        newStyle.id = 'global-color-style';
        newStyle.textContent = '* { color: ' + this.value + ' !important; }';
        document.head.appendChild(newStyle);
        localStorage.setItem('global_text_color', this.value);
    };
    
    // 预览背景图片
    var bgPreview = panelEl.querySelector('#customBgPreview');
    var savedBg = localStorage.getItem('custom_bg_image');
    if (savedBg) {
        bgPreview.style.backgroundImage = 'url(' + savedBg + ')';
        bgPreview.style.backgroundSize = 'cover';
        bgPreview.style.backgroundPosition = 'center';
        applyCustomBackground(savedBg, currentBgOpacity);
    }
    
    // 上传背景图片
    var bgUpload = panelEl.querySelector('#customBgUpload');
    bgUpload.onchange = function(e) {
        var file = e.target.files[0];
        if (file) {
            // 压缩图片
            compressImageForBg(file, 1200, 800, 0.7, function(compressedDataUrl) {
                bgPreview.style.backgroundImage = 'url(' + compressedDataUrl + ')';
                bgPreview.style.backgroundSize = 'cover';
                bgPreview.style.backgroundPosition = 'center';
                localStorage.setItem('custom_bg_image', compressedDataUrl);
                var opacity = panelEl.querySelector('#customBgOpacity').value;
                applyCustomBackground(compressedDataUrl, opacity);
            });
        }
    };
    
    // 透明度滑块
    var opacitySlider = panelEl.querySelector('#customBgOpacity');
    var opacityDisplay = panelEl.querySelector('#opacityValueDisplay');
    opacitySlider.oninput = function() {
        var val = this.value;
        opacityDisplay.textContent = val + '%';
        localStorage.setItem('custom_bg_opacity', val);
        var savedImage = localStorage.getItem('custom_bg_image');
        if (savedImage) {
            applyCustomBackground(savedImage, val);
        }
    };
    
    // 清除背景按钮
    var clearBtn = panelEl.querySelector('#clearCustomBgBtn');
    clearBtn.onclick = function() {
        clearCustomBackground();
        bgPreview.style.backgroundImage = '';
        localStorage.removeItem('custom_bg_image');
        localStorage.removeItem('custom_bg_opacity');
        opacitySlider.value = '30';
        opacityDisplay.textContent = '30%';
    };
}

// 压缩图片用于背景
function compressImageForBg(file, maxWidth, maxHeight, quality, callback) {
    var reader = new FileReader();
    reader.onload = function(e) {
        var img = new Image();
        img.onload = function() {
            var width = img.width;
            var height = img.height;
            var ratio = 1;
            if (width > maxWidth) ratio = maxWidth / width;
            if (height > maxHeight) {
                var ratio2 = maxHeight / height;
                if (ratio2 < ratio) ratio = ratio2;
            }
            var newWidth = width * ratio;
            var newHeight = height * ratio;
            var canvas = document.createElement('canvas');
            canvas.width = newWidth;
            canvas.height = newHeight;
            var ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, newWidth, newHeight);
            var compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
            callback(compressedDataUrl);
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

// 应用自定义背景
function applyCustomBackground(imageUrl, opacity) {
    var oldStyle = document.getElementById('custom-bg-style');
    if (oldStyle) oldStyle.remove();
    
    var actualOpacity = opacity / 100;
    
    var style = document.createElement('style');
    style.id = 'custom-bg-style';
    style.textContent = 'body::before { content: ""; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background-image: url(' + JSON.stringify(imageUrl) + '); background-size: cover; background-position: center; background-attachment: fixed; opacity: ' + actualOpacity + '; z-index: -1; pointer-events: none; } ' +
        '.app-container, .main-wrapper, .page, .sidebar-menu, .main-content, .book-detail-page, .detail-chapters, .detail-editor { background: transparent !important; }';
    document.head.appendChild(style);
    
    document.body.classList.add('has-custom-bg');
}

// 清除自定义背景
function clearCustomBackground() {
    var oldStyle = document.getElementById('custom-bg-style');
    if (oldStyle) oldStyle.remove();
    document.body.classList.remove('has-custom-bg');
    
    // 恢复当前主题的背景色
    var currentTheme = localStorage.getItem('app_theme') || 'default';
    var link = document.getElementById('themeStyle');
    if (link) link.href = 'themes/' + currentTheme + '.css';
    document.body.classList.remove('theme-default', 'theme-eye', 'theme-warm', 'theme-dark', 'theme-open');
    document.body.classList.add('theme-' + currentTheme);
    
    // 重新应用主题
    applyTheme(currentTheme);
}

// ========== 字体面板（从右边栏左侧滑出） ==========
function openFontPanel() {
    var panel = document.getElementById('fontSlidePanel');
    if (panel) {
        panel.remove();
        return;
    }
    
    var rightSidebar = document.getElementById('rightSidebar');
    var rightSidebarRect = rightSidebar ? rightSidebar.getBoundingClientRect() : null;
    var leftPos = rightSidebarRect ? (rightSidebarRect.left - 340) : (window.innerWidth - 380);
    var topPos = 80;
    
    var html = '<div id="fontSlidePanel" style="position: fixed; left: ' + leftPos + 'px; top: ' + topPos + 'px; width: 340px; height: calc(100vh - 80px); background: var(--panel-bg, rgba(255, 255, 255, 0.95)); backdrop-filter: blur(8px); border-radius: 0px; box-shadow: -2px 0 12px rgba(0,0,0,0.15); z-index: 1000; display: flex; flex-direction: column;">' +
        '<div class="right-slide-panel-header" style="padding: 16px; border-bottom: 1px solid var(--border-color, rgba(0,0,0,0.1)); display: flex; justify-content: space-between; align-items: center;">' +
        '<h3 style="margin:0;">字体设置</h3>' +
        '<button class="right-slide-panel-close" style="background:none; border:none; font-size:20px; cursor:pointer; color: var(--text-color, #333);">✕</button>' +
        '</div>' +
        '<div class="right-slide-panel-content" style="flex:1; overflow-y:auto; padding: 20px;">' +
        
        // 快速字体选择（下拉框）
        '<label style="display:block; margin-bottom:8px;">🔤 快速选择：</label>' +
        '<select id="fontFamilySlide" style="width:100%; margin-bottom:16px; padding:8px; border-radius:6px; border:1px solid #ddd;">' +
        '<option value="system-ui">系统默认</option>' +
        '<option value="Georgia, serif">宋体风格</option>' +
        '<option value="PingFang SC, Microsoft YaHei">苹方/雅黑</option>' +
        '<option value="KaiTi, serif">楷体</option>' +
        '<option value="Courier New, monospace">等宽字体</option>' +
        '</select>' +
        
        // 系统字体列表
        '<div style="margin-bottom:20px;">' +
        '<label style="display:block; margin-bottom:8px;">💻 系统字体：</label>' +
        '<div id="systemFontList" style="border:1px solid var(--border-color, #ddd); border-radius:6px; max-height:150px; overflow-y:auto;">' +
        '<div style="padding:8px; text-align:center; color:#888;">加载中...</div>' +
        '</div>' +
        '</div>' +
        
        // 自定义字体上传
        '<div style="margin-bottom:20px; border:1px dashed var(--border-color, #ddd); border-radius:8px; padding:12px;">' +
        '<label style="display:block; margin-bottom:8px; cursor:pointer;">📁 点击上传自定义字体</label>' +
        '<input type="file" id="customFontUpload" accept=".ttf,.otf,.woff,.woff2" style="width:100%; padding:6px; margin-bottom:8px;">' +
        '<div id="customFontList" style="margin-top:8px; font-size:12px; max-height:100px; overflow-y:auto;"></div>' +
        '</div>' +
        
        // 字号选择
        '<label style="display:block; margin-bottom:8px;">📏 字号：</label>' +
        '<select id="fontSizeSlide" style="width:100%; margin-bottom:16px; padding:8px; border-radius:6px; border:1px solid #ddd;">' +
        '<option value="12">12px</option><option value="14" selected>14px</option>' +
        '<option value="16">16px</option><option value="18">18px</option>' +
        '<option value="20">20px</option><option value="24">24px</option>' +
        '<option value="28">28px</option><option value="32">32px</option>' +
        '<option value="36">36px</option><option value="42">42px</option>' +
        '<option value="48">48px</option><option value="56">56px</option>' +
        '<option value="64">64px</option><option value="72">72px</option>' +
        '<option value="84">84px</option><option value="100">100px</option>' +
        '</select>' +
        
        // 行高选择
        '<label style="display:block; margin-bottom:8px;">📐 行高：</label>' +
        '<select id="lineHeightSlide" style="width:100%; margin-bottom:20px; padding:8px; border-radius:6px; border:1px solid #ddd;">' +
        '<option value="1.2">1.2（紧凑）</option>' +
        '<option value="1.4">1.4</option>' +
        '<option value="1.6">1.6</option>' +
        '<option value="1.8" selected>1.8（舒适）</option>' +
        '<option value="2.0">2.0</option>' +
        '<option value="2.2">2.2</option>' +
        '<option value="2.5">2.5（宽松）</option>' +
        '</select>' +
        
        '</div></div>';
    
    document.body.insertAdjacentHTML('beforeend', html);
    
    var panelEl = document.getElementById('fontSlidePanel');
    panelEl.querySelector('.right-slide-panel-close').onclick = function() { panelEl.remove(); };
    
    var editor = document.getElementById('editor');
    
    // 字体选择
    var fontSelect = document.getElementById('fontFamilySlide');
    fontSelect.onchange = function() { 
        if (editor) editor.style.fontFamily = this.value; 
        localStorage.setItem('editor_font_family', this.value);
    };
    
    // 字号选择
    var sizeSelect = document.getElementById('fontSizeSlide');
    sizeSelect.onchange = function() { 
        if (editor) editor.style.fontSize = this.value + 'px'; 
        localStorage.setItem('editor_font_size', this.value);
    };
    
    // 行高选择
    var lineHeightSelect = document.getElementById('lineHeightSlide');
    lineHeightSelect.onchange = function() { 
        if (editor) editor.style.lineHeight = this.value; 
        localStorage.setItem('editor_line_height', this.value);
    };
    
    // 加载保存的值
    var savedFont = localStorage.getItem('editor_font_family');
    var savedSize = localStorage.getItem('editor_font_size');
    var savedLine = localStorage.getItem('editor_line_height');
    if (savedFont) fontSelect.value = savedFont;
    if (savedSize) sizeSelect.value = savedSize;
    if (savedLine) lineHeightSelect.value = savedLine;
    if (editor) {
        if (savedFont) editor.style.fontFamily = savedFont;
        if (savedSize) editor.style.fontSize = savedSize + 'px';
        if (savedLine) editor.style.lineHeight = savedLine;
    }
    
    // 加载系统字体列表
    loadSystemFonts();
    
    // 加载自定义字体列表
    loadCustomFonts();
    
    // 自定义字体上传
    var fontUpload = document.getElementById('customFontUpload');
    fontUpload.onchange = function(e) {
        var file = e.target.files[0];
        if (file && (file.type === 'font/ttf' || file.type === 'font/otf' || 
                     file.name.endsWith('.ttf') || file.name.endsWith('.otf') ||
                     file.name.endsWith('.woff') || file.name.endsWith('.woff2'))) {
            installCustomFont(file);
        } else {
            alert('请选择有效的字体文件（.ttf, .otf, .woff, .woff2）');
        }
    };
}

// 加载系统字体列表
function loadSystemFonts() {
    var container = document.getElementById('systemFontList');
    if (!container) return;
    
    // 常见的系统字体列表
    var systemFonts = [
        { name: '苹方 (PingFang SC)', family: 'PingFang SC, system-ui' },
        { name: '微软雅黑 (Microsoft YaHei)', family: 'Microsoft YaHei, system-ui' },
        { name: '宋体 (SimSun)', family: 'SimSun, serif' },
        { name: '黑体 (SimHei)', family: 'SimHei, sans-serif' },
        { name: '楷体 (KaiTi)', family: 'KaiTi, serif' },
        { name: '仿宋 (FangSong)', family: 'FangSong, serif' },
        { name: '思源黑体 (Source Han Sans)', family: 'Source Han Sans, sans-serif' },
        { name: '思源宋体 (Source Han Serif)', family: 'Source Han Serif, serif' },
        { name: '阿里巴巴惠普体', family: 'Alibaba PuHuiTi, sans-serif' },
        { name: '霞鹜文楷 (LXGW WenKai)', family: 'LXGW WenKai, cursive' },
        { name: 'JetBrains Mono', family: 'JetBrains Mono, monospace' },
        { name: 'Fira Code', family: 'Fira Code, monospace' }
    ];
    
    var html = '';
    for (var i = 0; i < systemFonts.length; i++) {
        var font = systemFonts[i];
        html += '<div style="display:flex; justify-content:space-between; align-items:center; padding:8px; border-bottom:1px solid #eee; cursor:pointer;" onclick="applySystemFont(\'' + font.family.replace(/'/g, "\\'") + '\', \'' + font.name.replace(/'/g, "\\'") + '\')">' +
            '<span style="font-family:\'' + font.family + '\';">' + font.name + '</span>' +
            '<span style="font-size:11px; color:#888;">预览</span>' +
            '</div>';
    }
    container.innerHTML = html;
}

// 应用系统字体
function applySystemFont(fontFamily, fontName) {
    var editor = document.getElementById('editor');
    if (editor) {
        editor.style.fontFamily = fontFamily;
        localStorage.setItem('editor_font_family', fontFamily);
        var fontSelect = document.getElementById('fontFamilySlide');
        if (fontSelect) fontSelect.value = fontFamily;
        alert('已应用字体：' + fontName);
    }
}

// 加载自定义字体列表
function loadCustomFonts() {
    var fontList = localStorage.getItem('custom_fonts');
    var fonts = fontList ? JSON.parse(fontList) : [];
    var container = document.getElementById('customFontList');
    if (!container) return;
    
    if (fonts.length === 0) {
        container.innerHTML = '<div style="color:#888; padding:8px; text-align:center;">暂无安装的字体，点击上方按钮安装</div>';
        return;
    }
    
    var html = '';
    for (var i = 0; i < fonts.length; i++) {
        html += '<div style="display:flex; justify-content:space-between; align-items:center; padding:8px; border-bottom:1px solid #eee;">' +
            '<span style="font-family:\'' + fonts[i].name + '\', system-ui;">' + fonts[i].name + '</span>' +
            '<button class="delete-font-btn" data-font="' + fonts[i].name + '" style="padding:2px 8px; background:#dc3545; color:white; border:none; border-radius:4px; cursor:pointer;">删除</button>' +
            '<button class="apply-font-btn" data-font="' + fonts[i].name + '" style="padding:2px 8px; background:#28a745; color:white; border:none; border-radius:4px; cursor:pointer;">应用</button>' +
            '</div>';
    }
    container.innerHTML = html;
    
    // 删除字体
    document.querySelectorAll('.delete-font-btn').forEach(btn => {
        btn.onclick = function() {
            var fontName = this.getAttribute('data-font');
            deleteCustomFont(fontName);
        };
    });
    
    // 应用字体
    document.querySelectorAll('.apply-font-btn').forEach(btn => {
        btn.onclick = function() {
            var fontName = this.getAttribute('data-font');
            var editor = document.getElementById('editor');
            if (editor) editor.style.fontFamily = "'" + fontName + "', system-ui";
            localStorage.setItem('editor_font_family', "'" + fontName + "', system-ui");
            var fontSelect = document.getElementById('fontFamilySlide');
            if (fontSelect) fontSelect.value = "'" + fontName + "', system-ui";
        };
    });
}

// 安装自定义字体
function installCustomFont(file) {
    var reader = new FileReader();
    reader.onload = function(e) {
        var fontData = e.target.result;
        var fontName = file.name.replace(/\.(ttf|otf|woff|woff2)$/i, '');
        
        // 创建字体样式
        var styleId = 'custom_font_' + fontName.replace(/[^a-zA-Z0-9]/g, '_');
        var existingStyle = document.getElementById(styleId);
        if (existingStyle) existingStyle.remove();
        
        var fontFace = '@font-face { font-family: "' + fontName + '"; src: url(' + fontData + '); }';
        var style = document.createElement('style');
        style.id = styleId;
        style.textContent = fontFace;
        document.head.appendChild(style);
        
        // 保存字体名称
        var fonts = JSON.parse(localStorage.getItem('custom_fonts') || '[]');
        var exists = fonts.some(function(f) { return f.name === fontName; });
        if (!exists) {
            fonts.push({ name: fontName });
            localStorage.setItem('custom_fonts', JSON.stringify(fonts));
        }
        
        // 刷新列表
        loadCustomFonts();
        alert('字体 "' + fontName + '" 安装成功！');
    };
    reader.readAsDataURL(file);
}

// 删除自定义字体
function deleteCustomFont(fontName) {
    if (confirm('确定要删除字体 "' + fontName + '" 吗？')) {
        // 删除样式
        var styleId = 'custom_font_' + fontName.replace(/[^a-zA-Z0-9]/g, '_');
        var style = document.getElementById(styleId);
        if (style) style.remove();
        
        // 从 localStorage 删除
        var fonts = JSON.parse(localStorage.getItem('custom_fonts') || '[]');
        fonts = fonts.filter(function(f) { return f.name !== fontName; });
        localStorage.setItem('custom_fonts', JSON.stringify(fonts));
        
        // 刷新列表
        loadCustomFonts();
        
        // 如果当前使用的是这个字体，恢复默认
        var editor = document.getElementById('editor');
        if (editor && editor.style.fontFamily.indexOf(fontName) !== -1) {
            editor.style.fontFamily = 'system-ui';
            localStorage.setItem('editor_font_family', 'system-ui');
            var fontSelect = document.getElementById('fontFamilySlide');
            if (fontSelect) fontSelect.value = 'system-ui';
        }
        
        alert('字体 "' + fontName + '" 已删除');
    }
}

// ========== 导出面板（从右边栏左侧滑出） ==========
function openExportPanel() {
    var panel = document.getElementById('exportSlidePanel');
    if (panel) {
        panel.remove();
        return;
    }
    
    var rightSidebar = document.getElementById('rightSidebar');
    var rightSidebarRect = rightSidebar ? rightSidebar.getBoundingClientRect() : null;
    var leftPos = rightSidebarRect ? (rightSidebarRect.left - 340) : (window.innerWidth - 380);
    var topPos = 80;  // 固定顶部位置
    
    var html = '<div id="exportSlidePanel" style="position: fixed; left: ' + leftPos + 'px; top: ' + topPos + 'px; width: 340px; height: calc(100vh - 80px); background: var(--panel-bg, rgba(255, 255, 255, 0.95)); backdrop-filter: blur(8px); border-radius: 0px; box-shadow: -2px 0 12px rgba(0,0,0,0.15); z-index: 1000; display: flex; flex-direction: column;">' +
        '<div class="right-slide-panel-header" style="padding: 16px; border-bottom: 1px solid var(--border-color, rgba(0,0,0,0.1)); display: flex; justify-content: space-between; align-items: center;"><h3 style="margin:0;">导出</h3><button class="right-slide-panel-close" style="background:none; border:none; font-size:20px; cursor:pointer; color: var(--text-color, #333);">✕</button></div>' +
        '<div class="right-slide-panel-content" style="flex:1; overflow-y:auto; padding: 20px;">' +
        '<button id="exportChapterBtn" class="btn-primary" style="width:100%; padding:12px; margin-bottom:12px; background:#9b784e; color:white; border:none; border-radius:8px; cursor:pointer;">导出本章</button>' +
        '<button id="exportBookBtn" class="btn-secondary" style="width:100%; padding:12px; background:#6c757d; color:white; border:none; border-radius:8px; cursor:pointer;">导出全书</button>' +
        '</div></div>';
    document.body.insertAdjacentHTML('beforeend', html);
    
    var panelEl = document.getElementById('exportSlidePanel');
    panelEl.querySelector('.right-slide-panel-close').onclick = function() { panelEl.remove(); };
    panelEl.querySelector('#exportChapterBtn').onclick = function() { if (typeof exportChapter === 'function') exportChapter(); panelEl.remove(); };
    panelEl.querySelector('#exportBookBtn').onclick = function() { if (typeof exportBook === 'function') exportBook(); panelEl.remove(); };
}

// ========== 闭关面板（从右边栏左侧滑出） ==========
function openSeclusionPanel() {
    var panel = document.getElementById('seclusionSlidePanel');
    if (panel) {
        panel.remove();
        return;
    }
    
    var rightSidebar = document.getElementById('rightSidebar');
    var rightSidebarRect = rightSidebar ? rightSidebar.getBoundingClientRect() : null;
    var leftPos = rightSidebarRect ? (rightSidebarRect.left - 340) : (window.innerWidth - 380);
    var topPos = 80;  // 固定顶部位置
    
    var html = '<div id="seclusionSlidePanel" style="position: fixed; left: ' + leftPos + 'px; top: ' + topPos + 'px; width: 340px; height: calc(100vh - 80px); background: var(--panel-bg, rgba(255, 255, 255, 0.95)); backdrop-filter: blur(8px); border-radius: 0px; box-shadow: -2px 0 12px rgba(0,0,0,0.15); z-index: 1000; display: flex; flex-direction: column;">' +
        '<div class="right-slide-panel-header" style="padding: 16px; border-bottom: 1px solid var(--border-color, rgba(0,0,0,0.1)); display: flex; justify-content: space-between; align-items: center;"><h3 style="margin:0;">闭关修炼</h3><button class="right-slide-panel-close" style="background:none; border:none; font-size:20px; cursor:pointer; color: var(--text-color, #333);">✕</button></div>' +
        '<div class="right-slide-panel-content" style="flex:1; overflow-y:auto; padding: 20px;">' +
        '<label style="display:block; margin-bottom:8px;">目标字数：</label><input type="number" id="seclusionGoal" value="3000" style="width:100%; margin-bottom:16px; padding:8px; border-radius:6px; border:1px solid #ddd;">' +
        '<label style="display:block; margin-bottom:8px;">自动出关时间（小时）：</label><input type="number" id="seclusionTimeout" value="0" style="width:100%; margin-bottom:16px; padding:8px; border-radius:6px; border:1px solid #ddd;">' +
        '<div id="seclusionProgress" style="display:none;"><div>进度：<span id="seclusionCurrent">0</span> / <span id="seclusionGoalDisplay">3000</span></div>' +
        '<div style="height:8px; background:#ddd; margin-top:8px; border-radius:4px;"><div id="seclusionProgressFill" style="height:100%; width:0%; background:#007aff; border-radius:4px;"></div></div></div>' +
        '<button id="startSeclusionBtn" class="btn-primary" style="width:100%; padding:10px; margin-top:12px; background:#9b784e; color:white; border:none; border-radius:8px; cursor:pointer;">开始闭关</button>' +
        '<button id="stopSeclusionBtn" class="btn-danger" style="width:100%; padding:10px; margin-top:8px; background:#dc3545; color:white; border:none; border-radius:8px; cursor:pointer; display:none;">结束闭关</button>' +
        '</div></div>';
    document.body.insertAdjacentHTML('beforeend', html);
    
    var panelEl = document.getElementById('seclusionSlidePanel');
    panelEl.querySelector('.right-slide-panel-close').onclick = function() { 
        if (seclusionActive) endSeclusion(false);
        panelEl.remove(); 
    };
    panelEl.querySelector('#startSeclusionBtn').onclick = function() { startSeclusion(); panelEl.remove(); };
    panelEl.querySelector('#stopSeclusionBtn').onclick = function() { endSeclusion(false); alert('闭关已结束'); panelEl.remove(); };
}

// 闭关相关变量和函数
var seclusionActive = false, seclusionTimer = null, seclusionCheckInterval = null;

function startSeclusion() {
    var goal = parseInt(document.getElementById('seclusionGoal').value);
    var timeout = parseInt(document.getElementById('seclusionTimeout').value);
    if (isNaN(goal) || goal <= 0) { alert('请输入有效目标字数'); return; }
    seclusionActive = true;
    var startWords = getCurrentWordCount();
    document.getElementById('seclusionProgress').style.display = 'block';
    document.getElementById('seclusionGoalDisplay').innerText = goal;
    document.getElementById('startSeclusionBtn').style.display = 'none';
    document.getElementById('stopSeclusionBtn').style.display = 'block';
    if (timeout > 0) seclusionTimer = setTimeout(function() { if (seclusionActive) { endSeclusion(false); alert('时间到，自动出关！'); } }, timeout * 3600000);
    if (seclusionCheckInterval) clearInterval(seclusionCheckInterval);
    seclusionCheckInterval = setInterval(function() {
        if (!seclusionActive) { clearInterval(seclusionCheckInterval); return; }
        var current = getCurrentWordCount();
        var progress = Math.min(100, (current - startWords) / goal * 100);
        document.getElementById('seclusionCurrent').innerText = current - startWords;
        document.getElementById('seclusionProgressFill').style.width = progress + '%';
        if (current - startWords >= goal) { endSeclusion(true); alert('恭喜！完成闭关目标！'); clearInterval(seclusionCheckInterval); }
    }, 1000);
}

function endSeclusion(success) {
    seclusionActive = false;
    if (seclusionTimer) clearTimeout(seclusionTimer);
    var startBtn = document.getElementById('startSeclusionBtn');
    var stopBtn = document.getElementById('stopSeclusionBtn');
    if (startBtn) startBtn.style.display = 'block';
    if (stopBtn) stopBtn.style.display = 'none';
    var progressDiv = document.getElementById('seclusionProgress');
    if (progressDiv) progressDiv.style.display = 'none';
}

function getCurrentWordCount() {
    if (typeof getCurrentChapter === 'function') {
        var ch = getCurrentChapter();
        if (ch && ch.content) return ch.content.replace(/<[^>]*>/g, '').length;
    }
    var editor = document.getElementById('editor');
    if (editor) return editor.innerText.length;
    return 0;
}

// ========== 查找替换浮动窗口 ==========
function openFindReplacePanel() {
    var existingWin = document.getElementById('findReplaceFloatWin');
    if (existingWin) {
        existingWin.style.display = 'flex';
        existingWin.style.zIndex = '10000';
        return;
    }
    
    // 获取右边栏的位置，让查找替换面板出现在右边栏左侧
    var rightSidebar = document.getElementById('rightSidebar');
    var rightSidebarRect = rightSidebar ? rightSidebar.getBoundingClientRect() : null;
    var leftPos = rightSidebarRect ? (rightSidebarRect.left - 420) : (window.innerWidth - 440);
    var topPos = rightSidebarRect ? (rightSidebarRect.top + 50) : 150;
    
    var win = document.createElement('div');
    win.id = 'findReplaceFloatWin';
    win.style.cssText = 'position: fixed; top: ' + topPos + 'px; left: ' + leftPos + 'px; width: 400px; background: var(--panel-bg, rgba(255, 255, 255, 0.95)); backdrop-filter: blur(8px); border-radius: 0px; box-shadow: 0 8px 28px rgba(0,0,0,0.25); z-index: 10000; overflow: hidden; font-family: system-ui, -apple-system, sans-serif;';
    
    win.innerHTML = 
        '<div class="find-header" style="padding: 16px 20px; background: var(--header-bg, rgba(0,0,0,0.03)); border-bottom: 1px solid var(--border-color, rgba(0,0,0,0.1)); display: flex; justify-content: space-between; align-items: center; cursor: move;">' +
        '<h3 style="margin: 0; font-size: 16px; font-weight: 600; color: var(--text-color, #333);">查找替换</h3>' +
        '<button class="find-close-btn" style="background: none; border: none; font-size: 20px; cursor: pointer; color: var(--text-color, #999);">✕</button>' +
        '</div>' +
        '<div style="padding: 20px;">' +
        '<div style="margin-bottom: 20px;">' +
        '<label style="display: block; font-size: 13px; font-weight: 500; margin-bottom: 8px; color: var(--text-color, #333);">查找</label>' +
        '<input type="text" id="findTextFloat" placeholder="输入查找词" style="width: 100%; padding: 10px 12px; border: 1px solid var(--border-color, #ddd); border-radius: 8px; font-size: 14px; outline: none; box-sizing: border-box; background: var(--input-bg, #fff); color: var(--text-color, #333);">' +
        '<button id="searchBookBtn" style="margin-top: 8px; padding: 6px 12px; background: var(--btn-bg, #f0f0f0); border: 1px solid var(--border-color, #ddd); border-radius: 6px; cursor: pointer; font-size: 12px; color: var(--text-color, #333);">🔍 搜索全书</button>' +
        '</div>' +
        '<div style="margin-bottom: 24px;">' +
        '<label style="display: block; font-size: 13px; font-weight: 500; margin-bottom: 8px; color: var(--text-color, #333);">替换</label>' +
        '<input type="text" id="replaceTextFloat" placeholder="输入替换词" style="width: 100%; padding: 10px 12px; border: 1px solid var(--border-color, #ddd); border-radius: 8px; font-size: 14px; outline: none; box-sizing: border-box; background: var(--input-bg, #fff); color: var(--text-color, #333);">' +
        '</div>' +
        '<div style="display: flex; gap: 12px; flex-wrap: wrap;">' +
        '<button id="replaceCurrentBtn" class="find-btn" style="flex: 1; padding: 8px 12px; background: var(--btn-bg, #f0f0f0); border: 1px solid var(--border-color, #ddd); border-radius: 8px; cursor: pointer; font-size: 13px; color: var(--text-color, #333);">替换</button>' +
        '<button id="replaceChapterBtn" class="find-btn" style="flex: 1; padding: 8px 12px; background: var(--btn-bg, #f0f0f0); border: 1px solid var(--border-color, #ddd); border-radius: 8px; cursor: pointer; font-size: 13px; color: var(--text-color, #333);">本章替换</button>' +
        '<button id="replaceAllBtn" class="find-btn" style="flex: 1; padding: 8px 12px; background: var(--btn-bg, #f0f0f0); border: 1px solid var(--border-color, #ddd); border-radius: 8px; cursor: pointer; font-size: 13px; color: var(--text-color, #333);">全书替换</button>' +
        '</div>' +
        '<div id="searchResultArea" style="margin-top: 16px; padding: 10px; background: var(--result-bg, #f8f8f8); border-radius: 8px; font-size: 12px; color: var(--text-color, #666); display: none;"></div>' +
        '</div>';
    
    document.body.appendChild(win);
    
    // 拖拽功能
    var header = win.querySelector('.find-header');
    var isDragging = false;
    var offsetX, offsetY;
    
    header.addEventListener('mousedown', function(e) {
        if (e.target.tagName === 'BUTTON') return;
        isDragging = true;
        offsetX = e.clientX - win.offsetLeft;
        offsetY = e.clientY - win.offsetTop;
        win.style.transform = 'none';
        win.style.top = win.offsetTop + 'px';
        win.style.left = win.offsetLeft + 'px';
    });
    
    document.addEventListener('mousemove', function(e) {
        if (!isDragging) return;
        var newLeft = e.clientX - offsetX;
        var newTop = e.clientY - offsetY;
        var maxLeft = window.innerWidth - win.offsetWidth;
        var maxTop = window.innerHeight - win.offsetHeight;
        newLeft = Math.max(0, Math.min(newLeft, maxLeft));
        newTop = Math.max(0, Math.min(newTop, maxTop));
        win.style.left = newLeft + 'px';
        win.style.top = newTop + 'px';
    });
    
    document.addEventListener('mouseup', function() {
        isDragging = false;
    });
    
    // 关闭按钮
    win.querySelector('.find-close-btn').onclick = function() {
        win.style.display = 'none';
    };
    
    // 替换当前章节
    win.querySelector('#replaceCurrentBtn').onclick = function() {
        var findText = document.getElementById('findTextFloat').value;
        var replaceText = document.getElementById('replaceTextFloat').value;
        var editor = document.getElementById('editor');
        if (!editor || !findText) {
            alert('请输入查找内容');
            return;
        }
        
        var content = editor.innerHTML;
        if (content.indexOf(findText) !== -1) {
            editor.innerHTML = content.replace(findText, replaceText);
            if (typeof saveCurrentChapter === 'function') saveCurrentChapter();
            alert('已替换当前章节中的 "' + findText + '"');
        } else {
            alert('未找到 "' + findText + '"');
        }
    };
    
    // 替换本章所有匹配
    win.querySelector('#replaceChapterBtn').onclick = function() {
        var findText = document.getElementById('findTextFloat').value;
        var replaceText = document.getElementById('replaceTextFloat').value;
        var editor = document.getElementById('editor');
        if (!editor || !findText) {
            alert('请输入查找内容');
            return;
        }
        
        var content = editor.innerHTML;
        var regex = new RegExp(findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
        var matches = content.match(regex);
        var count = matches ? matches.length : 0;
        
        if (count > 0) {
            var newContent = content.replace(regex, replaceText);
            editor.innerHTML = newContent;
            if (typeof saveCurrentChapter === 'function') saveCurrentChapter();
            alert('本章已替换 ' + count + ' 处');
        } else {
            alert('未找到 "' + findText + '"');
        }
    };
    
    // 全书替换
    win.querySelector('#replaceAllBtn').onclick = function() {
        var findText = document.getElementById('findTextFloat').value;
        var replaceText = document.getElementById('replaceTextFloat').value;
        if (!findText) {
            alert('请输入查找内容');
            return;
        }
        
        var totalCount = 0;
        var regex = new RegExp(findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
        
        for (var i = 0; i < books.length; i++) {
            var book = books[i];
            if (book.volumes) {
                for (var j = 0; j < book.volumes.length; j++) {
                    var vol = book.volumes[j];
                    if (vol.chapters) {
                        for (var k = 0; k < vol.chapters.length; k++) {
                            var ch = vol.chapters[k];
                            if (ch.content) {
                                var matches = (ch.content.match(regex) || []).length;
                                if (matches > 0) {
                                    ch.content = ch.content.replace(regex, replaceText);
                                    totalCount += matches;
                                }
                            }
                        }
                    }
                }
            }
        }
        
        if (totalCount > 0) {
            if (typeof saveAllData === 'function') saveAllData();
            if (typeof renderCurrentChapter === 'function') renderCurrentChapter();
            alert('全书已替换 ' + totalCount + ' 处');
        } else {
            alert('未找到 "' + findText + '"');
        }
    };
    
    // 搜索全书
    win.querySelector('#searchBookBtn').onclick = function() {
        var findText = document.getElementById('findTextFloat').value;
        var resultArea = document.getElementById('searchResultArea');
        if (!findText) {
            alert('请输入查找内容');
            return;
        }
        
        var results = [];
        var regex = new RegExp(findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
        
        for (var i = 0; i < books.length; i++) {
            var book = books[i];
            if (book.volumes) {
                for (var j = 0; j < book.volumes.length; j++) {
                    var vol = book.volumes[j];
                    if (vol.chapters) {
                        for (var k = 0; k < vol.chapters.length; k++) {
                            var ch = vol.chapters[k];
                            if (ch.content) {
                                var matches = ch.content.match(regex);
                                if (matches && matches.length > 0) {
                                    results.push({
                                        bookTitle: book.title,
                                        volName: vol.name,
                                        chapterTitle: ch.title,
                                        chapterId: ch.id,
                                        volId: vol.id,
                                        bookId: book.id,
                                        count: matches.length
                                    });
                                }
                            }
                        }
                    }
                }
            }
        }
        
        if (results.length > 0) {
            var html = '<div style="max-height: 200px; overflow-y: auto;">';
            for (var r = 0; r < results.length; r++) {
                var res = results[r];
                html += '<div style="padding: 8px; border-bottom: 1px solid var(--border-color, #e0e0e0); cursor: pointer;" onclick="jumpToChapter(\'' + res.bookId + '\', \'' + res.volId + '\', \'' + res.chapterId + '\', \'' + findText.replace(/'/g, "\\'") + '\')">' +
                    '<div style="font-weight: 500; color: var(--text-color, #333);">📖 ' + escapeHtml(res.bookTitle) + '</div>' +
                    '<div style="font-size: 11px; color: var(--text-muted, #888);">' + escapeHtml(res.volName) + ' / ' + escapeHtml(res.chapterTitle) + '</div>' +
                    '<div style="font-size: 11px; color: #007aff;">找到 ' + res.count + ' 处</div>' +
                    '</div>';
            }
            html += '</div>';
            resultArea.innerHTML = html;
            resultArea.style.display = 'block';
        } else {
            resultArea.innerHTML = '<div style="text-align: center; padding: 10px; color: var(--text-color, #666);">未找到 "' + escapeHtml(findText) + '"</div>';
            resultArea.style.display = 'block';
        }
    };
    
    win.style.display = 'flex';
}

// ========== 双栏模式 ==========
// ========== 简化版双栏模式 ==========
// ========== 简化版双栏模式（跟随主题） ==========
function toggleDualMode() {
    var editor = document.getElementById('editor');
    if (!editor) {
        alert('请先打开一本书籍');
        return;
    }
    
    var editorContainer = editor.parentElement;
    var existingDual = document.getElementById('dualEditorContainer');
    
    if (existingDual) {
        existingDual.remove();
        editor.style.display = 'block';
        return;
    }
    
    var originalContent = editor.innerHTML;
    
    // 获取当前编辑器的字体和行高设置
    var currentFontSize = editor.style.fontSize || localStorage.getItem('editor_font_size') + 'px' || '14px';
    var currentLineHeight = editor.style.lineHeight || localStorage.getItem('editor_line_height') || '1.8';
    var currentFontFamily = editor.style.fontFamily || localStorage.getItem('editor_font_family') || 'system-ui';
    
    editor.style.display = 'none';
    
    // 左侧保持原样（使用当前编辑器的设置）
    // 右侧使用紧凑模式（小字号、小行高）
    var dualHtml = '<div id="dualEditorContainer" style="display:flex; flex:1; height:100%; width:100%; position:relative;">' +
        '<div id="dualLeft" contenteditable="true" style="flex:1; overflow:auto; padding:16px; outline:none; line-height:' + currentLineHeight + '; font-size:' + currentFontSize + '; font-family:' + currentFontFamily + '; background: var(--panel-bg, rgba(255,255,255,0.9)); color: var(--text-color, #333);">' + originalContent + '</div>' +
        '<div id="dualResizeHandle" style="width:4px; cursor:col-resize; background:rgba(0,122,255,0.3); transition:background 0.2s;"></div>' +
        '<div id="dualRight" contenteditable="true" style="flex:1; overflow:auto; padding:16px; outline:none; line-height:1.4; font-size:13px; font-family:system-ui; background: var(--panel-bg, rgba(255,255,255,0.9)); color: var(--text-color, #333);">' + originalContent + '</div>' +
        '<button id="exitDualBtn" style="position:absolute; bottom:16px; right:16px; padding:6px 12px; background:#dc3545; color:white; border:none; border-radius:16px; cursor:pointer; font-size:12px; z-index:10;">退出</button>' +
        '</div>';
    
    editorContainer.insertAdjacentHTML('beforeend', dualHtml);
    
    var leftArea = document.getElementById('dualLeft');
    var rightArea = document.getElementById('dualRight');
    var resizeHandle = document.getElementById('dualResizeHandle');
    var exitBtn = document.getElementById('exitDualBtn');
    var isResizing = false;
    var startX = 0;
    var startLeftWidth = 0;
    var containerWidth = 0;
    
    resizeHandle.addEventListener('mousedown', function(e) {
        e.preventDefault();
        isResizing = true;
        startX = e.clientX;
        var leftRect = leftArea.getBoundingClientRect();
        startLeftWidth = leftRect.width;
        containerWidth = leftArea.parentElement.clientWidth;
        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';
    });
    
    document.addEventListener('mousemove', function(e) {
        if (!isResizing) return;
        var deltaX = e.clientX - startX;
        var newLeftWidth = startLeftWidth + deltaX;
        var percent = (newLeftWidth / containerWidth) * 100;
        if (percent < 20) percent = 20;
        if (percent > 80) percent = 80;
        leftArea.style.flex = percent;
        rightArea.style.flex = 100 - percent;
    });
    
    document.addEventListener('mouseup', function() {
        if (isResizing) {
            isResizing = false;
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
            var leftPercent = leftArea.style.flex;
            if (leftPercent) localStorage.setItem('dual_width_ratio', leftPercent);
        }
    });
    
    resizeHandle.addEventListener('mouseover', function() { this.style.background = '#007aff'; });
    resizeHandle.addEventListener('mouseout', function() { this.style.background = 'rgba(0,122,255,0.3)'; });
    
    // 同步左右内容（但保持各自的样式）
    leftArea.addEventListener('input', function() {
        rightArea.innerHTML = this.innerHTML;
        editor.innerHTML = this.innerHTML;
        if (typeof saveCurrentChapter === 'function') saveCurrentChapter();
    });
    
    rightArea.addEventListener('input', function() {
        leftArea.innerHTML = this.innerHTML;
        editor.innerHTML = this.innerHTML;
        if (typeof saveCurrentChapter === 'function') saveCurrentChapter();
    });
    
    exitBtn.onclick = function() {
        document.getElementById('dualEditorContainer').remove();
        editor.style.display = 'block';
        if (typeof saveCurrentChapter === 'function') saveCurrentChapter();
    };
    
    var savedRatio = localStorage.getItem('dual_width_ratio');
    if (savedRatio) {
        leftArea.style.flex = savedRatio;
        rightArea.style.flex = 100 - parseFloat(savedRatio);
    }
}

// ========== 备忘录模式 ==========
// ========== 简化版备忘录模式 ==========
// ========== 简化版备忘录模式（跟随主题） ==========
function toggleMemoMode() {
    var editor = document.getElementById('editor');
    if (!editor) {
        alert('请先打开一本书籍');
        return;
    }
    
    var editorContainer = editor.parentElement;
    var existingMemo = document.getElementById('memoEditorContainer');
    
    if (existingMemo) {
        existingMemo.remove();
        editor.style.display = 'block';
        return;
    }
    
    // 获取当前编辑器的字体和行高设置
    var currentFontSize = editor.style.fontSize || localStorage.getItem('editor_font_size') + 'px' || '14px';
    var currentLineHeight = editor.style.lineHeight || localStorage.getItem('editor_line_height') || '1.8';
    var currentFontFamily = editor.style.fontFamily || localStorage.getItem('editor_font_family') || 'system-ui';
    
    var currentBook = typeof getCurrentBook === 'function' ? getCurrentBook() : null;
    var memoKey = 'memo_content_' + (currentBook ? currentBook.id : 'global');
    var savedMemo = localStorage.getItem(memoKey) || '';
    var originalContent = editor.innerHTML;
    editor.style.display = 'none';
    
    // 左侧保持原样（使用当前编辑器的设置）
    // 右侧备忘录使用稍微小一点的字体，但保持可读
    var memoHtml = '<div id="memoEditorContainer" style="display:flex; flex:1; height:100%; width:100%; position:relative;">' +
        '<div id="memoLeft" contenteditable="true" style="flex:1; overflow:auto; padding:16px; outline:none; line-height:' + currentLineHeight + '; font-size:' + currentFontSize + '; font-family:' + currentFontFamily + '; background: var(--panel-bg, rgba(255,255,255,0.9)); color: var(--text-color, #333);">' + originalContent + '</div>' +
        '<div id="memoResizeHandle" style="width:4px; cursor:col-resize; background:rgba(0,122,255,0.3); transition:background 0.2s;"></div>' +
        '<div id="memoRight" contenteditable="true" style="flex:1; overflow:auto; padding:16px; outline:none; line-height:1.6; font-size:14px; font-family:system-ui; background: var(--panel-bg, rgba(255,255,248,0.95)); color: var(--text-color, #333);">' + (savedMemo || '📓 备忘录\n\n在这里记录灵感、待办事项、人物设定等，内容会跨章节保存...') + '</div>' +
        '<button id="exitMemoBtn" style="position:absolute; bottom:16px; right:16px; padding:6px 12px; background:#dc3545; color:white; border:none; border-radius:16px; cursor:pointer; font-size:12px; z-index:10;">退出</button>' +
        '</div>';
    
    editorContainer.insertAdjacentHTML('beforeend', memoHtml);
    
    var leftArea = document.getElementById('memoLeft');
    var rightArea = document.getElementById('memoRight');
    var resizeHandle = document.getElementById('memoResizeHandle');
    var exitBtn = document.getElementById('exitMemoBtn');
    var isResizing = false;
    var startX = 0;
    var startLeftWidth = 0;
    var containerWidth = 0;
    
    resizeHandle.addEventListener('mousedown', function(e) {
        e.preventDefault();
        isResizing = true;
        startX = e.clientX;
        var leftRect = leftArea.getBoundingClientRect();
        startLeftWidth = leftRect.width;
        containerWidth = leftArea.parentElement.clientWidth;
        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';
    });
    
    document.addEventListener('mousemove', function(e) {
        if (!isResizing) return;
        var deltaX = e.clientX - startX;
        var newLeftWidth = startLeftWidth + deltaX;
        var percent = (newLeftWidth / containerWidth) * 100;
        if (percent < 20) percent = 20;
        if (percent > 80) percent = 80;
        leftArea.style.flex = percent;
        rightArea.style.flex = 100 - percent;
    });
    
    document.addEventListener('mouseup', function() {
        if (isResizing) {
            isResizing = false;
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
            var leftPercent = leftArea.style.flex;
            if (leftPercent) localStorage.setItem('memo_width_ratio', leftPercent);
        }
    });
    
    resizeHandle.addEventListener('mouseover', function() { this.style.background = '#007aff'; });
    resizeHandle.addEventListener('mouseout', function() { this.style.background = 'rgba(0,122,255,0.3)'; });
    
    // 左侧编辑时保存到章节
    leftArea.addEventListener('input', function() {
        editor.innerHTML = this.innerHTML;
        if (typeof saveCurrentChapter === 'function') saveCurrentChapter();
    });
    
    // 右侧编辑时保存备忘录到 localStorage
    rightArea.addEventListener('input', function() {
        var book = typeof getCurrentBook === 'function' ? getCurrentBook() : null;
        var key = 'memo_content_' + (book ? book.id : 'global');
        localStorage.setItem(key, this.innerHTML);
    });
    
    exitBtn.onclick = function() {
        if (rightArea) {
            var book = typeof getCurrentBook === 'function' ? getCurrentBook() : null;
            var key = 'memo_content_' + (book ? book.id : 'global');
            localStorage.setItem(key, rightArea.innerHTML);
        }
        document.getElementById('memoEditorContainer').remove();
        editor.style.display = 'block';
        if (typeof saveCurrentChapter === 'function') saveCurrentChapter();
    };
    
    var savedRatio = localStorage.getItem('memo_width_ratio');
    if (savedRatio) {
        leftArea.style.flex = savedRatio;
        rightArea.style.flex = 100 - parseFloat(savedRatio);
    }
}

// 导出功能
function exportChapter() {
    if (typeof getCurrentChapter === 'function') {
        var ch = getCurrentChapter();
        if (ch) {
            var content = ch.content.replace(/<[^>]*>/g, '');
            var blob = new Blob([content], { type: 'text/plain' });
            var url = URL.createObjectURL(blob);
            var a = document.createElement('a');
            a.href = url;
            a.download = (ch.title || '章节') + '.txt';
            a.click();
            URL.revokeObjectURL(url);
            alert('导出成功');
        }
    }
}

function exportBook() {
    var book = typeof getCurrentBook === 'function' ? getCurrentBook() : null;
    if (!book) { alert('请先打开一本书籍'); return; }
    var content = '';
    if (book.volumes) {
        for (var v = 0; v < book.volumes.length; v++) {
            var vol = book.volumes[v];
            content += vol.name + '\n\n';
            if (vol.chapters) {
                for (var c = 0; c < vol.chapters.length; c++) {
                    var ch = vol.chapters[c];
                    content += ch.title + '\n';
                    content += (ch.content || '').replace(/<[^>]*>/g, '') + '\n\n';
                }
            }
        }
    }
    var blob = new Blob([content], { type: 'text/plain' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = (book.title || '全书') + '.txt';
    a.click();
    URL.revokeObjectURL(url);
    alert('全书导出成功');
}

function toggleRightSidebar() {
    var sidebar = document.getElementById('rightSidebar');
    if (!sidebar) {
        if (typeof createRightSidebar === 'function') sidebar = createRightSidebar();
        else return;
    }
    if (sidebar.classList.contains('collapsed')) {
        sidebar.classList.remove('collapsed');
        sidebar.style.width = '280px';
        sidebar.style.minWidth = '200px';
        localStorage.setItem('rightSidebar_collapsed', 'false');
    } else {
        sidebar.classList.add('collapsed');
        sidebar.style.width = '0';
        sidebar.style.minWidth = '0';
        localStorage.setItem('rightSidebar_collapsed', 'true');
    }
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

function bindToolbarButtons() {
    var btns = document.querySelectorAll('.toolbar-btn');
    for (var i = 0; i < btns.length; i++) {
        var btn = btns[i];
        var action = btn.getAttribute('data-action');
        if (action) {
            btn.onclick = (function(a) { return function() { handleToolbarAction(a); }; })(action);
        }
    }
    console.log('工具栏已绑定，按钮数量:', btns.length);
}

setTimeout(bindToolbarButtons, 500);
