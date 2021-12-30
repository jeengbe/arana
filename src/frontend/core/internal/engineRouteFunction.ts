/**
 * @internal
 * @ignore
 */
let routeFunction: (() => void) | null = null;

/**
 * @internal
 * @ignore
 */
export function setRouteFunction(func: () => void): void {
  routeFunction = func;
}

export function engineRoute(): void {
  routeFunction!();
}
