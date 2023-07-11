export type Loading = { isLoading: true };
export const Loading = {
	isLoading: <T>(value: Loadable<T> | T): value is Loading =>
		typeof value === 'object' &&
		value !== null &&
		Object.keys(value).length === 1 &&
		'isLoading' in value &&
		value.isLoading === true
};

export type Loaded<T> = { isLoading: false; value: T } | { isLoading: false; error: any };
export const Loaded = {
	isLoaded: <T>(value: Loadable<T> | T): value is Loaded<T> =>
		typeof value === 'object' &&
		value !== null &&
		Object.keys(value).length === 2 &&
		'isLoading' in value &&
		value.isLoading === false &&
		('value' in value || 'error' in value),
	isError: <T>(value: Loadable<T> | T): value is { isLoading: false; error: any } =>
		Loaded.isLoaded(value) && 'error' in value,
	isValue: <T>(value: Loadable<T> | T): value is { isLoading: false; value: T } =>
		Loaded.isLoaded(value) && 'value' in value
};

export type Loadable<T> = Loading | Loaded<T>;
export const Loadable = {
	isLoadable: <T>(value: Loadable<T> | T): value is Loadable<T> =>
		Loaded.isLoaded(value) || Loading.isLoading(value)
};
