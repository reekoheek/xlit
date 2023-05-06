import { Container, injected, instance } from '../index';

const container = new Container({
  bar: instance('bar'),
});

@container.injectable()
class Foo {
  @container.injectLookup()
  bar!: string;
}

(async() => {
  const foo = new Foo();
  await injected(foo);
  alert('This value injected from container: ' + foo.bar);
})();
