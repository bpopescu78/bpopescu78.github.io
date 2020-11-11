import { Component, Method, Prop } from '@stencil/core'

@Component({
  tag: 'bp-persistent-storage',
  shadow: false,
})
export class BpPersistentStorage {

  @Prop() dbname = 'bp-persistent-storage-default'
  @Prop() dbversion = 1
  @Prop() dbstorename = 'key-value-default'

  @Method()
  async setKey(key: string, value: object): Promise<object> {
    // set a time object related to the save process - when the data was received, when was it saved
    const time = {
      received: +new Date(),
      saved: undefined
    }

    return new Promise<object>((resolve, reject) => {
      this.getObjectStore(this.dbstorename, 'readwrite')
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

  @Method()
  async getKey(key: string): Promise<object> {
    return new Promise<object>((resolve, reject) => {
      this.getObjectStore(this.dbstorename, 'readonly')
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

      const req = indexedDB.open(this.dbname, this.dbversion);
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
          this.dbstorename, { keyPath: 'key', autoIncrement: false })
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
      .catch(error => console.error(`openDb [${this.dbname}/${this.dbversion}/${this.dbstorename}]:`, error))
  }

  render() {
    return null
  }
}
