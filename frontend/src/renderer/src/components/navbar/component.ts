import { Lang } from '@exhibition-screens/shared';
import styles from './styles.css?inline';
import baseStyles from '../../base.css?inline';
import { getScreens } from '../../data-source';
import { currentLang } from '../../main';
import textSizeSvg from '../../assets/icons/text-size.svg?raw';
import fiSvg from '../../assets/icons/fi.svg?raw';
import svSvg from '../../assets/icons/sv.svg?raw';
import enSvg from '../../assets/icons/en-gb.svg?raw';
import homeSvg from '../../assets/icons/home.svg?raw';

const TEXT_SIZE_LEVEL_COUNT = 4;

const createTemplate = (title: string) => {
  const template = document.createElement('template');
  template.innerHTML = `
    <style>${baseStyles}${styles}</style>
    <div class="container">
      <h1 id="screen-title">${title}</h1>
      <div class="right-nav">
        <button class="nav-item" id="text-size-btn">${ textSizeSvg }</button>
        <button class="nav-item" id="fi-btn">${ fiSvg }</button>
        <button class="nav-item" id="sv-btn">${ svSvg }</button>
        <button class="nav-item" id="en-btn">${ enSvg }</button>
        <a class="nav-item" id="return-btn" href="#/home">${ homeSvg }</a>
      </div>
    </div>
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
        this.shadow.querySelector('#screen-title')!.textContent = 'Screen selection';
      } else {
        getScreens().then(screens => {
          if (!this.shadow.isConnected) return;
          this.shadow.querySelector('#screen-title')!.textContent = screens[screenIdx].info.title[currentLang];
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
