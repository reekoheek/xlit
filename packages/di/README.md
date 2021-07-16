# @xlit/di

Vanilla dependency injection custom element.

## Installation

```sh
npm i @xlit/di
```

## Getting started

```typescript
import { configure, inject } from '@xlit/di';

/**
 * Configure root container to have instances, singletons and factories
 **/
configure({
  instance: {
    foo: 'foo',
  },
  singletons: {
    bar: () => 'bar',
  },
  factories: {
    baz: () => 'baz',
  },
});

/**
 * Now create new custom element with auto injected property from configured
 * container
 **/
class XApp extends HTMLElement {
  @inject()
  foo!: string;
}
customElements.define('x-app', XApp);
```
