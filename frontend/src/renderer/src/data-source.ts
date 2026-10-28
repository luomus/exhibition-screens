import type { ScreenData, StartupContent } from '@exhibition-screens/shared';

let content: Promise<StartupContent> | undefined;

export const getStartupContent = (): Promise<StartupContent> => {
  content ??= window.exhibition.getContent();
  return content;
};

export const getScreens = (): Promise<ScreenData[]> =>
  getStartupContent().then(result => result.screens);
