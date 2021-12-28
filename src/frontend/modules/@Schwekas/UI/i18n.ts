import type { updatingString } from "@core/i18nLib";
import { makeUpdatingString, setupI18n, transform } from "@core/i18nLib";
import type * as defaultStringsList from "./i18n/de-DE.json";
import * as filesMap from "./i18n/_map.json";

const { defaultStrings, currentStrings } = setupI18n(filesMap, "de-DE");

/**
 * Translate a string from this module
 */
export function __(key: keyof typeof defaultStringsList, data: Record<string, string> = {}): string {
  let strings = currentStrings;
  if (!(key in strings)) {
    strings = defaultStrings;
  }

  return transform(strings[key], data);
}

/**
 * Translate a string from this module into an object that automatically updates with the currently set language
 */
export function ___(key: keyof typeof defaultStringsList, data: Record<string, string> = {}): updatingString {
  let strings = currentStrings;
  if (!(key in strings)) {
    strings = defaultStrings;
  }

  return makeUpdatingString(strings[key], key, data, __);
}
