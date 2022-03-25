import { Type } from "@core/utils";


declare global {
  class Module<T = {}> extends Type<IModule & T> {
    /**
     * The dependencies of the module
     */
    async a(): "HI";
  }


  /**
   * A semver-compatible versioning scheme
   */
  class Version extends Type<string> {
    /**
     * The full version string
     */
    get full(): string;

    /**
     * Check whether a given version is greater than this version
     *
     * @param version The version to compare to
     */
    isGreaterThan(version: string): boolean;
  }
}
