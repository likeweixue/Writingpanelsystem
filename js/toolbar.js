// ========== 工具栏功能 ==========

function handleToolbarAction(action) {
    console.log('点击:', action);
    switch(action) {
        case 'import': importFile(); break;
        case 'importImage': importImage(); break;
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
        case 'clean': quickClean(); break;
        default: console.log('未知:', action);
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

function importImage() {
    var editor = document.getElementById('editor');
    if (!editor) {
        alert('请先打开一本书籍');
        return;
    }
    
    var input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = true;
    
    input.onchange = function(e) {
        var files = e.target.files;
        if (!files || files.length === 0) return;
        
        var selection = window.getSelection();
        var range = selection.getRangeCount() > 0 ? selection.getRangeAt(0) : null;
        
        var insertAtCursor = true;
        if (!range || !editor.contains(range.commonAncestorContainer)) {
            insertAtCursor = false;
            range = document.createRange();
            range.selectNodeContents(editor);
            range.collapse(false);
        }
        
        for (var i = 0; i < files.length; i++) {
            var file = files[i];
            if (file.size > 10 * 1024 * 1024) {
                alert('图片 "' + file.name + '" 超过10MB，请压缩后重试');
                continue;
            }
            if (!file.type.startsWith('image/')) {
                alert('文件 "' + file.name + '" 不是图片格式');
                continue;
            }
            compressAndSaveImage(file, editor, range, insertAtCursor);
        }
    };
    input.click();
}

function compressAndSaveImage(file, editor, originalRange, insertAtCursor) {
    var reader = new FileReader();
    reader.onload = function(ev) {
        var img = new Image();
        img.onload = function() {
            var maxWidth = 800;
            var maxHeight = 800;
            var width = img.width;
            var height = img.height;
            var ratio = 1;
            
            if (width > maxWidth) ratio = maxWidth / width;
            if (height * ratio > maxHeight) ratio = maxHeight / height;
            
            var newWidth = width * ratio;
            var newHeight = height * ratio;
            
            var canvas = document.createElement('canvas');
            canvas.width = newWidth;
            canvas.height = newHeight;
            var ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, newWidth, newHeight);
            
            var compressedDataUrl = canvas.toDataURL('image/jpeg', 0.8);
            
            var originalName = file.name.replace(/\.[^/.]+$/, '');
            var timestamp = Date.now();
            var random = Math.random().toString(36).substring(2, 6);
            var fileName = originalName + '_' + timestamp + '_' + random + '.jpg';
            
            if (window.electron && window.electron.saveImage) {
                window.electron.saveImage(compressedDataUrl, fileName).then(function(result) {
                    if (result.success) {
                        insertImageIntoEditor(result.filePath, file.name, editor, originalRange, insertAtCursor);
                    } else {
                        alert('保存图片失败：' + result.error);
                    }
                }).catch(function(err) {
                    alert('保存图片失败：' + err.message);
                });
            } else {
                insertImageAsBase64(compressedDataUrl, file.name, editor, originalRange, insertAtCursor);
                alert('当前为网页模式，图片将保存在浏览器中。如需保存到本地，请使用桌面应用。');
            }
        };
        img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
}

function insertImageIntoEditor(imagePath, originalName, editor, originalRange, insertAtCursor) {
    var caption = prompt('为图片添加说明（可选）：', originalName);
    
    var imgElement = document.createElement('img');
    imgElement.src = imagePath;
    imgElement.style.maxWidth = '100%';
    imgElement.style.height = 'auto';
    imgElement.style.borderRadius = '8px';
    imgElement.style.margin = '8px 0';
    imgElement.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
    imgElement.setAttribute('alt', originalName);
    
    var container = document.createElement('div');
    container.style.margin = '12px 0';
    container.style.textAlign = 'center';
    container.appendChild(imgElement);
    
    if (caption && caption.trim()) {
        var captionSpan = document.createElement('div');
        captionSpan.textContent = caption.trim();
        captionSpan.style.fontSize = '12px';
        captionSpan.style.color = '#888';
        captionSpan.style.marginTop = '4px';
        container.appendChild(captionSpan);
    }
    
    if (insertAtCursor && originalRange) {
        originalRange.insertNode(container);
        var br = document.createElement('br');
        originalRange.setStartAfter(container);
        originalRange.insertNode(br);
        originalRange.setStartAfter(br);
        var selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(originalRange);
    } else {
        editor.appendChild(container);
        editor.appendChild(document.createElement('br'));
    }
    
    if (typeof saveCurrentChapter === 'function') saveCurrentChapter();
    if (typeof updateWordCount === 'function') updateWordCount();
    alert('图片已保存并插入成功！');
}

function insertImageAsBase64(base64Data, originalName, editor, originalRange, insertAtCursor) {
    var caption = prompt('为图片添加说明（可选）：', originalName);
    
    var imgElement = document.createElement('img');
    imgElement.src = base64Data;
    imgElement.style.maxWidth = '100%';
    imgElement.style.height = 'auto';
    imgElement.style.borderRadius = '8px';
    imgElement.style.margin = '8px 0';
    
    var container = document.createElement('div');
    container.style.margin = '12px 0';
    container.style.textAlign = 'center';
    container.appendChild(imgElement);
    
    if (caption && caption.trim()) {
        var captionSpan = document.createElement('div');
        captionSpan.textContent = caption.trim();
        captionSpan.style.fontSize = '12px';
        captionSpan.style.color = '#888';
        container.appendChild(captionSpan);
    }
    
    if (insertAtCursor && originalRange) {
        originalRange.insertNode(container);
        var br = document.createElement('br');
        originalRange.setStartAfter(container);
        originalRange.insertNode(br);
        originalRange.setStartAfter(br);
    } else {
        editor.appendChild(container);
        editor.appendChild(document.createElement('br'));
    }
    
    if (typeof saveCurrentChapter === 'function') saveCurrentChapter();
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
    
    // 获取排版设置
    var formatSettings = loadFormatSettingsFromLocal();
    
    // 保存当前内容用于历史记录
    var oldContent = editor.innerHTML;
    var oldTitle = document.getElementById('chapterTitle') ? document.getElementById('chapterTitle').value : '';
    
    // 获取纯文本内容
    var tempDiv = document.createElement('div');
    tempDiv.innerHTML = oldContent;
    var text = tempDiv.innerText;
    
    // 1. 根据句号、问号、感叹号等分割句子
    var parts = [];
    var currentPart = '';
    for (var i = 0; i < text.length; i++) {
        var char = text[i];
        currentPart += char;
        if ('。？！；：.!?;:'.indexOf(char) !== -1) {
            if (i + 1 < text.length && text[i + 1] === '”') {
                currentPart += '”';
                i++;
            }
            parts.push(currentPart.trim());
            currentPart = '';
        }
    }
    if (currentPart.trim()) {
        parts.push(currentPart.trim());
    }
    
    // 如果没有分割出多个部分（可能没有句号），则保持原样
    if (parts.length <= 1 && formatSettings.autoLineBreak) {
        parts = [text];
    }
    
    // 2. 处理每个句子
    var formattedLines = [];
    for (var p = 0; p < parts.length; p++) {
        var line = parts[p];
        line = line.trim();
        if (line === '') continue;
        
        var firstChar = line.charAt(0);
        var isPunctuation = ['，', '。', '！', '？', '；', '：', '”', '’', '》', '】', '、', ',', '.', '!', '?', ';', ':'].indexOf(firstChar) !== -1;
        
        // 首行缩进
        if (!isPunctuation && line.length > 0 && formatSettings.indentSize > 0) {
            var indent = '';
            for (var s = 0; s < formatSettings.indentSize; s++) {
                indent += '　';
            }
            line = indent + line;
        }
        
        formattedLines.push(line);
    }
    
    // 3. 重新组合 - 修复空行问题
    var formattedText = '';
    var spaceLinesCount = 1; // 默认1个空行
    
    if (formatSettings.autoLineBreak) {
        // 使用设置的空行数量
        spaceLinesCount = formatSettings.spaceLines && formatSettings.spaceLines > 0 ? formatSettings.spaceLines : 1;
        
        for (var i = 0; i < formattedLines.length; i++) {
            formattedText += formattedLines[i];
            if (i < formattedLines.length - 1) {
                // 添加指定数量的空行
                for (var s = 0; s < spaceLinesCount; s++) {
                    formattedText += '\n';
                }
            }
        }
    } else {
        formattedText = formattedLines.join('\n');
    }
    
    // 4. 转换为 HTML - 关键修复：保留多个空行
    var formattedHtml = '';
    var lines = formattedText.split('\n');
    
    for (var i = 0; i < lines.length; i++) {
        var line = lines[i];
        if (line === '') {
            // 空行转换为 <br>
            formattedHtml += '<br>';
        } else {
            // 非空行作为段落
            formattedHtml += '<p>' + line + '</p>';
        }
    }
    
    // 修复连续多个 <br> 的情况，确保空行效果
    formattedHtml = formattedHtml.replace(/(<br>\s*)+/g, function(match) {
        var count = match.match(/<br>/g).length;
        var result = '';
        for (var i = 0; i < count; i++) {
            result += '<br>';
        }
        return result;
    });
    
    // 清理多余的空段落
    formattedHtml = formattedHtml.replace(/<p><\/p>/g, '');
    
    editor.innerHTML = formattedHtml;
    
    // 添加历史记录
    if (typeof addHistoryRecord !== 'undefined') {
        addHistoryRecord('format', '排版操作', {
            content: oldContent,
            title: oldTitle,
            preview: formattedText.substring(0, 100)
        });
    }
    
    // 保存章节
    if (typeof saveCurrentChapter === 'function') {
        saveCurrentChapter();
    }
    
    // 更新字数统计
    if (typeof updateWordCount === 'function') {
        updateWordCount();
    }
    
    var indentMsg = formatSettings.indentSize > 0 ? '，首行缩进' + formatSettings.indentSize + '字符' : '，无缩进';
    var breakMsg = formatSettings.autoLineBreak ? '，句号自动换行' : '';
    var spaceMsg = (formatSettings.autoLineBreak && formatSettings.spaceLines > 1) ? '，段落间距' + formatSettings.spaceLines + '行' : '';
    alert('排版完成' + indentMsg + breakMsg + spaceMsg);
}

function quickClean() {
    var editor = document.getElementById('editor');
    if (!editor) {
        alert('请先打开一个章节');
        return;
    }
    
    var content = editor.innerHTML;
    var tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
    var text = tempDiv.innerText;
    
    text = text.replace(/\n{3,}/g, '\n\n');
    
    var lines = text.split('\n');
    for (var i = 0; i < lines.length; i++) {
        lines[i] = lines[i].trim();
    }
    text = lines.join('\n');
    
    var formattedHtml = text.replace(/\n/g, '<br>');
    formattedHtml = '<p>' + formattedHtml.replace(/<br><br>/g, '</p><p>') + '</p>';
    formattedHtml = formattedHtml.replace(/<p><\/p>/g, '');
    
    editor.innerHTML = formattedHtml;
    
    if (typeof saveCurrentChapter === 'function') saveCurrentChapter();
    alert('清理完成：已删除多余空格和空行');
}

// ========== 常见错别字词库（保持原样，省略部分内容以节省篇幅，实际使用时保留完整） ==========
var proofreadDictionary = {
    '按步就班': '按部就班',
    '迫不急待': '迫不及待',
    '一股作气': '一鼓作气',
    // ... 完整词库请保留原文件内容
};

function checkCharacterContext(text, position) {
    var result = { fixed: false, newChar: null };
    if (position <= 0 || position >= text.length - 1) return result;
    
    var prevChar = text[position - 1];
    var currentChar = text[position];
    var nextChar = text[position + 1];
    
    if (prevChar === '吃' && currentChar === '翻') {
        result.fixed = true;
        result.newChar = '饭';
    } else if (prevChar === '去' && currentChar === '翻') {
        result.fixed = true;
        result.newChar = '饭';
    } else if (currentChar === '翻' && nextChar === '桌') {
        result.fixed = true;
        result.newChar = '饭';
    } else if (currentChar === '翻' && nextChar === '店') {
        result.fixed = true;
        result.newChar = '饭';
    } else if (currentChar === '翻' && nextChar === '馆') {
        result.fixed = true;
        result.newChar = '饭';
    }
    
    return result;
}

function smartProofread(text, showReport) {
    var changes = [];
    var fixedText = text;
    
    var doubleCharPatterns = [
        { from: '的的', to: '的' }, { from: '了了', to: '了' },
        { from: '那那', to: '那' }, { from: '这这', to: '这' },
        { from: '就就', to: '就' }, { from: '到到', to: '到' }
    ];
    
    for (var d = 0; d < doubleCharPatterns.length; d++) {
        var pattern = doubleCharPatterns[d];
        if (fixedText.indexOf(pattern.from) !== -1) {
            var regex = new RegExp(pattern.from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
            var matchCount = (fixedText.match(regex) || []).length;
            if (matchCount > 0) {
                changes.push({ original: pattern.from, corrected: pattern.to, count: matchCount, type: '重复字' });
                fixedText = fixedText.replace(regex, pattern.to);
            }
        }
    }
    
    for (var wrong in proofreadDictionary) {
        if (fixedText.indexOf(wrong) !== -1) {
            var correct = proofreadDictionary[wrong];
            var regex = new RegExp(wrong.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
            var matchCount = (fixedText.match(regex) || []).length;
            if (matchCount > 0) {
                changes.push({ original: wrong, corrected: correct, count: matchCount, type: '词汇' });
                fixedText = fixedText.replace(regex, correct);
            }
        }
    }
    
    for (var i = 0; i < fixedText.length; i++) {
        var contextCheck = checkCharacterContext(fixedText, i);
        if (contextCheck.fixed && contextCheck.newChar !== fixedText[i]) {
            fixedText = fixedText.substring(0, i) + contextCheck.newChar + fixedText.substring(i + 1);
        }
    }
    
    if (showReport) {
        return { text: fixedText, changes: changes };
    }
    return fixedText;
}

function proofread() {
    var editor = document.getElementById('editor');
    if (!editor) {
        alert('请先打开一个章节');
        return;
    }
    
    var text = editor.innerText;
    var result = smartProofread(text, true);
    
    if (result.changes.length === 0) {
        alert('✅ 校对完成！未发现明显错别字。');
        return;
    }
    
    var reportHtml = '<div style="max-height: 300px; overflow-y: auto;">';
    reportHtml += '<h4 style="margin: 0 0 12px 0;">📋 发现以下问题：</h4>';
    
    for (var i = 0; i < result.changes.length; i++) {
        var change = result.changes[i];
        reportHtml += '<div style="padding: 8px 0; border-bottom: 1px solid #eee;">';
        reportHtml += '<span style="color: #dc3545;">❌ ' + escapeHtml(change.original) + '</span>';
        reportHtml += ' → ';
        reportHtml += '<span style="color: #28a745;">✅ ' + escapeHtml(change.corrected) + '</span>';
        reportHtml += '<span style="margin-left: 12px; font-size: 12px; color: #888;">(共 ' + change.count + ' 处)</span>';
        reportHtml += '</div>';
    }
    reportHtml += '<div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #eee;">';
    reportHtml += '<button id="applyProofreadBtn" style="padding: 8px 20px; background: #007aff; color: white; border: none; border-radius: 8px; cursor: pointer;">🔧 一键修复</button>';
    reportHtml += '<button id="cancelProofreadBtn" style="margin-left: 12px; padding: 8px 20px; background: #6c757d; color: white; border: none; border-radius: 8px; cursor: pointer;">取消</button>';
    reportHtml += '</div></div>';
    
    var modal = document.createElement('div');
    modal.id = 'proofreadModal';
    modal.style.cssText = 'position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 400px; background: rgba(255,255,255,0.98); backdrop-filter: blur(20px); border-radius: 20px; box-shadow: 0 20px 40px rgba(0,0,0,0.2); z-index: 20000; overflow: hidden;';
    modal.innerHTML = '<div style="padding: 16px; background: rgba(0,0,0,0.03); border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center;"><h3 style="margin: 0;">🏥 校对结果</h3><button id="closeModalBtn" style="background: none; border: none; font-size: 20px; cursor: pointer;">✕</button></div><div style="padding: 20px;">' + reportHtml + '</div>';
    document.body.appendChild(modal);
    
    document.getElementById('applyProofreadBtn').onclick = function() {
        var fixedText = smartProofread(text, false);
        var tempDiv = document.createElement('div');
        tempDiv.innerHTML = editor.innerHTML;
        
        function replaceTextNodes(node) {
            if (node.nodeType === Node.TEXT_NODE) {
                node.textContent = smartProofread(node.textContent, false);
            } else if (node.nodeType === Node.ELEMENT_NODE) {
                for (var i = 0; i < node.childNodes.length; i++) {
                    replaceTextNodes(node.childNodes[i]);
                }
            }
        }
        replaceTextNodes(tempDiv);
        editor.innerHTML = tempDiv.innerHTML;
        if (typeof saveCurrentChapter === 'function') saveCurrentChapter();
        modal.remove();
        alert('✅ 已修复 ' + result.changes.length + ' 处错误！');
    };
    
    document.getElementById('cancelProofreadBtn').onclick = function() { modal.remove(); };
    document.getElementById('closeModalBtn').onclick = function() { modal.remove(); };
}

// ========== 主题面板 ==========
function openThemePanel() {
    var panel = document.getElementById('themeSlidePanel');
    if (panel) { panel.remove(); return; }
    
    var rightSidebar = document.getElementById('rightSidebar');
    var rightSidebarRect = rightSidebar ? rightSidebar.getBoundingClientRect() : null;
    var leftPos = rightSidebarRect ? (rightSidebarRect.left - 340) : (window.innerWidth - 380);
    var topPos = 80;
    
    var currentBgImage = localStorage.getItem('custom_bg_image') || '';
    var currentBgOpacity = localStorage.getItem('custom_bg_opacity') || '30';
    
    var html = '<div id="themeSlidePanel" style="position: fixed; left: ' + leftPos + 'px; top: ' + topPos + 'px; width: 340px; height: calc(100vh - 80px); background: var(--panel-bg, rgba(255, 255, 255, 0.95)); backdrop-filter: blur(8px); border-radius: 0px; box-shadow: -2px 0 12px rgba(0,0,0,0.15); z-index: 1000; display: flex; flex-direction: column;">' +
        '<div class="right-slide-panel-header" style="padding: 16px; border-bottom: 1px solid var(--border-color, rgba(0,0,0,0.1)); display: flex; justify-content: space-between; align-items: center;"><h3 style="margin:0;">主题设置</h3><button class="right-slide-panel-close" style="background:none; border:none; font-size:20px; cursor:pointer; color: var(--text-color, #333);">✕</button></div>' +
        '<div class="right-slide-panel-content" style="flex:1; overflow-y:auto; padding: 20px;">' +
        '<h5 style="margin-bottom:12px;">🎨 预设主题</h5>' +
        '<div style="display:flex; gap:8px; flex-wrap:wrap; margin-bottom:24px;">' +
        '<button data-theme="default" class="theme-preset-btn" style="padding:8px 16px; border-radius:8px; background:#f0f0f0; border:none; cursor:pointer;">默认白</button>' +
        '<button data-theme="eye" class="theme-preset-btn" style="padding:8px 16px; border-radius:8px; background:#C8DBC5; border:none; cursor:pointer;">护眼绿</button>' +
        '<button data-theme="warm" class="theme-preset-btn" style="padding:8px 16px; border-radius:8px; background:#DFD5BD; border:none; cursor:pointer;">经典黄</button>' +
        '<button data-theme="dark" class="theme-preset-btn" style="padding:8px 16px; border-radius:8px; background:#1e1e2e; color:white; border:none; cursor:pointer;">暗夜黑</button>' +
        '<button data-theme="open" class="theme-preset-btn" style="padding:8px 16px; border-radius:8px; background:#f5f5f7; border:none; cursor:pointer;">Open圆润</button>' +
        '</div>' +
        '<div style="height:1px; background:var(--border-color, #eee); margin:16px 0;"></div>' +
        '<h5 style="margin-bottom:12px;">🖼️ 自定义背景图片</h5>' +
        '<input type="file" id="customBgUpload" accept="image/*" style="width:100%; margin-bottom:12px; padding:6px;">' +
        '<div id="customBgPreview" style="width:100%; height:100px; background:#f0f0f0; border-radius:8px; background-size:cover; background-position:center; margin-bottom:12px; border:1px solid var(--border-color, #ddd);"></div>' +
        '<div style="margin-bottom:16px;"><label style="display:flex; justify-content:space-between; margin-bottom:8px;"><span>🔆 背景透明度</span><span id="opacityValueDisplay" style="color:var(--text-color, #666);">' + currentBgOpacity + '%</span></label><input type="range" id="customBgOpacity" min="0" max="100" value="' + currentBgOpacity + '" style="width:100%; cursor:pointer;"></div>' +
        '<button id="clearCustomBgBtn" style="width:100%; padding:8px; background:#dc3545; color:white; border:none; border-radius:6px; cursor:pointer; margin-bottom:16px;">🗑️ 清除背景图片</button>' +
        '<div style="height:1px; background:var(--border-color, #eee); margin:16px 0;"></div>' +
        '<h5 style="margin-bottom:12px;">✏️ 全局文字颜色</h5>' +
        '<input type="color" id="globalTextColorSlide" value="#333333" style="width:100%; height:40px; cursor:pointer; border:none;">' +
        '</div></div>';
    
    document.body.insertAdjacentHTML('beforeend', html);
    var panelEl = document.getElementById('themeSlidePanel');
    panelEl.querySelector('.right-slide-panel-close').onclick = function() { panelEl.remove(); };
    
    panelEl.querySelectorAll('.theme-preset-btn').forEach(btn => {
        btn.onclick = function() {
            var theme = this.getAttribute('data-theme');
            var link = document.getElementById('themeStyle');
            if (link) link.href = 'themes/' + theme + '.css';
            document.body.classList.remove('theme-default', 'theme-eye', 'theme-warm', 'theme-dark', 'theme-open');
            document.body.classList.add('theme-' + theme);
            localStorage.setItem('app_theme', theme);
            clearCustomBackground();
            panelEl.remove();
        };
    });
    
    panelEl.querySelector('#globalTextColorSlide').onchange = function() {
        var style = document.getElementById('global-color-style');
        if (style) style.remove();
        var newStyle = document.createElement('style');
        newStyle.id = 'global-color-style';
        newStyle.textContent = '* { color: ' + this.value + ' !important; }';
        document.head.appendChild(newStyle);
        localStorage.setItem('global_text_color', this.value);
    };
    
    var bgPreview = panelEl.querySelector('#customBgPreview');
    var savedBg = localStorage.getItem('custom_bg_image');
    if (savedBg) {
        bgPreview.style.backgroundImage = 'url(' + savedBg + ')';
        bgPreview.style.backgroundSize = 'cover';
        bgPreview.style.backgroundPosition = 'center';
        applyCustomBackground(savedBg, currentBgOpacity);
    }
    
    panelEl.querySelector('#customBgUpload').onchange = function(e) {
        var file = e.target.files[0];
        if (file) {
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
    
    var opacitySlider = panelEl.querySelector('#customBgOpacity');
    var opacityDisplay = panelEl.querySelector('#opacityValueDisplay');
    opacitySlider.oninput = function() {
        var val = this.value;
        opacityDisplay.textContent = val + '%';
        localStorage.setItem('custom_bg_opacity', val);
        var savedImage = localStorage.getItem('custom_bg_image');
        if (savedImage) applyCustomBackground(savedImage, val);
    };
    
    panelEl.querySelector('#clearCustomBgBtn').onclick = function() {
        clearCustomBackground();
        bgPreview.style.backgroundImage = '';
        localStorage.removeItem('custom_bg_image');
        localStorage.removeItem('custom_bg_opacity');
        opacitySlider.value = '30';
        opacityDisplay.textContent = '30%';
    };
}

function compressImageForBg(file, maxWidth, maxHeight, quality, callback) {
    var reader = new FileReader();
    reader.onload = function(e) {
        var img = new Image();
        img.onload = function() {
            var width = img.width, height = img.height, ratio = 1;
            if (width > maxWidth) ratio = maxWidth / width;
            if (height > maxHeight) { var ratio2 = maxHeight / height; if (ratio2 < ratio) ratio = ratio2; }
            var newWidth = width * ratio, newHeight = height * ratio;
            var canvas = document.createElement('canvas');
            canvas.width = newWidth; canvas.height = newHeight;
            var ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, newWidth, newHeight);
            callback(canvas.toDataURL('image/jpeg', quality));
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

function applyCustomBackground(imageUrl, opacity) {
    var oldStyle = document.getElementById('custom-bg-style');
    if (oldStyle) oldStyle.remove();
    var style = document.createElement('style');
    style.id = 'custom-bg-style';
    style.textContent = 'body::before { content: ""; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background-image: url(' + JSON.stringify(imageUrl) + '); background-size: cover; background-position: center; background-attachment: fixed; opacity: ' + (opacity/100) + '; z-index: -1; pointer-events: none; } .app-container, .main-wrapper, .page, .sidebar-menu, .main-content, .book-detail-page, .detail-chapters, .detail-editor { background: transparent !important; }';
    document.head.appendChild(style);
    document.body.classList.add('has-custom-bg');
}

function clearCustomBackground() {
    var oldStyle = document.getElementById('custom-bg-style');
    if (oldStyle) oldStyle.remove();
    document.body.classList.remove('has-custom-bg');
    var currentTheme = localStorage.getItem('app_theme') || 'default';
    var link = document.getElementById('themeStyle');
    if (link) link.href = 'themes/' + currentTheme + '.css';
    document.body.classList.remove('theme-default', 'theme-eye', 'theme-warm', 'theme-dark', 'theme-open');
    document.body.classList.add('theme-' + currentTheme);
    if (typeof applyTheme === 'function') applyTheme(currentTheme);
}

// ========== 字体面板 ==========
function loadFormatSettingsFromLocal() {
    var saved = localStorage.getItem('format_settings');
    if (saved) {
        try {
            var settings = JSON.parse(saved);
            // 确保所有字段都存在
            return {
                indentSize: settings.indentSize !== undefined ? settings.indentSize : 2,
                autoLineBreak: settings.autoLineBreak !== undefined ? settings.autoLineBreak : true,
                autoSpace: settings.autoSpace !== undefined ? settings.autoSpace : false,
                spaceLines: settings.spaceLines !== undefined ? settings.spaceLines : 1
            };
        } catch(e) {}
    }
    return {
        indentSize: 2,
        autoLineBreak: true,
        autoSpace: false,
        spaceLines: 1
    };
}

function saveFormatSettingsToLocal(settings) {
    localStorage.setItem('format_settings', JSON.stringify(settings));
}

function loadSystemFonts() {
    var container = document.getElementById('systemFontList');
    if (!container) return;
    
    var systemFonts = [
        { name: '苹方 (PingFang SC)', family: 'PingFang SC, system-ui' },
        { name: '微软雅黑 (Microsoft YaHei)', family: 'Microsoft YaHei, system-ui' },
        { name: '宋体 (SimSun)', family: 'SimSun, serif' },
        { name: '黑体 (SimHei)', family: 'SimHei, sans-serif' },
        { name: '楷体 (KaiTi)', family: 'KaiTi, serif' },
        { name: '仿宋 (FangSong)', family: 'FangSong, serif' },
        { name: '思源黑体 (Source Han Sans)', family: 'Source Han Sans, sans-serif' },
        { name: '思源宋体 (Source Han Serif)', family: 'Source Han Serif, serif' },
        { name: 'JetBrains Mono', family: 'JetBrains Mono, monospace' },
        { name: 'Fira Code', family: 'Fira Code, monospace' },
        { name: 'Consolas', family: 'Consolas, monospace' },
        { name: 'Arial', family: 'Arial, sans-serif' }
    ];
    
    var html = '<div style="padding:4px;">';
    for (var i = 0; i < systemFonts.length; i++) {
        var font = systemFonts[i];
        var escapedFamily = font.family.replace(/'/g, "\\'");
        html += '<div style="display:flex; justify-content:space-between; align-items:center; padding:8px; border-bottom:1px solid #eee; cursor:pointer;" onclick="applySystemFont(\'' + escapedFamily + '\', \'' + font.name.replace(/'/g, "\\'") + '\')">' +
            '<span style="font-family: \'' + font.family + '\';">' + font.name + '</span>' +
            '<span style="font-size:11px; color:#888;">预览</span>' +
            '</div>';
    }
    html += '</div>';
    container.innerHTML = html;
}

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
window.applySystemFont = applySystemFont;

function loadCustomFonts() {
    var container = document.getElementById('customFontList');
    if (!container) return;
    var fontList = localStorage.getItem('custom_fonts');
    var fonts = fontList ? JSON.parse(fontList) : [];
    if (fonts.length === 0) {
        container.innerHTML = '<div style="color:#888; padding:8px; text-align:center;">暂无安装的字体</div>';
        return;
    }
    var html = '';
    for (var i = 0; i < fonts.length; i++) {
        var fontName = fonts[i].name;
        html += '<div style="display:flex; justify-content:space-between; align-items:center; padding:8px; border-bottom:1px solid #eee;">' +
            '<span style="font-family:\'' + fontName + '\', system-ui;">' + fontName + '</span>' +
            '<div><button class="apply-font-btn" data-font="' + fontName + '" style="padding:2px 8px; background:#28a745; color:white; border:none; border-radius:4px; cursor:pointer; margin-right:4px;">应用</button>' +
            '<button class="delete-font-btn" data-font="' + fontName + '" style="padding:2px 8px; background:#dc3545; color:white; border:none; border-radius:4px; cursor:pointer;">删除</button></div></div>';
    }
    container.innerHTML = html;
    
    container.querySelectorAll('.apply-font-btn').forEach(btn => {
        btn.onclick = function(e) {
            e.stopPropagation();
            var fontName = this.getAttribute('data-font');
            var editor = document.getElementById('editor');
            if (editor) {
                editor.style.fontFamily = "'" + fontName + "', system-ui";
                localStorage.setItem('editor_font_family', "'" + fontName + "', system-ui");
                alert('已应用字体：' + fontName);
            }
        };
    });
    container.querySelectorAll('.delete-font-btn').forEach(btn => {
        btn.onclick = function(e) {
            e.stopPropagation();
            var fontName = this.getAttribute('data-font');
            if (confirm('确定删除字体 "' + fontName + '" 吗？')) {
                var styleId = 'custom_font_' + fontName.replace(/[^a-zA-Z0-9]/g, '_');
                var style = document.getElementById(styleId);
                if (style) style.remove();
                var fonts = JSON.parse(localStorage.getItem('custom_fonts') || '[]');
                fonts = fonts.filter(function(f) { return f.name !== fontName; });
                localStorage.setItem('custom_fonts', JSON.stringify(fonts));
                loadCustomFonts();
                var editor = document.getElementById('editor');
                if (editor && editor.style.fontFamily.indexOf(fontName) !== -1) {
                    editor.style.fontFamily = 'system-ui';
                    localStorage.setItem('editor_font_family', 'system-ui');
                }
                alert('字体已删除');
            }
        };
    });
}

function installCustomFont(file) {
    var reader = new FileReader();
    reader.onload = function(e) {
        var fontData = e.target.result;
        var fontName = file.name.replace(/\.(ttf|otf|woff|woff2)$/i, '');
        var styleId = 'custom_font_' + fontName.replace(/[^a-zA-Z0-9]/g, '_');
        var existingStyle = document.getElementById(styleId);
        if (existingStyle) existingStyle.remove();
        var fontFace = '@font-face { font-family: "' + fontName + '"; src: url(' + fontData + '); }';
        var style = document.createElement('style');
        style.id = styleId;
        style.textContent = fontFace;
        document.head.appendChild(style);
        var fonts = JSON.parse(localStorage.getItem('custom_fonts') || '[]');
        var exists = fonts.some(function(f) { return f.name === fontName; });
        if (!exists) { fonts.push({ name: fontName }); localStorage.setItem('custom_fonts', JSON.stringify(fonts)); }
        loadCustomFonts();
        alert('字体 "' + fontName + '" 安装成功！');
    };
    reader.readAsDataURL(file);
}

function openFontPanel() {
    var panel = document.getElementById('fontSlidePanel');
    if (panel) { panel.remove(); return; }
    
    var rightSidebar = document.getElementById('rightSidebar');
    var rightSidebarRect = rightSidebar ? rightSidebar.getBoundingClientRect() : null;
    var leftPos = rightSidebarRect ? (rightSidebarRect.left - 340) : (window.innerWidth - 380);
    var topPos = 80;
    
    var formatSettings = loadFormatSettingsFromLocal();
    
    var html = '<div id="fontSlidePanel" style="position: fixed; left: ' + leftPos + 'px; top: ' + topPos + 'px; width: 340px; height: calc(100vh - 80px); background: var(--panel-bg, rgba(255, 255, 255, 0.95)); backdrop-filter: blur(8px); border-radius: 0px; box-shadow: -2px 0 12px rgba(0,0,0,0.15); z-index: 1000; display: flex; flex-direction: column;">' +
        '<div class="right-slide-panel-header" style="padding: 16px; border-bottom: 1px solid var(--border-color, rgba(0,0,0,0.1)); display: flex; justify-content: space-between; align-items: center;"><h3 style="margin:0;">字体设置</h3><button class="right-slide-panel-close" style="background:none; border:none; font-size:20px; cursor:pointer; color: var(--text-color, #333);">✕</button></div>' +
        '<div class="right-slide-panel-content" style="flex:1; overflow-y:auto; padding: 20px;">' +
        '<label style="display:block; margin-bottom:8px;">🔤 快速选择：</label>' +
        '<select id="fontFamilySlide" style="width:100%; margin-bottom:16px; padding:8px; border-radius:6px; border:1px solid #ddd;">' +
        '<option value="system-ui">系统默认</option><option value="Georgia, serif">宋体风格</option>' +
        '<option value="PingFang SC, Microsoft YaHei">苹方/雅黑</option><option value="KaiTi, serif">楷体</option>' +
        '<option value="Courier New, monospace">等宽字体</option></select>' +
        '<div style="margin-bottom:20px;"><label style="display:block; margin-bottom:8px;">💻 系统字体：</label><div id="systemFontList" style="border:1px solid var(--border-color, #ddd); border-radius:6px; max-height:150px; overflow-y:auto;"><div style="padding:8px; text-align:center; color:#888;">加载中...</div></div></div>' +
        '<div style="margin-bottom:20px; border:1px dashed var(--border-color, #ddd); border-radius:8px; padding:12px;"><label style="display:block; margin-bottom:8px; cursor:pointer;">📁 点击上传自定义字体</label><input type="file" id="customFontUpload" accept=".ttf,.otf,.woff,.woff2" style="width:100%; padding:6px; margin-bottom:8px;"><div id="customFontList" style="margin-top:8px; font-size:12px; max-height:100px; overflow-y:auto;"></div></div>' +
        '<label style="display:block; margin-bottom:8px;">📏 字号：</label><select id="fontSizeSlide" style="width:100%; margin-bottom:16px; padding:8px; border-radius:6px; border:1px solid #ddd;">' +
        '<option value="12">12px</option><option value="14" selected>14px</option><option value="16">16px</option><option value="18">18px</option><option value="20">20px</option><option value="24">24px</option><option value="28">28px</option>' +
        '<option value="32">32px</option><option value="36">36px</option><option value="42">42px</option><option value="48">48px</option><option value="56">56px</option><option value="64">64px</option><option value="72">72px</option><option value="84">84px</option><option value="100">100px</option></select>' +
        '<label style="display:block; margin-bottom:8px;">📐 行高：</label><select id="lineHeightSlide" style="width:100%; margin-bottom:20px; padding:8px; border-radius:6px; border:1px solid #ddd;">' +
        '<option value="1.2">1.2（紧凑）</option><option value="1.4">1.4</option><option value="1.6">1.6</option><option value="1.8" selected>1.8（舒适）</option>' +
        '<option value="2.0">2.0</option><option value="2.2">2.2</option><option value="2.5">2.5（宽松）</option></select>' +
        '<div style="height:1px; background:var(--border-color, #eee); margin:20px 0;"></div><h4 style="margin-bottom:12px;">✍️ 排版设置</h4>' +
        '<div style="margin-bottom:16px;"><label style="display:block; margin-bottom:8px;">📝 首行缩进：</label><select id="indentSizeSlide" style="width:100%; padding:8px; border-radius:6px; border:1px solid #ddd;">' +
        '<option value="0" ' + (formatSettings.indentSize === 0 ? 'selected' : '') + '>不缩进</option><option value="1" ' + (formatSettings.indentSize === 1 ? 'selected' : '') + '>缩进1字符</option>' +
        '<option value="2" ' + (formatSettings.indentSize === 2 ? 'selected' : '') + '>缩进2字符（推荐）</option><option value="3" ' + (formatSettings.indentSize === 3 ? 'selected' : '') + '>缩进3字符</option>' +
        '<option value="4" ' + (formatSettings.indentSize === 4 ? 'selected' : '') + '>缩进4字符</option></select><div style="font-size:11px; color:#888; margin-top:4px;">💡 每个段落开头自动添加空格</div></div>' +
        '<div style="margin-bottom:16px;"><div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:8px;"><label>🔴 句号自动换行：</label><label style="display:flex; align-items:center; gap:8px;"><input type="checkbox" id="autoLineBreakSlide" ' + (formatSettings.autoLineBreak ? 'checked' : '') + '><span style="font-size:12px;">开启</span></label></div><div style="font-size:11px; color:#888;">💡 遇到句号（。）自动换行，每个句子单独成段</div></div>' +
        '<div style="margin-bottom:16px;"><div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:8px;"><label>⏎ 回车自动添加空行：</label><label style="display:flex; align-items:center; gap:8px;"><input type="checkbox" id="autoSpaceSlide" ' + (formatSettings.autoSpace ? 'checked' : '') + '><span style="font-size:12px;">开启</span></label></div><select id="spaceLinesSlide" style="width:100%; padding:8px; border-radius:6px; border:1px solid #ddd; margin-top:8px;" ' + (formatSettings.autoSpace ? '' : 'disabled') + '>' +
        '<option value="1" ' + (formatSettings.spaceLines === 1 ? 'selected' : '') + '>空1行</option><option value="2" ' + (formatSettings.spaceLines === 2 ? 'selected' : '') + '>空2行</option>' +
        '<option value="3" ' + (formatSettings.spaceLines === 3 ? 'selected' : '') + '>空3行</option><option value="4" ' + (formatSettings.spaceLines === 4 ? 'selected' : '') + '>空4行</option>' +
        '<option value="5" ' + (formatSettings.spaceLines === 5 ? 'selected' : '') + '>空5行</option></select><div style="font-size:11px; color:#888; margin-top:4px;">💡 按回车时自动添加空行，让段落间距更舒适</div></div>' +
        '<button id="saveFormatSettingsSlideBtn" style="width:100%; padding:10px; background:#ceb087; color:white; border:none; border-radius:8px; cursor:pointer; margin-top:8px;">💾 保存排版设置</button></div></div>';
    
    document.body.insertAdjacentHTML('beforeend', html);
    var panelEl = document.getElementById('fontSlidePanel');
    panelEl.querySelector('.right-slide-panel-close').onclick = function() { panelEl.remove(); };
    
    var editor = document.getElementById('editor');
    var fontSelect = document.getElementById('fontFamilySlide');
    var sizeSelect = document.getElementById('fontSizeSlide');
    var lineHeightSelect = document.getElementById('lineHeightSlide');
    
    if (fontSelect) fontSelect.onchange = function() { if (editor) editor.style.fontFamily = this.value; localStorage.setItem('editor_font_family', this.value); };
    if (sizeSelect) sizeSelect.onchange = function() { if (editor) editor.style.fontSize = this.value + 'px'; localStorage.setItem('editor_font_size', this.value); };
    if (lineHeightSelect) lineHeightSelect.onchange = function() { if (editor) editor.style.lineHeight = this.value; localStorage.setItem('editor_line_height', this.value); };
    
    var savedFont = localStorage.getItem('editor_font_family');
    var savedSize = localStorage.getItem('editor_font_size');
    var savedLine = localStorage.getItem('editor_line_height');
    if (savedFont && fontSelect) fontSelect.value = savedFont;
    if (savedSize && sizeSelect) sizeSelect.value = savedSize;
    if (savedLine && lineHeightSelect) lineHeightSelect.value = savedLine;
    if (editor) {
        if (savedFont) editor.style.fontFamily = savedFont;
        if (savedSize) editor.style.fontSize = savedSize + 'px';
        if (savedLine) editor.style.lineHeight = savedLine;
    }
    
    loadSystemFonts();
    loadCustomFonts();
    
    var fontUpload = document.getElementById('customFontUpload');
    if (fontUpload) fontUpload.onchange = function(e) {
        var file = e.target.files[0];
        if (file) installCustomFont(file);
        else alert('请选择有效的字体文件');
    };
    
    var indentSelect = document.getElementById('indentSizeSlide');
    var autoBreakCheckbox = document.getElementById('autoLineBreakSlide');
    var autoSpaceCheckbox = document.getElementById('autoSpaceSlide');
    var spaceLinesSelect = document.getElementById('spaceLinesSlide');
    
    if (autoSpaceCheckbox && spaceLinesSelect) {
        autoSpaceCheckbox.onchange = function() { spaceLinesSelect.disabled = !this.checked; };
        spaceLinesSelect.disabled = !autoSpaceCheckbox.checked;
    }
    
    var saveFormatBtn = document.getElementById('saveFormatSettingsSlideBtn');
    if (saveFormatBtn) {
        saveFormatBtn.onclick = function(e) {
            e.preventDefault();
            e.stopPropagation();
            var settings = {
                indentSize: indentSelect ? parseInt(indentSelect.value) : 2,
                autoLineBreak: autoBreakCheckbox ? autoBreakCheckbox.checked : true,
                autoSpace: autoSpaceCheckbox ? autoSpaceCheckbox.checked : false,
                spaceLines: spaceLinesSelect ? parseInt(spaceLinesSelect.value) : 2
            };
            saveFormatSettingsToLocal(settings);
            alert('排版设置已保存！');
        };
    }
}

// ========== 导出面板 ==========
function openExportPanel() {
    var panel = document.getElementById('exportSlidePanel');
    if (panel) { panel.remove(); return; }
    
    var rightSidebar = document.getElementById('rightSidebar');
    var rightSidebarRect = rightSidebar ? rightSidebar.getBoundingClientRect() : null;
    var leftPos = rightSidebarRect ? (rightSidebarRect.left - 340) : (window.innerWidth - 380);
    var topPos = 80;
    
    var html = '<div id="exportSlidePanel" style="position: fixed; left: ' + leftPos + 'px; top: ' + topPos + 'px; width: 340px; height: calc(100vh - 80px); background: var(--panel-bg, rgba(255, 255, 255, 0.95)); backdrop-filter: blur(8px); border-radius: 0px; box-shadow: -2px 0 12px rgba(0,0,0,0.15); z-index: 1000; display: flex; flex-direction: column;">' +
        '<div class="right-slide-panel-header" style="padding: 16px; border-bottom: 1px solid var(--border-color, rgba(0,0,0,0.1)); display: flex; justify-content: space-between; align-items: center;"><h3 style="margin:0;">导出</h3><button class="right-slide-panel-close" style="background:none; border:none; font-size:20px; cursor:pointer; color: var(--text-color, #333);">✕</button></div>' +
        '<div class="right-slide-panel-content" style="flex:1; overflow-y:auto; padding: 20px;">' +
        '<div style="margin-bottom: 16px;"><label style="display: block; margin-bottom: 8px; font-weight: 500;">📄 导出格式：</label><select id="exportFormatSelect" style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #ddd; background: #f8f8f8;">' +
        '<option value="txt">TXT 文本格式</option><option value="docx">DOCX 文档格式</option></select></div>' +
        '<div style="height:1px; background:var(--border-color, #eee); margin:8px 0 16px 0;"></div>' +
        '<button id="exportChapterBtn" class="btn-primary" style="width:100%; padding:12px; margin-bottom:12px; background:#9b784e; color:white; border:none; border-radius:8px; cursor:pointer;">📄 导出本章</button>' +
        '<button id="exportBookBtn" class="btn-secondary" style="width:100%; padding:12px; background:#6c757d; color:white; border:none; border-radius:8px; cursor:pointer;">📚 导出全书</button>' +
        '<div style="font-size: 11px; color: #888; margin-top: 12px; text-align: center;">💡 导出全书会按「书名/分卷/章节」创建文件夹结构</div></div></div>';
    
    document.body.insertAdjacentHTML('beforeend', html);
    var panelEl = document.getElementById('exportSlidePanel');
    panelEl.querySelector('.right-slide-panel-close').onclick = function() { panelEl.remove(); };
    panelEl.querySelector('#exportChapterBtn').onclick = function() { var format = document.getElementById('exportFormatSelect').value; exportChapter(format); panelEl.remove(); };
    panelEl.querySelector('#exportBookBtn').onclick = function() { var format = document.getElementById('exportFormatSelect').value; exportBookWithStructure(format); panelEl.remove(); };
}

// 导出当前章节（支持 TXT 和 DOCX）
function exportChapter(format) {
    if (typeof getCurrentChapter !== 'function') { 
        alert('请先打开一本书籍'); 
        return; 
    }
    var ch = getCurrentChapter();
    if (!ch) { 
        alert('没有找到当前章节'); 
        return; 
    }
    var book = getCurrentBook();
    var vol = getCurrentVolume();
    var content = ch.content || '';
    
    if (format === 'docx') {
        exportToDocxLocal(content, book.title, vol.name, ch.title);
        return;
    }
    
    // TXT 格式
    var textContent = content.replace(/<[^>]*>/g, '');
    var header = '【' + book.title + '】\n';
    header += '分卷：' + vol.name + '\n';
    header += '章节：' + ch.title + '\n';
    header += '导出时间：' + new Date().toLocaleString() + '\n';
    header += '='.repeat(50) + '\n\n';
    var fullContent = header + textContent;
    
    var fileName = (book ? book.title + '_' : '') + (vol ? vol.name + '_' : '') + (ch.title || '章节') + '.txt';
    fileName = fileName.replace(/[\\/:*?"<>|]/g, '_');
    
    // 使用 Electron 保存文件
    if (window.electron && window.electron.saveFile) {
        window.electron.saveFile(fileName, fullContent, 'txt').then(function(result) {
            if (result.success) {
                alert('导出成功：' + result.filePath);
            } else if (!result.canceled) {
                alert('导出失败');
            }
        });
    } else {
        // 降级方案：浏览器下载
        var blob = new Blob([fullContent], { type: 'text/plain;charset=utf-8' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url; 
        a.download = fileName; 
        a.click();
        URL.revokeObjectURL(url);
        alert('导出成功：' + fileName);
    }
}

// 检查 JSZip 是否可用
function isJSZipAvailable() {
    return typeof JSZip !== 'undefined';
}

// 导出全书（支持 TXT 压缩包和 DOCX 文件夹结构）
function exportBookWithStructure(format) {
    var book = typeof getCurrentBook === 'function' ? getCurrentBook() : null;
    if (!book) { 
        alert('请先打开一本书籍'); 
        return; 
    }
    if (!book.volumes || book.volumes.length === 0) { 
        alert('没有找到分卷和章节'); 
        return; 
    }
    
    if (format === 'docx') {
        // DOCX 格式：导出为文件夹结构的 ZIP 压缩包
        exportBookToDocxFolderStructure(book);
        return;
    }
    
    // TXT 格式：创建 ZIP 压缩包
    if (!isJSZipAvailable()) {
        alert('JSZip 库未加载，请确保 jszip.min.js 文件存在于项目根目录');
        return;
    }
    
    var zip = new JSZip();
    var bookName = sanitizeFileName(book.title);
    
    for (var v = 0; v < book.volumes.length; v++) {
        var vol = book.volumes[v];
        var volName = sanitizeFileName(vol.name);
        for (var c = 0; c < vol.chapters.length; c++) {
            var ch = vol.chapters[c];
            var chName = sanitizeFileName(ch.title);
            var content = ch.content || '';
            var textContent = content.replace(/<[^>]*>/g, '');
            var header = '【' + book.title + '】\n';
            header += '分卷：' + vol.name + '\n';
            header += '章节：' + ch.title + '\n';
            header += '='.repeat(50) + '\n\n';
            var fullContent = header + textContent;
            zip.file(bookName + '/' + volName + '/' + chName + '.txt', fullContent);
        }
    }
    
    zip.generateAsync({ type: 'blob' }).then(function(blob) {
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = bookName + '.zip';
        a.click();
        URL.revokeObjectURL(url);
        alert('全书导出成功！共 ' + countTotalChapters(book) + ' 章');
    }).catch(function(err) { 
        alert('导出失败：' + err.message); 
    });
}

// 导出全书为 DOCX 文件夹结构（每个章节独立一个 .docx 文件）
function exportBookToDocxFolderStructure(book) {
    if (!isJSZipAvailable()) {
        alert('JSZip 库未加载，请确保 jszip.min.js 文件存在于项目根目录');
        return;
    }
    
    var zip = new JSZip();
    var bookName = sanitizeFileName(book.title);
    var totalChapters = 0;
    
    for (var v = 0; v < book.volumes.length; v++) {
        var vol = book.volumes[v];
        var volName = sanitizeFileName(vol.name);
        
        for (var c = 0; c < vol.chapters.length; c++) {
            var ch = vol.chapters[c];
            var chName = sanitizeFileName(ch.title);
            var content = ch.content || '';
            
            // 为每个章节生成单独的 DOCX 文件
            var docxContent = generateSingleChapterDocx(book.title, vol.name, ch.title, content);
            
            // 按照「书名/分卷/章节.docx」的路径存储
            var filePath = bookName + '/' + volName + '/' + chName + '.docx';
            zip.file(filePath, docxContent);
            totalChapters++;
        }
    }
    
    // 如果没有任何章节，提示错误
    if (totalChapters === 0) {
        alert('没有找到任何章节内容');
        return;
    }
    
    zip.generateAsync({ type: 'blob' }).then(function(blob) {
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = bookName + '_全书.zip';
        a.click();
        URL.revokeObjectURL(url);
        alert('DOCX 全书导出成功！共 ' + totalChapters + ' 个章节文件\n\n保存为 ZIP 压缩包，解压后即可看到按「书名/分卷/章节」组织的 DOCX 文件');
    }).catch(function(err) { 
        alert('导出失败：' + err.message); 
    });
}

// 生成单个章节的 DOCX 文件内容（返回 Blob）
function generateSingleChapterDocx(bookTitle, volName, chapterTitle, content) {
    // 提取纯文本
    var tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
    var textContent = tempDiv.innerText;
    
    // 处理段落
    var paragraphs = textContent.split(/\n+/);
    var paraXml = '';
    for (var i = 0; i < paragraphs.length; i++) {
        var paraText = paragraphs[i].trim();
        if (paraText === '') continue;
        // 转义 XML 特殊字符
        paraText = paraText.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        // 首行缩进2字符
        paraXml += '<w:p><w:pPr><w:ind w:firstLine="480"/></w:pPr><w:r><w:t>' + paraText + '</w:t></w:r></w:p>';
    }
    
    // 构建 DOCX 的 XML 结构
    var docXml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n' +
        '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">\n' +
        '<w:body>\n' +
        // 书籍标题
        '<w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:b/><w:sz w:val="48"/></w:rPr><w:t>' + escapeXml(bookTitle) + '</w:t></w:r></w:p>' +
        // 分卷和章节标题
        '<w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:b/><w:sz w:val="32"/></w:rPr><w:t>' + escapeXml(volName) + '</w:t></w:r></w:p>' +
        '<w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:b/><w:sz w:val="28"/></w:rPr><w:t>' + escapeXml(chapterTitle) + '</w:t></w:r></w:p>' +
        '<w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:t>导出时间：' + new Date().toLocaleString() + '</w:t></w:r></w:p>' +
        '<w:p><w:r><w:t/></w:r></w:p>' +
        paraXml +
        '</w:body>\n' +
        '</w:document>';
    
    // 创建 ZIP 对象并生成 DOCX
    var zip = new JSZip();
    
    // 添加 [Content_Types].xml
    zip.file('[Content_Types].xml', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/></Types>');
    
    // 添加 _rels/.rels
    var relsXml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>';
    zip.folder('_rels').file('.rels', relsXml);
    
    // 添加 word/_rels/document.xml.rels
    var docRelsXml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"></Relationships>';
    zip.folder('word').folder('_rels').file('document.xml.rels', docRelsXml);
    
    // 添加 word/document.xml
    zip.folder('word').file('document.xml', docXml);
    
    // 返回 ZIP 生成的 Blob（作为 DOCX 文件）
    return zip.generateAsync({ type: 'blob' });
}

// 原有的单个章节 DOCX 导出（保持兼容）
function exportToDocxLocal(content, bookTitle, volName, chapterTitle) {
    if (!isJSZipAvailable()) {
        alert('JSZip 库未加载，请确保 jszip.min.js 文件存在于项目根目录');
        return;
    }
    
    generateSingleChapterDocx(bookTitle, volName, chapterTitle, content).then(function(blob) {
        var fileName = sanitizeFileName(bookTitle + '_' + volName + '_' + chapterTitle) + '.docx';
        
        if (window.electron && window.electron.saveFile) {
            // 将 Blob 转换为 base64
            var reader = new FileReader();
            reader.onload = function() {
                var base64 = reader.result.split(',')[1];
                window.electron.saveFile(fileName, base64, 'docx').then(function(result) {
                    if (result.success) {
                        alert('导出成功：' + result.filePath);
                    } else if (!result.canceled) {
                        alert('导出失败');
                    }
                });
            };
            reader.readAsDataURL(blob);
        } else {
            var url = URL.createObjectURL(blob);
            var a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            a.click();
            URL.revokeObjectURL(url);
            alert('导出成功：' + fileName);
        }
    }).catch(function(err) {
        alert('导出失败：' + err.message);
    });
}

// 原有的合并版全书 DOCX 导出（如果需要保留，可以注释掉，或者重命名）
function exportBookToDocxLocal(book) {
    // 这个函数现在被 exportBookToDocxFolderStructure 替代
    // 如果不需要可以删除，或者保留作为备用
    exportBookToDocxFolderStructure(book);
}

// 创建 DOCX ZIP 文件（核心函数）
function createDocxZip(docXmlContent, fileName) {
    if (!isJSZipAvailable()) {
        alert('JSZip 库未加载，请确保 jszip.min.js 文件存在于项目根目录');
        return;
    }
    
    var zip = new JSZip();
    
    // 添加 [Content_Types].xml
    zip.file('[Content_Types].xml', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/></Types>');
    
    // 添加 _rels/.rels
    var relsXml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>';
    zip.folder('_rels').file('.rels', relsXml);
    
    // 添加 word/_rels/document.xml.rels
    var docRelsXml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"></Relationships>';
    zip.folder('word').folder('_rels').file('document.xml.rels', docRelsXml);
    
    // 添加 word/document.xml
    zip.folder('word').file('document.xml', docXmlContent);
    
    // 生成并下载
    zip.generateAsync({ type: 'base64' }).then(function(base64Data) {
        var finalFileName = fileName || 'document.docx';
        
        if (window.electron && window.electron.saveFile) {
            window.electron.saveFile(finalFileName, base64Data, 'docx').then(function(result) {
                if (result.success) {
                    alert('导出成功：' + result.filePath);
                } else if (!result.canceled) {
                    alert('导出失败');
                }
            });
        } else {
            // 降级方案：浏览器下载
            var blob = base64ToBlob(base64Data, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
            var url = URL.createObjectURL(blob);
            var a = document.createElement('a');
            a.href = url; 
            a.download = finalFileName; 
            a.click();
            URL.revokeObjectURL(url);
            alert('导出成功：' + finalFileName);
        }
    }).catch(function(err) {
        alert('导出失败：' + err.message);
    });
}

// base64 转 Blob
function base64ToBlob(base64, mime) {
    var byteCharacters = atob(base64);
    var byteNumbers = new Array(byteCharacters.length);
    for (var i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    var byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mime });
}

// 转义 XML 特殊字符
function escapeXml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')
              .replace(/"/g, '&quot;')
              .replace(/'/g, '&apos;');
}

// 清理文件名
function sanitizeFileName(name) {
    if (!name) return '未命名';
    return name.replace(/[\\/:*?"<>|]/g, '_').replace(/\s+$/g, '');
}

// 统计全书章节总数
function countTotalChapters(book) {
    var count = 0;
    if (book && book.volumes) {
        for (var v = 0; v < book.volumes.length; v++) {
            var vol = book.volumes[v];
            if (vol && vol.chapters) {
                count += vol.chapters.length;
            }
        }
    }
    return count;
}

// ========== 闭关面板 ==========
function openSeclusionPanel() {
    var panel = document.getElementById('seclusionSlidePanel');
    if (panel) { panel.remove(); return; }
    
    var rightSidebar = document.getElementById('rightSidebar');
    var rightSidebarRect = rightSidebar ? rightSidebar.getBoundingClientRect() : null;
    var leftPos = rightSidebarRect ? (rightSidebarRect.left - 340) : (window.innerWidth - 380);
    var topPos = 80;
    
    var html = '<div id="seclusionSlidePanel" style="position: fixed; left: ' + leftPos + 'px; top: ' + topPos + 'px; width: 340px; height: calc(100vh - 80px); background: var(--panel-bg, rgba(255, 255, 255, 0.95)); backdrop-filter: blur(8px); border-radius: 0px; box-shadow: -2px 0 12px rgba(0,0,0,0.15); z-index: 1000; display: flex; flex-direction: column;">' +
        '<div class="right-slide-panel-header" style="padding: 16px; border-bottom: 1px solid var(--border-color, rgba(0,0,0,0.1)); display: flex; justify-content: space-between; align-items: center;"><h3 style="margin:0;">闭关修炼</h3><button class="right-slide-panel-close" style="background:none; border:none; font-size:20px; cursor:pointer; color: var(--text-color, #333);">✕</button></div>' +
        '<div class="right-slide-panel-content" style="flex:1; overflow-y:auto; padding: 20px;">' +
        '<label style="display:block; margin-bottom:8px;">目标字数：</label><input type="number" id="seclusionGoal" value="3000" style="width:100%; margin-bottom:16px; padding:8px; border-radius:6px; border:1px solid #ddd;">' +
        '<label style="display:block; margin-bottom:8px;">自动出关时间（小时）：</label><input type="number" id="seclusionTimeout" value="0" style="width:100%; margin-bottom:16px; padding:8px; border-radius:6px; border:1px solid #ddd;">' +
        '<div id="seclusionProgress" style="display:none;"><div>进度：<span id="seclusionCurrent">0</span> / <span id="seclusionGoalDisplay">3000</span></div><div style="height:8px; background:#ddd; margin-top:8px; border-radius:4px;"><div id="seclusionProgressFill" style="height:100%; width:0%; background:#007aff; border-radius:4px;"></div></div></div>' +
        '<button id="startSeclusionBtn" class="btn-primary" style="width:100%; padding:10px; margin-top:12px; background:#9b784e; color:white; border:none; border-radius:8px; cursor:pointer;">开始闭关</button>' +
        '<button id="stopSeclusionBtn" class="btn-danger" style="width:100%; padding:10px; margin-top:8px; background:#dc3545; color:white; border:none; border-radius:8px; cursor:pointer; display:none;">结束闭关</button></div></div>';
    
    document.body.insertAdjacentHTML('beforeend', html);
    var panelEl = document.getElementById('seclusionSlidePanel');
    panelEl.querySelector('.right-slide-panel-close').onclick = function() { if (seclusionActive) endSeclusion(false); panelEl.remove(); };
    panelEl.querySelector('#startSeclusionBtn').onclick = function() { startSeclusion(); panelEl.remove(); };
    panelEl.querySelector('#stopSeclusionBtn').onclick = function() { endSeclusion(false); alert('闭关已结束'); panelEl.remove(); };
}

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

// ========== 查找替换 ==========
function openFindReplacePanel() {
    var existingWin = document.getElementById('findReplaceFloatWin');
    if (existingWin) { existingWin.style.display = 'flex'; existingWin.style.zIndex = '10000'; return; }
    
    var rightSidebar = document.getElementById('rightSidebar');
    var rightSidebarRect = rightSidebar ? rightSidebar.getBoundingClientRect() : null;
    var leftPos = rightSidebarRect ? (rightSidebarRect.left - 420) : (window.innerWidth - 440);
    var topPos = rightSidebarRect ? (rightSidebarRect.top + 50) : 150;
    
    var win = document.createElement('div');
    win.id = 'findReplaceFloatWin';
    win.style.cssText = 'position: fixed; top: ' + topPos + 'px; left: ' + leftPos + 'px; width: 400px; background: var(--panel-bg, rgba(255, 255, 255, 0.95)); backdrop-filter: blur(8px); border-radius: 0px; box-shadow: 0 8px 28px rgba(0,0,0,0.25); z-index: 10000; overflow: hidden;';
    win.innerHTML = '<div class="find-header" style="padding: 16px 20px; background: var(--header-bg, rgba(0,0,0,0.03)); border-bottom: 1px solid var(--border-color, rgba(0,0,0,0.1)); display: flex; justify-content: space-between; align-items: center; cursor: move;"><h3 style="margin: 0;">查找替换</h3><button class="find-close-btn" style="background: none; border: none; font-size: 20px; cursor: pointer;">✕</button></div>' +
        '<div style="padding: 20px;">' +
        '<div style="margin-bottom: 20px;"><label style="display: block; margin-bottom: 8px;">查找</label><input type="text" id="findTextFloat" placeholder="输入查找词" style="width: 100%; padding: 10px 12px; border: 1px solid #ddd; border-radius: 8px;"><button id="searchBookBtn" style="margin-top: 8px; padding: 6px 12px; background: #f0f0f0; border: 1px solid #ddd; border-radius: 6px; cursor: pointer;">🔍 搜索全书</button></div>' +
        '<div style="margin-bottom: 24px;"><label style="display: block; margin-bottom: 8px;">替换</label><input type="text" id="replaceTextFloat" placeholder="输入替换词" style="width: 100%; padding: 10px 12px; border: 1px solid #ddd; border-radius: 8px;"></div>' +
        '<div style="display: flex; gap: 12px;"><button id="replaceCurrentBtn" style="flex:1; padding: 8px; background: #f0f0f0; border: 1px solid #ddd; border-radius: 8px; cursor: pointer;">替换</button><button id="replaceChapterBtn" style="flex:1; padding: 8px; background: #f0f0f0; border: 1px solid #ddd; border-radius: 8px; cursor: pointer;">本章替换</button><button id="replaceAllBtn" style="flex:1; padding: 8px; background: #f0f0f0; border: 1px solid #ddd; border-radius: 8px; cursor: pointer;">全书替换</button></div>' +
        '<div id="searchResultArea" style="margin-top: 16px; padding: 10px; background: #f8f8f8; border-radius: 8px; display: none;"></div></div>';
    document.body.appendChild(win);
    
    var header = win.querySelector('.find-header');
    var isDragging = false, offsetX, offsetY;
    header.addEventListener('mousedown', function(e) {
        if (e.target.tagName === 'BUTTON') return;
        isDragging = true;
        offsetX = e.clientX - win.offsetLeft;
        offsetY = e.clientY - win.offsetTop;
        win.style.top = win.offsetTop + 'px';
        win.style.left = win.offsetLeft + 'px';
    });
    document.addEventListener('mousemove', function(e) {
        if (!isDragging) return;
        var newLeft = e.clientX - offsetX, newTop = e.clientY - offsetY;
        newLeft = Math.max(0, Math.min(newLeft, window.innerWidth - win.offsetWidth));
        newTop = Math.max(0, Math.min(newTop, window.innerHeight - win.offsetHeight));
        win.style.left = newLeft + 'px';
        win.style.top = newTop + 'px';
    });
    document.addEventListener('mouseup', function() { isDragging = false; });
    win.querySelector('.find-close-btn').onclick = function() { win.style.display = 'none'; };
    
    win.querySelector('#replaceCurrentBtn').onclick = function() {
        var findText = document.getElementById('findTextFloat').value;
        var replaceText = document.getElementById('replaceTextFloat').value;
        var editor = document.getElementById('editor');
        if (!editor || !findText) { alert('请输入查找内容'); return; }
        var content = editor.innerHTML;
        if (content.indexOf(findText) !== -1) {
            editor.innerHTML = content.replace(findText, replaceText);
            if (typeof saveCurrentChapter === 'function') saveCurrentChapter();
            alert('已替换');
        } else { alert('未找到'); }
    };
    
    win.querySelector('#replaceChapterBtn').onclick = function() {
        var findText = document.getElementById('findTextFloat').value;
        var replaceText = document.getElementById('replaceTextFloat').value;
        var editor = document.getElementById('editor');
        if (!editor || !findText) { alert('请输入查找内容'); return; }
        var content = editor.innerHTML;
        var regex = new RegExp(findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
        var matches = content.match(regex);
        var count = matches ? matches.length : 0;
        if (count > 0) {
            editor.innerHTML = content.replace(regex, replaceText);
            if (typeof saveCurrentChapter === 'function') saveCurrentChapter();
            alert('已替换 ' + count + ' 处');
        } else { alert('未找到'); }
    };
    
    win.querySelector('#replaceAllBtn').onclick = function() {
        var findText = document.getElementById('findTextFloat').value;
        var replaceText = document.getElementById('replaceTextFloat').value;
        if (!findText) { alert('请输入查找内容'); return; }
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
        } else { alert('未找到'); }
    };
    
    win.style.display = 'flex';
}

// ========== 双栏模式 ==========
function toggleDualMode() {
    var editor = document.getElementById('editor');
    if (!editor) { alert('请先打开一本书籍'); return; }
    var editorContainer = editor.parentElement;
    var existingDual = document.getElementById('dualEditorContainer');
    if (existingDual) { existingDual.remove(); editor.style.display = 'block'; return; }
    
    var originalContent = editor.innerHTML;
    var currentFontSize = editor.style.fontSize || localStorage.getItem('editor_font_size') + 'px' || '14px';
    var currentLineHeight = editor.style.lineHeight || localStorage.getItem('editor_line_height') || '1.8';
    var currentFontFamily = editor.style.fontFamily || localStorage.getItem('editor_font_family') || 'system-ui';
    editor.style.display = 'none';
    
    var dualHtml = '<div id="dualEditorContainer" style="display:flex; flex:1; height:100%; width:100%; position:relative;">' +
        '<div id="dualLeft" contenteditable="true" style="flex:1; overflow:auto; padding:16px; outline:none; line-height:' + currentLineHeight + '; font-size:' + currentFontSize + '; font-family:' + currentFontFamily + '; background: var(--panel-bg, rgba(255,255,255,0.9)); color: var(--text-color, #333);">' + originalContent + '</div>' +
        '<div id="dualResizeHandle" style="width:4px; cursor:col-resize; background:rgba(0,122,255,0.3);"></div>' +
        '<div id="dualRight" contenteditable="true" style="flex:1; overflow:auto; padding:16px; outline:none; line-height:1.4; font-size:13px; font-family:system-ui; background: var(--panel-bg, rgba(255,255,255,0.9)); color: var(--text-color, #333);">' + originalContent + '</div>' +
        '<button id="exitDualBtn" style="position:absolute; bottom:16px; right:16px; padding:6px 12px; background:#dc3545; color:white; border:none; border-radius:16px; cursor:pointer; z-index:10;">退出</button></div>';
    editorContainer.insertAdjacentHTML('beforeend', dualHtml);
    
    var leftArea = document.getElementById('dualLeft'), rightArea = document.getElementById('dualRight');
    var resizeHandle = document.getElementById('dualResizeHandle'), isResizing = false, startX = 0, startLeftWidth = 0, containerWidth = 0;
    resizeHandle.addEventListener('mousedown', function(e) {
        e.preventDefault(); isResizing = true; startX = e.clientX; startLeftWidth = leftArea.getBoundingClientRect().width;
        containerWidth = leftArea.parentElement.clientWidth; document.body.style.cursor = 'col-resize'; document.body.style.userSelect = 'none';
    });
    document.addEventListener('mousemove', function(e) {
        if (!isResizing) return;
        var deltaX = e.clientX - startX, newLeftWidth = startLeftWidth + deltaX, percent = (newLeftWidth / containerWidth) * 100;
        if (percent < 20) percent = 20; if (percent > 80) percent = 80;
        leftArea.style.flex = percent; rightArea.style.flex = 100 - percent;
    });
    document.addEventListener('mouseup', function() { if (isResizing) { isResizing = false; document.body.style.cursor = ''; document.body.style.userSelect = ''; } });
    resizeHandle.addEventListener('mouseover', function() { this.style.background = '#007aff'; });
    resizeHandle.addEventListener('mouseout', function() { this.style.background = 'rgba(0,122,255,0.3)'; });
    
    leftArea.addEventListener('input', function() { rightArea.innerHTML = this.innerHTML; editor.innerHTML = this.innerHTML; if (typeof saveCurrentChapter === 'function') saveCurrentChapter(); });
    rightArea.addEventListener('input', function() { leftArea.innerHTML = this.innerHTML; editor.innerHTML = this.innerHTML; if (typeof saveCurrentChapter === 'function') saveCurrentChapter(); });
    document.getElementById('exitDualBtn').onclick = function() { document.getElementById('dualEditorContainer').remove(); editor.style.display = 'block'; if (typeof saveCurrentChapter === 'function') saveCurrentChapter(); };
}

// ========== 备忘录模式 ==========
function toggleMemoMode() {
    var editor = document.getElementById('editor');
    if (!editor) { alert('请先打开一本书籍'); return; }
    var editorContainer = editor.parentElement;
    var existingMemo = document.getElementById('memoEditorContainer');
    if (existingMemo) { existingMemo.remove(); editor.style.display = 'block'; return; }
    
    var currentFontSize = editor.style.fontSize || localStorage.getItem('editor_font_size') + 'px' || '14px';
    var currentLineHeight = editor.style.lineHeight || localStorage.getItem('editor_line_height') || '1.8';
    var currentFontFamily = editor.style.fontFamily || localStorage.getItem('editor_font_family') || 'system-ui';
    var currentBook = typeof getCurrentBook === 'function' ? getCurrentBook() : null;
    var memoKey = 'memo_content_' + (currentBook ? currentBook.id : 'global');
    var savedMemo = localStorage.getItem(memoKey) || '';
    var originalContent = editor.innerHTML;
    editor.style.display = 'none';
    
    var memoHtml = '<div id="memoEditorContainer" style="display:flex; flex:1; height:100%; width:100%; position:relative;">' +
        '<div id="memoLeft" contenteditable="true" style="flex:1; overflow:auto; padding:16px; outline:none; line-height:' + currentLineHeight + '; font-size:' + currentFontSize + '; font-family:' + currentFontFamily + '; background: var(--panel-bg, rgba(255,255,255,0.9)); color: var(--text-color, #333);">' + originalContent + '</div>' +
        '<div id="memoResizeHandle" style="width:4px; cursor:col-resize; background:rgba(0,122,255,0.3);"></div>' +
        '<div id="memoRight" contenteditable="true" style="flex:1; overflow:auto; padding:16px; outline:none; line-height:1.6; font-size:14px; font-family:system-ui; background: var(--panel-bg, rgba(255,255,248,0.95)); color: var(--text-color, #333);">' + (savedMemo || '📓 备忘录\n\n在这里记录灵感、待办事项、人物设定等...') + '</div>' +
        '<button id="exitMemoBtn" style="position:absolute; bottom:16px; right:16px; padding:6px 12px; background:#dc3545; color:white; border:none; border-radius:16px; cursor:pointer; z-index:10;">退出</button></div>';
    editorContainer.insertAdjacentHTML('beforeend', memoHtml);
    
    var leftArea = document.getElementById('memoLeft'), rightArea = document.getElementById('memoRight');
    var resizeHandle = document.getElementById('memoResizeHandle'), isResizing = false, startX = 0, startLeftWidth = 0, containerWidth = 0;
    resizeHandle.addEventListener('mousedown', function(e) {
        e.preventDefault(); isResizing = true; startX = e.clientX; startLeftWidth = leftArea.getBoundingClientRect().width;
        containerWidth = leftArea.parentElement.clientWidth; document.body.style.cursor = 'col-resize'; document.body.style.userSelect = 'none';
    });
    document.addEventListener('mousemove', function(e) {
        if (!isResizing) return;
        var deltaX = e.clientX - startX, newLeftWidth = startLeftWidth + deltaX, percent = (newLeftWidth / containerWidth) * 100;
        if (percent < 20) percent = 20; if (percent > 80) percent = 80;
        leftArea.style.flex = percent; rightArea.style.flex = 100 - percent;
    });
    document.addEventListener('mouseup', function() { if (isResizing) { isResizing = false; document.body.style.cursor = ''; document.body.style.userSelect = ''; } });
    resizeHandle.addEventListener('mouseover', function() { this.style.background = '#007aff'; });
    resizeHandle.addEventListener('mouseout', function() { this.style.background = 'rgba(0,122,255,0.3)'; });
    
    leftArea.addEventListener('input', function() { editor.innerHTML = this.innerHTML; if (typeof saveCurrentChapter === 'function') saveCurrentChapter(); });
    rightArea.addEventListener('input', function() { localStorage.setItem(memoKey, this.innerHTML); });
    document.getElementById('exitMemoBtn').onclick = function() {
        localStorage.setItem(memoKey, rightArea.innerHTML);
        document.getElementById('memoEditorContainer').remove();
        editor.style.display = 'block';
        if (typeof saveCurrentChapter === 'function') saveCurrentChapter();
    };
}

// ========== 工具栏按钮绑定 ==========
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

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) { if (m === '&') return '&amp;'; if (m === '<') return '&lt;'; if (m === '>') return '&gt;'; return m; });
}

// 延迟绑定，确保 DOM 加载完成
setTimeout(bindToolbarButtons, 500);
// ========== 工具栏拖拽排序功能 ==========

var toolbarDragSource = null;
var toolbarDragIndex = -1;

// 初始化工具栏拖拽排序
function initToolbarDragSort() {
    var toolbar = document.getElementById('mainToolbar');
    if (!toolbar) {
        console.log('工具栏未找到，稍后重试');
        setTimeout(initToolbarDragSort, 500);
        return;
    }
    
    var buttons = toolbar.querySelectorAll('.toolbar-btn');
    console.log('找到 ' + buttons.length + ' 个按钮，正在添加拖拽功能...');
    
    for (var i = 0; i < buttons.length; i++) {
        var btn = buttons[i];
        btn.setAttribute('draggable', 'true');
        btn.setAttribute('data-drag-index', i);
        
        btn.removeEventListener('dragstart', toolbarDragStart);
        btn.removeEventListener('dragend', toolbarDragEnd);
        btn.removeEventListener('dragover', toolbarDragOver);
        btn.removeEventListener('drop', toolbarDrop);
        
        btn.addEventListener('dragstart', toolbarDragStart);
        btn.addEventListener('dragend', toolbarDragEnd);
        btn.addEventListener('dragover', toolbarDragOver);
        btn.addEventListener('drop', toolbarDrop);
    }
    
    console.log('工具栏拖拽排序已初始化完成');
}

function toolbarDragStart(e) {
    console.log('dragstart 触发', this.getAttribute('data-action'));
    toolbarDragSource = this;
    toolbarDragIndex = parseInt(this.getAttribute('data-drag-index'));
    e.dataTransfer.setData('text/plain', toolbarDragIndex);
    e.dataTransfer.effectAllowed = 'move';
    this.style.opacity = '0.5';
}

function toolbarDragEnd(e) {
    this.style.opacity = '';
    toolbarDragSource = null;
    toolbarDragIndex = -1;
    saveToolbarOrder();
}

function toolbarDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (toolbarDragSource && toolbarDragSource !== this) {
        this.style.borderLeft = '2px solid #007aff';
    }
}

function toolbarDrop(e) {
    e.preventDefault();
    this.style.borderLeft = '';
    
    if (!toolbarDragSource || toolbarDragSource === this) return;
    
    var toolbar = document.getElementById('mainToolbar');
    var sourceIndex = toolbarDragIndex;
    var targetIndex = parseInt(this.getAttribute('data-drag-index'));
    
    if (isNaN(sourceIndex) || isNaN(targetIndex)) return;
    
    var buttons = Array.from(toolbar.querySelectorAll('.toolbar-btn'));
    var movedButton = buttons[sourceIndex];
    
    if (sourceIndex < targetIndex) {
        for (var i = sourceIndex; i < targetIndex; i++) {
            buttons[i] = buttons[i + 1];
        }
        buttons[targetIndex] = movedButton;
    } else {
        for (var i = sourceIndex; i > targetIndex; i--) {
            buttons[i] = buttons[i - 1];
        }
        buttons[targetIndex] = movedButton;
    }
    
    for (var i = 0; i < buttons.length; i++) {
        buttons[i].setAttribute('data-drag-index', i);
        toolbar.appendChild(buttons[i]);
    }
    
    // 重新绑定按钮事件
    var newButtons = toolbar.querySelectorAll('.toolbar-btn');
    for (var i = 0; i < newButtons.length; i++) {
        var btn = newButtons[i];
        var action = btn.getAttribute('data-action');
        if (action) {
            btn.onclick = (function(a) { 
                return function() { handleToolbarAction(a); }; 
            })(action);
        }
    }
    
    saveToolbarOrder();
}

function getButtonIndex(btn) {
    var toolbar = document.getElementById('mainToolbar');
    if (!toolbar) return -1;
    var buttons = toolbar.querySelectorAll('.toolbar-btn');
    for (var i = 0; i < buttons.length; i++) {
        if (buttons[i] === btn) return i;
    }
    return -1;
}

function saveToolbarOrder() {
    var toolbar = document.getElementById('mainToolbar');
    if (!toolbar) return;
    
    var buttons = toolbar.querySelectorAll('.toolbar-btn');
    var order = [];
    for (var i = 0; i < buttons.length; i++) {
        var action = buttons[i].getAttribute('data-action');
        if (action) {
            order.push(action);
        }
    }
    localStorage.setItem('toolbar_button_order', JSON.stringify(order));
    console.log('工具栏顺序已保存', order);
}

function loadToolbarOrder() {
    var savedOrder = localStorage.getItem('toolbar_button_order');
    if (!savedOrder) return false;
    try {
        var order = JSON.parse(savedOrder);
        var toolbar = document.getElementById('mainToolbar');
        if (!toolbar) return false;
        
        var buttonMap = {};
        var buttons = toolbar.querySelectorAll('.toolbar-btn');
        for (var i = 0; i < buttons.length; i++) {
            var btn = buttons[i];
            var action = btn.getAttribute('data-action');
            if (action) {
                buttonMap[action] = btn;
            }
        }
        
        for (var i = 0; i < order.length; i++) {
            var action = order[i];
            if (buttonMap[action]) {
                toolbar.appendChild(buttonMap[action]);
            }
        }
        
        // 重新绑定事件
        var newButtons = toolbar.querySelectorAll('.toolbar-btn');
        for (var i = 0; i < newButtons.length; i++) {
            var btn = newButtons[i];
            var action = btn.getAttribute('data-action');
            if (action) {
                btn.onclick = (function(a) { 
                    return function() { handleToolbarAction(a); }; 
                })(action);
            }
        }
        
        return true;
    } catch(e) {
        return false;
    }
}

// 重置工具栏到默认顺序
function resetToolbarOrder() {
    var defaultOrder = [
        'import', 'importImage', 'fullscreen', 'theme', 'font', 'clean', 
        'format', 'find', 'proofread', 'dual', 'seclusion', 
        'memo', 'save', 'export', 'sidebar'
    ];
    
    var toolbar = document.getElementById('mainToolbar');
    if (!toolbar) return;
    
    var buttonMap = {};
    var buttons = toolbar.querySelectorAll('.toolbar-btn');
    for (var i = 0; i < buttons.length; i++) {
        var btn = buttons[i];
        var action = btn.getAttribute('data-action');
        if (action) {
            buttonMap[action] = btn;
        }
    }
    
    for (var i = 0; i < defaultOrder.length; i++) {
        var action = defaultOrder[i];
        if (buttonMap[action]) {
            toolbar.appendChild(buttonMap[action]);
        }
    }
    
    // 重新绑定事件
    var newButtons = toolbar.querySelectorAll('.toolbar-btn');
    for (var i = 0; i < newButtons.length; i++) {
        var btn = newButtons[i];
        var action = btn.getAttribute('data-action');
        if (action) {
            btn.onclick = (function(a) { 
                return function() { handleToolbarAction(a); }; 
            })(action);
        }
    }
    
    localStorage.removeItem('toolbar_button_order');
    alert('工具栏已重置为默认顺序');
}

// 添加重置提示
function addToolbarResetHint() {
    var toolbar = document.getElementById('mainToolbar');
    if (!toolbar) return;
    
    toolbar.style.position = 'relative';
    
    toolbar.addEventListener('dblclick', function(e) {
        if (!e.target.classList.contains('toolbar-btn')) {
            if (confirm('重置工具栏到默认顺序？')) {
                resetToolbarOrder();
            }
        }
    });
    
    var tip = document.createElement('div');
    tip.className = 'toolbar-drag-tip';
    tip.style.cssText = 'position: absolute; right: 8px; top: 50%; transform: translateY(-50%); font-size: 10px; color: #999; opacity: 0.5; pointer-events: none;';
    tip.textContent = '💡 拖拽按钮可调整顺序，双击空白处重置';
    toolbar.appendChild(tip);
}

// 初始化拖拽排序（页面加载时）
setTimeout(function() {
    loadToolbarOrder();
    initToolbarDragSort();
    addToolbarResetHint();
    console.log('拖拽排序模块启动完成');
}, 500);