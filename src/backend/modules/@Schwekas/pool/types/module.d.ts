import { Type } from "@core/utils";

declare global {
  class Module<T = {}> extends Type<IModule & T> {
    /**
     * The vendor of the module
     */
    get vendor(): string;

    /**
     * The name of the module
     */
    get name(): string;

    /**
     * The version of the module
     */
    get version(): Version;

    /**
     * The description of the module
     */
    get description(): string;

    /**
     * The public download path of the module
     */
    get path(): string;

    /**
     * The dependencies of the module
     */
    async dependencies(): Promise<ModuleDependency[]>;
  }

  class ModuleDependency extends Type<{
    dependency: IModule;
    minVersion: string;
  }> {
    /**
     * The required module
     */
    get module(): Module;

    /**
     * The minimum required version of the module
     */
    get version(): Version;
  }
}
