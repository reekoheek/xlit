import { Event } from './Event.js';
import { EventHandler } from './EventHandler.js';

type MatcherFn = (evt: Event) => boolean;
type Matcher = string | RegExp | MatcherFn;

export function select(matcher: Matcher, handler: EventHandler): EventHandler {
  const match = toMatcherFn(matcher);
  return (evt) => {
    if (match(evt)) {
      handler(evt);
    }
  };
}

function toMatcherFn(matcher: Matcher): MatcherFn {
  if (typeof matcher === 'function') {
    return matcher;
  }

  if (matcher instanceof RegExp) {
    return (evt: Event) => Boolean(matcher.exec(evt.kind));
  }

  return (evt: Event) => evt.kind === matcher;
}
