import { Component, Method, Prop } from '@stencil/core'

@Component({
  tag: 'bp-persistent-storage',
  shadow: false,
})
export class BpPersistentStorage {

  /**
   * The IndexedDB's database name
   */
  @Prop({ attribute: 'dbname' }) DB_NAME = 'bp-persistent-storage-default'

  /**
   * The database version
   */
  @Prop({ attribute: 'dbversion' }) DB_VERSION = 1

  /**
   * The database store name
   */
  @Prop({ attribute: 'dbstorename' }) DB_STORE_NAME = 'key-value-default'

  /**
   * Writes the `key` - `value` pair in the database.
   * If the `key` already exists in the database, the new `value` will overwrite the existing `value`.
   *
   * ```ts
   * setKey(key: string, value: Object)
   *   .then(resolveObject => ...)
   *   .catch(rejectObject => ...)
   * ```
   * * resolves with an Object
   *   ```ts
   *   resolveObject: {
   *     key: string,
   *     value: Object,
   *     time: {
   *       received: number,
   *       saved: number
   *     }
   *   })
   *   ```
   *   where time holds the timestamps:
   *   - when the `setKey` request was received
   *   - when the `key` - `value` pair was saved in the database
   * * or rejects with an Object
   *   ```ts
   *   rejectObject: {
   *     key: string,
   *     value: Object,
   *     error: Object
   *   })
   *   ```
   *   The rejection reason can be displayed using
   *   ```ts
   *   console.error(rejectObject.error)
   *   ```
   */
  @Method()
  async setKey(key: string, value: object): Promise<object> {
    // set a time object related to the save process - when the data was received, when was it saved
    const time = {
      received: +new Date(),
      saved: undefined
    }

    return new Promise((resolve, reject) => {
      this.getObjectStore(this.DB_STORE_NAME, 'readwrite')
        .then(objectStore => {

          time.saved = +new Date()

          const request = objectStore.put({
            key,
            value,
            time
          })

          request.onerror = error => {throw error}
          request.onsuccess = () => resolve({
            key,
            value,
            time
          })
        })
        .catch(error => {
          reject({
            key,
            value,
            error
          })
        })
    })
  }

  /**
   * Reads the `value` and `time` info for a given `key` from the database.
   * If the `key` does not exist, `value` and `time` will be undefined.
   *
   * ```ts
   * getKey(key: string)
   *   .then(resolveObject => ...)
   *   .catch(rejectObject => ...)
   * ```
   * * resolves with an Object
   *   ```ts
   *   resolveObject: {
   *     key: string,
   *     value: Object,
   *     time: {
   *       received: number,
   *       saved: number
   *     }
   *   })
   *   ```
   *   where time holds the timestamps:
   *   - when the `setKey` request was received
   *   - when the `key` - `value` pair was saved in the database
   *
   *   If the `key` is _not_ found in the database, the `Promise` will still be resolved, but the Object will look like
   *   ```ts
   *   resolveObject: {
   *     key: string,
   *     value: undefined,
   *     time: undefined
   *   })
   *   ```
   * * or rejects with an Object
   *   ```ts
   *   rejectObject: {
   *     key: string,
   *     error: Object
   *   })
   *   ```
   *   The rejection reason can be displayed using
   *   ```ts
   *   console.error(rejectObject.error)
   *   ```
   */
  @Method()
  async getKey(key: string): Promise<object> {
    return new Promise((resolve, reject) => {
      this.getObjectStore(this.DB_STORE_NAME, 'readonly')
        .then(objectStore => {
          const request = objectStore.get(key)
          request.onerror = event => {throw event}
          request.onsuccess = () => resolve({
            key,
            value: undefined,
            time: undefined,
            ...request.result
          })
        })
        .catch(error => reject({
          key,
          error
        }))
    })
  }

  private db: IDBDatabase = null
  private openDb() {
    return new Promise((resolve: (value?: IDBDatabase) => void, reject: (reason: any) => void) => {
      if (this.db) {
        return resolve(this.db)
      }

      const req = indexedDB.open(this.DB_NAME, this.DB_VERSION);
      req.onsuccess = () => {
        this.db = req.result
        // console.log("openDb DONE", this.db)
        resolve(this.db)
      }

      req.onerror = (evt) => {
        const target: any = evt.target
        reject(target.errorCode)
      }

      req.onupgradeneeded = (evt) => {
        // console.log("openDb.onupgradeneeded")
        const target: any = evt.currentTarget
        target.result.createObjectStore(
          this.DB_STORE_NAME, { keyPath: 'key', autoIncrement: false })
      }
    })
  }

  /**
   * @paramètre {string}(chaîne de caractères) store_name
   * @paramètre {string}(chaîne de caractères) mode either "readonly" ou "readwrite"
   */
  private getObjectStore(store_name, mode) {
    return new Promise((resolve: (value: IDBObjectStore) => void, reject: (reason: any) => void) =>
      this.openDb()
        .then(db => {
          const tx = db.transaction(store_name, mode)
          resolve(tx.objectStore(store_name))
        })
        .catch(error => {
          reject(error)
        })
    )
  }

  componentWillLoad() {
    this.openDb()
      .catch(error => console.error(`openDb [${this.DB_NAME}/${this.DB_VERSION}/${this.DB_STORE_NAME}]:`, error))
  }

  render() {
    return null
  }
}
