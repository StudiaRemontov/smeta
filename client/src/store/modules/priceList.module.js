import axios from '../../axios/index.js'

export default {
  namespaced: true,
  state: {
    priceLists: [],
    contentLoaded: false,
  },
  mutations: {
    setPriceLists(state, payload) {
      state.priceLists = payload
    },
    setContentLoaded(state, payload) {
      state.contentLoaded = payload
    },
  },
  actions: {
    async fetchAll({ state, commit }) {
      if (state.contentLoaded) {
        return
      }
      try {
        const response = await axios.get('/pricelist')
        commit('setPriceLists', response.data)
        commit('setContentLoaded', true)
        return response
      } catch (error) {
        return Promise.reject(error)
      }
    },
  },
  getters: {
    priceLists: s => s.priceLists,
  },
}
