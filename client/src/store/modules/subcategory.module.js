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
    pushSubcategory(state, payload) {
      state.subcategories.push(payload)
    },
    updateSubcategory(state, { id, data }) {
      state.subcategories = state.subcategories.map(subcategory => {
        if (subcategory._id === id) {
          return data
        }

        return subcategory
      })
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
    async create({ commit }, payload) {
      try {
        const response = await axios.post('/subcategory', payload)
        commit('pushSubcategory', response.data)
        return response
      } catch (error) {
        return Promise.reject(error)
      }
    },
    async update({ commit }, { id, data }) {
      try {
        const response = await axios.put(`/subcategory/${id}`, data)
        commit('updateSubcategory', { id, data: response.data })
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
