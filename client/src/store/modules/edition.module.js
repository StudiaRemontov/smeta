import axios from '../../axios/index.js'

export default {
  namespaced: true,
  state: {
    editions: [],
    contentLoaded: false,
    clonedDirectories: [],
  },
  mutations: {
    setEditions(state, payload) {
      state.editions = payload
    },
    setContentLoaded(state, payload) {
      state.contentLoaded = payload
    },
    setClonedDirectories(state, payload) {
      state.clonedDirectories = JSON.parse(JSON.stringify(payload))
    },
  },
  actions: {
    async fetchAll({ state, commit }) {
      if (state.contentLoaded) {
        return
      }
      try {
        const response = await axios.get('/edition')
        commit('setEditions', response.data)
        commit('setContentLoaded', true)
        return response
      } catch (error) {
        return Promise.reject(error)
      }
    },
  },
  getters: {
    editions: s => s.editions,
    clonedDirectories: s => s.clonedDirectories,
  },
}
