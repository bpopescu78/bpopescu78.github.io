import { r as registerInstance, h } from './index-8ac4ad20.js';

const BpPersistentStorage = class {
  constructor(hostRef) {
    registerInstance(this, hostRef);
    /**
     * The IndexedDB's database name
     */
    this.DB_NAME = 'bp-persistent-storage-default';
    /**
     * The database version
     */
    this.DB_VERSION = 1;
    /**
     * The database store name
     */
    this.DB_STORE_NAME = 'key-value-default';
    this.db = null;
  }
  /**
   * Writes the `key` - `value` pair in the database.
   *
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
  async setKey(key, value) {
    // set a time object related to the save process - when the data was received, when was it saved
    const time = {
      received: +new Date(),
      saved: undefined
    };
    return new Promise((resolve, reject) => {
      this.getObjectStore(this.DB_STORE_NAME, 'readwrite')
        .then(objectStore => {
        time.saved = +new Date();
        const request = objectStore.put({
          key,
          value,
          time
        });
        request.onerror = error => { throw error; };
        request.onsuccess = () => resolve({
          key,
          value,
          time
        });
      })
        .catch(error => {
        reject({
          key,
          value,
          error
        });
      });
    });
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
  async getKey(key) {
    return new Promise((resolve, reject) => {
      this.getObjectStore(this.DB_STORE_NAME, 'readonly')
        .then(objectStore => {
        const request = objectStore.get(key);
        request.onerror = event => { throw event; };
        request.onsuccess = () => resolve(Object.assign({ key, value: undefined, time: undefined }, request.result));
      })
        .catch(error => reject({
        key,
        error
      }));
    });
  }
  openDb() {
    return new Promise((resolve, reject) => {
      if (this.db) {
        return resolve(this.db);
      }
      const req = indexedDB.open(this.DB_NAME, this.DB_VERSION);
      req.onsuccess = () => {
        this.db = req.result;
        // console.log("openDb DONE", this.db)
        resolve(this.db);
      };
      req.onerror = (evt) => {
        const target = evt.target;
        reject(target.errorCode);
      };
      req.onupgradeneeded = (evt) => {
        // console.log("openDb.onupgradeneeded")
        const target = evt.currentTarget;
        target.result.createObjectStore(this.DB_STORE_NAME, { keyPath: 'key', autoIncrement: false });
      };
    });
  }
  /**
   * @param {string} store_name
   * @param {string} mode either "readonly" ou "readwrite"
   */
  getObjectStore(store_name, mode) {
    return new Promise((resolve, reject) => this.openDb()
      .then(db => {
      const tx = db.transaction(store_name, mode);
      resolve(tx.objectStore(store_name));
    })
      .catch(error => {
      reject(error);
    }));
  }
  componentWillLoad() {
    this.openDb()
      .catch(error => console.error(`openDb [${this.DB_NAME}/${this.DB_VERSION}/${this.DB_STORE_NAME}]:`, error));
  }
  render() {
    // only render the inner content
    return h("slot", null);
  }
};

export { BpPersistentStorage as bp_persistent_storage };
