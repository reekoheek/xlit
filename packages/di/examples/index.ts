import { Container, injected, instance } from '../src';

const container = new Container({
  foo: instance('foo'),
});

@container.injectable()
class Foo {
  @container.injectLookup()
  foo!: string;
}

(async() => {
  const foo = new Foo();
  await injected(foo);
  alert(foo.foo);
})();
