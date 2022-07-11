import axios from '../../modules/axios'
import idb from '../local/idb'

import OutlayService from '../../api/OutlayService'
import Outlay from '../../models/Outlay'

import { InputType } from '../../enum/InputType'
import getLocalDifference from '../../helpers/getLocalDifference'

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
    async fetchAll({ commit, state, rootGetters, dispatch }) {
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
        const outlay = rootGetters['outlay/outlay']
        if (outlay) {
          const newestOutlay = data.find(o => o._id === outlay._id)
          await dispatch('outlay/setOutlay', newestOutlay, { root: true })
        }
        await dispatch('syncData')
        commit('setContentLoaded', true)
        return Promise.resolve(data)
      } catch (error) {
        return Promise.reject(error)
      } finally {
        state.loading = false
      }
    },
    async syncData({ dispatch, state, rootGetters }) {
      try {
        const data = state.outlays
        const localData = await idb.getCollectionData('outlays')
        const startedAt = rootGetters['status/status']
        const diff = getLocalDifference(data, localData, startedAt)
        const { created, updated, removed } = diff
        await idb.setArrayToCollection('outlays', data)
        await Promise.all(
          created.map(async o => {
            return await dispatch('clone', o)
          }),
          updated.map(async o => {
            const { _id: id, ...data } = o
            return await dispatch('update', { id, data })
          }),
          removed.map(async o => {
            return await dispatch('removeLocal', o)
          }),
        )
      } catch (error) {
        return Promise.reject(error)
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
    async create({ commit, dispatch }, outlay) {
      try {
        const response = await OutlayService.create(outlay)
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
        commit('updateById', { id, data: response.data })
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
    getQuantityKey({ rootState, rootGetters }, outlay) {
      const { quantityKey } = rootState.outlay
      if (quantityKey) {
        return quantityKey
      }
      const edition = rootGetters['edition/editions'].find(
        e => e._id === outlay.edition,
      )
      const directory = rootGetters['directory/directories'].find(
        d => d._id === edition.dirId,
      )
      const key = directory.keys.find(k => k.type === InputType.QUANTITY)
      return key
    },
    async update({ commit, dispatch, rootGetters }, { id, data }) {
      try {
        const response = await OutlayService.update({ _id: id, ...data })
        commit('updateById', { id, data: response.data })
        const outlay = rootGetters['outlay/outlay']
        if (outlay && outlay._id === id) {
          await dispatch('outlay/setOutlay', response.data, { root: true })
        }
        return response
      } catch (error) {
        return Promise.reject(error)
      }
    },
  },
  getters: {
    outlays: s => {
      const { outlays } = s
      return outlays.filter(o => !o.removedAt)
    },
  },
}
