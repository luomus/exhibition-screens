import './style.css'
import type { Lang } from '@exhibition-screens/shared';
import { getStartupContent } from './data-source';

export let currentLang: Lang = 'fi';

const createErrorElem = (): HTMLElement => {
  let el = document.createElement('div');
  el.textContent = '404';
  return el;
}

const routes: [RegExp, (match: RegExpExecArray) => HTMLElement][] = [
  [/^\/home$/, () => {
    document.querySelector('x-navbar')?.setAttribute('screen-idx', '-1');
    return document.createElement('x-screens-index');
  }],
  [/^\/screens\/([^/]+)$/, ([, screenIdx]) => {
    const el = document.createElement('x-species-index');
    el.setAttribute('screen-idx', screenIdx);
    document.querySelector('x-navbar')?.setAttribute('screen-idx', screenIdx);
    return el;
  }],
  [/^\/screens\/([^/]+)\/([^/]+)$/, ([, screenIdx, speciesIdx]) => {
    const el = document.createElement('x-species-card');
    el.setAttribute('screen-idx', screenIdx);
    el.setAttribute('species-idx', speciesIdx);
    document.querySelector('x-navbar')?.setAttribute('screen-idx', screenIdx);
    return el;
  }]
];

const getRoute = (path: string): HTMLElement => {
  for (const [pattern, render] of routes) {
    const result = pattern.exec(path);
    if (result) return render(result);
  }

  return createErrorElem();
}

const renderPage = (el: HTMLElement) => {
  const root = document.querySelector<HTMLElement>('#app')
  root?.replaceChildren(el);
};

const navigate = () => {
  const fallbackPath = window.config.screenIdx !== undefined ? `/screens/${window.config.screenIdx}` : '/home';
  const path = location.hash.slice(1) || fallbackPath;
  renderPage(getRoute(path));
}

const root = document.querySelector<HTMLElement>('#app')

if (!root) {
  throw new Error('Application root was not found')
}

async function start(): Promise<void> {
  const status = document.querySelector<HTMLElement>('#startup-status');
  try {
    await Promise.all([
      import('./components/navbar/component'),
      import('./components/screens-index/component'),
      import('./components/species-index/component'),
      import('./components/species-card/component'),
    ]);

    const navbar = document.createElement('x-navbar');
    navbar.addEventListener('text-size-changed', event => {
      const { newSize } = (event as CustomEvent<{ newSize: number }>).detail;
      document.documentElement.style.fontSize = `${newSize}px`;
    });
    navbar.addEventListener('lang-changed', event => {
      const { newLang } = (event as CustomEvent<{ newLang: Lang }>).detail;
      currentLang = newLang;
      navigate();
    });
    root?.before(navbar);

    if (status) {
      status.hidden = true;
    }
    window.addEventListener('hashchange', navigate);
    navigate();
  } catch (error) {
    console.error('Unable to load content.', error);
    if (status) {
      status.hidden = false;
      status.textContent = 'Unable to load content.';
    }
  }
}

void start();
