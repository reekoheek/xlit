import { Container, inject, injected, instance, lookup } from '../index.js';

const container = new Container()
  .provide('bar', instance('bar'));

@inject(container)
class Foo {
  @lookup()
  bar!: string;
}

(async() => {
  const foo = await injected(new Foo());
  alert('This value injected from container: ' + foo.bar);
})();
