type Children<T> = {
  [key in keyof T]?: Error;
};

export class SchemaError<T = Record<string, unknown>> extends Error {
  readonly children: Children<T> = {};

  putChild(key: keyof T, err: Error) {
    this.children[key] = err;
  }

  hasChildren() {
    return Object.keys(this.children).length !== 0;
  }
}
