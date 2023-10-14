# @xlit/intl

Work with internationalization

## Installation

```sh
npm i @xlit/intl
```

## Getting started

```typescript
import { setLocale } from '@xlit/intl';

const SUPPORTED_LOCALES = ['id', 'en'];
const BROWSER_SUPPORTED_LANGUAGES = [...navigator.languages];

await setLocale(BROWSER_SUPPORTED_LANGUAGES, SUPPORTED_LANGUAGES);
await resolveDictionary(multiDictionaryResolver({
  id: () => import('./locales/id.js'),
  en: () => import('./locales/en.js'),
}));

t('foo'); // foo
t('bar $0', 'baz'); // bar baz
```
