export namespace Arana {
  export class Module {
    constructor(
      /**
       * The vendor of the module
       */
      public readonly vendor: string,
      /**
       * The name of the module
       */
      public readonly name: string,
      /**
       * The version of the module
       */
      public readonly version: VersionString,
      /**
       * The description of the module
       */
      public readonly description: string,
      /**
       * The dependencies of the module
       */
      public readonly dependencies: ModuleDependency[],
      /**
       * The authors of the module
       */
      public readonly authors: string[],
      /**
       * The public download path of the module
       */
      public readonly path: string
    ) { }
  }

  export class ModuleDependency {
    constructor(
      /**
       * The vendor of the module
       */
      public readonly vendor: string,

      /**
       * The name of the module
       */
      public readonly name: string,

      /**
       * The minimum required version of the module
       */
      public readonly version: VersionString
    ) { }
  }
}
