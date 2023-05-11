import { equal } from 'uvu/assert';
import { test } from 'uvu';

import { get } from 'svelte/store';

import readable from './readable';

const delay = <T>(ms: number, value: T): Promise<T> =>
	new Promise((resolve) => setTimeout(() => resolve(value), ms));

test('should return initial value', () => {
	const store = readable();
	equal(get(store), { isLoading: true });
});

test('should run notifier immidiately', () => {
	const store = readable<number>(undefined, (set) => set(1));
	equal(get(store), { isLoading: false, value: 1 });
});

test('should immidiately load value', () => {
	const store = readable(1);
	equal(get(store), { isLoading: false, value: 1 });
});

test('should wait for promised value', async () => {
	const load = Promise.resolve(1);
	const store = readable(load);
	equal(get(store), { isLoading: true });
	await load;
	equal(get(store), { isLoading: false, value: 1 });
});

test('should wait for promised value and run notifier', async () => {
	const load = delay(1, 1);
	const update = delay(2, 2);

	const store = readable(load, (set) => {
		update.then(set);
	});

	equal(get(store), { isLoading: true });
	await load;
	equal(get(store), { isLoading: false, value: 1 });
	await update;
	equal(get(store), { isLoading: false, value: 2 });
});

test('should not override value from initial promise if store is loaded', async () => {
	const load = delay(2, 1);
	const update = delay(1, 2);

	const store = readable(load, (set) => {
		update.then(set);
	});

	equal(get(store), { isLoading: true });
	await update;
	equal(get(store), { isLoading: false, value: 2 });
	await load;
	equal(get(store), { isLoading: false, value: 2 });
});

test.run();
