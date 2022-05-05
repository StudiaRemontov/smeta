import axios from '../../axios/index.js'

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
  },
  actions: {
    async fetchAll({ commit, state }) {
      if (state.contentLoaded) {
        return
      }
      try {
        commit('setContentLoaded', true)
        const response = await axios.get('/outlay')
        commit('setOutlays', response.data)
        return response
      } catch (error) {
        return Promise.reject(error)
      }
    },
    async create({ commit, dispatch }, payload) {
      try {
        const outlay = {
          ...payload,
          rooms: [],
        }
        const response = await axios.post('/outlay', outlay)
        commit('pushOutlay', response.data)
        dispatch('setOutlay', response.data, { root: true })
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
