# Svelte Loadable Store

[![npm](https://img.shields.io/npm/v/svelte-loadable-store)](https://www.npmjs.com/package/svelte-loadable-store)
[![license](https://img.shields.io/github/license/ngalaiko/svelte-loadable-store)](https://raw.githubusercontent.com/ngalaiko/svelte-loadable-store/master/LICENSE)
[![test](https://github.com/ngalaiko/svelte-loadable-store/actions/workflows/test.yaml/badge.svg)](https://github.com/ngalaiko/svelte-loadable-store/actions/workflows/test.yaml)

This library provides a set of utility functions for creating and working with asynchronously populated stores in Svelte.
It offers a way to manage store states during asynchronous operations and enables easy composition of derived stores.

## Installation

You can install the library using your preferred package manager:

```bash
pnpm add svelte-loadable-store
```

## Usage

### `writable(value?: T | Promise<T>, startStopNotifier?: StartStopNotifier<T>)`

The `writable` function creates a writable store that can be populated asynchronously. It accepts two optional parameters:

- `value` (optional): The initial value or a promise that resolves to the initial value of the store.
- `startStopNotifier` (optional): A function that will be called when the store is subscribed to. This can be used to start and stop a subscription to WebSocket events or other asynchronous processes.

Example usage:

```typescript
import { writable } from 'svelte-loadable-store';

const start = performance.now();

const delay = (timeout: number) =>
  new Promise<number>((resolve) => setTimeout(() => resolve(performance.now() - start), timeout));

const startNotifier = (set: Subscriber<number>) => {
  delay(200).then((value) => set(value));
};

const store = writable(delay(100), startNotifier);

store.subscribe(console.log);

/*
 * prints:
 * { isLoading: true }
 * { isLoading: false, value: 101 }
 * { isLoading: false, value: 201 }
 */
```

### `derived<S extends Stores<any>, T>(stores: S, fn: (values: StoresValues<S>) => T)`

The `derived` function creates a derived store that depends on other asynchronously populated stores. It accepts two parameters:

- `stores`: A single store or an array of stores that the derived store depends on.
- `fn`: A function that receives the resolved values of the dependent stores and returns the derived value.

Example usage:

```typescript
const start = performance.now();

const delay = (timeout: number) =>
  new Promise<number>((resolve) => setTimeout(() => resolve(performance.now() - start), timeout));

const first = writable(delay(100));
const second = writable(delay(200));
const third = derived([first, second], ([first, second]) => first + second);

first.subscribe((v) => console.log('first', v));
second.subscribe((v) => console.log('second', v));
third.subscribe((v) => console.log('third', v));

/*
 * prints:
 * first { isLoading: true }
 * second { isLoading: true }
 * third { isLoading: true }
 * first { isLoading: false, value: 101 }
 * second { isLoading: false, value: 201 }
 * third { isLoading: false, value: 302 }
 */
```

### `readable<T>(value?: T | Promise<T>, startStopNotifier?: StartStopNotifier<T>)`

The `readable` function is an alias for `writable` and provides a consistent interface when creating readable stores. It accepts the same parameters as `writable`.

## Contribution

Contributions to this library are welcome! If you find any issues or have suggestions for improvements, please feel free to submit a pull request or create an issue in the GitHub repository.

## License

This library is released under the [MIT License](https://raw.githubusercontent.com/ngalaiko/svelte-loadable-store/master/LICENSE).
