import Act from '../models/Act'
import axios from '../modules/axios'
import idb from '../store/local/idb'

const COLLECTION_NAME = 'acts'

export default class ActService {
  static isOffline = false

  static getLocalDifference(server, local) {
    const created = local.filter(lo => {
      if (lo.removedAt) {
        return false
      }
      return !server.find(so => so._id === lo._id)
    })

    const updated = local.filter(lo => {
      const serverOutlay = server.find(so => so._id === lo._id)
      if (!serverOutlay) {
        return false
      }
      const serverUpdatedAt = new Date(serverOutlay.updatedAt).getTime()
      const localUpdatedAt = new Date(lo.updatedAt).getTime()
      return localUpdatedAt > serverUpdatedAt
    })

    const removedOutlays = local.filter(lo => lo.removedAt)

    const removed = removedOutlays.filter(lo => {
      const serverOutlay = server.find(so => so._id === lo._id)
      if (!serverOutlay) {
        return false
      }
      const serverUpdatedAt = new Date(serverOutlay.updatedAt).getTime()
      const localRemovedAt = new Date(lo.removedAt).getTime()
      return localRemovedAt > serverUpdatedAt
    })

    return {
      created,
      updated,
      removed,
    }
  }

  static async getAll() {
    try {
      const localData = await idb.getCollectionData(COLLECTION_NAME)
      if (!ActService.isOffline) {
        const response = await axios.get('/act')
        return response.data
      }
      const notRemoved = localData.filter(o => !o.removedAt)
      return notRemoved
    } catch (error) {
      return Promise.reject(error)
    }
  }

  static async create(name, outlay) {
    const act = new Act(name, outlay)
    if (!ActService.isOffline) {
      const response = await axios.post('/act', act)
      return response
    }
    await idb.saveDataInCollection(COLLECTION_NAME, act)
    return Promise.resolve({ data: act })
  }

  static async update(act) {
    try {
      if (ActService.isOffline) {
        await idb.saveDataInCollection(COLLECTION_NAME, {
          ...act,
          updatedAt: new Date(),
        })
        return Promise.resolve({ data: act })
      }
      const { _id: id, ...data } = act
      const response = await axios.put(`/act/${id}`, data)
      await idb.saveDataInCollection(COLLECTION_NAME, response.data)
      return response
    } catch (error) {
      return Promise.reject(error)
    }
  }

  static async remove(act) {
    try {
      if (ActService.isOffline) {
        await idb.saveDataInCollection(COLLECTION_NAME, {
          ...act,
          removedAt: new Date(),
        })
        return Promise.resolve({ data: act })
      }
      const { _id: id } = act
      const response = await axios.delete(`/act/${id}`)
      await idb.removeDataInCollection(COLLECTION_NAME, id)
      return response
    } catch (error) {
      return Promise.reject(error)
    }
  }
}
