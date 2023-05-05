# @xlit/router

Vanilla router custom element with multiple routes and middlewares.

## Installation

```sh
npm i @xlit/router
```

## Getting started

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>@xlit/router</title>
</head>

<body>
  <div id="outlet"></div>

  <template id="homeTemplate">
    <div>
      <h1>Home</h1>
    </div>
  </template>

  <script type="module" src="index.js"></script>
</body>
</html>
```

Write `index.js`:

```js
import { Router, template, component } from '@xlit/router';

customElements.define('x-login', class Login extends HTMLElement {
  // ...
});

const router = new Router(document.getElementById('outlet'))
  .use(async (ctx, next) => {
    // do something before
    await next();
    // do something after
  })
  // route with template element
  .route('/', template(document.getElementById('homeTemplate'))
  // route with custom element component
  .route('/login', component('x-login'))
  // route with lazy loading component
  .route('/lazy', component('x-lazy', () => import('./lazy.js')));

router.start();
```

Write `lazy.js`:

```js
customElements.define('x-lazy', class Lazy extends HTMLElement {
  // ...
});
```

## Router Mode

Router mode can be configured from `mode` router options whether use push state
`history` or `hash`-bang mode. Default value is `history`.

```js
const defaultRouter = new Router(outlet); // history
const hashRouter = new Router(outlet, { mode: 'hash' }); // hash
const historyRouter = new Router(outlet, { mode: 'history' }); // history
```

## Router Base Path

Router can be configured to worked with sub directory in `history` mode by
specifying `basePath` router options.

```js
const router = new Router(outlet, { basePath: '/subdir' });
```
