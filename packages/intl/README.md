# @xlit/event

Work with events

## Installation

```sh
npm i @xlit/event
```

## Getting started

```typescript
import { MemoryEventBus, select } from '@xlit/event';

class Event1 {
  kind = 'Event1';
}

class Event2 {
  kind = 'Event2';
}

const bus = new MemoryEventBus();

bus.addHandler((evt) => {
  // handle all events
});

bus.addHandler(select('Event1', (evt: Event1) => {
  // handle only Event1 events
}));

bus.addHandler(select('Event2', (evt: Event2) => {
  // handle only Event2 events
}));

bus.dispatchEvent(new Event1());
bus.dispatchEvent(new Event2());
```
