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

const container = new Container()
  .provide('foo', () => 'foo')
  .provide('bar', instance('bar'))
  .provide('baz', singleton(() => 'baz'));

const foo = await container.lookup('foo');
```

```js
// x-app.js

import { container } from './container.js';

@inject(container)
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
import { container } from './container.js';

@inject(container)
class XChild extends HTMLElement {
  @lookup()
  foo: string;

  @lookup('barx')
  bar: string;
}
customElements.define('x-child', XChild);
```
