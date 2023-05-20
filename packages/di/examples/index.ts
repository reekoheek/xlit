import { Container, inject, injected, instance, lookup } from '../src';

const container = new Container({
  bar: instance('bar'),
});

@inject(container)
class Foo {
  @lookup()
  bar!: string;
}

(async() => {
  const foo = new Foo();
  await injected(foo);
  alert('This value injected from container: ' + foo.bar);
})();
