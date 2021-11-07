import * as React from "react";

/**
 * Metadata for providing a user component
 */
interface UserComponentOptions<Props> {
  /**
   * User-friendly component name
   */
  name: string;

  /**
   * User-friendly component description
   */
  description: string;

  /**
   * Examples of how the component can be used
   */
  examples?: JSX.Element[];

  /**
   * Custom properties for the component
   */
  props: Record<keyof Props, {
    /**
     * User-friendly name
     */
    name: string;
    /**
     * User-friendly description
     */
    description: string;
    /**
     * Property type
     */
    type: typeof Component | "boolean" | "string";
  }>;
}

/**
 * A user component is a component which a user can use to build their own pages
 */
export function UserComponent<Props>(options: UserComponentOptions<Props>) {
  return function <ComponentConstructor extends new (...props: any[]) => Component>(constructor: ComponentConstructor): ComponentConstructor {
    // TODO: Handle component data and add to component registry
    return constructor;
  };
}

export default abstract class Component<
  Props = {},
  State = {},
  HTMLProps extends React.HTMLAttributes<unknown> = React.HTMLAttributes<unknown>
> extends React.Component<
  Props & Pick<HTMLProps, Exclude<keyof HTMLProps, keyof Props>>,
  State
  > {
  public abstract render(): JSX.Element;

  // Implement here so that children can call super.
  /* eslint-disable @typescript-eslint/no-empty-function */
  public componentDidMount(): void { }
  public componentDidUpdate(): void { }
  public componentWillUnmount(): void { }
  /* eslint-enable @typescript-eslint/no-empty-function */
}


export type Variant = typeof VariantComponent.variants[number];

export abstract class VariantComponent<
  Props = {},
  State = {},
  HTMLProps extends React.HTMLAttributes<unknown> = React.HTMLAttributes<unknown>
> extends Component<
  Props & {
    variant?: Variant;
  },
  State,
  HTMLProps
  > {
  public static readonly variants = ["success", "warning", "error", "info", "default"] as const;

  public abstract render(): JSX.Element;

  /**
   * Return the required classes for this Component's variant from a given css declaration
   */
  protected vary(css: Record<Variant, string>): string {
    return css[this.props.variant ?? "default"];
  }
}
