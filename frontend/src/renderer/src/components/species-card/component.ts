import type { ScreenData, SpeciesCard, Media } from '@exhibition-screens/shared';
import styles from './styles.css?inline';
import { getScreens } from '../../data-source';
import { currentLang } from '../../main';

const template = document.createElement('template');
template.innerHTML = `
  <style>${styles}</style>
  <button id="return-btn">Palaa</button>
`;

const cardTemplate = document.createElement('template');
cardTemplate.innerHTML = `
  <div id="species-card">
    <div class="hero"></div>
    <h2></h2>
    <p id="scientific-name"></p>
    <p id="description"></p>
  </div>
`;

const createSpeciesCard = (species: SpeciesCard): HTMLElement => {
  const fragment = cardTemplate.content.cloneNode(true) as DocumentFragment;
  const el = fragment.firstElementChild as HTMLElement;
  el.querySelector('h2')!.textContent = species.vernacularName[currentLang];
  el.querySelector('#scientific-name')!.textContent = species.scientificName[currentLang];
  el.querySelector('#description')!.textContent = species.description[currentLang];

  const createMedia = (hero: Media): HTMLElement => {
    let el: HTMLImageElement | HTMLVideoElement;
    if (hero._tag === 'img') {
      el = document.createElement('img');
    } else {
      el = document.createElement('video');
      el.controls = true;
      el.preload = 'metadata';
    }
    el.src = `exhibition-cache://${species.hero.url}`;
    return el;
  }

  el.querySelector('.hero')!.append(createMedia(species.hero));
  return el;
};

export class SpeciesCardComponent extends HTMLElement {
  static observedAttributes = ['screen-idx', 'species-idx'];

  private shadow: ShadowRoot;

  private screens: ScreenData[] | undefined;
  private screenIdx: number | undefined;
  private speciesIdx: number | undefined;

  constructor() {
    super();

    this.shadow = this.attachShadow({ mode: 'open' });
    this.shadow.append(template.content.cloneNode(true));

    this.shadow.querySelector('#return-btn')?.addEventListener('click', this.onReturnClick.bind(this));

    getScreens().then((screens) => {
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
    if (attribute === 'species-idx') {
      this.speciesIdx = newValue === null ? undefined : parseInt(newValue);
    }
    this.update();
  }

  update() {
    if (this.screens === undefined || this.screenIdx === undefined || this.speciesIdx === undefined) return;
    this.shadow.querySelector('#species-card')?.remove();
    this.shadow.append(createSpeciesCard(this.screens[this.screenIdx].species[this.speciesIdx]));
  }

  onReturnClick() {
    if (this.screenIdx === undefined) return;
    location.hash = `/screens/${this.screenIdx}`;
  }
}

customElements.define('x-species-card', SpeciesCardComponent);
