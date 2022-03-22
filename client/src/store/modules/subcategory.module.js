import axios from '../../axios/index.js'

export default {
  namespaced: true,
  state: {
    subcategories: [],
    loading: false,
    contentLoaded: false,
  },
  mutations: {
    setSubcategories(state, payload) {
      state.subcategories = payload
    },
    setContentLoaded(state, payload) {
      state.contentLoaded = payload
    },
    setLoading(state, payload) {
      state.loading = payload
    },
  },
  actions: {
    async fetchAll({ commit, state }) {
      if (state.loading || state.contentLoaded) {
        return
      }
      commit('setLoading', true)
      try {
        const response = await axios.get('/subcategory')
        commit('setSubcategories', response.data)
        commit('setContentLoaded', true)
        commit('setLoading', false)
        return response
      } catch (error) {
        return Promise.reject(error)
      }
    },
    async create({ commit, state }, payload) {
      if (state.loading) {
        return
      }
      commit('setLoading', true)
      try {
        const response = await axios.post('/subcategory', payload)
        commit('setLoading', false)
        return response
      } catch (error) {
        return Promise.reject(error)
      }
    },
  },
  getters: {
    subcategories: s => s.subcategories,
  },
}
