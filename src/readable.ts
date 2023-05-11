import type { Readable } from 'svelte/store';
import type { Loadable } from './types';
import writable, { type StartStopNotifier } from './writable';

export default <T>(
	value?: T | Promise<T>,
	start: StartStopNotifier<T> = () => {}
): Readable<Loadable<T>> => writable(value, start);
