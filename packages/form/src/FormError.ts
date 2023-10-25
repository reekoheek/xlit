export class FormError extends Error {
  constructor(message: string, readonly children: Record<string, string>) {
    super(message);
  }
}
