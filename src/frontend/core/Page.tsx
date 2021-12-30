import * as React from "react";
import { getCurrentRoute } from "./internal/currentRoute";

export interface Props {}

/**
 * A page is a collection of components mapped to one or more routes.
 * It may provide additional metadata such as required viewing permissions or a custom title etc.
 */
export class Page<
  Groups extends string[] = [],
  State = {}
> extends React.Component<Props, State> {
  /**
   * Get path groups for the current route
   */
  protected get groups(): Record<Groups[number], string> {
    return getCurrentRoute().groups;
  }
}
