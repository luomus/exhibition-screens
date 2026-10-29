import type { ExhibitionAPI } from '@exhibition-screens/shared';

export interface RendererConfig {
  screenIdx?: number;
}

declare global {
  interface Window {
    exhibition: ExhibitionAPI;
    config: RendererConfig;
  }
}
