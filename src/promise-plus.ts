type PromiseResolveFn<T> = (value: T | PromiseLike<T>) => void;
type PromiseRejectFn = (reason?: any) => void;
type PromiseExecutor<T> = (
  resolve: PromiseResolveFn<T>,
  reject: PromiseRejectFn,
) => void;
type ShortCircuitCallback<T> = (value: T) => boolean;

export class PromisePlus<T> extends Promise<T> {
  constructor(executor: PromiseExecutor<T>) {
    super((resolve, reject) => {
      return executor(resolve, reject);
    });
  }

  /**
   * A utility function that returns a boolean to represent whether the short-circuit condition has been met. If the 'shortCircuitDefiner' is a callback function, it executes the callback and returns a boolean equivalent of the result of the callback's execution. Otherwise, it returns a boolean to represent whether the current resolved value is equal to the 'shortCircuitDefiner' value.
   * @param currentResolvedValue
   * @param shortCircuitDefiner a value or callback that defines the short-circuit condition (if a callback is passed, it must return a boolean)
   * @returns boolean
   */
  private static isShortCircuitConditionFulfilled<T>(
    currentResolvedValue: T,
    shortCircuitDefiner: T | ShortCircuitCallback<T>,
  ): boolean {
    if (typeof shortCircuitDefiner === 'function') {
      return !!(shortCircuitDefiner as ShortCircuitCallback<T>)(
        currentResolvedValue,
      );
    }
    return currentResolvedValue === shortCircuitDefiner;
  }

  /**
   * An extension to the Promise.all() method. This method executes multiple promises and resolves with an array containing the first fulfilled promise that satisfies the short-circuit condition, or resolves with an array of all the resolved values if no short-circuit condition is met. Rejects early with the first promise rejection in case any of the promises rejects.
   * @param promises an array of promise objects
   * @param shortCircuitDefiner a value or callback that defines the short-circuit condition (if a callback is passed, it must return a boolean)
   * @returns a promise that resolves with an array of all the fulfilled values or an array with the first resolved value that satifies the short circuit condition
   */
  static allShortCircuit<T>(
    promises: Promise<T>[],
    shortCircuitDefiner: T | ShortCircuitCallback<T>,
  ): Promise<T[]> {
    return new Promise((resolve, reject) => {
      if (!promises?.length) {
        resolve([]);
        return;
      }
      const resolvedValues: T[] = [];
      let resolvedPromisesCount = 0;
      let isShortCircuited = false;
      promises.forEach((promise, index) => {
        if (isShortCircuited) return;
        this.resolve(promise)
          .then((value) => {
            if (isShortCircuited) return;
            if (
              this.isShortCircuitConditionFulfilled<T>(
                value,
                shortCircuitDefiner,
              )
            ) {
              isShortCircuited = true;
              resolve([value]);
              return;
            }
            resolvedValues[index] = value;
            resolvedPromisesCount++;
            if (resolvedPromisesCount === promises.length) {
              resolve(resolvedValues);
            }
          })
          .catch((err: Error) => {
            if (!isShortCircuited) {
              isShortCircuited = true;
              reject(err);
            }
          });
      });
    });
  }
}
