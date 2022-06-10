import collections from './collections'

const DB_NAME = 'outlay'
const DB_VERSION = 1
let DB = null

const dbCollections = Object.keys(collections)

export default {
  async getDb() {
    return new Promise((resolve, reject) => {
      if (DB) {
        return resolve(DB)
      }
      const request = indexedDB.open(DB_NAME, DB_VERSION)

      request.onerror = e => {
        console.log('Error opening db', e)
        reject('Error')
      }

      request.onsuccess = e => {
        DB = e.target.result
        resolve(DB)
      }

      request.onupgradeneeded = e => {
        console.log('onupgradeneeded')
        const db = e.target.result
        dbCollections.forEach(colName => {
          db.createObjectStore(colName, { keyPath: '_id' })
        })
      }
    })
  },
  async getCollectionData(collection) {
    const db = await this.getDb(collection)
    return new Promise(resolve => {
      const trans = db.transaction([collection], 'readonly')
      const store = trans.objectStore(collection)
      const docs = []
      trans.oncomplete = () => {
        resolve(docs)
      }

      store.openCursor().onsuccess = e => {
        const cursor = e.target.result
        if (cursor) {
          docs.push(cursor.value)
          cursor.continue()
        }
      }
    })
  },
  async saveDataInCollection(collection, payload) {
    const db = await this.getDb(collection)
    return new Promise(resolve => {
      const trans = db.transaction([collection], 'readwrite')

      trans.oncomplete = () => {
        resolve()
      }

      const store = trans.objectStore(collection)
      const data = JSON.parse(JSON.stringify(payload))
      store.put(data)
    })
  },
  async removeDataInCollection(collection, id) {
    const db = await this.getDb(collection)
    return new Promise(resolve => {
      const trans = db.transaction([collection], 'readwrite')

      trans.oncomplete = () => {
        resolve()
      }

      const store = trans.objectStore(collection)
      store.delete(id)
    })
  },

  async clearCollection(collection) {
    const db = await this.getDb(collection)

    return new Promise(resolve => {
      const trans = db.transaction([collection], 'readwrite')

      trans.oncomplete = () => {
        resolve()
      }

      const store = trans.objectStore(collection)
      store.clear()
    })
  },

  async setArrayToCollection(collection, array) {
    await this.clearCollection(collection)
    return await Promise.all(
      array.map(async item => {
        const data = await JSON.parse(JSON.stringify(item))
        return await this.saveDataInCollection(collection, data)
      }),
    )
  },
}
