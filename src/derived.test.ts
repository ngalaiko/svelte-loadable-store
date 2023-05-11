import { equal } from 'uvu/assert';
import { test } from 'uvu';

import derived from './derived';
import readable from './readable';
import { get } from 'svelte/store';

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

test.run();
