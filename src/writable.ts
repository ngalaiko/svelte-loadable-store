import { writable, type Subscriber, type Unsubscriber, type Writable } from 'svelte/store';
import type { Loadable, Loading, Loaded } from './types';

export type StartStopNotifier<T> = (
	set: Subscriber<T>
) => Promise<Unsubscriber> | Unsubscriber | void;

const noop = () => {};

const isPromise = <T>(value: T | Promise<T>): value is Promise<T> => {
	return value && typeof (value as Promise<T>).then === 'function';
};

// writable is a wrapper for vanilla svelte writable store.
// it can be used to create a store that is populated asynchronously.
// the store will be in a loading state until the promise resolves.
// it is also possible to pass a startStopNotifier function that will be called when the store is subscribed to.
// this can be used to start and stop a subscription to websocket events for example.
export default <T>(
	value?: T | Promise<T>,
	start: StartStopNotifier<T> = noop
): Writable<Loadable<T>> => {
	const isValuePromised = isPromise(value);

	const initialValue =
		value === undefined || isValuePromised
			? ({ isLoading: true } as Loading)
			: ({ isLoading: false, value } as Loaded<T>);
	const { set, update, subscribe } = writable<Loadable<T>>(
		initialValue,
		// allow the user to subscribe to the store
		(set) => {
			const stop = () => {};
			Promise.resolve(start((value) => set({ isLoading: false, value }))).then(stop);
			return stop;
		}
	);

	if (isValuePromised) {
		// when the promise resolves, the store will be updated with the value.
		value.then((value) =>
			// if the store is already loading, we don't want to overwrite the value.
			update((state) => (state.isLoading ? { isLoading: false, value } : state))
		);
	}

	return { set, update, subscribe };
};
