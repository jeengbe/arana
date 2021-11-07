// TODO: Move to Doc: 'Change default language here'
import type { updatingString } from "@core/i18nLib";
import { makeUpdatingString, setupI18n, transform } from "@core/i18nLib";
import type * as defaultStringsList from "./i18n/en-US.json";
import * as filesMap from "./i18n/_map.json";

// TEST: Test that both default languages are the same (implies that the language exists as TS would else throw an error)
// TODO: Move to Doc: 'Change default language here'
const { defaultStrings, currentStrings } = setupI18n(filesMap, "en-US");

/**
 * Translate a string from this module
 */
export default function __(key: keyof typeof defaultStringsList, data: Record<string, string> = {}): string {
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
