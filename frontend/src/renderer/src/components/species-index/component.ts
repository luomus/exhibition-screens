import { ScreenData, SpeciesCard } from '@exhibition-screens/shared';
import styles from './styles.css?inline';
import { getScreens } from '../../data-source';
import { currentLang } from '../../main';

const template = document.createElement('template');
template.innerHTML = `
  <style>${styles}</style>
  <h2>Species index</h2>
`;

const createSpeciesListItem = (species: SpeciesCard, screenIdx:number, speciesIdx: number): HTMLElement => {
  const screenEl = document.createElement('li');
  screenEl.innerHTML = `
    <a href="#/screens/${screenIdx}/${speciesIdx}">
      <img class="thumbnail" alt="" width="240" height="135" />
      <h3></h3>
    </a>
  `;
  screenEl.querySelector('img')!.src = `exhibition-cache://${species.thumbnail.url}`;
  screenEl.querySelector('h3')!.textContent = species.vernacularName[currentLang];
  return screenEl;
};

const createSpeciesList = (screen: ScreenData, screenIdx: number): HTMLElement => {
  const items = screen.species.map((species, speciesIdx) => createSpeciesListItem(species, screenIdx, speciesIdx));
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
    this.shadow.querySelector('#species-list')?.remove();
    this.shadow.append(createSpeciesList(this.screens[this.screenIdx], this.screenIdx));
  }
}

customElements.define('x-species-index', SpeciesIndexComponent);
