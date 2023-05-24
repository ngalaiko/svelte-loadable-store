import type { Readable, StartStopNotifier } from 'svelte/store';
import type { Loadable } from './types';
import writable from './writable';

export default <T>(
	value?: T | Promise<T>,
	start: StartStopNotifier<T> = () => {}
): Readable<Loadable<T>> => writable(value, start);
