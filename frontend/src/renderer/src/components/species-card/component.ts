import type { ScreenData, SpeciesCard } from '@exhibition-screens/shared';
import styles from './styles.css?inline';
import { getScreens } from '../../data-source';
import { currentLang } from '../../main';

const template = document.createElement('template');
template.innerHTML = `
  <style>${styles}</style>
  <button id="return-btn">Palaa</button>
`;

const createSpeciesCard = (species: SpeciesCard): HTMLElement => {
  const el = document.createElement('div');
  el.setAttribute('id', 'species-card');
  el.innerHTML = `
    <h2>${species.vernacularName[currentLang]}</h2>
    <p>${species.scientificName[currentLang]}</p>
    <p>${species.description[currentLang]}</p>
  `;
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
