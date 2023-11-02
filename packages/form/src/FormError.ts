export class FormError extends Error {
  constructor(message: string, readonly children: Record<string, string>) {
    super(message);
  }
}

export function isFormError(err: unknown): err is FormError {
  if (!err) {
    return false;
  }
  return typeof (err as { children: unknown }).children === 'object';
}
