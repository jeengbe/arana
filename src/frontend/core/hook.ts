/*
 * Types
 */

type HookCallback<HookData, Type> = (data: HookData) => Type;
type HookCall<HookData, Type> = HookData extends Record<string, never> ? () => Type extends void ? void : Type[] : (data: HookData) => Type extends void ? void : Type[];
interface Hook<HookData, Type> {
  (callback: HookCallback<HookData, Type>): void;
  callbacks: HookCallback<HookData, Type>[];
  call: HookCall<HookData, Type>;
}

type WaterfallHookCallback<HookData, Type> = (previous: Type, data: HookData) => Type;
type WaterfallHookCall<HookData, Type> = HookData extends Record<string, never> ? (initial: Type) => Type : (initial: Type, data: HookData) => Type;
interface WaterfallHook<HookData, Type> {
  (callback: WaterfallHookCallback<HookData, Type>): void;
  callbacks: WaterfallHookCallback<HookData, Type>[];
  call: WaterfallHookCall<HookData, Type>;
}

type FlowHookCallback<HookData> = (data: HookData) => boolean;
type FlowHookCall<HookData> = HookData extends Record<string, never> ? () => boolean : (data: HookData) => boolean;
interface FlowHook<HookData> {
  (callback: FlowHookCallback<HookData>): void;
  callbacks: FlowHookCallback<HookData>[];
  call: FlowHookCall<HookData>;
}

type AsyncHookCallback<HookData, Type> = (data: HookData) => Promise<Type> | Type;
type AsyncHookCall<HookData, Type> = HookData extends Record<string, never> ? () => Promise<Type extends void ? void : Type[]> : (data: HookData) => Promise<Type extends void ? void : Type[]>;
interface AsyncHook<HookData, Type> {
  (callback: AsyncHookCallback<HookData, Type>): void;
  callbacks: AsyncHookCallback<HookData, Type>[];
  call: AsyncHookCall<HookData, Type>;
}

type AsyncWaterfallHookCallback<HookData, Type> = (previous: Type, data: HookData) => Promise<Type> | Type;
type AsyncWaterfallHookCall<HookData, Type> = HookData extends Record<string, never> ? (initial: Type) => Promise<Type> : (data: HookData, initial: Type) => Promise<Type>;
interface AsyncWaterfallHook<HookData, Type> {
  (callback: AsyncWaterfallHookCallback<HookData, Type>): void;
  callbacks: AsyncWaterfallHookCallback<HookData, Type>[];
  call: AsyncWaterfallHookCall<HookData, Type>;
}

type AsyncFlowHookCallback<HookData> = (data: HookData) => Promise<boolean> | boolean;
type AsyncFlowHookCall<HookData> = HookData extends Record<string, never> ? () => Promise<boolean> : (data: HookData) => Promise<boolean>;
interface AsyncFlowHook<HookData> {
  (callback: AsyncFlowHookCallback<HookData>): void;
  callbacks: AsyncFlowHookCallback<HookData>[];
  call: AsyncFlowHookCall<HookData>;
}

/*
 * Implementation
 */

export function createHook<HookData extends Record<string, any> = Record<string, never>, Type = void>(): Hook<HookData, Type> {
  const hook = function (callback: HookCallback<HookData, Type>): void {
    hook.callbacks.push(callback);
  } as unknown as Hook<HookData, Type>;
  hook.callbacks = [];
  hook.call = function (data?: HookData): Type[] {
    return hook.callbacks.map(callback => callback(data!));
  } as HookCall<HookData, Type>;

  return hook;
}

export function createWaterfallHook<Type, HookData extends Record<string, any> = Record<string, never>>(): WaterfallHook<HookData, Type> {
  const hook = function (callback: WaterfallHookCallback<HookData, Type>): void {
    hook.callbacks.push(callback);
  } as unknown as WaterfallHook<HookData, Type>;
  hook.callbacks = [];
  hook.call = function (initial: Type, data: HookData): Type {
    return hook.callbacks.reduce((prev, callback) => callback(prev, data), initial);
  } as WaterfallHookCall<HookData, Type>;

  return hook;
}

export function createFlowHook<HookData extends Record<string, any> = Record<string, never>>(): FlowHook<HookData> {
  const hook = function (callback: FlowHookCallback<HookData>): void {
    hook.callbacks.push(callback);
  } as unknown as FlowHook<HookData>;
  hook.callbacks = [];
  hook.call = function (data: HookData): boolean {
    return hook.callbacks.every(callback => {
      try {
        return callback(data);
      } catch (err) {
        return false;
      }
    });
  } as FlowHookCall<HookData>;

  return hook;
}

export function createAsyncHook<HookData extends Record<string, any> = Record<string, never>, Type = never>(): AsyncHook<HookData, Type> {
  const hook = function (callback: AsyncHookCallback<HookData, Type>): void {
    hook.callbacks.push(callback);
  } as unknown as AsyncHook<HookData, Type>;
  hook.callbacks = [];
  hook.call = async function (data: HookData): Promise<Type[]> {
    return await Promise.all(hook.callbacks.map(callback => callback(data)));
  } as AsyncHookCall<HookData, Type>;

  return hook;
}

export function createAsyncFlowHook<HookData extends Record<string, any> = Record<string, never>>(): AsyncFlowHook<HookData> {
  const hook = function (callback: AsyncFlowHookCallback<HookData>): void {
    hook.callbacks.push(callback);
  } as unknown as AsyncFlowHook<HookData>;
  hook.callbacks = [];
  hook.call = async function (data: HookData): Promise<boolean> {
    return (await Promise.all(hook.callbacks.map(callback => callback(data)))).every(val => val);
  } as AsyncFlowHookCall<HookData>;

  return hook;
}

export function createAsyncSeriesHook<HookData extends Record<string, any> = Record<string, never>, Type = void>(): AsyncHook<HookData, Type> {
  const hook = function (callback: AsyncHookCallback<HookData, Type>): void {
    hook.callbacks.push(callback);
  } as unknown as AsyncHook<HookData, Type>;
  hook.callbacks = [];
  hook.call = async function (data: HookData): Promise<Type[]> {
    const values: Type[] = [];
    for (const callback of hook.callbacks) {
      values.push(await callback(data));
    }
    return values;
    // TODO: Fancy Array#reduce-ify this
  } as AsyncHookCall<HookData, Type>;

  return hook;
}

export function createAsyncSeriesWaterfallHook<Type, HookData extends Record<string, any> = Record<string, never>>(): AsyncWaterfallHook<HookData, Type> {
  const hook = function (callback: AsyncWaterfallHookCallback<HookData, Type>): void {
    hook.callbacks.push(callback);
  } as unknown as AsyncWaterfallHook<HookData, Type>;
  hook.callbacks = [];
  hook.call = async function (initial: Type, data: HookData): Promise<Type> {
    let value = initial;
    for (const callback of hook.callbacks) {
      value = await callback(value, data);
    }
    return value;
    // TODO: Fancy Array#reduce-ify this
  } as AsyncWaterfallHookCall<HookData, Type>;

  return hook;
}

export function createAsyncSeriesFlowHook<HookData extends Record<string, any> = Record<string, never>>(): AsyncFlowHook<HookData> {
  const hook = function (callback: AsyncFlowHookCallback<HookData>): void {
    hook.callbacks.push(callback);
  } as unknown as AsyncFlowHook<HookData>;
  hook.callbacks = [];
  hook.call = async function (data: HookData): Promise<boolean> {
    let value = true;
    for (const callback of hook.callbacks) {
      try {
        value &&= await callback(data);
      } catch (err) {
        value = false;
      }
    }
    return value;
    // TODO: Fancy Array#reduce-ify this
  } as AsyncFlowHookCall<HookData>;

  return hook;
}
