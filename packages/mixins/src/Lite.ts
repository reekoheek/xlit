// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Constructor<T> = new(...args: any[]) => T;

export function Lite<T extends Constructor<HTMLElement>>(ElementCtr: T): T {
  return class extends ElementCtr {
    createRenderRoot() {
      return this;
    }
  };
}
