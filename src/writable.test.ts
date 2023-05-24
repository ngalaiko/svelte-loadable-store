import { equal } from 'uvu/assert';
import { test } from 'uvu';

import { get } from 'svelte/store';

import writable from './writable';

const delay = <T>(ms: number, value: T): Promise<T> =>
	new Promise((resolve) => setTimeout(() => resolve(value), ms));

test('should set value', () => {
	const store = writable<number>();
	equal(get(store), { isLoading: true });

	store.set({ isLoading: false, value: 1 });
	equal(get(store), { isLoading: false, value: 1 });
});

test('should not override value with initial promise result if store is loaded', async () => {
	const load = delay(1, 1);

	const store = writable(load);
	equal(get(store), { isLoading: true });

	store.set({ isLoading: false, value: 2 });
	equal(get(store), { isLoading: false, value: 2 });

	await load;
	equal(get(store), { isLoading: false, value: 2 });
});

test('should override value with update if store is loaded', async () => {
	const update = delay(1, 1);

	const store = writable<number>(undefined, (set) => {
		update.then(set);
	});
	equal(get(store), { isLoading: true });

	store.set({ isLoading: false, value: 2 });
	equal(get(store), { isLoading: false, value: 2 });

	await update;
	equal(get(store), { isLoading: false, value: 1 });
});

test('shoud set error if initial promise throws', async () => {
	const error = new Error('test');

	const load = Promise.reject(error);

	const store = writable(load);
	equal(get(store), { isLoading: true });

	await load.catch(() => {});
	equal(get(store), { isLoading: false, value: error });
});

test.run();
