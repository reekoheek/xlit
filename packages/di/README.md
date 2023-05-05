# @xlit/di

Vanilla dependency injection custom element.

## Installation

```sh
npm i @xlit/di
```

## Getting started

Implement container

```js
// container.js

import { Container, instance, singleton } from '@xlit/di';

const container = new Container({
  foo: () => 'foo',
  bar: instance('bar'),
  baz: singleton(() => 'baz'),
});

(async () => {
  container.provide('other', instanec('other instance'));

  const foo = await container.lookup('foo');
})();
```

```js
// x-app.js

import { container } from './container.js';

class XApp extends HTMLElement {
  @container.injectable()
  foox = 'foox';

  @container.injectable('barx')
  _barx = 'barx';

  @container.injectable()
  bazx = () => 'bazx';
}
customElements.define('x-app', XApp);
```

Child elements can lookup and inject container data with `lookup` decorator

```js
import { container } from './container.js';

class XChild extends HTMLElement {
  @container.inject()
  foo: string;

  @container.inject('barx')
  bar: string;
}
customElements.define('x-child', XChild);
```
