import { Constructor } from './Constructor.js';
import { Container } from './Container.js';
import { DIError } from './DIError.js';
import { injected } from './injected.js';
import { singleton } from './singleton.js';

export interface Injectable<T> {
  [key: string]: NonNullable<unknown>;
  // eslint-disable-next-line no-use-before-define
  __diMetadata: Metadata;
  __diInjected: Promise<T>;
}

interface LookupEntry {
  readonly from: string;
  readonly to: string;
}

interface ProvideEntry {
  readonly from: string;
  readonly to: string;
}

export type Scope = 'singleton' | 'transient';

interface ProvideClassEntry {
  readonly to: string;
  readonly scope: Scope;
}

export class Metadata {
  private provideClassEntry?: ProvideClassEntry;
  private readonly lookupEntries: LookupEntry[] = [];
  private readonly provideEntries: ProvideEntry[] = [];

  constructor(private readonly parent?: Metadata) {
  }

  setProvideClassEntry(entry: ProvideClassEntry) {
    this.provideClassEntry = entry;
  }

  addLookupEntry(entry: LookupEntry) {
    this.lookupEntries.push(entry);
  }

  addProvideEntry(entry: ProvideEntry) {
    this.provideEntries.push(entry);
  }

  private flattenLookupEntries(): LookupEntry[] {
    return [
      ...(this.parent ? this.parent.flattenLookupEntries() : []),
      ...this.lookupEntries,
    ];
  }

  private hasRecursiveProvideEntries(): boolean {
    if (this.provideEntries.length !== 0) {
      return true;
    }

    return this.parent?.hasRecursiveProvideEntries() ?? false;
  }

  private hasRecursiveProvideClassEntry(): boolean {
    if (this.provideClassEntry) {
      return true;
    }

    return this.parent?.hasRecursiveProvideClassEntry() ?? false;
  }

  inject<Class extends Constructor>(container: Container, Target: Class) {
    if (this.parent?.hasRecursiveProvideClassEntry()) {
      throw new DIError('provide class must be immediately injected');
    }

    if (this.parent?.hasRecursiveProvideEntries()) {
      throw new DIError('provide must be immediately injected');
    }

    const injectThis = <T>(obj: T) => {
      const injectable = obj as Injectable<T>;
      injectable.__diInjected = (async() => {
        for (const entry of this.provideEntries) {
          container.provide(entry.to, () => injectable[entry.from]);
        }

        await Promise.all(this.flattenLookupEntries().map(async(entry) => {
          injectable[entry.to] = await container.lookup(entry.from);
        }));

        return obj;
      })();
    };

    class InjectedTarget extends Target {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      constructor(...args: any[]) {
        super(...args);
        injectThis(this);
      }
    }

    const entry = this.provideClassEntry;
    if (entry) {
      const fn = async() => {
        const obj = new InjectedTarget();
        await injected(obj);
        return obj;
      };
      container.provide(entry.to, entry.scope === 'singleton' ? singleton(fn) : fn);
    }

    return InjectedTarget;
  }
}

export function metadataOf<T>(obj: T): Metadata {
  const injectable = obj as Injectable<T>;
  let metadata = injectable.__diMetadata;
  if (hasOwnMetadata(injectable) && metadata) {
    return metadata;
  }

  metadata = injectable.__diMetadata = new Metadata(injectable.__diMetadata);
  return metadata;
}

export function hasMetadata(obj: object): boolean {
  return '__diMetadata' in obj;
}

function hasOwnMetadata<T>(injectable: Injectable<T>) {
  return Object.prototype.hasOwnProperty.call(injectable, '__diMetadata');
}
