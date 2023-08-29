import { Dictionary, StrictDictionary, toStrictDictionary } from './Dictionary.js';
import { DictionaryResolver, isImportedDictionary } from './DictionaryResolver.js';
import { stringTranslation } from './Translation.js';

type ReporterFn = (...args: unknown[]) => unknown;

const NULL_REPORTER = () => undefined;

function normalizeLocales(locales: string[]): string[] {
  const set = new Set(locales.map(locale => locale.toLowerCase()));
  return [...set];
}

export class Intl {
  static reset() {
    warn = console.warn;
  }

  static setReporter(reporter: ReporterFn | null) {
    warn = reporter ?? NULL_REPORTER;
  }

  static async fromLocales(locales: string[], supportedLocales: string[], resolver: DictionaryResolver): Promise<Intl> {
    locales = normalizeLocales(locales);
    supportedLocales = normalizeLocales(supportedLocales);

    for (const locale of locales) {
      if (supportedLocales.includes(locale)) {
        const resolved = await resolver(locale);
        return new Intl(locale, isImportedDictionary(resolved) ? resolved.dict : resolved);
      }
    }

    const defaultLocale = supportedLocales[0] ?? 'en';
    const intl = new Intl(defaultLocale, {});
    warn({ message: 'no supported locale, fallback to default locale' });
    if (supportedLocales.length === 0) {
      warn({ message: 'undetected default locale, set default locale to en' });
    }

    return intl;
  }

  readonly locale: string;
  private dict: StrictDictionary;

  constructor(locale: string, dict: Dictionary) {
    this.dict = toStrictDictionary(dict);
    this.locale = locale;
  }

  readonly translate = (key: string, ...args: unknown[]) => {
    const fn = this.dict[key];
    if (fn) {
      return fn(...args);
    }

    warn({ message: 'no translation', locale: this.locale, key });
    return stringTranslation(key)(...args);
  };
}

let warn: ReporterFn = console.warn;
