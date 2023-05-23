export type Loading = { isLoading: true };

export type Loaded<T> = { isLoading: false; value: T };
export const Loaded = {
	isLoaded: <T>(value: Loadable<T> | T): value is Loaded<T> =>
		Loadable.isLoadable(value) && !value.isLoading
};

export type Loadable<T> = Loading | Loaded<T>;
export const Loadable = {
	isLoadable: <T>(value: Loadable<T> | T): value is Loadable<T> =>
		typeof value === 'object' &&
		value !== null &&
		Object.keys(value).length === 2 &&
		'isLoading' in value &&
		'value' in value
};
