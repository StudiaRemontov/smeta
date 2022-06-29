import Outlay from '../models/Outlay'
import axios from '../modules/axios'
import idb from '../store/local/idb'

const COLLECTION_NAME = 'outlays'

export default class OutlayService {
  static isOffline = false

  static mergeData(serverData, localData) {
    const mergedOutlays = [...serverData, ...localData]
    const grouped = mergedOutlays.reduce((acc, outlay) => {
      acc[outlay._id] = acc[outlay._id] || []
      acc[outlay._id].push(outlay)
      return acc
    }, {})
    return Object.values(grouped).map(outlays => {
      return outlays.reduce((acc, outlay) => {
        if (!acc) {
          return outlay
        }

        const removedTime = outlay.removedAt
          ? new Date(outlay.removedAt).getTime()
          : 0
        const timeA = new Date(outlay.updatedAt).getTime()
        const timeB = new Date(acc.updatedAt).getTime()
        if (removedTime > timeB) {
          return outlay
        }

        return timeA > timeB ? outlay : acc
      }, null)
    })
  }

  //сравниваю локальные и серверные данные.
  //метод возвразает объект с массивами: created, updated, removed.
  //В этих массивах сметы, которые нужно создать/изменить/удалить т.е. отправить запрос на бек.
  static getLocalDifference(server, local) {
    //созданные
    const created = local.filter(lo => {
      //те, что не удалены локально
      if (lo.removedAt) {
        return false
      }
      //и те, которых нету на сервере
      return !server.find(so => so._id === lo._id)
    })
    //измененные
    const updated = local.filter(lo => {
      const serverOutlay = server.find(so => so._id === lo._id)
      //те, то есть на севере
      if (!serverOutlay) {
        return false
      }
      const serverUpdatedAt = new Date(serverOutlay.updatedAt).getTime()
      const localUpdatedAt = new Date(lo.updatedAt).getTime()
      //если дата изменения локальной больше серверной, то она считается измененой
      return localUpdatedAt > serverUpdatedAt
    })
    //получаю все удаленный локальные сметы
    const removedOutlays = local.filter(lo => lo.removedAt)

    const removed = removedOutlays.filter(lo => {
      const serverOutlay = server.find(so => so._id === lo._id)
      //проверяю есть ли на сервере. Если нету, то запрос на сервер отправлять не нужно.
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

  static async create(name, edition) {
    try {
      const outlay = new Outlay(name, edition)
      if (OutlayService.isOffline) {
        await idb.saveDataInCollection(COLLECTION_NAME, outlay)
        return Promise.resolve({ data: outlay })
      }
      const response = await axios.post('/outlay', outlay)
      await idb.saveDataInCollection(COLLECTION_NAME, outlay)
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
        return Promise.resolve(outlay)
      }
      const response = await axios.delete(`/outlay/${outlay._id}`)
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
