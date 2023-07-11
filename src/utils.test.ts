import { equal } from 'uvu/assert';
import { test } from 'uvu';

import { get } from 'svelte/store';

import readable from './readable';
import derived from './derived';
import { promisify } from './utils';

const delay = <T>(ms: number, value: T): Promise<T> =>
	new Promise((resolve) => setTimeout(() => resolve(value), ms));

test('promisify should await async store', async () => {
	const store = readable(delay(1, 1));
	equal(await promisify(store), 1);
	equal(get(store), { isLoading: false, value: 1 });
});

test('promisify should await value store', async () => {
	const store = readable(1);
	equal(await promisify(store), 1);
	equal(get(store), { isLoading: false, value: 1 });
});

test('promisify should await derived store', async () => {
	const store = derived([readable(delay(1, 1)), readable(delay(2, 2))], ([a, b]) => a + b);
	equal(await promisify(store), 3);
	equal(get(store), { isLoading: false, value: 3 });
});

test('promisify should reject failed store', async () => {
	const testError = new Error('test');
	const store = readable(Promise.reject(testError));
	try {
		await promisify(store);
	} catch (e) {
		equal(e, testError);
	}
	equal(get(store), { isLoading: false, error: testError });
});

test.run();
