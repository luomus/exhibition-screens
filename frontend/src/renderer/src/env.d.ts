import type { ExhibitionAPI } from '@exhibition-screens/shared';

declare global {
  interface Window {
    exhibition: ExhibitionAPI;
  }
}
