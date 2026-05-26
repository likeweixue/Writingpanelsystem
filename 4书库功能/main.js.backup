const { app, BrowserWindow, Menu, shell } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        minWidth: 800,
        minHeight: 600,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        },
        icon: path.join(__dirname, 'icon.ico'),
        title: 'OpenWrite',
        frame: true
    });

    mainWindow.loadFile('index.html');
    
    // 处理新窗口打开 - 使用系统默认浏览器或创建新窗口
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        // 创建新的浏览器窗口而不是在内部打开
        const newWindow = new BrowserWindow({
            width: 1200,
            height: 800,
            webPreferences: {
                nodeIntegration: false,
                contextIsolation: true
            }
        });
        newWindow.loadURL(url);
        return { action: 'deny' };
    });
    
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
                { label: '关于', click: () => {
                    const { dialog } = require('electron');
                    dialog.showMessageBox(mainWindow, {
                        type: 'info',
                        title: '关于 OpenWrite',
                        message: 'OpenWrite 版本 1.0.0',
                        detail: '免费、开源、自由的写作软件\n\nGitHub: https://github.com/likeweixue/OpenWrite'
                    });
                }}
            ]
        }
    ];
    
    const menu = Menu.buildFromTemplate(menuTemplate);
    Menu.setApplicationMenu(menu);
    
    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

app.whenReady().then(() => {
    createWindow();
    
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
