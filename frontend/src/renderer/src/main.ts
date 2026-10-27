import './style.css'
import './components/navbar/component'
import './components/screens-index/component'
import './components/species-index/component'
import './components/species-card/component'
import { Lang } from '@exhibition-screens/shared';

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
  const path = location.hash.slice(1) || '/home';
  renderPage(getRoute(path));
}

const root = document.querySelector<HTMLElement>('#app')

if (!root) {
  throw new Error('Application root was not found')
}

// TODO not sure if this is a natural place for top-level logic or not..
document.querySelector('x-navbar')?.addEventListener('text-size-changed', event => {
  const { newSize } = (event as any).detail;
  document.documentElement.style.fontSize = `${newSize}px`;
});

document.querySelector('x-navbar')?.addEventListener('lang-changed', event => {
  const { newLang } = (event as any).detail;
  currentLang = newLang;
  navigate();
});

window.addEventListener('hashchange', navigate)
navigate();
