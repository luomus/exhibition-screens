import { ScreenData, ScreenDataSchema, StartupContent } from "@exhibition-screens/shared";
import { createReadStream, createWriteStream } from "fs";
import { mkdir, readFile, writeFile } from "fs/promises";
import { dirname, extname, join } from "path";
import { Readable } from "stream";
import { pipeline } from "stream/promises";

export interface ContentCacheSettings {
  contentDir: string;
  backendUrl: string;
}

const mediaTypes = new Map<string, string>([
  ['jpg', 'image/jpeg'],
  ['jpeg', 'image/jpeg'],
  ['png', 'image/png'],
  ['gif', 'image/gif'],
  ['webp', 'image/webp'],
  ['avif', 'image/avif'],
  ['svg', 'image/svg+xml'],
  ['bmp', 'image/bmp'],
  ['ico', 'image/vnd.microsoft.icon'],
  ['mp4', 'video/mp4'],
  ['m4v', 'video/mp4'],
  ['webm', 'video/webm'],
  ['ogv', 'video/ogg'],
  ['mov', 'video/quicktime'],
]);

const fileExtensionToHeaders = (extension: string): Headers =>
  new Headers({
    'Content-Type': mediaTypes.get(extension.replace('.', '')) ?? 'application/octet-stream',
  });

export class ContentCache {
  private refreshSucceeded = false;

  static async build(settings: ContentCacheSettings) {
    const cache = new ContentCache(settings);
    try {
      await cache.refresh();
    } catch (e) {
      console.warn(`Refresh from server failed; loading cached files: ${e}`);
    }
    return cache;
  }

  private constructor(private settings: ContentCacheSettings) {}

  async handleStartup(): Promise<StartupContent> {
    try {
      const fullPath = join(this.settings.contentDir, 'screens.json');
      const file = await readFile(fullPath, 'utf8');
      const screens = ScreenDataSchema.array().parse(JSON.parse(file));
      return { fromCache: this.refreshSucceeded, screens };
    } catch (e) {
      console.error('No screen data on disk');
      return { fromCache: false, screens: [] };
    }
  }

  async handleMedia(url: string): Promise<Response> {
    const parsed = new URL(url);
    const fileExtension = extname(parsed.pathname);
    const fullPath = join(this.settings.contentDir, parsed.hostname, parsed.pathname);
    try {
      const body = Readable.toWeb(createReadStream(fullPath));
      const res = new Response(body, { headers: fileExtensionToHeaders(fileExtension) });
      return res;
    } catch (e) {
      return new Response(undefined, { status: 404 });
    }
  }

  private async loadBackendJson(): Promise<ScreenData[]> {
    const response = await fetch(`${this.settings.backendUrl}/content/screens.json`, {
      cache: 'no-store',
      redirect: 'error',
      signal: AbortSignal.timeout(120_000),
    });
    if (!response.ok) {
      throw new Error(`Couldn't load json; ${response.status}: ${response.statusText}`);
    }
    const json = await response.json();
    const data = ScreenDataSchema.array().parse(json);
    const fullPath = join(this.settings.contentDir, 'screens.json');
    await mkdir(dirname(fullPath), { recursive: true });
    await writeFile(fullPath, JSON.stringify(data));
    return data;
  }

  private async loadBackendMedia(path: string): Promise<null> {
    const response = await fetch(`${this.settings.backendUrl}/content/${path}`, {
      cache: 'no-store',
      redirect: 'error',
      signal: AbortSignal.timeout(120_000),
    });
    if (!response.ok || !response.body) {
      throw new Error(`Couldn't load media ${path}; ${response.status}: ${response.statusText}`);
    }
    const fullPath = join(this.settings.contentDir, path);
    await mkdir(dirname(fullPath), { recursive: true });
    await pipeline(Readable.fromWeb(response.body), createWriteStream(fullPath));
    return null;
  }

  private async refresh(): Promise<null> {
    // fetch json from backend
    const screenData = await this.loadBackendJson();
    // uncover all media
    const mediaPromises = [];
    for (const screen of screenData) {
      for (const species of screen.species) {
        mediaPromises.push(this.loadBackendMedia(species.hero.url));
      }
    }
    // load media in parallel
    await Promise.all(mediaPromises);
    this.refreshSucceeded = true;
    return null;
  }
}
