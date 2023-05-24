export type Loading = { isLoading: true };
export const Loading = {
	isLoading: <T>(value: Loadable<T> | T): value is Loading =>
		typeof value === 'object' &&
		value !== null &&
		Object.keys(value).length === 1 &&
		'isLoading' in value &&
		value.isLoading === true
};

export type Value<T> = T | Error;
export const Value = {
	isError: <T>(value: Value<T>): value is Error => value instanceof Error,
	isValue: <T>(value: Value<T>): value is T => !Value.isError(value)
};

export type Loaded<T> = { isLoading: false; value: Value<T> };
export const Loaded = {
	isLoaded: <T>(value: Loadable<T> | T): value is Loaded<T> =>
		typeof value === 'object' &&
		value !== null &&
		Object.keys(value).length === 2 &&
		'isLoading' in value &&
		value.isLoading === false &&
		'value' in value,
	isError: <T>(value: Loadable<T> | T): value is { isLoading: false; value: Error } =>
		Loaded.isLoaded(value) && Value.isError(value.value),
	isValue: <T>(value: Loadable<T> | T): value is { isLoading: false; value: T } =>
		Loaded.isLoaded(value) && Value.isValue(value.value)
};

export type Loadable<T> = Loading | Loaded<T>;
export const Loadable = {
	isLoadable: <T>(value: Loadable<T> | T): value is Loadable<T> =>
		Loaded.isLoaded(value) || Loading.isLoading(value)
};
