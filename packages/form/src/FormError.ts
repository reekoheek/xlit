export class FormError extends Error {
  constructor(message: string, readonly children: Record<string, string>) {
    super(message);
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isFormError(err: any): err is FormError {
  return typeof err.children === 'object';
}
