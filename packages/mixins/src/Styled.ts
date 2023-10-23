import { CSSResultGroup } from 'lit';
import { getStyles } from './styles.js';

type WithStyles<T> = T & {
  styles: CSSResultGroup[];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Constructor<T> = new(...args: any[]) => T;

export function Styled<T extends Constructor<HTMLElement>>(SuperClass: T): WithStyles<T> {
  const styles = getStyles();
  return class extends SuperClass {
    static styles = [...styles];
  };
}
