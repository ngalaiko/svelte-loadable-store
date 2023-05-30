import type { Readable } from 'svelte/store';
import { type Loadable, Loading, Value } from './types';

export const promisify = <T>(store: Readable<Loadable<T>>): Promise<T> =>
	new Promise((resovle, reject) => {
		const unsubscribe = store.subscribe((value) => {
			if (Loading.isLoading(value)) return;
			if (Value.isError(value.value)) {
				reject(value.value);
				unsubscribe();
			} else {
				resovle(value.value);
				unsubscribe();
			}
		});
	});
