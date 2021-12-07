declare global {
  interface ModuleFilter {
    /**
     * The vendor of the module
     */
    vendor?: string;
    /**
     * The name of the module
     */
    name?: string;
  }

  class Query {
    /**
     * Get a module by vendor and name
     */
    async module(
      /**
       * The vendor of the module
       */
      vendor: string,
      /**
       * The name of the module
       */
      name: string
    ): Promise<Module | null>;

    /**
     * Query all modules
     */
    modules(filter?: ModuleFilter): Module[];

    /**
     * The server's public key
     */
    publicKey(): string;
  }

  class Mutation {
    /**
     * Add a module to the pool
     * @param location URI to the repository
     * @return The added module
     */
    addModule(location: string): Module;

    /**
     * Remove a module from the pool
     */
    removeModule(vendor: string, name: string): void;
  }
}
