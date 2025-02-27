# PromisePlus

A class that extends the JavaScript `Promise` class with some custom utility method implementations.

## Utility Methods

### 1. PromisePlus.allShortCircuit()

#### Use Case

Let's say you are required to implement a function `areAdminUserIds()` that takes in an array of user IDs as the input and returns a `Promise` that must resolve with a boolean value denoting whether all of the users associated with the provided IDs are admins or not.

```JS
async function isAdminUserId(userId: number): Promise<boolean> {
  // query the database and return a promise that resolves to a boolean value
}

async function areAdminUserIds(userIds: number[]): Promise<boolean> {
  const promisesArr = userIds.map((userId) => isAdminUserId(userId));
  const results = await Promise.all(promisesArr);
  return results.every((result) => result === true);
}
```

For this, you create a helper function `isAdminUserId()` that takes in a single user ID, asynchronously performs queries on the database and returns a `Promise` that resolves with a boolean value denoting whether the user associated with the provided ID is an admin.

For your `areAdminUserIds()` function implementation, you first create an array of promises returned by calling the `isAdminUserId()` function and then process them concurrently.

You might want to make use of the `Promise.all()` method here. But the problem with that will be the fact that `Promise.all()` waits for all of the promises to resolve no matter what values they get resolved with, unless any of the promises gets rejected early.

Since we are implementing a function that requires all of the promises to resolve with `True` in order for itself to resolve with `True`, it would be efficient if we could somehow resolve early (kind of like exiting early) as soon as any of the promises gets resolved with `False`.

#### Introducing PromisePlus.allShortCircuit()

The `PromisePlus.allShortCircuit()` static method takes an array of promises as input and returns a single `Promise` which:

- resolves with an array of all the resolved values if the [short-circuit condition](#short-circuit-conditions) is not met by any resolved value **_(identical to how the `Promise.all()` method works)_**
- resolves with an array containing the first fulfilled promise that satisfies the [short-circuit condition](#short-circuit-conditions)
- rejects early with the first promise rejection in case any of the promises rejects.

#### Parameters

##### promises

- an array of `Promise` objects

##### shortCircuitDefiner

- a value or callback that defines the [short-circuit condition](#short-circuit-conditions) (if a callback is passed, it must return a boolean value)

#### Return value

- a `Promise` that resolves with either:
  - an array of all the fulfilled values
  - an array with the first resolved value that satifies the short circuit condition

#### Description

The `PromisePlus.allShortCircuit()` method is similar to the `Promise.all()` method. But it takes an additional `ShortCircuitDefiner` value as its second parameter. It can be a plain value or a callback function that returns a boolean value.

#### [Short-circuit conditions](#short-circuit-conditions)

The `PromisePlus.allShortCircuit()` value resolves early if:

- any of the values resolved from the `promises` array matches the `shortCircuitDefiner` value
- the `shortCircuitDefiner` callback function returns a `truthy` value while executing with any of the values resolved from the `promises` array

The cases above can be referred to as the `Short Circuit conditions`. If the short-circuit condition is not met, `PromisePlus.allShortCircuit()` behaves just like the `Promise.all()` method. The case for rejection is similar to the `Promise.all()` method as well.

##### Things to keep in mind

_It is important to note that the `PromisePlus.allShortCircuit()` method does not actually stop the execution of pending promises when the [short-circuit condition](#short-circuit-conditions) is met. It only `resolves` early, just like the `Promise.all()` and `Promise.race()` methods do._

#### Examples

##### Using a plain value as the `shortCircuitDefiner`

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

const TIMER_NAME = 'EXECUTION_TIME';
console.time(TIMER_NAME);
PromisePlus.allShortCircuit([promise1, promise2, promise3, promise4], true)
  .then((data) => {
    console.timeEnd(TIMER_NAME);
    console.log(data);
  })
  .catch((error) => {
    console.timeEnd(TIMER_NAME);
    console.error(error);
  });

/*
Output:
EXECUTION_TIME: 2.003s
[true]
*/
```

##### Using a callback function as the `shortCircuitDefiner`

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

const TIMER_NAME = 'EXECUTION_TIME';
console.time(TIMER_NAME);
PromisePlus.allShortCircuit<string>(
  [promise1, promise2, promise3, promise4],
  (value: string) => value === 'B',
)
  .then((data) => {
    console.timeEnd(TIMER_NAME);
    console.log(data);
  })
  .catch((error) => {
    console.timeEnd(TIMER_NAME);
    console.error(error);
  });

/*
Output:
EXECUTION_TIME: 3.003s
['B']
*/
```

#### Solution for our `areAdminUserIds()` function

##### Using `Promise.all()`:

```JS
const users = [
  { id: 1, name: 'Leohang', isAdmin: false },
  { id: 2, name: 'Milon', isAdmin: true },
  { id: 3, name: 'Shizen', isAdmin: true },
  { id: 4, name: 'Pica', isAdmin: false },
];

async function isAdminUserId(userId: number): Promise<boolean> {
  // simulating db query delay
  await new Promise((resolve) =>
    setTimeout(resolve, (Number(userId) || 2) * 1000),
  );
  return users.find((user) => user.id === userId)?.isAdmin ?? false;
}

async function areAdminUserIds(userIds: number[]): Promise<boolean> {
  const promisesArr = userIds.map((userId) => isAdminUserId(userId));
  const results = await Promise.all(promisesArr);
  return results.every((result) => result === true);
}

const TIMER_NAME = 'EXECUTION_TIME';
console.time(TIMER_NAME);
areAdminUserIds([1, 2, 3, 4])
  .then((data) => {
    console.timeEnd(TIMER_NAME);
    console.log(data);
  })
  .catch((error) => {
    console.timeEnd(TIMER_NAME);
    console.log(error);
  });

/*
Output:
EXECUTION_TIME: 4.003s
false
*/
```

##### Using `PromisePlus.allShortCircuit()`:

```JS
import { PromisePlus } from './promise-plus';

const users = [
  { id: 1, name: 'Leohang', isAdmin: false },
  { id: 2, name: 'Milon', isAdmin: true },
  { id: 3, name: 'Shizen', isAdmin: true },
  { id: 4, name: 'Pica', isAdmin: false },
];

async function isAdminUserId(userId: number): Promise<boolean> {
  // simulating db query delay
  await new Promise((resolve) =>
    setTimeout(resolve, (Number(userId) || 2) * 1000),
  );
  return users.find((user) => user.id === userId)?.isAdmin ?? false;
}

async function areAdminUserIds(userIds: number[]): Promise<boolean> {
  const promisesArr = userIds.map((userId) => isAdminUserId(userId));
  const results = await PromisePlus.allShortCircuit(promisesArr, false);
  return results.every((result) => result === true);
}

const TIMER_NAME = 'EXECUTION_TIME';
console.time(TIMER_NAME);
areAdminUserIds([1, 2, 3, 4])
  .then((data) => {
    console.timeEnd(TIMER_NAME);
    console.log(data);
  })
  .catch((error) => {
    console.timeEnd(TIMER_NAME);
    console.log(error);
  });

/*
Output:
EXECUTION_TIME: 1.004s
false
*/
```
