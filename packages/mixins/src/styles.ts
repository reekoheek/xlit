import { CSSResult } from 'lit';

const _styles: CSSResult[] = [];

export function addStyle(...styles: CSSResult[]) {
  styles.forEach((style) => {
    _styles.push(style);
    if (style.styleSheet) {
      document.adoptedStyleSheets.push(style.styleSheet);
    }
  });
}

export function getStyles(): CSSResult[] {
  return _styles;
}
