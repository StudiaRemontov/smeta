import axios from '../../modules/axios'
import idb from '../local/idb'

const mergeData = (local, server) => {
  return server.map(s => {
    const savedLocaly = local.find(l => l._id === s._id)
    if (savedLocaly) {
      return savedLocaly
    }
    return s
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
      await idb.saveOutlay(outlay)
    },
    removeById(state, id) {
      state.outlays = state.outlays.filter(o => o._id !== id)
    },
  },
  actions: {
    async fetchAll({ commit, state }) {
      if (state.contentLoaded) {
        return
      }
      const localOutlays = await idb.getOutlays()
      try {
        commit('setContentLoaded', true)
        const response = await axios.get('/outlay')
        const data =
          localOutlays.length > 0
            ? mergeData(localOutlays, response.data)
            : response.data
        commit('setOutlays', data)
        return response
      } catch (error) {
        return Promise.reject(error)
      }
    },
    async create({ commit, dispatch }, payload) {
      try {
        const outlay = {
          ...payload,
          sale: 0,
          active: false,
          rooms: [],
        }
        const response = await axios.post('/outlay', outlay)
        commit('pushOutlay', response.data)
        dispatch('outlay/setOutlay', response.data, { root: true })
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
        await idb.removeOutlay(id)
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
  },
  getters: {
    outlays: s => s.outlays,
  },
}
