import { db } from "@core/database";
import { Type } from "@core/utils";
import { aql } from "arangojs";
import type { ArrayCursor } from "arangojs/cursor";

export class Module<T = {}> extends Type<IModule & T> {
  /**
   * The vendor of the module
   */
  get vendor(): string {
    return this.data.vendor;
  }

  /**
   * The name of the module
   */
  get name(): string {
    return this.data.name;
  }

  /**
   * The version of the module
   */
  get version(): Version {
    return new Version(this.data.version);
  }

  /**
   * The description of the module
   */
  get description(): string {
    return this.data.description;
  }

  /**
   * The public download path of the module
   */
  get path(): string {
    return `https://jeengbe/download/${this.vendor}/${this.name}`;
  }

  /**
   * The dependencies of the module
   */
  async dependencies(): Promise<ModuleDependency[]> {
    const cursor = await db.query(aql`
      FOR dependency, edge IN 1..1 OUTBOUND ${this.data._id} moduleDependencies
        RETURN {
          dependency: dependency,
          minVersion: edge.minVersion
        }
    `) as ArrayCursor<{ dependency: IModule; minVersion: string; }>;
    return (await cursor.all()).map(
      ({ dependency, minVersion }) => new ModuleDependency({ dependency, minVersion })
    );
  }
}

export class ModuleDependency extends Type<{
  dependency: IModule;
  minVersion: string;
}> {
  /**
   * The required module
   */
  get module(): Module {
    return new Module(this.data.dependency);
  }

  /**
   * The minimum required version of the module
   */
  get version(): Version {
    return new Version(this.data.minVersion);
  }
}
