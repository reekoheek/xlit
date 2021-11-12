# @xlit/di

Vanilla dependency injection custom element.

## Installation

```sh
npm i @xlit/di
```

## Getting started

```typescript
import { container, inject } from '@xlit/di';

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

  @inject({ name: 'bar' })
  bar!: string;

  @inject({ after: true })
  baz!: string;
}
customElements.define('x-app', XApp);
```
