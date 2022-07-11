import axios from '../../modules/axios'

export default {
  namespaced: true,
  state: {
    status: null,
    contentLoaded: false,
  },
  mutations: {
    setStatus(state, payload) {
      state.status = payload
    },
    setContentLoaded(state, payload) {
      state.contentLoaded = payload
    },
  },
  actions: {
    async getStatus({ state, commit, rootState }) {
      if (state.contentLoaded || rootState.isOffline) {
        return
      }
      try {
        const response = await axios.get('/status')
        commit('setStatus', response.data)
        commit('setContentLoaded', true)
        return response
      } catch (error) {
        return Promise.reject(error)
      }
    },
  },
  getters: {
    status: s => {
      const { status } = s
      return status && status.startedAt
    },
  },
}
