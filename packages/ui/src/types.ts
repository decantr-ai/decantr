/** Signal getter — reads the current value and tracks the calling effect */
export type Accessor<T> = () => T;

/** Signal setter — updates the value, accepts direct value or updater function */
export type Setter<T> = (value: T | ((prev: T) => T)) => void;

/** A signal pair: [getter, setter] */
export type Signal<T> = [Accessor<T>, Setter<T>];

/** Valid children for h() and components */
export type Child =
  | string
  | number
  | boolean
  | null
  | undefined
  | Node
  | (() => Child)
  | Child[];

/** A component function that returns a DOM element */
export type Component<P extends Record<string, unknown> = Record<string, unknown>> = {
  (props: P, ...children: Child[]): HTMLElement;
  __d_isComponent?: true;
  displayName?: string;
};

/** Props base — all components accept these */
export interface BaseProps {
  class?: string;
  style?: string | Record<string, string>;
  ref?: (el: HTMLElement) => void;
}

/** Reactive node in the dependency graph */
export interface ReactiveNode {
  run: () => void;
  level: number;
  sources?: Set<Set<ReactiveNode>>;
  disposed?: boolean;
}

/** Owner in the reactive ownership tree */
export interface Owner {
  children: Set<Owner>;
  cleanups: Array<() => void>;
  onError?: (err: unknown) => void;
  context?: Map<symbol, unknown>;
  _parent?: Owner | null;
}

/** Context object created by createContext */
export interface Context<T> {
  readonly id: symbol;
  Provider: (value: T) => () => void;
  consume: () => T;
  defaultValue: T;
}
