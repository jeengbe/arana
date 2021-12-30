import { getCurrentRoute } from "./internal/currentRoute";
import { engineRoute } from "./internal/engineRouteFunction";

export let currentLanguage = "en-EN";

type ModuleFilesMap = Record<string, string>;
type i18nStringsObject = Record<string, string>;

/**
 * Load all strings for the specified language from the specified files map
 */
const loadStringsList = async (moduleFilesMap: ModuleFilesMap, language = currentLanguage): Promise<i18nStringsObject> => {
  if (language in moduleFilesMap) {
    return await (await fetch(moduleFilesMap[language])).json();
  }
  return {};
};

const objectsToKeepUpdated: {
  moduleFilesMap: ModuleFilesMap;
  stringsObject: i18nStringsObject;
}[] = [];

/**
 * Keep the passed object up-to-date with the currently selected language
 */
const keepListUpdated = (moduleFilesMap: ModuleFilesMap, stringsObject: i18nStringsObject): void => {
  objectsToKeepUpdated.push({
    moduleFilesMap,
    stringsObject
  });
};

/**
 * Initial promises that need to be fulfilled for the page to load correctly
 */
const setupPromises: Promise<void>[] = [];

/**
 * Response from `setupI18n`
 */
interface i18nSetup {
  readonly currentStrings: i18nStringsObject;
  readonly defaultStrings: i18nStringsObject;
  /**
   * This promise resolves after the language files have been loaded
   */
  promise: Promise<void>;
}

/**
 * Set up the i18n objects.\
 * **IMPORTANT**: The returned objects are empty at first and resolve to data once the site has finished loading!
 * @param addToWatch Whether to update the objects when the currently selected language changes
 */
export function setupI18n(moduleFilesMap: ModuleFilesMap, defaultLanguage = "en-US", addToWatch = true): i18nSetup {
  const currentStrings: i18nStringsObject = {};
  const defaultStrings: i18nStringsObject = {};

  const promise = Promise.all([
    loadStringsList(moduleFilesMap),
    loadStringsList(moduleFilesMap, defaultLanguage)
  ]).then(values => {
    Object.assign(currentStrings, values[0]);
    Object.assign(defaultStrings, values[1]);
  });

  setupPromises.push(promise);

  if (addToWatch) {
    keepListUpdated(moduleFilesMap, currentStrings);
  }

  return { currentStrings, defaultStrings, promise };
}

/**
 * List of updatingString objects to update when the language changes
 */
const updatingStringsToWatch: updatingStringWrapper<any>[] = [];

/**
 * Update all updatingString objects with the current language
 */
const updateUpdatingStrings = (): void => {
  updatingStringsToWatch.forEach(({ updatingString, key, data, update }) => void (updatingString.value = update(key, data)));
};

/**
 * Make sure that all language files have been loaded
 */
export async function awaitSetup(): Promise<void> {
  // We are safe to await this array here as all modules will have been loaded by now. (thanks to webpack-configuration)
  await Promise.all(setupPromises);
  updateUpdatingStrings();
}

/**
 * Reload all strings objects that wish to be updated.\
 * **IMPORTANT**: This function mutates already existing objects
 */
const reloadListsToKeepUpdated = async (): Promise<void> => {
  await Promise.all(
    objectsToKeepUpdated.map(object => loadStringsList(object.moduleFilesMap, currentLanguage))
  ).then(strings => {
    objectsToKeepUpdated.forEach((object, index) => {
      for (const key in object.stringsObject) {
        delete object.stringsObject[key];
      }
      Object.assign(object.stringsObject, strings[index]);
    });
  });
};

/**
 * Change the current language
 * @param reroute Whether to redirect the the corresponding url
 */
export async function setLanguage(language: string, reroute = true): Promise<void> {
  currentLanguage = language;
  await reloadListsToKeepUpdated();
  updateUpdatingStrings();

  const currentRoute = getCurrentRoute();

  if (reroute) {
    // Check whether the route is static ie. does not change with locale changes
    if (typeof currentRoute.route !== "string") {
      // Got a dynamic route so we must update the current url
      let newUrlSplit = currentRoute.route.value.split("/");

      newUrlSplit = newUrlSplit.map(segment => {
        if (segment.substring(1) in currentRoute.groups) {
          return currentRoute.groups[segment.substring(1)];
        }
        return segment;
      });

      // Must not add a leading slash since `Router.currentRoute.route.value` already starts with once
      window.history.pushState({ currentLanguage }, "", `${newUrlSplit.join("/")}`);
      engineRoute();
    } else {
      // Manually trigger a re-route
      engineRoute();
    }
  }
}

/**
 * Apply transformations to a translated string (eg. replacing data placeholders with values)
 */
export function transform(value: string, data: Record<string, string>): string {
  let val = value;
  for (const dataKey in data) {
    val = val.replace(new RegExp(`{{${dataKey}}}`, "g"), data[dataKey]);
  }
  return val;
}

/**
 * An updating string is an object that automatically updates its value when the currently selected language changes
 */
export interface updatingString {
  value: string;
}

/**
 * How an updatingString is stored for later updating
 */
interface updatingStringWrapper<Key extends string> {
  updatingString: updatingString;
  key: Key;
  data: Record<string, string>;
  update: (key: Key, data: Record<string, string>) => string;
}

/**
 * Return an object with a translated string that automatically updates with the current language
 *
 * @internal
 * @param value Initial value of the translated object
 * @param key Key that will later be used to update the translated string
 * @param data Data to use in the translated string
 * @param update Method used for updating (usually the local `__` function)
 */
export function makeUpdatingString<Key extends string>(value: string, key: Key, data: Record<string, string>, update: (key: Key, data: Record<string, string>) => string): updatingString {
  const updatingString = {
    value: transform(value, data)
  };

  updatingStringsToWatch.push({ updatingString, key, data, update });
  return updatingString;
}

// TODO: Remove debug
// @ts-expect-error
window.setLanguage = setLanguage;
