# @xlit/mixins

Lit common mixins

## Installation

```sh
npm i @xlit/mixins
```

## Getting started

```typescript
import { LitElement, html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { Lite, Styled, addStyle } from '@xlit/mixins';

addStyle()

@customElement('x-foo')
class Foo extends Lite(LitElement) {
  // do something here
}

@customElement('x-bar')
class Foo extends Styled(LitElement) {
  // do something here
}
```
