import type { CurrentRoute } from "@core/router";

/**
 * @internal
 * @ignore
 */
let currentRoute: CurrentRoute | null = null;

/**
 * @internal
 * @ignore
 */
export function setCurrentRoute(route: CurrentRoute): void {
  currentRoute = route;
}

/**
 * **IMPORTANT** You must first call `Router.determineCurrentRoute()` for this not to be null!\
 * Otherwise, you may get runtime errors.
 */
export default function getCurrentRoute(): CurrentRoute {
  return currentRoute as CurrentRoute;
}
