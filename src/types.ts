export type Loading = { isLoading: true };
export const Loading = {
	isLoading: <T>(value: Loadable<T> | T): value is Loading =>
		typeof value === 'object' &&
		value !== null &&
		Object.keys(value).length === 1 &&
		'isLoading' in value &&
		value.isLoading === true
};

export type Loaded<T> = { isLoading: false; value: T };
export const Loaded = {
	isLoaded: <T>(value: Loadable<T> | T): value is Loaded<T> =>
		typeof value === 'object' &&
		value !== null &&
		Object.keys(value).length === 2 &&
		'isLoading' in value &&
		value.isLoading === false &&
		'value' in value
};

export type Loadable<T> = Loading | Loaded<T>;
export const Loadable = {
	isLoadable: <T>(value: Loadable<T> | T): value is Loadable<T> =>
		Loaded.isLoaded(value) || Loading.isLoading(value)
};
