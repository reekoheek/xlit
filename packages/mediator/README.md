# @xlit/mediator

Command and query mediator

## Installation

```sh
npm i @xlit/mediator
```

## Getting started

Define command handler with decorator.

```typescript
import { commandHandler } from '@xlit/mediator';

class FooCommand {
  kind = 'FooCommand';
}

@commandHandler('FooCommand')
class FooCommandHandler {
  handle(cmd: FooCommand): Promise<void> {
    // do something
  }
}
```

Define query handler with decorator.

```typescript
import { queryHandler } from '@xlit/mediator';

class BarQuery {
  kind = 'BarQuery';
}

type BarDto = string;

@queryHandler('BarQuery')
class BarQueryHandler {
  handle(query: BarQuery): Promise<BarDto> {
    // do something
    return Promise.resolve('barbar');
  }
}
```

Send command and query

```ts
import { FooCommand } from './FooCommand.js';
import { BarQuery } from './BarQuery.js';

const mediator = Mediator.instance();

await mediator.send(new FooCommand()); // send command
const result = await mediator.send(new BarQuery()); // send query
```
