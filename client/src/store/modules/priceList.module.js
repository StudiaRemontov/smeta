import axios from '../../axios/index.js'

export default {
  namespaced: true,
  state: {
    priceLists: [],
    contentLoaded: false,
    selectedPriceList: null,
  },
  mutations: {
    setPriceLists(state, payload) {
      state.priceLists = payload
    },
    setContentLoaded(state, payload) {
      state.contentLoaded = payload
    },
    pushPriceList(state, payload) {
      state.priceLists.push(payload)
    },
    removePriceList(state, payload) {
      state.priceLists = state.priceLists.filter(p => p._id !== payload)
    },
    setSelectedPriceList(state, payload) {
      state.selectedPriceList = payload
    },
    updatePriceList(state, { id, value }) {
      state.priceLists = state.priceLists.map(p => {
        if (p._id === id) {
          return value
        }
        return p
      })
    },
    removeEdition(state, { id, editionId }) {
      const priceList = state.priceLists.find(p => p._id === id)
      if (!priceList) {
        return
      }
      priceList.editions = priceList.editions.filter(
        edition => edition !== editionId,
      )
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
    async updateEditions({ commit }, { id, editions }) {
      try {
        const response = await axios.put(`/pricelist/${id}`, { editions })
        commit('updatePriceList', { id, value: response.data })
      } catch (error) {
        return Promise.reject(error)
      }
    },
    async create({ commit }, payload) {
      try {
        const response = await axios.post('/pricelist', payload)
        commit('pushPriceList', response.data)
        commit('setSelectedPriceList', response.data._id)
        return response
      } catch (error) {
        return Promise.reject(error)
      }
    },
    async remove({ commit }, payload) {
      try {
        const response = await axios.delete(`/pricelist/${payload}`)
        commit('setSelectedPriceList', null)
        commit('removePriceList', payload)
        return response
      } catch (error) {
        return Promise.reject(error)
      }
    },
  },
  getters: {
    priceLists: s => s.priceLists,
    selectedPriceList: s => {
      return s.priceLists.find(p => p._id === s.selectedPriceList)
    },
  },
}
