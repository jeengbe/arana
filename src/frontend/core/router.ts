import { __ } from "./i18n";
import type { updatingString } from "./i18nLib";
import { currentLanguage, setLanguage } from "./i18nLib";
import { setCurrentRoute } from "./internal/currentRoute";
import { engineRoute } from "./internal/engineRouteFunction";
import { routes, addRoute } from "./internal/routes";
import type { Page } from "./Page";
import { Error404 } from "./pages/Error404";

/**
 * Object used to add a route to the router
 */
export interface RegisteredRoute {
  /**
   * Route to serve the page under
   */
  route: string | updatingString;

  /**
   * Page to render
   */
  page: typeof Page;
}

/**
 * Data for the currently matched route
 */
export interface CurrentRoute extends RegisteredRoute {
  /**
   * Actual url path that matched the route
   */
  path: string;

  /**
   * Route that was matched under
   */
  route: string | updatingString;

  /**
   * Captured path groups\
   * **BEWARE WHEN USING: NOT TYPED OR CHECKED!**
   * TEST: Check these
   */
  groups: Record<string, string>;

  /**
   * Page to render
   */
  page: typeof Page;
}

/**
 * The router handles everything that is related to the current url and its related page.
 */
export class Router {
  /**
   * Get the current page url
   * @return With a leading slash
   */
  public static get path(): string {
    return window.location.pathname;
  }

  /**
   * Get the current path split by /
   * @return The first element is an empty string due to the leading slash of the path
   */
  public static get pathSplit(): string[] {
    return Router.path.split("/");
  }

  /**
   * Register a page and all of its routes
   */
  // TODO
  public static registerPage(page: typeof Page, pageRoutes: string[]): void {
    // Register each route individually
    pageRoutes.forEach(route => addRoute({ route, page }));
  }

  /**
   * Get the current route for the currently opened path
   */
  public static determineCurrentRoute(): void {
    const { path, pathSplit } = Router;
    const possibleRoutes: CurrentRoute[] = [];

    // Iterate over all registered routes
    routes.forEach(route => {
      let { route: routeRoute } = route;
      if (typeof routeRoute !== "string") {
        routeRoute = routeRoute.value;
      }


      if (routeRoute === path && !routeRoute.includes(":")) {
        // Exact match
        return possibleRoutes.push({ ...route, groups: {}, path });
      }

      // Check each path segment individually
      const routeSplit = routeRoute.split("/");
      if (routeSplit.length !== pathSplit.length) {
        // Lengths don't match
        return;
      }

      const groups: Record<string, string> = {};
      for (let i = 0; i < pathSplit.length; i++) {
        if (routeSplit[i].startsWith(":")) {
          // Capturing group
          if (routeSplit[i].substring(1) in groups) {
            // TEST: Move to test suite
            throw new Error(`Duplicate group in route '${routeRoute}'`);
          }
          groups[routeSplit[i].substr(1)] = pathSplit[i];
        } else if (routeSplit[i] !== pathSplit[i]) {
          // Path segments don't match
          return;
        }
      }

      // It's a match!
      return possibleRoutes.push({ ...route, groups, path });
    });

    // TODO: On first load: Determine best-fitting language based on ip and what not and use that to resolve the initial page. (server-side!)
    if (possibleRoutes.length === 0) {
      // No page found
      // TEST: Add testing to make sure paths start with '/'
      setCurrentRoute({
        route: __("pages.error.404.route"),
        path: __("pages.error.404.route"),
        page: Error404,
        groups: {}
      });
    } else if (possibleRoutes.length === 1) {
      setCurrentRoute(possibleRoutes[0]);
    } else {
      // TEST: Add a test to prevent multiple routing options
      throw new Error("Multiple routes found");
    }
  }

  /**
   * Redirect to a different url and trigger and reroute
   */
  public static redirectTo(url: string, forceReload = false): void {
    const isExternal = url.includes("://");
    if (isExternal || forceReload) {
      window.location.href = url;
    } else {
      window.history.pushState({ currentLanguage }, "", url);
      engineRoute();
    }
  }
}

window.addEventListener("popstate", async (e): Promise<void> => {
  const { state: oldState } = e;

  if (!("currentLanguage" in oldState)) {
    // TODO: Handle this accordingly
    throw new Error("Panic");
  }
  await setLanguage(oldState.currentLanguage, false);
  engineRoute();
});
