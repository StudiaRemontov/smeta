import axios from '../../modules/axios'
import idb from '../local/idb'
import { generateMongoId } from '@/helpers/generateMongoId'

const mergeData = (serverData, localData) => {
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
      const timeA = new Date(outlay.updatedAt).getTime()
      const timeB = new Date(acc.updatedAt).getTime()
      return timeA > timeB ? outlay : acc
    }, null)
  })
}

export default {
  namespaced: true,
  state: {
    contentLoaded: false,
    outlays: [],
  },
  mutations: {
    setContentLoaded(state, payload) {
      state.contentLoaded = payload
    },
    setOutlays(state, payload) {
      state.outlays = payload
    },
    pushOutlay(state, payload) {
      state.outlays.push(payload)
    },
    updateById(state, { id, data }) {
      state.outlays = state.outlays.map(o => {
        if (o._id === id) {
          return data
        }
        return o
      })
    },
    async updateField(state, { id, key, value }) {
      const outlay = state.outlays.find(o => o._id === id)
      outlay[key] = value
      await idb.saveDataInCollection('outlays', outlay)
    },
    removeById(state, id) {
      state.outlays = state.outlays.filter(o => o._id !== id)
    },
  },
  actions: {
    async fetchAll({ commit, state, rootGetters }) {
      if (state.contentLoaded) {
        return
      }
      const { isOffline } = rootGetters

      try {
        const localOutlays = await idb.getCollectionData('outlays')
        if (isOffline) {
          commit('setOutlays', localOutlays)
          commit('setContentLoaded', true)
          return Promise.resolve(localOutlays)
        }
        const response = await axios.get('/outlay')
        const merged = mergeData(response.data, localOutlays)
        commit('setOutlays', merged)
        await idb.setArrayToCollection('outlays', merged)
        return response
      } catch (error) {
        return Promise.reject(error)
      }
    },
    async uploadFromServer({ state, rootGetters, commit, dispatch }) {
      const { isOffline } = rootGetters
      if (isOffline) return
      try {
        const response = await axios.get('/outlay')
        const localData = state.outlays
        const merged = mergeData(response.data, localData)
        commit('setOutlays', merged)
        await idb.setArrayToCollection('outlays', merged)
        const newest = merged.filter(o => o.local)
        await dispatch('saveArray', newest)
        return response
      } catch (error) {
        return Promise.reject(error)
      }
    },
    async saveArray({ commit }, array) {
      try {
        return Promise.all(
          array.map(async data => {
            const response = await axios.post('/outlay', data)
            commit('updateById', { id: response._id, data: response.data })
            return response
          }),
        )
      } catch (error) {
        return Promise.reject(error)
      }
    },
    async create({ commit, dispatch, rootGetters }, payload) {
      const { isOffline } = rootGetters
      try {
        if (isOffline) {
          const currentDate = new Date()
          const newData = {
            ...payload,
            active: false,
            _id: generateMongoId(),
            local: true,
            rooms: [],
            createdAt: currentDate,
            updatedAt: currentDate,
            sale: 0,
          }
          commit('pushOutlay', newData)
          await idb.saveDataInCollection('outlays', newData)
          await dispatch('outlay/setOutlay', newData, { root: true })
          return Promise.resolve()
        }
        const response = await axios.post('/outlay', payload)
        commit('pushOutlay', response.data)
        dispatch('outlay/setOutlay', response.data, { root: true })
        await idb.saveDataInCollection('outlays', response.data)
        return response
      } catch (error) {
        return Promise.reject(error)
      }
    },
    async remove({ commit, dispatch, rootGetters }, id) {
      try {
        const response = await axios.delete(`/outlay/${id}`)
        if (rootGetters['outlay/outlay']?._id === id) {
          dispatch('outlay/setOutlay', null, { root: true })
        }
        commit('removeById', id)
        await idb.removeDataInCollection('outlays', id)
        return response
      } catch (error) {
        return Promise.reject(error)
      }
    },
    async setActive({ commit }, id) {
      try {
        const response = await axios.patch(`/outlay/${id}/active`)
        const { updated } = response.data
        updated.forEach(o =>
          commit('updateField', { id: o._id, key: 'active', value: o.active }),
        )
        return response
      } catch (error) {
        return Promise.reject(error)
      }
    },
    async print(_, id) {
      try {
        if (!id) {
          throw 'id is required'
        }
        const response = await axios.post(`/outlay/pdf/${id}`, {
          domain: window.location.origin,
        })
        return response
      } catch (error) {
        return Promise.reject(error)
      }
    },
    async update({ commit }, { id, data }) {
      try {
        const response = await axios.put(`/outlay/${id}`, data)
        commit('updateById', { id, data: response.data })
        await idb.removeDataInCollection('outlays', id)
        return response
      } catch (error) {
        return Promise.reject(error)
      }
    },
  },
  getters: {
    outlays: s => s.outlays,
  },
}
