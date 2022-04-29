import axios from '../../axios/index.js'

export default {
  namespaced: true,
  state: {
    contentLoaded: false,
    outlays: null,
  },
  mutations: {
    setContentLoaded(state, payload) {
      state.contentLoaded = payload
    },
    setOutlays(state, payload) {
      state.outlays = payload
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
  },
  getters: {
    outlays: s => s.outlays,
  },
}
