import { equal } from 'uvu/assert';
import { test } from 'uvu';

import derived from './derived';
import readable from './readable';
import { Subscriber, get, readable as vanillaReadable } from 'svelte/store';

const delay = <T>(ms: number, value: T): Promise<T> =>
	new Promise((resolve) => setTimeout(() => resolve(value), ms));

test('should wait for single dependency', async () => {
	const load = delay(1, 1);

	const store = derived(readable(load), (value) => value + 1);
	equal(get(store), { isLoading: true });

	await load;
	equal(get(store), { isLoading: false, value: 2 });
});

test('should wait for multiple dependencies', async () => {
	const load1 = delay(1, 1);
	const load2 = delay(2, 2);

	const store = derived([readable(load1), readable(load2)], ([value1, value2]) => value1 + value2);

	equal(get(store), { isLoading: true });

	await load1;
	equal(get(store), { isLoading: true });

	await load2;
	equal(get(store), { isLoading: false, value: 3 });
});

test('shoud wait for transitive dependencies', async () => {
	const load = delay(1, 1);
	const store = derived(
		derived(readable(load), (value) => value + 1),
		(value) => value + 1
	);

	equal(get(store), { isLoading: true });

	await load;
	equal(get(store), { isLoading: false, value: 3 });
});

test('updates should propagate', async () => {
	let updateStore: Subscriber<number> | undefined;
	const store = derived(
		readable(new Promise<number>(() => {}), (set) => {
			updateStore = set;
		}),
		(value) => value + 1
	);

	equal(get(store), { isLoading: true });

	updateStore?.(1);
	equal(get(store), { isLoading: false, value: 2 });

	updateStore?.(2);
	equal(get(store), { isLoading: false, value: 3 });
});

test('should derive from valilla store', async () => {
	const store = derived(vanillaReadable(1), (value) => value + 1);

	equal(get(store), { isLoading: false, value: 2 });
});

test('should derive from both vanilla and async stores', async () => {
	const store = derived([vanillaReadable(1), readable(2)], ([a, b]) => a + b);

	equal(get(store), { isLoading: false, value: 3 });
});

test('should allow single vanilla derivation using a promise', async () => {
	const store = derived(vanillaReadable(1), (a) => Promise.resolve(a + 1));

	equal(get(store), { isLoading: true });

	await delay(1, undefined);
	equal(get(store), { isLoading: false, value: 2 });
});

test('should allow single loaded derivation using a promise', async () => {
	const store = derived(readable(1), (a) => Promise.resolve(a + 1));

	equal(get(store), { isLoading: true });

	await delay(1, undefined);
	equal(get(store), { isLoading: false, value: 2 });
});

test('should allow multiple vanilla derivation using a promise', async () => {
	const store = derived([vanillaReadable(1), vanillaReadable(2)], ([a, b]) =>
		Promise.resolve(a + b)
	);

	equal(get(store), { isLoading: true });

	await delay(1, undefined);
	equal(get(store), { isLoading: false, value: 3 });
});

test('should allow multiple loaded derivation using a promise', async () => {
	const store = derived([readable(1), readable(2)], ([a, b]) => Promise.resolve(a + b));

	equal(get(store), { isLoading: true });

	await delay(1, undefined);
	equal(get(store), { isLoading: false, value: 3 });
});

test('should allow loaded with vanilla derivation using a promise', async () => {
	const store = derived([readable(1), vanillaReadable(2)], ([a, b]) => Promise.resolve(a + b));

	equal(get(store), { isLoading: true });

	await delay(1, undefined);
	equal(get(store), { isLoading: false, value: 3 });
});

test('should set error if derivation promise rejects', async () => {
	const error = new Error('test');
	const store = derived(readable(1), () => Promise.reject(error));

	equal(get(store), { isLoading: true });

	await delay(1, undefined);
	equal(get(store), { isLoading: false, value: error });
});

test('should set error if single store is error', async () => {
	const error = new Error('test');
	const store = derived(readable(Promise.reject(error)), (value) => value);

	equal(get(store), { isLoading: true });

	await delay(1, undefined);
	equal(get(store), { isLoading: false, value: error });
});

test('should set error if one of multiple stores is error', async () => {
	const error = new Error('test');
	const store = derived([readable(1), readable(Promise.reject(error))], ([a, b]) => a + b);

	equal(get(store), { isLoading: true });

	await delay(1, undefined);
	equal(get(store), { isLoading: false, value: error });
});

test('should derive no stores are provided', async () => {
	const store = derived([], () => 1);

	equal(get(store), { isLoading: false, value: 1 });
});

test.run();
