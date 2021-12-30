import * as React from "react";

/**
 * Shorthand for a constructor type
 */
type Ctor<Type, Args extends any[] = any> = new (...args: Args) => Type;

/**
 * Shorthand for the `data` property
 */
type Data<D> = { data: D; };

/**
 * Base class for a plugin
 * See documentation for more information
 */
// TODO: Documentation link
export abstract class Plugin<PluginData = {}> extends React.Component<
  Data<PluginData>
> {
  abstract render(): JSX.Element;
}

/**
 * Function signature for a simple collector (decorator without arguments)
 */
type CollectorSignature<CollectorData> = <PluginData>(
  constructor: CollectorData extends PluginData
    ? Ctor<Plugin<PluginData>>
    : "Error: Plugin requirements not satisfied by collector"
) => void;

type CollectorRenderSignature<CollectorData, Type> =
  CollectorData extends Record<string, never>
    ? (key?: (index: number) => number | string) => Type[]
    : (data: CollectorData, key?: (index: number) => number | string) => Type[];

/**
 * Object signature of a simple collector
 */
interface Collector<CollectorData, Type>
  extends CollectorSignature<CollectorData> {
  plugins: Ctor<Type>[];
  render: CollectorRenderSignature<CollectorData, Type>;
}

type ComplexCollectorMapper<Args, Type> = (data: {
  constructor: Ctor<Type>;
  args: Args;
}) => Type;

type ComplexCollectorRenderSignature<Args, Type> = (mapper: ComplexCollectorMapper<Args, Type>) => Type[];

/**
 * Object signature of a complex collector
 */
interface ComplexCollector<
  Args extends Record<string, any>,
  CollectorData,
  Type
> {
  (args: Args): CollectorSignature<CollectorData>;
  plugins: { constructor: Ctor<Type>; args: Args; }[];
  render: ComplexCollectorRenderSignature<Args, Type>;
}

// TODO: Link to documentation
/**
 * See documentation for this
 * OR
 */
// TODO: Copy from documentation
export function createPluginCollector<
  CollectorData extends Record<string, any> = Record<string, never>,
  Type extends Plugin<CollectorData> = Plugin<CollectorData>
>(): Collector<CollectorData, Type> {
  // Collector object is a function (object must have a call signature for decorator, which only functions have)
  const collector = function (constructor: Ctor<Type>): void {
    collector.plugins.push(constructor);
  } as unknown as Collector<CollectorData, Type>;
  // Set required properties on the function object
  collector.plugins = [];
  collector.render = function (
    data?: CollectorData,
    key = (index: number): number => index
  ): Type[] {
    // Map each collector's plugin to the respective React Component
    return collector.plugins.map<Type>(
      (plugin, index) =>
        React.createElement(plugin, {
          data,
          key: key(index)
        }) as unknown as Type
    );
  } as CollectorRenderSignature<CollectorData, Type>;

  return collector;
}

// TODO: Link to documentation
/**
 * See documentation for this
 * OR
 */
// TODO: Copy from documentation
export function createComplexPluginCollector<
  Args extends Record<string, any>,
  CollectorData extends Record<string, any> = Record<string, never>,
  Type = Plugin<CollectorData>
>(): ComplexCollector<Args, CollectorData, Type> {
  const collector = function (args: Args) {
    return function (constructor: Ctor<Type>): void {
      collector.plugins.push({ constructor, args });
    };
  } as unknown as ComplexCollector<Args, CollectorData, Type>;
  collector.plugins = [];
  collector.render = function (
    mapper: ComplexCollectorMapper<Args, Type>
  ): Type[] {
    // Map each plugin using a custom mapping function
    return collector.plugins.map(plugin => mapper({ ...plugin }));
  } as ComplexCollectorRenderSignature<Args, Type>;

  return collector;
}
