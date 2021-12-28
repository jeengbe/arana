import { Type } from "@core/utils";
import * as semver from "semver";

/**
 * A semver-compatible versioning scheme
 */
export class Version extends Type<string> {
  /**
   * The full version string
   */
  get full(): string {
    return this.data;
  }

  /**
   * Check whether a given version is greater than this version
   *
   * @param version The version to compare to
   */
  isGreaterThan(version: string): boolean {
    return semver.gt(version, this.data);
  }
}
