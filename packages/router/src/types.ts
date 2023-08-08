export interface LocationInterface {
  readonly pathname: string;
  readonly search: string;
  readonly hash: string;
}

export interface EventTargetInterface {
  addEventListener(name: string, listener: EventListener): void;
  removeEventListener(name: string, listener: EventListener): void;
}

export interface HistoryInterface {
  go(delta: number): void;
  pushState(data: unknown, _: string, url: string): void;
  replaceState(data: unknown, _: string, url: string): void;
}

export interface ModeInterface {
  getContextPath(location: LocationInterface): string;
  getHistoryUrl(path: string): string;
}
