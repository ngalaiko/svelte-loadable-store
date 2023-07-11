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
		store.subscribe((maybeLoadable) => {
			const value: Loadable<any> = Loadable.isLoadable(maybeLoadable)
				? maybeLoadable
				: { isLoading: false, value: maybeLoadable };
			if (Loaded.isError(value)) {
				set(value);
			} else if (Loaded.isValue(value)) {
				const derivedValue = fn(value.value as any);
				if (derivedValue instanceof Promise) {
					derivedValue
						.then((value) => set({ isLoading: false, value }))
						.catch((error) => set({ isLoading: false, error: error }));
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
		const values: Loadable<any>[] = new Array(stores.length).fill({ isLoading: true });
		const unsubscribes = new Array(stores.length);

		const update = () => {
			const firstError = values.find((value) => Loaded.isError(value));
			if (firstError) {
				set(firstError);
			} else if (values.every(Loaded.isValue)) {
				const derivedValue = fn(values.map((value) => value.value));
				if (derivedValue instanceof Promise) {
					derivedValue
						.then((value) => set({ isLoading: false, value }))
						.catch((error) => set({ isLoading: false, error: error }));
				} else {
					set({ isLoading: false, value: derivedValue });
				}
			}
		};

		stores.forEach((store, index) => {
			unsubscribes[index] = store.subscribe((value) => {
				if (Loaded.isLoaded(value)) {
					values[index] = value;
				} else if (!Loadable.isLoadable(value)) {
					values[index] = { isLoading: false, value };
				}
				update();
			});
		});

		update();
		return () => {
			unsubscribes.forEach((unsubscribe) => unsubscribe());
		};
	});

export default <S extends Stores<any>, T>(
	stores: S,
	fn: (values: StoresValues<S>) => T | Promise<T>
): Readable<Loadable<T>> =>
	!Array.isArray(stores) ? single(stores, fn) : array(stores, fn as (values: Array<any>) => T);
