import { derived, type Readable } from 'svelte/store';
import type { Loadable, Loaded, Loading } from './types';

type Stores<T> =
	| Readable<Loadable<T>>
	| [Readable<Loadable<T>>, ...Array<Readable<Loadable<T>>>]
	| Array<Readable<Loadable<T>>>;

type StoresValues<T> = T extends Readable<Loadable<infer U>>
	? U
	: {
			[K in keyof T]: T[K] extends Readable<Loadable<infer U>> ? U : never;
	  };

const single = <U, T>(store: Readable<Loadable<U>>, fn: (value: U) => T): Readable<Loadable<T>> =>
	derived(store, (value) =>
		value.isLoading
			? ({ isLoading: true } as Loading)
			: ({ isLoading: false, value: fn(value.value) } as Loaded<T>)
	);

const isLoaded = <U>(value: Loadable<U>): value is Loaded<U> => !value.isLoading;

const array = <U, T>(
	stores: Array<Readable<Loadable<U>>>,
	fn: (values: Array<U>) => T
): Readable<Loadable<T>> =>
	derived(stores, (values) => {
		const loaded = values.filter(isLoaded);
		return loaded.length === values.length
			? ({ isLoading: false, value: fn(loaded.map(({ value }) => value)) } as Loaded<T>)
			: ({ isLoading: true } as Loading);
	});

// derived works similar to how it works in vanilla svelte.
// it can be used to create an asynchronously populated store from other asynchronously populated stores.
// the store will be in a loading state until all the dependencies are resolved.
export default <S extends Stores<any>, T>(
	stores: S,
	fn: (values: StoresValues<S>) => T
): Readable<Loadable<T>> =>
	!Array.isArray(stores) ? single(stores, fn) : array(stores, fn as (values: Array<any>) => T);
