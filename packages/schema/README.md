# @xlit/schema

Schema validation for javascript

## Installation

```sh
npm i @xlit/schema
```

## Getting started

```js
import { ObjectType } from '@xlit/schema';

const schema = new ObjectType({
  username: new StringType().required(),
  firstName: new StringType(),
  lastName: new StringType(),
});

const user = await schema.resolve(userDto);

```
