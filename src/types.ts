export type Loading = { isLoading: true };
export type Loaded<T> = { isLoading: false; value: T };
export type Loadable<T> = Loading | Loaded<T>;
