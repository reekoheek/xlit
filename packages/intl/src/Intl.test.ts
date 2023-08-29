import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Intl } from './Intl.js';

describe('Intl', () => {
  beforeEach(() => {
    Intl.setReporter(null);
  });

  afterEach(() => {
    Intl.reset();
  });

  describe('.fromLocales()', () => {
    it('resolve from resolver', async() => {
      const resolver = (locale: string) => {
        switch (locale) {
        case 'en': return { locale: 'en' };
        case 'id': return { locale: 'id' };
        case 'jv': return { locale: 'jv' };
        default: throw new Error('not found');
        }
      };
      const supportedLocales = ['en', 'id', 'jv'];
      async function fromLocales(locales: string[]): Promise<Intl> {
        const intl = await Intl.fromLocales(locales, supportedLocales, resolver);
        return intl;
      }
      expect((await fromLocales(['id', 'en-US', 'en'])).locale).toStrictEqual('id');
      expect((await fromLocales(['jv'])).locale).toStrictEqual('jv');
      expect((await fromLocales(['it'])).locale).toStrictEqual('en');
    });

    it('resolve from imported dictionary resolver', async() => {
      const resolver = (locale: string) => {
        return Promise.resolve({
          dict: { locale },
        });
      };

      const intl = await Intl.fromLocales(['id'], ['id'], resolver);
      expect(intl.locale).toStrictEqual('id');
    });

    it('resolve to en as fallback', async() => {
      const intl = await Intl.fromLocales(['it'], [], () => Promise.resolve({}));
      expect(intl.locale).toStrictEqual('en');
    });
  });

  describe('constructor', () => {
    it('create new intl', () => {
      const intl = new Intl('id', {});
      expect(intl.locale).toStrictEqual('id');
    });
  });

  describe('#translate()', () => {
    it('translate', () => {
      const intl = new Intl('id', {
        'Hello world': 'Halo dunia',
        'Hello $0 from $1': '$1 menyapa: Halo $0',
        'With args: $0 $1': (a, b) => `Dengan argumen: ${a}, ${b}`,
      });

      expect(intl.translate('Hello world')).toStrictEqual('Halo dunia');
      expect(intl.translate('Hello $0 from $1', 'universe', 'Foo')).toStrictEqual('Foo menyapa: Halo universe');
      expect(intl.translate('With args: $0 $1', 1, 2)).toStrictEqual('Dengan argumen: 1, 2');
      expect(intl.translate('Foobar')).toStrictEqual('Foobar');
      expect(intl.translate('Foo:$0 bar:$1', 'foo', 'bar')).toStrictEqual('Foo:foo bar:bar');
    });
  });
});
