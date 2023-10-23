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

await Intl.instance()
  .registerMulti('main', {
    id: () => import('./locales/id.js'),
    en: () => import('./locales/en.js'),
  })
  .detect(BROWSER_SUPPORTED_LANGUAGES, SUPPORTED_LANGUAGES)
  .resolve();

t('foo'); // foo
t('bar $0', 'baz'); // bar baz
```
