import { ScreenData, ScreenDataSchema } from '@exhibition-screens/shared'
import express from 'express'
import { readFile, watch } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'

const port = Number(process.env.PORT ?? 3000)

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error('PORT must be an integer between 1 and 65535')
}

const app = express()
let screens: ScreenData[] | undefined = undefined;

app.use(express.json())

const contentDir = process.env.CONTENT_DIR ?? resolve(import.meta.dirname, '../assets');
const mediaDir = resolve(contentDir, 'media');
const screensPath = resolve(contentDir, 'screens.json');

const reloadScreens = async () => {
  try {
    const file = await readFile(screensPath, { encoding: 'utf8' });
    const json = JSON.parse(file);
    const data = ScreenDataSchema.array().parse(json);
    console.log('screens.json validated succesfully!');
    screens = data;
  } catch (e) {
    console.error('screens.json validation failed; ', e);
  }
};

const watcher = new AbortController();
const watchScreens = async () => {
  await reloadScreens();

  const events = watch(screensPath, { persistent: false, signal: watcher.signal });

  for await (const { filename } of events) {
    await reloadScreens();
  }
};

void watchScreens().catch(error => {
  if (!watcher.signal.aborted) {
    console.error('File watcher failed.');
  }
});

app.use('/content/media', express.static(mediaDir, { index: false, dotfiles: 'deny' }))

app.get('/screens', (req, res) => {
  if (screens !== undefined) {
    res.json(screens);
  } else {
    res.sendStatus(500);
  }
});

app.get('/health', (_request, response) => {
  response.json({ status: 'ok' })
})

const server = app.listen(port, () => {
  console.log(`Backend listening on http://localhost:${port}`)
})

function shutdown(): void {
  server.close((error) => {
    if (error) {
      console.error(error)
      process.exitCode = 1
    }
  })
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
