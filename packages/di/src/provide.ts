import { Constructor, isConstructor } from './Constructor.js';
import { DIError } from './DIError.js';
import { Scope, metadataOf } from './Metadata.js';

interface ProvideOptions {
  name?: string;
  scope?: Scope;
}

export function provide(opts?: ProvideOptions) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (target: any, ctx: unknown) => {
    if (typeof ctx === 'object') throw new DIError('unimplemented new decorator spec');

    if (isConstructor(target)) {
      return decorateClass(target, opts);
    }

    return decorateClassMember(target, ctx as string, opts);
  };
}

function toContainerWiseName(name: string) {
  return name[0].toLowerCase() + name.slice(1);
}

function decorateClass(Target: Constructor, { name, scope = 'singleton' }: ProvideOptions = {}) {
  const to = name ?? toContainerWiseName(Target.name);
  metadataOf(Target.prototype).setProvideClassEntry({ to, scope });
}

function decorateClassMember(target: object, propertyName: string, { name }: ProvideOptions = {}) {
  const from = name ?? propertyName;
  const to = propertyName;
  metadataOf(target).addProvideEntry({ from, to });
}
