import { readable, type Readable } from 'svelte/store';
import { Loadable, Loaded } from './types';

type Stores<T> =
	| (Readable<Loadable<T>> | Readable<T>)
	| (
			| [Readable<Loadable<T>>, ...Array<Readable<Loadable<T>>>]
			| [Readable<T>, ...Array<Readable<T>>]
	  )
	| (Array<Readable<Loadable<T>>> | Array<Readable<T>>);

type StoresValues<T> = T extends Readable<Loadable<infer U>>
	? U
	: T extends Readable<infer U>
	? U
	: {
			[K in keyof T]: T[K] extends Readable<Loadable<infer U>>
				? U
				: T[K] extends Readable<infer U>
				? U
				: never;
	  };

const single = <U, T>(
	store: Readable<Loadable<U>> | Readable<U>,
	fn: (value: U) => T | Promise<T>
): Readable<Loadable<T>> =>
	readable<Loadable<T>>({ isLoading: true }, (set) =>
		store.subscribe((value) => {
			if (Loaded.isLoaded(value)) {
				const derivedValue = fn(value.value as any);
				if (derivedValue instanceof Promise) {
					derivedValue
						.then((value) => set({ isLoading: false, value }))
						.catch((error) => set({ isLoading: false, value: error }));
				} else {
					set({ isLoading: false, value: derivedValue });
				}
			} else if (!Loadable.isLoadable(value)) {
				const derivedValue = fn(value);
				if (derivedValue instanceof Promise) {
					derivedValue.then((value) => set({ isLoading: false, value }));
				} else {
					set({ isLoading: false, value: derivedValue });
				}
			}
		})
	);

const array = <U, T>(
	stores: Array<Readable<Loadable<U>> | Readable<U>>,
	fn: (values: Array<U>) => T | Promise<T>
): Readable<Loadable<T>> =>
	readable<Loadable<T>>({ isLoading: true }, (set) => {
		const values = new Array(stores.length);
		const unsubscribes = new Array(stores.length);
		let loaded = 0;
		let error: Error | undefined;
		let isSet = false;

		const update = () => {
			if (isSet) {
				return;
			} else if (error) {
				set({ isLoading: false, value: error });
			} else if (loaded === values.length) {
				const derivedValue = fn(values);
				if (derivedValue instanceof Promise) {
					derivedValue
						.then((value) => set({ isLoading: false, value }))
						.catch((error) => set({ isLoading: false, value: error }));
				} else {
					set({ isLoading: false, value: derivedValue });
					isSet = true;
				}
			}
		};

		stores.forEach((store, index) => {
			unsubscribes[index] = store.subscribe((value) => {
				if (Loaded.isValue(value)) {
					values[index] = value.value;
					loaded++;
					update();
				} else if (Loaded.isError(value)) {
					error = value.value;
					update();
				} else if (!Loadable.isLoadable(value)) {
					values[index] = value;
					loaded++;
					update();
				}
			});
		});

        update()
		return () => {
			unsubscribes.forEach((unsubscribe) => unsubscribe());
		};
	});

export default <S extends Stores<any>, T>(
	stores: S,
	fn: (values: StoresValues<S>) => T | Promise<T>
): Readable<Loadable<T>> =>
	!Array.isArray(stores) ? single(stores, fn) : array(stores, fn as (values: Array<any>) => T);
