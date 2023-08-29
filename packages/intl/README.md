# @xlit/intl

Work with internationalization

## Installation

```sh
npm i @xlit/intl
```

## Getting started

```typescript
import { Intl } from '@xlit/intl';

const SUPPORTED_LOCALES = ['id', 'en'];
const BROWSER_SUPPORTED_LANGUAGES = [...navigator.languages];

const intl = await Intl.fromLocales(BROWSER_SUPPORTED_LANGUAGES, SUPPORTED_LOCALES, multiDictionaryResolver({
  id: () => import('./locales/id.js'),
  en: () => import('./locales/en.js'),
}));
```
