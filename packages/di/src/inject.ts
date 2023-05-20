import { Constructor } from './Constructor.js';
import { Container } from './Container.js';
import { DIError } from './DIError.js';
import { metadataOf, hasMetadata } from './Metadata.js';

export function inject(container: Container) {
  return <Class extends Constructor>(Target: Class, ctx?: unknown) => {
    if (typeof ctx === 'object') throw new DIError('unimplemented new decorator spec');

    if (!hasMetadata(Target.prototype)) {
      throw new DIError('nothing to inject');
    }

    return metadataOf(Target.prototype).inject(container, Target);
  };
}
