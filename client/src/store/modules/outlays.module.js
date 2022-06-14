import axios from '../../modules/axios'
import idb from '../local/idb'

import OutlayService from '../../api/OutlayService'
import Outlay from '../../models/Outlay'

export default {
  namespaced: true,
  state: {
    contentLoaded: false,
    outlays: [],
    loading: false,
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
    async fetchAll({ commit, state, dispatch, rootGetters }) {
      if (state.contentLoaded || state.loading) {
        return
      }
      state.loading = true
      const { isOffline } = rootGetters

      try {
        const data = await OutlayService.getAll()
        if (isOffline) {
          commit('setOutlays', data)
          commit('setContentLoaded', true)
          return Promise.resolve(data)
        }
        commit('setOutlays', data)
        const localData = await idb.getCollectionData('outlays')
        const diff = OutlayService.getLocalDifference(data, localData)
        const { created, updated, removed } = diff
        await idb.setArrayToCollection('outlays', data)
        await Promise.all(
          created.map(async o => {
            return await dispatch('clone', o)
          }),
        )
        await Promise.all(
          updated.map(async o => {
            const { _id: id, ...data } = o
            return await dispatch('update', { id, data })
          }),
        )
        await Promise.all(
          removed.map(async o => {
            return await dispatch('removeLocal', o)
          }),
        )
        commit('setContentLoaded', true)
        return Promise.resolve(data)
      } catch (error) {
        return Promise.reject(error)
      } finally {
        state.loading = false
      }
    },
    async uploadFromServer({ rootGetters, commit, dispatch }) {
      const { isOffline } = rootGetters
      if (isOffline) return
      try {
        commit('setContentLoaded', false)
        const response = await dispatch('fetchAll')
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
    async create({ commit, dispatch }, { name, edition }) {
      try {
        const response = await OutlayService.create(name, edition)
        commit('pushOutlay', response.data)
        await dispatch('outlay/setOutlay', response.data, { root: true })
        await idb.saveDataInCollection('outlays', response.data)
        return response
      } catch (error) {
        return Promise.reject(error)
      }
    },
    async clone({ dispatch }, cloningOutlay) {
      try {
        const clone = Outlay.getClone(cloningOutlay)
        const response = await dispatch('create', clone)

        return response
      } catch (error) {
        return Promise.reject(error)
      }
    },
    async remove({ state, commit, dispatch, rootGetters }, id) {
      try {
        const { outlays } = state
        const outlay = outlays.find(o => o._id === id)
        if (!outlay) {
          throw new Error('Outlay not found')
        }
        const response = await OutlayService.remove(outlay)
        if (rootGetters['outlay/outlay']?._id === id) {
          dispatch('outlay/setOutlay', null, { root: true })
        }
        commit('removeById', id)
        return response
      } catch (error) {
        return Promise.reject(error)
      }
    },
    async removeLocal({ commit }, outlay) {
      try {
        const response = await OutlayService.remove(outlay)
        commit('removeById', outlay._id)
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
          throw new Error('id is required')
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
        const response = await OutlayService.update({ _id: id, ...data })
        commit('updateById', { id, data: response.data })
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
