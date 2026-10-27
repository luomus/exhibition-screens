import { getScreens } from '../../data-source';
import { currentLang } from '../../main';
import styles from './styles.css?inline';
import type { ScreenData } from '@exhibition-screens/shared';

const template = document.createElement('template');
template.innerHTML = `
  <style>${styles}</style>
  <h2>Screens index</h2>
`;

const createScreenListItem = (screen: ScreenData, index: number): HTMLElement => {
  const screenEl = document.createElement('li');
  screenEl.innerHTML = `
    <h3>${screen.info.title[currentLang]}</h3>
    <a href="#/screens/${index}">Link to screen</a>
  `;
  return screenEl;
};

const createScreenList = (screens: ScreenData[]): HTMLElement => {
  const items = screens.map(createScreenListItem);
  const ulEl = document.createElement('ul');
  ulEl.setAttribute('id', 'screen-list');
  ulEl.append(...items);
  return ulEl;
};

export class ScreensIndexComponent extends HTMLElement {
  private shadow: ShadowRoot;

  constructor() {
    super();

    this.shadow = this.attachShadow({ mode: 'open' });
    this.shadow.append(template.content.cloneNode(true));

    getScreens().then((screens) => {
      if (!this.shadow.isConnected) return;
      this.updateScreens(screens);
    });
  }

  updateScreens(screens: ScreenData[]) {
    this.shadow.querySelector('#screen-list')?.remove();
    this.shadow.append(createScreenList(screens));
  }
}

customElements.define('x-screens-index', ScreensIndexComponent);
