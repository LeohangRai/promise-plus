# Typescript Boilerplate

This repository serves as a boilerplate for starting new TypeScript projects. It provides a basic project setup and configurations to kickstart development quickly.

## Installation

```bash
$ pnpm install
```

## Running the application server

```bash
# production
$ pnpm start

# watch mode
$ pnpm start:dev
```

## PromisePlus Utility Methods

### 1. PromisePlus.allShortCircuit()

The `PromisePlus.allShortCircuit()` static method takes an array of promises as input and returns a single `Promise`. The returned promise resolves with an array containing the first fulfilled promise that satisfies the [short-circuit condition](#short-circuit-conditions), or resolves with an array of all the resolved values if the [short-circuit condition](#short-circuit-conditions) is not met by any resolved value. It rejects early with the first promise rejection in case any of the promises rejects.

#### Parameters

##### promises

- an array of `Promise` objects

##### shortCircuitDefiner

- a value or callback that defines the [short-circuit condition](#short-circuit-conditions) (if a callback is passed, it must return a boolean)

#### Return value

- a `Promise` that resolves with an array of all the fulfilled values or an array with the first resolved value that satifies the short circuit condition

#### Description

The `PromisePlus.allShortCircuit()` method is similar to the `Promise.all()` method. But it takes an additional `ShortCircuitDefiner` value as its second parameter. It can be a plain value or a callback function that returns a boolean value.

##### [Short-circuit conditions](#short-circuit-conditions)

The `PromisePlus.allShortCircuit()` value resolves early if:

- any of the values resolved from the `promises` array matches the `shortCircuitDefiner` value
- the `shortCircuitDefiner` callback function returns a `truthy` value while executing with any of the values resolved from the `promises` array

The cases above can be referred to as the `Short Circuit conditions`.
If the short-circuit condition is not met, `PromisePlus.allShortCircuit()` behaves just like the `Promise.all()` method. The case for rejection is similar to the `Promise.all()` method as well.

##### Things to keep in mind

_It is important to note that the `PromisePlus.allShortCircuit()` does not actually stop the execution of pending promises when the [short-circuit condition](#short-circuit-conditions) is met. It only `resolves` early, just like the `Promise.all()` and `Promise.race()` methods do._

#### Examples

`PromisePlus.allShortCircuit()` resolves early if a value resolved from the `promises` array becomes equal to the `shortCircuitDefiner` value

```JS
import { PromisePlus } from './promise-plus';

const promise1 = new Promise((resolve, _reject) => {
  setTimeout(() => {
    resolve(true);
  }, 2000);
});
const promise2 = new Promise((resolve, _reject) => {
  setTimeout(() => {
    resolve(true);
  }, 3000);
});
const promise3 = new Promise((resolve, _reject) => {
  setTimeout(() => {
    resolve(true);
  }, 4000);
});
const promise4 = new Promise((resolve, _reject) => {
  setTimeout(() => {
    resolve(true);
  }, 5000);
});

PromisePlus.allShortCircuit([promise1, promise2, promise3, promise4], true)
  .then(console.log)
  .catch(console.error);

// Output:
// [true]

```

`PromisePlus.allShortCircuit()` resolves early if the `shortCircuitDefiner` callback function returns a `truthy` value while being executed with the resolved value of any of the promises from the `promises` array

```JS
import { PromisePlus } from './promise-plus';

const promise1 = new Promise<string>((resolve, _reject) => {
  setTimeout(() => {
    resolve('A');
  }, 2000);
});
const promise2 = new Promise<string>((resolve, _reject) => {
  setTimeout(() => {
    resolve('B');
  }, 3000);
});
const promise3 = new Promise<string>((resolve, _reject) => {
  setTimeout(() => {
    resolve('C');
  }, 4000);
});
const promise4 = new Promise<string>((resolve, _reject) => {
  setTimeout(() => {
    resolve('D');
  }, 5000);
});

PromisePlus.allShortCircuit<string>(
  [promise1, promise2, promise3, promise4],
  (value: string) => value === 'B',
)
  .then(console.log)
  .catch(console.error);

// Output:
// [true]
```
