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

export default function engineRoute(): void {
  routeFunction!();
}
