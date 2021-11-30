export namespace Arana {
  export interface ModuleFilter {
    /**
     * The vendor of the module
     */
    vendor?: string;
    /**
     * The name of the module
     */
    name?: string;
  }

  export class Query {
    /**
     * Get a module by vendor and name
     */
    module(
      /**
       * The vendor of the module
       */
      vendor: string,
      /**
       * The name of the module
       */
      name: string
    ): Module | null {
      return data.modules.find(m => m.vendor === vendor && m.name === name);
    }

    /**
     * Query all modules
     */
    @paginate()
    modules(filter?: ModuleFilter): Module[] {

    }

    /**
     * The server's public key
     */
    publicKey(): string {

    }
  }

  export class Mutation {
    /**
     * Add a module to the pool
     * @param location URI to the repository
     * @return The added module
     */
    @requirePermission("pool.admin.module.add")
    addModule(location: string): Module {

    }

    /**
     * Remove a module from the pool
     */
    @requirePermission("pool.admin.module.remove")
    removeModule(vendor: string, name: string): void {

    }
  }
}
