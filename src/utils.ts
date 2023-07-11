import type { Readable } from 'svelte/store';
import { type Loadable, Loading, Loaded } from './types';

export const promisify = async <T>(store: Readable<Loadable<T>>) => {
	let unsubscribe: () => void;
	return new Promise<T>((resovle, reject) => {
		unsubscribe = store.subscribe((value) => {
			if (Loading.isLoading(value)) return;
			if (Loaded.isError(value)) {
				reject(value.error);
			} else {
				resovle(value.value);
			}
		});
	}).finally(() => unsubscribe());
};
