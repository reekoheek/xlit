export type Translation = (...args: unknown[]) => string;

export function stringTranslation(s: string): Translation {
  return (...args: unknown[]) => {
    if (args.length === 0) {
      return s;
    }

    return s.replace(/\$(\d+)/g, (_, index) => {
      return args[index] as string;
    });
  };
}
