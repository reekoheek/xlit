type ReporterFn = (...args: unknown[]) => unknown;
type Translation = (...args: unknown[]) => string;
type Dictionary = Record<string, Translation>;
type DictionaryCfg = Record<string, Translation | string>;
type Resolver = (locale: string) => Promise<DictionaryCfg> | DictionaryCfg;

export const INTL_DEFAULT_REPORTER: ReporterFn = console.warn;
export const INTL_NULL_REPORTER: ReporterFn = () => undefined;
const DEFAULT_LOCALE = 'en';

let report: ReporterFn = INTL_DEFAULT_REPORTER;
let locale = DEFAULT_LOCALE;
let resolvers: Resolver[] = [];
let dict: Dictionary = {};

export function _state() {
  return { report, locale, resolvers, dict };
}

export function resetIntl() {
  report = INTL_DEFAULT_REPORTER;
  locale = DEFAULT_LOCALE;
  resolvers = [];
  dict = {};
}

export class IntlError extends Error {

}

export function setReporter(reportFn: ReporterFn) {
  report = reportFn;
}

function _toDictionary(dict: DictionaryCfg): Dictionary {
  const result: Dictionary = {};

  for (const key in dict) {
    const translation = dict[key];
    result[key] = (typeof translation === 'function') ? translation : _stringTranslation(translation);
  }

  return result;
}

async function _resolveDict(resolve: Resolver) {
  try {
    const resolvedConfig = await resolve(locale);
    const resolvedDict = _toDictionary(resolvedConfig);
    dict = { ...resolvedDict };
  } catch (err) {
    report({ message: 'unable to resolve dictionary', locale });
  }
}

export async function setLocale(_locale: string) {
  locale = _locale.toLowerCase();
  dict = {};
  for (const key in resolvers) {
    const resolve = resolvers[key];
    await _resolveDict(resolve);
  }
}

export function getLocale() {
  return locale;
}

function _normalizeLocales(locales: string[]): string[] {
  const set = new Set(locales.map(locale => locale.toLowerCase()));
  return [...set];
}

export async function detectLocale(fromLocales: string[], supportedLocales: string[]) {
  fromLocales = _normalizeLocales(fromLocales);
  supportedLocales = _normalizeLocales(supportedLocales);

  if (supportedLocales.length === 0) {
    const locale = DEFAULT_LOCALE;
    await setLocale(locale);
    report({ message: 'fallback to default locale', locale });
    return;
  }

  for (const locale of fromLocales) {
    if (supportedLocales.includes(locale)) {
      await setLocale(locale);
      report({ message: 'set locale', locale });
      return;
    }
  }

  const locale = supportedLocales[0];
  await setLocale(locale);
  report({ message: 'fallback to default locale', locale });
}

export async function resolveDictionary(resolver: Resolver) {
  resolvers.push(resolver);
  await _resolveDict(resolver);
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

export function translate(key: string, ...args: unknown[]) {
  const fn = dict[key];
  if (fn) {
    return fn(...args);
  }

  report({ message: 'no translation', locale, key });
  return _stringTranslation(key)(...args);
}

export const t = translate;

type ResolverSelections = Record<string, Resolver | DictionaryCfg>

export function multiDictionaryResolver(selections: ResolverSelections): Resolver {
  const resolvers: Record<string, Resolver> = {};
  for (const key in selections) {
    const selected = selections[key];
    if (typeof selected === 'function') {
      resolvers[key] = selected;
      continue;
    }

    resolvers[key] = () => selected;
  }

  return (locale) => {
    const resolver = resolvers[locale];
    if (!resolver) {
      throw new IntlError(`unresolved locale ${locale}`);
    }

    return resolver(locale);
  };
}
