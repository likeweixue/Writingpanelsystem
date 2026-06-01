const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
    // 备份相关
    backupBook: (book) => ipcRenderer.invoke('backup-book', { book }),
    backupAllBooks: (books) => ipcRenderer.invoke('backup-all-books', { books }),
    openBackupFolder: () => ipcRenderer.invoke('open-backup-folder'),
    
    // 保存图片
    saveImage: (imageData, fileName) => ipcRenderer.invoke('save-image', { imageData, fileName }),
    
    // 新增：保存文件对话框
    saveFile: (fileName, content, type) => ipcRenderer.invoke('save-file-dialog', { fileName, content, type }),
    
    // 新增：保存 ZIP 文件
    saveZipFile: (fileName, data) => ipcRenderer.invoke('save-zip-file', { fileName, data }),
    
    platform: process.platform
});

console.log('preload.js 已加载，electron API 已暴露');