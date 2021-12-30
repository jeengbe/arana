import type { RegisteredRoute } from "@core/router";

/**
 * @internal
 * @ignore
 */
export const routes: RegisteredRoute[] = [];

/**
 * @internal
 * @ignore
 */
export function addRoute(route: RegisteredRoute): void {
  routes.push(route);
}
