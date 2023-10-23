import { describe, it, beforeEach, expect } from 'vitest';
import { Intl, t, translate } from './Intl.js';

const NULL_REPORTER = () => undefined;

describe('Intl', () => {
  beforeEach(() => {
    Intl.reset();
  });

  describe('.instance()', () => {
    it('return instance', () => {
      expect(Intl.instance()).toStrictEqual(Intl.instance());
      expect(Intl.instance() instanceof Intl).toStrictEqual(true);
    });
  });

  describe('#setLocale()', () => {
    it('set locale', () => {
      const intl = new Intl(NULL_REPORTER);
      expect(intl.locale).toStrictEqual('en');
      const retval = intl.setLocale('id');
      expect(retval).toStrictEqual(intl);
      expect(intl.locale).toStrictEqual('id');
    });
  });

  describe('#detectLocale()', () => {
    it('detect locale', () => {
      const intl = new Intl(NULL_REPORTER);
      const retval = intl.detectLocale(['foo', 'bar', 'baz'], ['bar', 'baz']);
      expect(retval).toStrictEqual(intl);
      expect(intl.locale).toStrictEqual('bar');
    });

    it('fallback to first supported locale', () => {
      const intl = new Intl(NULL_REPORTER);
      intl.detectLocale(['foo'], ['bar', 'baz']);
      expect(intl.locale).toStrictEqual('bar');
    });

    it('fallback to en if no locale', () => {
      const intl = new Intl(NULL_REPORTER);
      intl.detectLocale(['foo'], []);
      expect(intl.locale).toStrictEqual('en');
    });
  });

  describe('#register()', () => {
    it('register resolver', () => {
      const intl = new Intl(NULL_REPORTER);
      expect(intl.registered('main')).toStrictEqual(false);
      const retval = intl.register('main', () => {
        return {
          foo: 'bar',
        };
      });
      expect(retval).toStrictEqual(intl);
      expect(intl.registered('main')).toStrictEqual(true);
    });

    it('throw error if key already registered', () => {
      const intl = new Intl(NULL_REPORTER);
      intl.register('main', () => ({}));
      expect(() => intl.register('main', () => ({}))).toThrowError(/^intl key already registered/);
    });
  });

  describe('#registerMulti()', () => {
    it('select the specified dict', () => {
      const intl = new Intl(NULL_REPORTER);
      const retval = intl.registerMulti('main', {
        foo: { msg: 'foo' },
        bar: () => Promise.resolve({ msg: 'bar' }),
      });
      expect(retval).toStrictEqual(intl);
      expect(intl.registered('main')).toStrictEqual(true);
    });
  });

  describe('#resolve()', () => {
    it('resolve dict', async() => {
      const intl = new Intl(NULL_REPORTER);
      intl.register('main', () => ({ foo: 'foo' }));
      await intl.resolve();
      expect(intl['resolved']).toStrictEqual(1);
      expect(intl['dict'].foo()).toStrictEqual('foo');

      intl.register('override', () => ({ foo: 'bar' }));
      await intl.resolve();

      expect(intl['resolved']).toStrictEqual(2);
      expect(intl['dict'].foo()).toStrictEqual('bar');
    });
  });

  describe('#translate()', () => {
    it('translate', async() => {
      await Intl.instance(NULL_REPORTER)
        .register('main', () => ({
          foo: 'foo',
          bar: () => 'bar',
          'hello $0!': 'halo $0!',
        }))
        .registerMulti('multi', {
          en: {
            multi: 'multi',
          },
        })
        .resolve();

      expect(t('foo')).toStrictEqual('foo');
      expect(t('bar')).toStrictEqual('bar');
      expect(t('notfound')).toStrictEqual('notfound');
      expect(t('multi')).toStrictEqual('multi');
      expect(t('hello $0!', 'guys')).toStrictEqual('halo guys!');

      expect(translate).toStrictEqual(t);
    });
  });
});
