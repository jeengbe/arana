interface IModule {
  _id: string;
  _key: string;
  _ref: string;

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
