declare module "gray-matter" {
  interface GrayMatterFile<T = string> {
    data: Record<string, unknown>;
    content: T;
    excerpt?: string;
    orig: Buffer | string;
    language: string;
    matter: string;
    stringify(lang?: string): string;
  }

  interface GrayMatterOption<T = string> {
    excerpt?: boolean | ((input: T, options: GrayMatterOption<T>) => string);
    excerpt_separator?: string;
    engines?: Record<string, unknown>;
    language?: string;
    delimiters?: string | [string, string];
  }

  function matter<T = string>(
    input: T | Buffer,
    options?: GrayMatterOption<T>
  ): GrayMatterFile<T>;

  export = matter;
}
