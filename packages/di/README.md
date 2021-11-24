# @xlit/di

Vanilla dependency injection custom element.

## Installation

```sh
npm i @xlit/di
```

## Getting started

```js
import { container, injectable } from '@xlit/di';

@container({
  instance: {
    foo: 'foo',
  },
  singletons: {
    bar: () => 'bar',
  },
  factories: {
    baz: () => 'baz',
  },
})
class XApp extends HTMLElement {
  @injectable()
  other = 'some other';
}
customElements.define('x-app', XApp);
```

Child elements can inject container data with `inject` decorator

```js
import { inject } from '@xlit/di';

class XChild extends HTMLElement {
  @inject()
  other: string;
}
customElements.define('x-child', XChild);
```
