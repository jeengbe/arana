import type { updatingString } from "@core/i18nLib";
import type Page from "@core/Page";
import type { Props } from "@core/Page";
import { addRoute } from "./internal/routes";

/**
 * Register a route for a page\
 * Used as a decorator
 * @param pageRoute Route to register
 */
export default function Route<S extends Page>(
  pageRoute: string | updatingString
): (<P extends new (props: Props) => S>(constructor: P) => P) {
  return function <T extends new (props: Props) => S>(constructor: T): T {
    addRoute({ page: constructor, route: pageRoute });
    return constructor;
  };
}
