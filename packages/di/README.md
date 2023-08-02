# @xlit/di

Vanilla dependency injection custom element.

## Installation

```sh
npm i @xlit/di
```

## Getting started

Dependency injection container works for custom elements.

```js
import { Container, instance, singleton } from '@xlit/di';

// provide value for key programmatically
const container = Container.instance()
  .provide('foo', () => 'foo')
  .provide('bar', instance('bar'))
  .provide('baz', singleton(() => 'baz'));

// lookup valie from container programmatically
const foo = await container.lookup('foo');
```

Use decorators to provide and lookup.

```js
import { provide, lookup } from '@xlit/di';

@provide()
class FooService {
  doFoo() [
    // do foo
  ]
}

class XApp extends HTMLElement {
  @lookup()
  fooService!: FooService;

  doSomethingWithFooService() {
    this.fooService.doFoo();
  }
}
customElements.define('x-app', XApp);
```
