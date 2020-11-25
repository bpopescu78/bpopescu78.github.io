# bp-service



<!-- Auto Generated Below -->


## Methods

### `getLastQueued(queueName: string) => Promise<object>`

Obtains the last element emitted in `queueName`.

Returns a `Promise` that always resolves to an `object` except if the queue does not exist or no value was emitted yet, in which case it resolves to `undefined`.

#### Returns

Type: `Promise<object>`



### `publishToQueue(queueName: string, content: any) => Promise<Array<object>>`

Publish content to `queueName`.

`content` can be of any type but if `content` is of type `Array`, its elements will be sent to the queue as distinct values.
For example:
```ts
publishToQueue('my-queue-name', [1, 4, 5])
```
will emit 3 values on the `my-queue-name` in the array order: `1`, `3` and `5`.

If the actual data we want to emit as a single value is the array `[1, 4, 5]`, then it needs to be escaped inside an additional array:
```ts
publishToQueue('my-queue-name', [[1, 4, 5]])
```

It is a good practice to always send the value to be emitted inside an array in order to avoid checking the data types:
```ts
publishToQueue('my-queue-name', [{key: 345}])
publishToQueue('my-queue-name', [3])
publishToQueue('my-queue-name', ['Hello world!'])
publishToQueue('my-queue-name', [[1, 4, 5]])
```

#### Returns

Type: `Promise<object[]>`



### `subscribeToQueue(queueName: string, callBackFunction: (queueValue: object) => void) => Promise<boolean>`

Subscribes a `callBackFunction` to `queueName`. If the queue does not exist yet, it is created.

#### Returns

Type: `Promise<boolean>`



### `unsubscribeToQueue(queueName: string, callBackFunction: (queueValue: object) => void) => Promise<boolean>`

Unsubscribes from `queueName`.

#### Returns

Type: `Promise<boolean>`




----------------------------------------------

(c)2020 Bogdan Popescu
