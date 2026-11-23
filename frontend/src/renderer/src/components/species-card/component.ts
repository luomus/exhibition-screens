import type { ScreenData, SpeciesCard, Media } from '@exhibition-screens/shared';
import styles from './styles.css?inline';
import baseStyles from '../../base.css?inline';
import { getScreens } from '../../data-source';
import { currentLang } from '../../main';
import homeSvg from '../../assets/icons/home.svg?raw';

const template = document.createElement('template');
template.innerHTML = `
  <style>${baseStyles}${styles}</style>
  <!-- <button id="return-btn">${ homeSvg }</button> -->
`;

const cardTemplate = document.createElement('template');
cardTemplate.innerHTML = `
  <div id="species-card">
    <div class="hero"></div>
    <div class="text-section">
      <div class="title">
        <h2></h2>
        <i id="scientific-name"></i>
      </div>
      <p id="description"></p>
    </div>
  </div>
`;

const createSpeciesCard = (species: SpeciesCard): HTMLElement => {
  const fragment = cardTemplate.content.cloneNode(true) as DocumentFragment;
  const el = fragment.firstElementChild as HTMLElement;
  el.querySelector('h2')!.textContent = species.vernacularName[currentLang];
  el.querySelector('#scientific-name')!.textContent = species.scientificName;
  el.querySelector('#description')!.textContent = species.description[currentLang];

  const createMedia = (hero: Media): HTMLElement => {
    let el: HTMLImageElement | HTMLVideoElement;
    if (hero._tag === 'img') {
      el = document.createElement('img');
      el.alt = species.vernacularName[currentLang];
    } else {
      el = document.createElement('video');
      el.controls = false;
      el.autoplay = true;
      el.loop = true;
      el.muted = true;
      el.playsInline = true;
      el.preload = 'metadata';
    }
    el.src = `exhibition-cache://${species.hero.url}`;
    return el;
  }

  el.querySelector('.hero')!.append(createMedia(species.hero));
  return el;
};

const createFooter = (screen: ScreenData, screenIdx: number, activeSpeciesIdx: number): HTMLElement => {
  const footer = document.createElement('footer');
  footer.id = 'species-footer';

  const list = document.createElement('ul');
  screen.species.forEach((species, speciesIdx) => {
    const item = document.createElement('li');
    const link = document.createElement('a');
    link.href = `#/screens/${screenIdx}/${speciesIdx}`;

    const thumbnail = document.createElement('img');
    thumbnail.src = `exhibition-cache://${species.thumbnail.url}`;
    thumbnail.alt = '';
    link.append(thumbnail, species.vernacularName[currentLang]);

    if (speciesIdx === activeSpeciesIdx) {
      link.classList.add('active');
      link.setAttribute('aria-current', 'page');
    }
    item.append(link);
    list.append(item);
  });

  footer.append(list);
  return footer;
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
    const screen = this.screens[this.screenIdx];
    this.shadow.querySelector('#species-card')?.remove();
    this.shadow.querySelector('#species-footer')?.remove();

    const footer = createFooter(screen, this.screenIdx, this.speciesIdx);
    this.shadow.append(createSpeciesCard(screen.species[this.speciesIdx]), footer);

    const activeLink = footer.querySelector('.active')!;
    footer.scrollLeft = activeLink.getBoundingClientRect().left - footer.getBoundingClientRect().left;
  }

  onReturnClick() {
    if (this.screenIdx === undefined) return;
    location.hash = `/screens/${this.screenIdx}`;
  }
}

customElements.define('x-species-card', SpeciesCardComponent);
