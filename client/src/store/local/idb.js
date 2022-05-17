const DB_NAME = 'outlay'
const DB_VERSION = 1
let DB = null

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
        db.createObjectStore('outlays', { keyPath: '_id' })
      }
    })
  },
  async getOutlays() {
    const db = await this.getDb()

    return new Promise(resolve => {
      const trans = db.transaction(['outlays'], 'readonly')
      const store = trans.objectStore('outlays')
      const outlays = []
      trans.oncomplete = () => {
        resolve(outlays)
      }

      store.openCursor().onsuccess = e => {
        const cursor = e.target.result
        if (cursor) {
          outlays.push(cursor.value)
          cursor.continue()
        }
      }
    })
  },
  async saveOutlay(outlay) {
    const db = await this.getDb()

    return new Promise(resolve => {
      const trans = db.transaction(['outlays'], 'readwrite')

      trans.oncomplete = () => {
        resolve()
      }

      const store = trans.objectStore('outlays')
      const data = JSON.parse(JSON.stringify(outlay))
      store.put(data)
    })
  },
  async removeOutlay(id) {
    const db = await this.getDb()
    return new Promise(resolve => {
      const trans = db.transaction(['outlays'], 'readwrite')

      trans.oncomplete = () => {
        resolve()
      }

      const store = trans.objectStore('outlays')
      store.delete(id)
    })
  },
}
