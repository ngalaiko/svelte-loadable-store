import type { Readable } from 'svelte/store';
import { type Loadable, Loading, Value } from './types';

export const promisify = async <T>(store: Readable<Loadable<T>>) => {
	let unsubscribe: () => void;
	return new Promise<T>((resovle, reject) => {
		unsubscribe = store.subscribe((value) => {
			if (Loading.isLoading(value)) return;
			if (Value.isError(value.value)) {
				reject(value.value);
			} else {
				resovle(value.value);
			}
		});
	}).finally(() => unsubscribe());
};
