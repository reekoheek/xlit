import { Constructor } from './Constructor.js';
import { Container } from './Container.js';
import { DIError } from './DIError.js';
import { metadataOf, hasMetadata } from './Metadata.js';

export function inject(container: Container = Container.instance()) {
  return <Class extends Constructor>(Target: Class) => {
    if (!hasMetadata(Target.prototype)) {
      throw new DIError('nothing to inject');
    }

    return metadataOf(Target.prototype).inject(container, Target);
  };
}
