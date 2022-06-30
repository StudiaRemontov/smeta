import Outlay from '../models/Outlay'
import axios from '../modules/axios'
import idb from '../store/local/idb'
const COLLECTION_NAME = 'outlays'

export default class OutlayService {
  static isOffline = false

  static async getAll() {
    try {
      const localData = await idb.getCollectionData(COLLECTION_NAME)
      if (!OutlayService.isOffline) {
        const response = await axios.get('/outlay')
        return response.data
      }
      const notRemoved = localData.filter(o => !o.removedAt)
      return notRemoved
    } catch (error) {
      return Promise.reject(error)
    }
  }

  static async create(outlay) {
    try {
      const { name, edition, ...additionalData } = outlay
      const instance = new Outlay(name, edition)
      const data = {
        ...instance,
        ...additionalData,
      }
      if (OutlayService.isOffline) {
        await idb.saveDataInCollection(COLLECTION_NAME, data)
        return Promise.resolve({ data })
      }
      const response = await axios.post('/outlay', data)
      await idb.saveDataInCollection(COLLECTION_NAME, data)
      return response
    } catch (error) {
      return Promise.reject(error)
    }
  }

  static async update(outlay) {
    try {
      if (OutlayService.isOffline) {
        await idb.saveDataInCollection(COLLECTION_NAME, {
          ...outlay,
          updatedAt: new Date(),
        })
        return Promise.resolve({ data: outlay })
      }
      const { _id: id, ...data } = outlay
      const response = await axios.put(`/outlay/${id}`, data)
      await idb.saveDataInCollection(COLLECTION_NAME, response.data)
      return response
    } catch (error) {
      return Promise.reject(error)
    }
  }

  static async remove(outlay) {
    try {
      if (OutlayService.isOffline) {
        outlay.removedAt = new Date()
        await idb.saveDataInCollection(COLLECTION_NAME, outlay)
        return Promise.resolve({ data: outlay })
      }
      const response = await axios.put(`/outlay/${outlay._id}`, {
        ...outlay,
        removedAt: new Date(),
      })
      await idb.removeDataInCollection(COLLECTION_NAME, outlay._id)
      return response
    } catch (error) {
      return Promise.reject(error)
    }
  }

  static async createArray(array) {
    try {
      if (OutlayService.isOffline) {
        return
      }
      const response = await Promise.all(
        array.map(async data => {
          const response = await axios.post('/outlay', data)
          return response
        }),
      )
      return response
    } catch (error) {
      return Promise.reject(error)
    }
  }

  static async updateArray(array) {
    try {
      if (OutlayService.isOffline) {
        return
      }
      const response = await Promise.all(
        array.map(async data => {
          const response = await axios.put(`/outlay/${data._id}`, data)
          return response
        }),
      )
      return response
    } catch (error) {
      return Promise.reject(error)
    }
  }
}
