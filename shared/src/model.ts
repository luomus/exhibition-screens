export type Lang = 'fi' | 'sv' | 'en';

export interface MultiLangString {
  fi: string;
  sv: string;
  en: string;
}

export interface ScreenInfo {
  title: MultiLangString,
  description: MultiLangString;
  qrDescription: MultiLangString;
  qrUrl: MultiLangString;
}

export interface Img {
  _tag: 'img',
  url: string,
}

export interface Video {
  _tag: 'video',
  url: string,
}

export interface SpeciesCard {
  hero: Img | Video;
  vernacularName: MultiLangString;
  scientificName: MultiLangString;
  description: MultiLangString;
}

export interface ScreenData {
  info: ScreenInfo;
  species: SpeciesCard[];
}
