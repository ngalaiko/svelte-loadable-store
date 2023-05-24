import { writable, type StartStopNotifier, type Writable } from 'svelte/store';
import type { Loadable, Loading, Loaded } from './types';

export default <T>(
	value?: T | Promise<T>,
	start: StartStopNotifier<T> = () => {}
): Writable<Loadable<T>> => {
	const isValuePromised = value instanceof Promise;

	const initialValue =
		value === undefined || isValuePromised
			? ({ isLoading: true } as Loading)
			: ({ isLoading: false, value } as Loaded<T>);

	const { set, update, subscribe } = writable<Loadable<T>>(initialValue, (set) =>
		start((value) => set({ isLoading: false, value }))
	);

	if (isValuePromised) {
		value
			.then((value) => update((state) => (state.isLoading ? { isLoading: false, value } : state)))
			.catch((error) =>
				update((state) => (state.isLoading ? { isLoading: false, value: error } : state))
			);
	}

	return { set, update, subscribe };
};
