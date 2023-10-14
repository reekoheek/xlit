import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  INTL_NULL_REPORTER,
  IntlError,
  _state,
  detectLocale,
  getLocale,
  multiDictionaryResolver,
  resetIntl,
  resolveDictionary,
  setLocale,
  setReporter,
  t,
  translate,
} from './index.js';

describe('intl', () => {
  beforeEach(() => {
    resetIntl();
    setReporter(INTL_NULL_REPORTER);
  });

  afterEach(() => {
    resetIntl();
  });

  describe('setLocale()', () => {
    it('set locale', async() => {
      expect(getLocale()).toStrictEqual('en');

      await setLocale('foo');
      expect(getLocale()).toStrictEqual('foo');
    });

    it('resolve if resolver already exist', async() => {
      await resolveDictionary(() => {
        return {
          foo: 'foo',
        };
      });
      await setLocale('foo');
      const msg = translate('foo');
      expect(msg).toStrictEqual('foo');
    });
  });

  describe('detectLocale()', () => {
    it('detect locale', async() => {
      await detectLocale(['foo', 'bar', 'baz'], ['bar', 'baz']);
      expect(getLocale()).toStrictEqual('bar');
    });

    it('fallback to first supported locale', async() => {
      await detectLocale(['foo'], ['bar', 'baz']);
      expect(getLocale()).toStrictEqual('bar');
    });

    it('fallback to en if no locale', async() => {
      await detectLocale(['foo'], []);
      expect(getLocale()).toStrictEqual('en');
    });
  });

  describe('resolveDictionary()', () => {
    it('add resolver', async() => {
      expect(_state().resolvers.length).toStrictEqual(0);

      await resolveDictionary(() => {
        throw new Error('xxx');
      });
    });
  });

  describe('t()', () => {
    it('translate', async() => {
      await resolveDictionary(() => {
        return {
          foo: 'foo',
          fn: () => 'with fn',
        };
      });

      expect(t('foo')).toStrictEqual('foo');
      expect(t('bar $0', 'baz')).toStrictEqual('bar baz');
      expect(t('baz')).toStrictEqual('baz');
      expect(t('fn')).toStrictEqual('with fn');
    });
  });

  describe('multiDictionaryResolver()', () => {
    it('select the specified dict', async() => {
      const resolve = multiDictionaryResolver({
        foo: { msg: 'foo' },
        bar: () => Promise.resolve({ msg: 'bar' }),
      });

      const cfgFoo = await resolve('foo');
      expect(cfgFoo.msg).toStrictEqual('foo');
      const cfgBar = await resolve('bar');
      expect(cfgBar.msg).toStrictEqual('bar');

      await expect(async() => await resolve('baz')).rejects.toThrow(IntlError);
    });
  });
});
