declare type int = number;
declare type float = number;
declare type Resolver<T> = T | Promise<T>;

export interface IDocument {
  _id: string;
  _key: string;
  _ref: string;
}
