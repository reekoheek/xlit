export interface Type<T> {
  _outputType: T;
  resolve(value: unknown): Promise<T>;
}
