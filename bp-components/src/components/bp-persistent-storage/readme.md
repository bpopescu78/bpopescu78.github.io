# bp-persistent-storage



<!-- Auto Generated Below -->


## Properties

| Property      | Attribute     | Description                   | Type     | Default                           |
| ------------- | ------------- | ----------------------------- | -------- | --------------------------------- |
| `dbname`      | `dbname`      | The IndexedDB's database name | `string` | `'bp-persistent-storage-default'` |
| `dbstorename` | `dbstorename` | The database store name       | `string` | `'key-value-default'`             |
| `dbversion`   | `dbversion`   | The database version          | `number` | `1`                               |


## Methods

### `getKey(key: string) => Promise<object>`

Reads the `value` and `time` info for a given `key` from the database.
If the `key` does not exist, `value` and `time` will be undefined.

```ts
getKey(key: string)
   .then(resolveObject => ...)
   .catch(rejectObject => ...)
```
* resolves with an Object
   ```ts
   resolveObject: {
     key: string,
     value: Object,
     time: {
       received: number,
       saved: number
     }
   })
   ```
   where time holds the timestamps:
   - when the `setKey` request was received
   - when the `key` - `value` pair was saved in the database

   If the `key` is _not_ found in the database, the `Promise` will still be resolved, but the Object will look like
   ```ts
   resolveObject: {
     key: string,
     value: undefined,
     time: undefined
   })
   ```
* or rejects with an Object
   ```ts
   rejectObject: {
     key: string,
     error: Object
   })
   ```
   The rejection reason can be displayed using
   ```ts
   console.error(rejectObject.error)
   ```

#### Returns

Type: `Promise<object>`



### `setKey(key: string, value: object) => Promise<object>`

Writes the `key` - `value` pair in the database.
If the `key` already exists in the database, the new `value` will overwrite the existing `value`.

```ts
setKey(key: string, value: Object)
   .then(resolveObject => ...)
   .catch(rejectObject => ...)
```
* resolves with an Object
   ```ts
   resolveObject: {
     key: string,
     value: Object,
     time: {
       received: number,
       saved: number
     }
   })
   ```
   where time holds the timestamps:
   - when the `setKey` request was received
   - when the `key` - `value` pair was saved in the database
* or rejects with an Object
   ```ts
   rejectObject: {
     key: string,
     value: Object,
     error: Object
   })
   ```
   The rejection reason can be displayed using
   ```ts
   console.error(rejectObject.error)
   ```

#### Returns

Type: `Promise<object>`




----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
