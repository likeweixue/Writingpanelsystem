const { app, BrowserWindow, Menu, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');

let mainWindow;
let splashWindow;

// 获取文档目录中的备份文件夹
const documentsPath = path.join(os.homedir(), 'Documents', '写作面板系统备份');

// 确保备份目录存在
function ensureBackupDir() {
    if (!fs.existsSync(documentsPath)) {
        fs.mkdirSync(documentsPath, { recursive: true });
        console.log('创建备份目录:', documentsPath);
    }
}

// 清理文件名中的非法字符
function sanitizeFileName(name) {
    if (!name) return '未命名';
    return name.replace(/[\\/:*?"<>|]/g, '_').replace(/\s+$/g, '');
}

// 创建启动画面
function createSplashWindow() {
    splashWindow = new BrowserWindow({
        width: 500,
        height: 350,
        frame: false,
        transparent: true,
        alwaysOnTop: true,
        resizable: false,
        center: true,
        skipTaskbar: true,
        show: true,  // 确保显示
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true
        }
    });
    
    splashWindow.loadFile('splash.html');
    
    // 不再使用 setTimeout 自动关闭，由主窗口 ready-to-show 控制
}

// 备份单本书籍
async function backupBook(book) {
    ensureBackupDir();
    
    const today = new Date();
    const dateStr = `${today.getFullYear()}年${today.getMonth() + 1}月${today.getDate()}日`;
    const timeStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}_${String(today.getHours()).padStart(2, '0')}-${String(today.getMinutes()).padStart(2, '0')}`;
    
    const bookName = sanitizeFileName(book.title);
    const bookFolder = path.join(documentsPath, bookName);
    const dateFolder = path.join(bookFolder, dateStr);
    const timeFolder = path.join(dateFolder, timeStr);
    
    if (!fs.existsSync(timeFolder)) {
        fs.mkdirSync(timeFolder, { recursive: true });
    }
    
    let chapterCount = 0;
    let totalWords = 0;
    
    if (book.volumes && book.volumes.length > 0) {
        for (let v = 0; v < book.volumes.length; v++) {
            const vol = book.volumes[v];
            const volName = sanitizeFileName(vol.name);
            const volFolder = path.join(timeFolder, volName);
            if (!fs.existsSync(volFolder)) {
                fs.mkdirSync(volFolder, { recursive: true });
            }
            
            if (vol.chapters && vol.chapters.length > 0) {
                for (let c = 0; c < vol.chapters.length; c++) {
                    const ch = vol.chapters[c];
                    const chName = sanitizeFileName(ch.title);
                    const fileName = `${chName}.txt`;
                    const filePath = path.join(volFolder, fileName);
                    const content = ch.content ? ch.content.replace(/<[^>]*>/g, '') : '';
                    const words = content.length;
                    totalWords += words;
                    chapterCount++;
                    
                    const header = `【${book.title}】${vol.name} - ${ch.title}\n`;
                    const timeHeader = `备份时间：${new Date().toLocaleString()}\n字数：${words}\n${'='.repeat(50)}\n\n`;
                    const fullContent = header + timeHeader + content;
                    
                    fs.writeFileSync(filePath, fullContent, 'utf8');
                }
            }
        }
    }
    
    const infoPath = path.join(timeFolder, '_book_info.json');
    fs.writeFileSync(infoPath, JSON.stringify({
        title: book.title,
        desc: book.desc || '',
        backupTime: new Date().toISOString(),
        backupTimeStr: new Date().toLocaleString(),
        totalChapters: chapterCount,
        totalWords: totalWords,
        volumes: book.volumes ? book.volumes.map(v => ({ 
            name: v.name, 
            chapters: v.chapters ? v.chapters.map(c => ({ 
                title: c.title, 
                words: c.content ? c.content.replace(/<[^>]*>/g, '').length : 0 
            })) : [] 
        })) : []
    }, null, 2), 'utf8');
    
    return { success: true, path: timeFolder, chapterCount: chapterCount, totalWords: totalWords };
}

// 备份所有书籍
async function backupAllBooks(books) {
    ensureBackupDir();
    const results = [];
    for (let i = 0; i < books.length; i++) {
        try {
            const result = await backupBook(books[i]);
            results.push({ bookName: books[i].title, success: true, ...result });
        } catch (err) {
            results.push({ bookName: books[i].title, success: false, error: err.message });
        }
    }
    return results;
}

function createWindow() {
    // 先显示启动画面
    createSplashWindow();
    
    setTimeout(() => {
        mainWindow = new BrowserWindow({
            width: 1400,
            height: 900,
            minWidth: 800,
            minHeight: 600,
            show: false,  // 这里虽然是 false，但后面会调用 show()
            webPreferences: {
                nodeIntegration: false,
                contextIsolation: true,
                preload: path.join(__dirname, 'preload.js'),
                webSecurity: false,
                allowRunningInsecureContent: true,
                sandbox: false,
                additionalArguments: ['--allow-popups'],
                nativeWindowOpen: true
            },
            icon: path.join(__dirname, 'icon.icns'),
            title: '写作面板系统 WritingPanelSystem',
            frame: true
        });

        mainWindow.loadFile('index.html');
        
        // ===== 关键修复：页面加载完成后显示主窗口 =====
        mainWindow.once('ready-to-show', () => {
            // 关闭启动画面
            if (splashWindow && !splashWindow.isDestroyed()) {
                splashWindow.close();
                splashWindow = null;
            }
            // 显示主窗口
            mainWindow.show();
            mainWindow.focus();
        });
        
        // ===== 备用：如果 ready-to-show 没触发，5秒后强制显示 =====
        setTimeout(() => {
            if (mainWindow && !mainWindow.isVisible()) {
                console.log('⚠️ 强制显示主窗口（备用方案）');
                if (splashWindow && !splashWindow.isDestroyed()) {
                    splashWindow.close();
                    splashWindow = null;
                }
                mainWindow.show();
                mainWindow.focus();
            }
        }, 5000);
        
        // 设置窗口打开处理器
        mainWindow.webContents.setWindowOpenHandler(({ url }) => {
            console.log('🔗 打开新窗口:', url);
            
            if (url && (url.startsWith('file://') || url.startsWith('data:') || url.includes('.html'))) {
                const newWindow = new BrowserWindow({
                    width: 1200,
                    height: 800,
                    parent: mainWindow,
                    modal: false,
                    show: false,
                    frame: true,
                    webPreferences: {
                        nodeIntegration: false,
                        contextIsolation: true,
                        preload: path.join(__dirname, 'preload.js'),
                        webSecurity: false,
                        allowRunningInsecureContent: true,
                        sandbox: false,
                        nativeWindowOpen: true
                    }
                });
                
                newWindow.loadURL(url);
                newWindow.once('ready-to-show', () => {
                    newWindow.show();
                });
                
                newWindow.on('closed', () => {
                    console.log('子窗口已关闭');
                });
                
                return { action: 'allow' };
            }
            
            try {
                shell.openExternal(url);
            } catch(e) {
                console.error('打开外部链接失败:', e);
            }
            return { action: 'deny' };
        });
        
        // 设置菜单
        const menuTemplate = [
            {
                label: '文件',
                submenu: [
                    { label: '新建窗口', click: () => { createWindow(); } },
                    { type: 'separator' },
                    { label: '退出', role: 'quit' }
                ]
            },
            {
                label: '编辑',
                submenu: [
                    { label: '撤销', role: 'undo' },
                    { label: '重做', role: 'redo' },
                    { type: 'separator' },
                    { label: '剪切', role: 'cut' },
                    { label: '复制', role: 'copy' },
                    { label: '粘贴', role: 'paste' }
                ]
            },
            {
                label: '视图',
                submenu: [
                    { label: '重新加载', role: 'reload' },
                    { label: '全屏', role: 'togglefullscreen' },
                    { label: '开发者工具', role: 'toggleDevTools' }
                ]
            },
            {
                label: '帮助',
                submenu: [
                    { 
                        label: '关于', 
                        click: () => {
                            dialog.showMessageBox(mainWindow, {
                                type: 'info',
                                title: '关于 写作面板系统 Writingpanelsystem',
                                message: '写作面板系统 Writingpanelsystem 版本 1.9.1\n\n免费，开源，自由的写作软件\n开发者@麻昌生',
                                detail: 'GitHub: https://github.com/likeweixue/Writingpanelsystem\n\n备份位置：~/Documents/写作面板系统备份/'
                            });
                        }
                    },
                    {
                        label: '打开备份文件夹',
                        click: () => {
                            if (fs.existsSync(documentsPath)) {
                                shell.openPath(documentsPath);
                            } else {
                                dialog.showMessageBox(mainWindow, {
                                    type: 'info',
                                    title: '提示',
                                    message: '备份文件夹尚未创建，请先执行一次备份'
                                });
                            }
                        }
                    }
                ]
            }
        ];
        
        const menu = Menu.buildFromTemplate(menuTemplate);
        Menu.setApplicationMenu(menu);
        
        mainWindow.on('closed', () => {
            mainWindow = null;
        });
        
    }, 100);
}

// IPC 事件处理
ipcMain.handle('backup-book', async (event, { book }) => {
    return await backupBook(book);
});

ipcMain.handle('backup-all-books', async (event, { books }) => {
    return await backupAllBooks(books);
});

ipcMain.handle('open-backup-folder', async () => {
    if (fs.existsSync(documentsPath)) {
        shell.openPath(documentsPath);
        return { success: true };
    } else {
        return { success: false, error: '备份文件夹不存在' };
    }
});

// 保存图片
ipcMain.handle('save-image', async (event, { imageData, fileName }) => {
    console.log('保存图片请求:', fileName);
    
    const userDataPath = app.getPath('userData');
    const imagesPath = path.join(userDataPath, 'assets', 'images');
    
    console.log('图片保存路径:', imagesPath);
    
    if (!fs.existsSync(imagesPath)) {
        fs.mkdirSync(imagesPath, { recursive: true });
        console.log('创建图片目录:', imagesPath);
    }
    
    let finalFileName = fileName;
    if (!finalFileName) {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 8);
        finalFileName = `img_${timestamp}_${random}.jpg`;
    }
    finalFileName = finalFileName.replace(/[\\/:*?"<>|]/g, '_');
    
    const filePath = path.join(imagesPath, finalFileName);
    console.log('完整文件路径:', filePath);
    
    try {
        const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');
        fs.writeFileSync(filePath, buffer);
        
        const fileUrl = `file://${filePath}`;
        console.log('图片保存成功，URL:', fileUrl);
        
        return { 
            success: true, 
            filePath: fileUrl,
            fullPath: filePath
        };
    } catch (err) {
        console.error('保存图片失败:', err);
        return { success: false, error: err.message };
    }
});

// 保存文件对话框
ipcMain.handle('save-file-dialog', async (event, { fileName, content, type }) => {
    const result = await dialog.showSaveDialog({
        title: '保存文件',
        defaultPath: path.join(app.getPath('downloads'), fileName),
        filters: [
            { name: type === 'docx' ? 'Word 文档' : '文本文件', extensions: [type === 'docx' ? 'docx' : 'txt'] },
            { name: '所有文件', extensions: ['*'] }
        ]
    });
    
    if (!result.canceled && result.filePath) {
        if (type === 'docx') {
            const buffer = Buffer.from(content, 'base64');
            fs.writeFileSync(result.filePath, buffer);
        } else {
            fs.writeFileSync(result.filePath, content, 'utf8');
        }
        return { success: true, filePath: result.filePath };
    }
    return { success: false, canceled: true };
});

// 保存 ZIP 文件
ipcMain.handle('save-zip-file', async (event, { fileName, data }) => {
    const result = await dialog.showSaveDialog({
        title: '保存压缩包',
        defaultPath: path.join(app.getPath('downloads'), fileName),
        filters: [
            { name: 'ZIP 压缩包', extensions: ['zip'] }
        ]
    });
    
    if (!result.canceled && result.filePath) {
        fs.writeFileSync(result.filePath, Buffer.from(data));
        return { success: true, filePath: result.filePath };
    }
    return { success: false, canceled: true };
});

// ===== 新增：显示提示框（用于替代 alert） =====
ipcMain.handle('show-alert', async (event, { message }) => {
    await dialog.showMessageBox({
        type: 'info',
        title: '提示',
        message: message,
        buttons: ['确定']
    });
    return true;
});

app.whenReady().then(() => {
    createWindow();
    ensureBackupDir();
    
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});