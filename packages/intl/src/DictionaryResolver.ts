import { Dictionary } from './Dictionary.js';
import { IntlError } from './IntlError.js';

interface ImportedDictionary {
  dict: Dictionary;
}

export function isImportedDictionary(o: object): o is ImportedDictionary {
  return ('dict' in o && typeof o.dict === 'object');
}

export type DictionaryResolver = (locale: string) => Promise<Dictionary | ImportedDictionary> | Dictionary;

type ResolverOpts = Record<string, DictionaryResolver | Dictionary>

export function multiDictionaryResolver(opts: ResolverOpts): DictionaryResolver {
  const resolvers: Record<string, DictionaryResolver> = {};
  for (const key in opts) {
    const opt = opts[key];
    if (typeof opt === 'function') {
      resolvers[key] = opt;
      continue;
    }

    resolvers[key] = () => opt;
  }

  return (locale) => {
    const resolver = resolvers[locale];
    if (!resolver) {
      throw new IntlError(`unresolved locale ${locale}`);
    }

    return resolver(locale);
  };
}
