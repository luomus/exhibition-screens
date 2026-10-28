import { app, BrowserWindow, ipcMain, protocol } from 'electron'
import { dirname, join } from 'node:path'
import { ContentCache } from './content-cache';

// register 'exhibition-cache://<url>' urls in chromium
protocol.registerSchemesAsPrivileged([{
  scheme: 'exhibition-cache',
  privileges: { standard: true, secure: true, supportFetchAPI: true, stream: true, corsEnabled: true }
}]);

function createWindow(): void {
  const window = new BrowserWindow({
    width: 1280, height: 720,
    fullscreen: process.env.FULLSCREEN === 'true',
    webPreferences: {
      preload: join(import.meta.dirname, '../preload/index.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });

  // launch chromium with url (dev) or file (packaged)
  // ELECTRON_RENDERER_URL is set by electron-vite
  if (!app.isPackaged && process.env.ELECTRON_RENDERER_URL) {
    void window.loadURL(process.env.ELECTRON_RENDERER_URL);
  } else {
    void window.loadFile(join(import.meta.dirname, '../renderer/index.html'));
  }
}

const start = async () => {
  await app.whenReady();
  const backendUrl = process.env.EXHIBITION_BACKEND_URL ?? 'http://127.0.0.1:3000';
  const appDir = app.isPackaged
    ? process.env.PORTABLE_EXECUTABLE_DIR ?? dirname(process.env.APPIMAGE ?? app.getPath('exe'))
    : app.getAppPath();
  const contentDir = join(appDir, 'cache');
  const cache = await ContentCache.build({ backendUrl, contentDir });

  // Regular IPC for messaging
  ipcMain.handle('content:get', () => cache.handleStartup());

  // URL-protocol for fetching images/videos (so that you can fetch them by URL in html)
  protocol.handle('exhibition-cache', request =>
    cache.handleMedia(request.url)
      .catch(error => {
        console.error('Unable to serve cached media:', error);
        return new Response(null, { status: 500 });
      })
  );
  createWindow();

  // only needed on mac but might as well keep it
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
};

void start();

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
