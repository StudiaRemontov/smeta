import axios from '../../axios/index.js'

export default {
  namespaced: true,
  state: {
    roomTypes: [],
    loading: false,
    contentLoaded: false,
  },
  mutations: {
    setRoomTypes(state, payload) {
      state.roomTypes = payload
    },
    pushCategory(state, payload) {
      state.roomTypes.push(payload)
    },
    updateCategory(state, { id, data }) {
      state.roomTypes = state.roomTypes.map(roomtype => {
        if (roomtype._id === id) {
          return data
        }

        return roomtype
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
        const response = await axios.get('/roomtype')
        commit('setRoomTypes', response.data)
        commit('setContentLoaded', true)
        commit('setLoading', false)
        return response
      } catch (error) {
        return Promise.reject(error)
      }
    },
    async create({ commit }, payload) {
      try {
        const response = await axios.post('/roomtype', payload)
        commit('pushCategory', response.data)
        return response
      } catch (error) {
        return Promise.reject(error)
      }
    },
    async update({ commit }, { id, data }) {
      try {
        const response = await axios.put(`/roomtype/${id}`, data)
        commit('updateCategory', { id, data: response.data })
        return response
      } catch (error) {
        return Promise.reject(error)
      }
    },
  },
  getters: {
    roomTypes: s => s.roomTypes,
  },
}
