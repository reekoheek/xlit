# @xlit/event

Event mechanism

## Installation

```sh
npm i @xlit/event
```

## Getting started

```typescript
import { DefaultEventDispatcher, select } from '@xlit/event';

class Event1 {
  kind = 'Event1';
}

class Event2 {
  kind = 'Event2';
}

const dispatcher = new DefaultEventDispatcher();

dispatcher.add((evt) => {
  // all events
});

dispatcher.add(select('Event1', (evt: Event1) => {
  // only Event1 events
}));

dispatcher.add(select('Event2', (evt: Event2) => {
  // only Event2 events
}));

dispatcher.dispatchEvent(new Event1());
dispatcher.dispatchEvent(new Event2());
```
