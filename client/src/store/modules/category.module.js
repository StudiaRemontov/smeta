import axios from '../../axios/index.js'

export default {
  namespaced: true,
  state: {
    categories: [],
    loading: false,
    contentLoaded: false,
  },
  mutations: {
    setCategories(state, payload) {
      state.categories = payload
    },
    pushCategory(state, payload) {
      state.categories.push(payload)
    },
    updateCategory(state, { id, data }) {
      state.categories = state.categories.map(category => {
        if (category._id === id) {
          return data
        }

        return category
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
        const response = await axios.get('/category')
        commit('setCategories', response.data)
        commit('setContentLoaded', true)
        commit('setLoading', false)
        return response
      } catch (error) {
        return Promise.reject(error)
      }
    },
    async create({ commit }, payload) {
      try {
        const response = await axios.post('/category', payload)
        commit('pushCategory', response.data)
        return response
      } catch (error) {
        return Promise.reject(error)
      }
    },
    async update({ commit }, { id, data }) {
      try {
        const response = await axios.put(`/category/${id}`, data)
        commit('updateCategory', { id, data: response.data })
        return response
      } catch (error) {
        return Promise.reject(error)
      }
    },
  },
  getters: {
    categories: s => s.categories,
  },
}
