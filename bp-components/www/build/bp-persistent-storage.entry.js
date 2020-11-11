import { r as registerInstance } from './index-c8e98dd6.js';

const BpPersistentStorage = class {
  constructor(hostRef) {
    registerInstance(this, hostRef);
    this.dbname = 'bp-persistent-storage-default';
    this.dbversion = 1;
    this.dbstorename = 'key-value-default';
    this.db = null;
  }
  async setKey(key, value) {
    // set a time object related to the save process - when the data was received, when was it saved
    const time = {
      received: +new Date(),
      saved: undefined
    };
    return new Promise((resolve, reject) => {
      this.getObjectStore(this.dbstorename, 'readwrite')
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
  async getKey(key) {
    return new Promise((resolve, reject) => {
      this.getObjectStore(this.dbstorename, 'readonly')
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
      const req = indexedDB.open(this.dbname, this.dbversion);
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
        target.result.createObjectStore(this.dbstorename, { keyPath: 'key', autoIncrement: false });
      };
    });
  }
  /**
   * @paramètre {string}(chaîne de caractères) store_name
   * @paramètre {string}(chaîne de caractères) mode either "readonly" ou "readwrite"
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
      .catch(error => console.error(`openDb [${this.dbname}/${this.dbversion}/${this.dbstorename}]:`, error));
  }
  render() {
    return null;
  }
};

export { BpPersistentStorage as bp_persistent_storage };
