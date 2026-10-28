import { z } from 'zod';

export const LangSchema = z.enum(['fi', 'sv', 'en']);

export const MultiLangStringSchema = z.object({
  fi: z.string(),
  sv: z.string(),
  en: z.string(),
});

export const ScreenInfoSchema = z.object({
  title: MultiLangStringSchema,
  description: MultiLangStringSchema,
  qrDescription: MultiLangStringSchema,
  qrUrl: MultiLangStringSchema,
});

export const ImgSchema = z.object({
  _tag: z.literal('img'),
  url: z.string(),
});

export const VideoSchema = z.object({
  _tag: z.literal('video'),
  url: z.string(),
});

export const SpeciesCardSchema = z.object({
  hero: z.discriminatedUnion('_tag', [ImgSchema, VideoSchema]),
  vernacularName: MultiLangStringSchema,
  scientificName: MultiLangStringSchema,
  description: MultiLangStringSchema,
});

export const ScreenDataSchema = z.object({
  info: ScreenInfoSchema,
  species: z.array(SpeciesCardSchema),
});

export type Lang = z.infer<typeof LangSchema>;
export type MultiLangString = z.infer<typeof MultiLangStringSchema>;
export type ScreenInfo = z.infer<typeof ScreenInfoSchema>;
export type Img = z.infer<typeof ImgSchema>;
export type Video = z.infer<typeof VideoSchema>;
export type Media = Img | Video;
export type SpeciesCard = z.infer<typeof SpeciesCardSchema>;
export type ScreenData = z.infer<typeof ScreenDataSchema>;

export interface StartupContent {
  screens: ScreenData[];
  fromCache: boolean;
}

export interface ExhibitionAPI {
  getContent(): Promise<StartupContent>;
}
