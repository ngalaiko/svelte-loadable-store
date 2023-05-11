import { readable, type Readable } from 'svelte/store';
import type { Loadable, Loaded } from './types';

type Stores<T> =
	| Readable<Loadable<T>>
	| [Readable<Loadable<T>>, ...Array<Readable<Loadable<T>>>]
	| Array<Readable<Loadable<T>>>;

type StoresValues<T> = T extends Readable<Loadable<infer U>>
	? U
	: {
			[K in keyof T]: T[K] extends Readable<Loadable<infer U>> ? U : never;
	  };

// derived works similar to how it works in vanilla svelte.
// it can be used to create an asynchronously populated store from other asynchronously populated stores.
// the store will be in a loading state until all the dependencies are resolved.
export default <S extends Stores<any>, T>(
	stores: S,
	fn: (values: StoresValues<S>) => T
): Readable<Loadable<T>> => {
	const single = !Array.isArray(stores);
	const stores_array: Array<Readable<Loadable<T>>> = single
		? [stores as Readable<Loadable<T>>]
		: (stores as Array<Readable<Loadable<T>>>);

	return readable<Loadable<T>>({ isLoading: true }, (set) => {
		let loaded = 0;
		const values = new Array<Loaded<T>>(stores_array.length);
		const unsubscribers = new Array(stores_array.length);

		const update = () => {
			if (loaded === values.length) {
				set({
					isLoading: false,
					value: fn(single ? values[0].value : (values.map(({ value }) => value) as any))
				});
			}
		};

		stores_array.forEach((store, i) => {
			unsubscribers[i] = store.subscribe((value) => {
				if (!value.isLoading) {
					values[i] = value;
					loaded += 1;
					update();
				}
			});
		});

		return () => {
			unsubscribers.forEach((unsubscribe) => unsubscribe());
		};
	});
};
