import { ScreenData, SpeciesCard } from '@exhibition-screens/shared';
import { toCanvas } from 'qrcode';
import styles from './styles.css?inline';
import baseStyles from '../../base.css?inline';
import { getScreens } from '../../data-source';
import { currentLang } from '../../main';

const template = document.createElement('template');
template.innerHTML = `
  <style>${baseStyles}${styles}</style>
  <svg width="0" height="0" aria-hidden="true"
       style="position: absolute">
    <defs>
      <clipPath id="wavy-bottom" clipPathUnits="objectBoundingBox">
        <path d="M0 0 H1 V0.95 Q0.75 1 0.5 0.95 T0 0.95 Z" />
      </clipPath>
    </defs>
  </svg>
  <div id="screen-intro">
    <p id="screen-desc"></p>
  </div>
`;

const createScreenQr = (url: string, description: string): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');
  canvas.id = 'screen-qr';
  canvas.hidden = true;
  canvas.setAttribute('role', 'img');
  canvas.setAttribute('aria-label', description);
  toCanvas(canvas, url, { width: 384 }, error => {
    if (error) {
      console.warn('Unable to generate screen QR code:', error);
      return;
    }
    // Let CSS size the canvas independently of its drawing resolution.
    canvas.removeAttribute('style');
    canvas.hidden = false;
  });
  return canvas;
};

const createSpeciesListItem = (species: SpeciesCard, screenIdx:number, speciesIdx: number): HTMLElement => {
  const screenEl = document.createElement('li');
  screenEl.innerHTML = `
    <a class="panel" href="#/screens/${screenIdx}/${speciesIdx}">
      <div class="img-frame">
        <img alt=""/>
      </div>
      <div class="title">
        <h3></h3>
        <i><span></span></i>
      </div>
    </a>
  `;
  screenEl.querySelector('img')!.src = `exhibition-cache://${species.thumbnail.url}`;
  screenEl.querySelector('h3')!.textContent = species.vernacularName[currentLang];
  screenEl.querySelector('span')!.textContent = species.scientificName;
  return screenEl;
};

const createSpeciesList = (screen: ScreenData, screenIdx: number): HTMLElement => {
  const tempSpecies = [...screen.species, ...screen.species, ...screen.species, ...screen.species, ...screen.species, ...screen.species, ...screen.species];
  const items = tempSpecies.map((species, speciesIdx) => createSpeciesListItem(species, screenIdx, speciesIdx % 3)); // TODO remove temp modulo
  const ulEl = document.createElement('ul');
  ulEl.setAttribute('id', 'species-list');
  ulEl.append(...items);
  return ulEl;
};

export class SpeciesIndexComponent extends HTMLElement {
  static observedAttributes = ['screen-idx'];

  private shadow: ShadowRoot;

  private screens: ScreenData[] | undefined;
  private screenIdx: number | undefined;

  constructor() {
    super();

    this.shadow = this.attachShadow({ mode: 'open' });
    this.shadow.append(template.content.cloneNode(true));

    getScreens().then(screens => {
      if (!this.shadow.isConnected) return;
      this.screens = screens;
      this.update();
    });
  }

  attributeChangedCallback(
    attribute: string,
    oldValue: string | null,
    newValue: string | null
  ) {
    if (oldValue === newValue) return;
    if (attribute === 'screen-idx') {
      this.screenIdx = newValue === null ? undefined : parseInt(newValue);
    }
    this.update();
  }

  update() {
    if (this.screens === undefined || this.screenIdx === undefined) return;
    const screen = this.screens[this.screenIdx];
    const intro = this.shadow.querySelector('#screen-intro')!;
    intro.querySelector('#screen-desc')!.textContent = screen.info.description[currentLang];
    intro.querySelector('#screen-qr')?.remove();
    const qrUrl = screen.info.qrUrl[currentLang].trim();
    if (qrUrl) {
      intro.append(createScreenQr(qrUrl, screen.info.qrDescription[currentLang] || qrUrl));
    }
    this.shadow.querySelector('#species-list')?.remove();
    this.shadow.append(createSpeciesList(screen, this.screenIdx));
  }
}

customElements.define('x-species-index', SpeciesIndexComponent);
