declare module "web-tree-sitter" {
  export default class Parser {
    static init(): Promise<void>;
    static Language: {
      load(path: string): Promise<any>;
    };

    setLanguage(lang: any): void;
    parse(code: string): any;
  }
}
