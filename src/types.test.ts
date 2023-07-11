import { equal } from 'uvu/assert';
import { test } from 'uvu';

import { Loaded, Loading, Loadable } from './types';

test('loading value typing', async () => {
	const value: Loadable<number> = { isLoading: true };

	equal(Loadable.isLoadable(value), true);

	equal(Loading.isLoading(value), true);

	equal(Loaded.isLoaded(value), false);
	equal(Loaded.isValue(value), false);
	equal(Loaded.isError(value), false);
});

test('loaded success value typing', async () => {
	const value: Loadable<number> = { isLoading: false, value: 1 };

	equal(Loadable.isLoadable(value), true);

	equal(Loading.isLoading(value), false);

	equal(Loaded.isLoaded(value), true);
	equal(Loaded.isValue(value), true);
	equal(Loaded.isError(value), false);
});

test('loaded error value typing', async () => {
	const value: Loadable<number> = { isLoading: false, error: {} };

	equal(Loadable.isLoadable(value), true);

	equal(Loading.isLoading(value), false);

	equal(Loaded.isLoaded(value), true);
	equal(Loaded.isValue(value), false);
	equal(Loaded.isError(value), true);
});

test.run();
