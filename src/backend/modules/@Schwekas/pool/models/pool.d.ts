import type { IDocument } from "@core/types";

export interface IModule extends IDocument {
  vendor: string;
  name: string;
  description: string;
  version: string;
  authors: IAuthor[];
}

export interface IAuthor {
  name: string;
  email: string;
}
