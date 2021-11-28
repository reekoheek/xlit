# @xlit/di

Vanilla dependency injection custom element.

## Installation

```sh
npm i @xlit/di
```

## Getting started

```js
import { container, instance, singleton, injectable } from '@xlit/di';

@container({
  foo: () => 'foo',
  bar: instance('bar'),
  baz: singleton(() => 'baz'),
})
class XApp extends HTMLElement {
  @provide()
  foox = 'foox';

  @provide('barx')
  _barx = 'barx';

  @provide()
  bazx = () => 'bazx';
}
customElements.define('x-app', XApp);
```

Child elements can lookup and inject container data with `lookup` decorator

```js
import { accessor, lookup } from '@xlit/di';

class XChild extends accessor(HTMLElement) {
  @lookup()
  foo: string;

  @lookup('barx')
  bar: string;
}
customElements.define('x-child', XChild);
```
