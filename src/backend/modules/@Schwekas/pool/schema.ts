import { db } from "@core/database";
import { aql } from "arangojs";
import type { ArrayCursor } from "arangojs/cursor";


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

export class Query {
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
  ): Promise<Module | null> {
    const cursor = await db.query(aql`
      FOR module IN modules
        FILTER module.vendor == ${vendor} && module.name == ${name}
        RETURN { module }
    `) as ArrayCursor<IModule>;
    const data = await cursor.next();
    return data ? new Module(data) : null;
  }

  // /**
  //  * Query all modules
  //  */
  // @paginate()
  // modules(filter?: ModuleFilter): Module[] {

  // }

  // /**
  //  * The server's public key
  //  */
  // publicKey(): string {

  // }
}

// export class Mutation {
//   /**
//    * Add a module to the pool
//    * @param location URI to the repository
//    * @return The added module
//    */
//   @requirePermission("pool.admin.module.add")
//   addModule(location: string): Module {

//   }

//   /**
//    * Remove a module from the pool
//    */
//   @requirePermission("pool.admin.module.remove")
//   removeModule(vendor: string, name: string): void {

//   }
// }

const query = new Query();
console.log(query.module("@Schwekas", "pool"));
