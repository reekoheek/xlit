import { Translation, stringTranslation } from './Translation.js';

export type Dictionary = Record<string, Translation | string>;

export type StrictDictionary = Record<string, Translation>;

export function toStrictDictionary(dict: Dictionary): StrictDictionary {
  const result: StrictDictionary = {};

  for (const key in dict) {
    const translation = dict[key];
    result[key] = (typeof translation === 'function') ? translation : stringTranslation(translation);
  }

  return result;
}
