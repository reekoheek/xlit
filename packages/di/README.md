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
  })
  .addProvider('other', instance('other instance'));

const foo = await container.lookup('foo');
```

```js
// x-app.js

import { container } from './container.js';

@container.inject()
class XApp extends HTMLElement {
  @container.provide()
  foox = 'foox';

  @container.provide('barx')
  _barx = 'barx';

  @container.provide()
  bazx = () => 'bazx';
}
customElements.define('x-app', XApp);
```

Child elements can lookup and inject container data with `lookup` decorator

```js
import { container } from './container.js';

@container.inject()
class XChild extends HTMLElement {
  @container.lookup()
  foo: string;

  @container.lookup('barx')
  bar: string;
}
customElements.define('x-child', XChild);
```
