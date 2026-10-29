import { contextBridge, ipcRenderer } from 'electron';
import type { ExhibitionAPI } from '@exhibition-screens/shared';
import type { RendererConfig } from '../renderer/src/env';

const api: ExhibitionAPI = {
  getContent: () => ipcRenderer.invoke('content:get'),
};

const rendererConfig: RendererConfig = {
  screenIdx: process.env.SCREEN_IDX !== undefined ? parseInt(process.env.SCREEN_IDX) : undefined,
};

contextBridge.exposeInMainWorld('exhibition', api);
contextBridge.exposeInMainWorld('config', rendererConfig);
