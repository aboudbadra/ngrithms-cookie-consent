import { LanguagePack } from '../types/language-pack';
import { EN_LANGUAGE } from './en';
import { FR_LANGUAGE } from './fr';

export { EN_LANGUAGE } from './en';
export { FR_LANGUAGE } from './fr';

/** Built-in language packs shipped with `@ngxt/cookie-consent`. */
export const BUILTIN_LANGUAGES: Record<string, LanguagePack> = {
  en: EN_LANGUAGE,
  fr: FR_LANGUAGE,
};
