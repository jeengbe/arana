interface IModule extends IType {
  vendor: string;
  name: string;
  description: string;
  version: string;
  authors: IAuthor[];
}

interface IAuthor {
  name: string;
  email: string;
}
