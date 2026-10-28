import { contextBridge, ipcRenderer } from 'electron';
import type { ExhibitionAPI } from '@exhibition-screens/shared';

const api: ExhibitionAPI = {
  getContent: () => ipcRenderer.invoke('content:get'),
};

contextBridge.exposeInMainWorld('exhibition', api);
