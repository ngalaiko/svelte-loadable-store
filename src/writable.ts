import { writable, type Subscriber, type Unsubscriber, type Writable } from 'svelte/store';
import type { Loadable, Loading, Loaded } from './types';

export type StartStopNotifier<T> = (
	set: Subscriber<T>
) => Promise<Unsubscriber> | Unsubscriber | void;

export default <T>(
	value?: T | Promise<T>,
	start: StartStopNotifier<T> = () => {}
): Writable<Loadable<T>> => {
	const isValuePromised = value instanceof Promise;

	const initialValue =
		value === undefined || isValuePromised
			? ({ isLoading: true } as Loading)
			: ({ isLoading: false, value } as Loaded<T>);

	const { set, update, subscribe } = writable<Loadable<T>>(initialValue, (set) => {
		const stop = () => {};
		Promise.resolve(start((value) => set({ isLoading: false, value }))).then(stop);
		return stop;
	});

	if (isValuePromised) {
		value.then((value) =>
			update((state) => (state.isLoading ? { isLoading: false, value } : state))
		);
	}

	return { set, update, subscribe };
};
