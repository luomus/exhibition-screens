import { Lang } from '@exhibition-screens/shared';
import styles from './styles.css?inline';
import { getScreens } from '../../data-source';
import { currentLang } from '../../main';

const TEXT_SIZE_LEVEL_COUNT = 4;

const createTemplate = (title: string) => {
  const template = document.createElement('template');
  template.innerHTML = `
    <style>${styles}</style>
    <h1 id="screen-title">${title}</h1>
    <button id="text-size-btn">Text size</button>
    <button id="fi-btn">Fi</button>
    <button id="sv-btn">Sv</button>
    <button id="en-btn">En</button>
  `;
  return template;
};

export class NavbarComponent extends HTMLElement {
  static observedAttributes = ['screen-idx'];

  private shadow: ShadowRoot;
  private textSizeLevel = 0;

  constructor() {
    super();

    const template = createTemplate('Screen selection');
    this.shadow = this.attachShadow({ mode: 'open' });
    this.shadow.append(template.content.cloneNode(true));

    this.shadow.querySelector('#text-size-btn')?.addEventListener('click', this.onTextSizeClick.bind(this));
    this.shadow.querySelector('#fi-btn')?.addEventListener('click', () => { this.onLangChange('fi'); });
    this.shadow.querySelector('#sv-btn')?.addEventListener('click', () => { this.onLangChange('sv'); });
    this.shadow.querySelector('#en-btn') ?.addEventListener('click', () => { this.onLangChange('en'); });
  }

  attributeChangedCallback(
    attribute: string,
    oldValue: string | null,
    newValue: string | null
  ) {
    if (oldValue === newValue) return;
    if (attribute === 'screen-idx' && newValue !== null) {
      const screenIdx = parseInt(newValue);
      if (screenIdx < 0) {
        this.shadow.querySelector('#screen-title')!.innerHTML = 'Screen selection';
      } else {
        getScreens().then(screens => {
          if (!this.shadow.isConnected) return;
          this.shadow.querySelector('#screen-title')!.innerHTML = screens[screenIdx].info.title[currentLang];
        });
      }
    }
  }

  private onTextSizeClick() {
    this.textSizeLevel = (this.textSizeLevel + 1) % TEXT_SIZE_LEVEL_COUNT;
    const newSize = 16 + this.textSizeLevel * 4;
    this.dispatchEvent(new CustomEvent('text-size-changed', { detail: { newSize } }));
  }

  private onLangChange(newLang: Lang) {
    this.dispatchEvent(new CustomEvent('lang-changed', { detail: { newLang } }));
  }
}

customElements.define('x-navbar', NavbarComponent);
