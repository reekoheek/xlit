import { Context } from './Context.js';
import { toContextedElement } from './ContextedElement.js';
import { Dispatcher } from './Dispatcher.js';
import { HistoryMode } from './HistoryMode.js';
import { ModeInterface, EventTargetInterface, HistoryInterface, LocationInterface } from './types.js';
import { Outlet, toOutlet } from './Outlet.js';
import { Resolvable, resolvable } from './Resolvable.js';
import { RouterError } from './RouterError.js';

const POPSTATE_TIMEOUT = 500;

type OutletArg<TState extends object> = Outlet<TState> | Element;

interface NavigatorOpts<TState extends object> {
  readonly outlet: OutletArg<TState>;
  readonly mode?: ModeInterface;
  readonly eventTarget?: EventTargetInterface;
  readonly history?: HistoryInterface;
  readonly location?: LocationInterface;
}

export class Navigator<TState extends object> {
  private outlet: Outlet<TState>;
  private mode: ModeInterface;
  private eventTarget: EventTargetInterface;
  private history: HistoryInterface;
  private location: LocationInterface;

  private currentCtx?: Context<TState>;
  private _dispatching?: Resolvable<void>;
  private _poppingState?: Resolvable<void>;

  private static _() {
    if (!instance) {
      throw new RouterError('navigator is not running');
    }

    return instance;
  }

  static async run<TState extends object>(dispatcher: Dispatcher<TState>, opts?: NavigatorOpts<TState>) {
    if (instance) {
      throw new RouterError('navigator already run');
    }

    const navigator = new Navigator(dispatcher, opts);
    instance = navigator;
    await instance.start();
  }

  static async push(path: string): Promise<void> {
    await Navigator._().push(path);
  }

  static async replace(path: string): Promise<void> {
    await Navigator._().replace(path);
  }

  static async go(delta: number): Promise<void> {
    await Navigator._().go(delta);
  }

  static async pop(): Promise<void> {
    await Navigator._().pop();
  }

  static async reset() {
    instance?.stop();
    await instance?._dispatching;
    await instance?._poppingState;
    instance = undefined;
  }

  private constructor(private dispatcher: Dispatcher<TState>, opts?: NavigatorOpts<TState>) {
    this.outlet = toOutlet(opts?.outlet ?? document.body);
    this.mode = opts?.mode ?? new HistoryMode();
    this.eventTarget = opts?.eventTarget ?? window;
    this.history = opts?.history ?? history;
    this.location = opts?.location ?? location;
  }

  private popstateListener: EventListener = async() => {
    const path = this.mode.getContextPath(this.location);
    await this.dispatch(new Context(path));
    this._poppingState?.resolve();
  };

  private clickListener: EventListener = async(evt) => {
    const target = (evt.composedPath()[0] as Element).closest('a');
    if (!target) {
      return;
    }
    evt.preventDefault();
    evt.stopImmediatePropagation();
    const path = this.mode.getContextPath(target);
    await this.push(path);
  };

  private async start(): Promise<void> {
    this.eventTarget.addEventListener('popstate', this.popstateListener);
    this.eventTarget.addEventListener('click', this.clickListener);
    const ctx = new Context(this.mode.getContextPath(this.location));
    await this.dispatch(ctx);
  }

  private stop(): Promise<void> {
    this.eventTarget.removeEventListener('popstate', this.popstateListener);
    this.eventTarget.removeEventListener('click', this.clickListener);
    return Promise.resolve();
  }

  private async push(path: string): Promise<void> {
    const ctx = new Context(path);
    this.history.pushState('', '', this.mode.getHistoryUrl(path));
    await this.dispatch(ctx);
  }

  private async replace(path: string): Promise<void> {
    const ctx = new Context(path);
    this.history.replaceState('', '', this.mode.getHistoryUrl(path));
    await this.dispatch(ctx);
  }

  private async go(delta: number): Promise<void> {
    await this._poppingState;
    this._poppingState = resolvable();
    this.history.go(delta);
    setTimeout(() => this._poppingState?.resolve(), POPSTATE_TIMEOUT);
    await this._poppingState;
  }

  private async pop(): Promise<void> {
    await this.go(-1);
  }

  private async dispatch(ctx: Context<TState>): Promise<void> {
    if (this.currentCtx?.equals(ctx)) {
      return;
    }

    await this._dispatching;
    this._dispatching = resolvable();

    this.currentCtx = ctx;

    try {
      await this.dispatcher.dispatch(ctx);

      if (!ctx.result) {
        throw new RouterError('no result route');
      }

      await this.outlet.render(toContextedElement(ctx.result, ctx));
    } finally {
      this._dispatching.resolve();
    }
  }
}

let instance: Navigator<object> | undefined;
