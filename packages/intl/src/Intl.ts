type ReporterFn = (...args: unknown[]) => unknown;
type Translation = (...args: unknown[]) => string;
type Dictionary = Record<string, Translation>;
type DictionaryCfg = Record<string, Translation | string>;
type Resolver = (locale: string) => Promise<DictionaryCfg> | DictionaryCfg;
type MultiResolver = Record<string, Resolver | DictionaryCfg>

const DEFAULT_LOCALE = 'en';
const DEFAULT_REPORTER: ReporterFn = console.warn;

export class Intl {
  private _locale = DEFAULT_LOCALE;
  private resolvers = new Map<string, Resolver>();
  private resolved = 0;
  private dict: Dictionary = {};

  constructor(private report: ReporterFn = DEFAULT_REPORTER) {

  }

  get locale() { return this._locale; }

  static instance(reporter?: ReporterFn): Intl {
    if (!instance) {
      instance = new Intl(reporter);
    }
    return instance;
  }

  static reset() {
    instance = undefined;
  }

  setLocale(locale: string): this {
    this._locale = locale;
    document.documentElement.setAttribute('lang', locale);
    return this;
  }

  detectLocale(fromLocales: string[], supportedLocales: string[]) {
    fromLocales = _normalizeLocales(fromLocales);
    supportedLocales = _normalizeLocales(supportedLocales);

    if (supportedLocales.length === 0) {
      const locale = DEFAULT_LOCALE;
      this.setLocale(locale);
      this.report({ message: 'fallback to default locale', locale });
      return this;
    }

    for (const locale of fromLocales) {
      if (supportedLocales.includes(locale)) {
        this.setLocale(locale);
        this.report({ message: 'set locale', locale });
        return this;
      }
    }

    const locale = supportedLocales[0];
    this.setLocale(locale);
    this.report({ message: 'fallback to default locale', locale });
    return this;
  }

  registered(key: string): boolean {
    return this.resolvers.has(key);
  }

  register(key: string, resolver: Resolver): this {
    if (this.registered(key)) {
      throw new Error('intl key already registered. ' + key);
    }
    this.resolvers.set(key, resolver);
    return this;
  }

  registerMulti(key: string, selections: MultiResolver): this {
    const resolvers: Record<string, Resolver> = {};
    for (const key in selections) {
      const selected = selections[key];
      if (typeof selected === 'function') {
        resolvers[key] = selected;
        continue;
      }

      resolvers[key] = () => selected;
    }

    const resolver: Resolver = (locale) => {
      const resolver = resolvers[locale];
      if (!resolver) {
        throw new Error(`unresolved locale ${locale}`);
      }

      return resolver(locale);
    };

    return this.register(key, resolver);
  }

  async resolve(): Promise<void> {
    const keys = [...this.resolvers.keys()];
    const size = this.resolvers.size;
    while (this.resolved < size) {
      const key = keys[this.resolved];
      try {
        const resolve = this.resolvers.get(key);
        if (!resolve) {
          throw new Error('resolver not found');
        }
        const resolvedConfig = await resolve(this._locale);
        const resolvedDict = _toDictionary(resolvedConfig);
        this.dict = {
          ...this.dict,
          ...resolvedDict,
        };
      } catch (err) {
        this.report({ message: 'unable to resolve dictionary', resolver: key, locale: this._locale });
      }
      this.resolved++;
    }
  }

  translate(key: string, ...args: unknown[]): string {
    const fn = this.dict[key];
    if (fn) {
      return fn(...args);
    }

    this.report({ message: 'no translation', locale: this._locale, key });
    return _stringTranslation(key)(...args);
  }
}

let instance: Intl | undefined;

export function translate(key: string, ...args: unknown[]): string {
  return Intl.instance().translate(key, ...args);
}

export const t = translate;

function _normalizeLocales(locales: string[]): string[] {
  const set = new Set(locales.map(locale => locale.toLowerCase()));
  return [...set];
}

function _toDictionary(dict: DictionaryCfg): Dictionary {
  const result: Dictionary = {};

  for (const key in dict) {
    const translation = dict[key];
    result[key] = (typeof translation === 'function') ? translation : _stringTranslation(translation);
  }

  return result;
}

function _stringTranslation(s: string): Translation {
  return (...args: unknown[]) => {
    if (args.length === 0) {
      return s;
    }

    return s.replace(/\$(\d+)/g, (_, index) => {
      return args[index] as string;
    });
  };
}
