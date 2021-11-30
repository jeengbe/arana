import * as semver from "semver";

export namespace Arana {
  /**
   * A semver-compatible versioning scheme
   */
  export class VersionString {
    constructor(
      /**
       * The major part of the version
       */
      public readonly major: int,
      /**
       * The minor part of the version
       */
      public readonly minor: int,
      /**
       * The patch part of the version
       */
      public readonly patch: int,
      /**
       * The suffix of the version
       */
      public readonly suffix?: string
    ) { }

    /**
     * The full version string
     */
    full(): string {
      return `${this.major}.${this.minor}.${this.patch}${this.suffix}`;
    }

    /**
     * Check whether a given version is greater than this version
     *
     * @param version The version to compare to
     */
    isGreaterThan(version: string): boolean {
      return semver.gt(version, this.full());
    }
  }
}
