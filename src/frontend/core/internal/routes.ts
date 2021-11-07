import type { RegisteredRoute } from "@core/router";

/**
 * @internal
 * @ignore
 */
const routes: RegisteredRoute[] = [];
export default routes;

/**
 * @internal
 * @ignore
 */
export function addRoute(route: RegisteredRoute): void {
  routes.push(route);
}
