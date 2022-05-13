import axios from '../../modules/axios'

export default {
  namespaced: true,
  state: {
    editions: [],
    contentLoaded: false,
    clonedDirectories: [],
    selectedEdition: null,
    clone: null,
  },
  mutations: {
    setEditions(state, payload) {
      state.editions = payload
    },
    setContentLoaded(state, payload) {
      state.contentLoaded = payload
    },
    pushEditions(state, payload) {
      state.editions.push(payload)
    },
    removeEdition(state, payload) {
      state.editions = state.editions.filter(e => e._id !== payload)
    },
    setSelectedEdition(state, payload) {
      state.selectedEdition = payload
    },
    //mergeTypes: "full" | "rightJoin"
    setClone(state, payload) {
      if (!payload) {
        return (state.clone = payload)
      }
      const { value, mergeType } = payload
      state.clone = {
        value: JSON.parse(JSON.stringify(value)),
        mergeType,
      }
    },
    setClonedDirectories(state, payload) {
      state.clonedDirectories = payload
    },
    update(state, { id, data }) {
      state.editions = state.editions.map(e => {
        if (e._id === id) {
          return {
            ...e,
            ...data,
          }
        }
        return e
      })
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
    async create({ commit, rootGetters, dispatch }, data) {
      try {
        const priceList = rootGetters['priceList/selectedPriceList']
        if (!priceList) {
          return
        }

        const response = await axios.post('/edition', data)
        commit('pushEditions', response.data)
        await dispatch(
          'priceList/updateEditions',
          {
            id: priceList._id,
            editions: [...priceList.editions, response.data._id],
          },
          {
            root: true,
          },
        )
        commit('setSelectedEdition', response.data._id)
        return response
      } catch (error) {
        console.log(error)
        return Promise.reject(error)
      }
    },
    async setActive({ commit, rootGetters }, payload) {
      try {
        const response = await axios.patch(`/edition/${payload}/active`)
        const selectedPriceList = rootGetters['priceList/selectedPriceList']
        const { editions } = selectedPriceList
        editions.forEach(id => {
          commit('update', { id, data: { active: id === payload } })
        })

        return response
      } catch (error) {
        return Promise.reject(error)
      }
    },
    async remove({ commit, rootGetters, dispatch }, payload) {
      try {
        const response = await axios.delete(`/edition/${payload}`)
        commit('removeEdition', payload)
        commit('setSelectedEdition', null)
        const selectedPriceList = rootGetters['priceList/selectedPriceList']
        const newEditions = selectedPriceList.editions.filter(
          e => e !== payload,
        )
        if (newEditions.length > 0) {
          await dispatch(
            'priceList/updateEditions',
            {
              id: selectedPriceList._id,
              editions: newEditions,
            },
            { root: true },
          )
          commit('setSelectedEdition', newEditions[newEditions.length - 1])
          return response
        }
        await dispatch('priceList/remove', selectedPriceList._id, {
          root: true,
        })

        return response
      } catch (error) {
        return Promise.reject(error)
      }
    },
  },
  getters: {
    editions: s => s.editions,
    clonedDirectories: s => s.clonedDirectories,
    selectedEdition: s => {
      return s.editions.find(e => e._id === s.selectedEdition)
    },
    clone: s => s.clone,
    active: (s, _, __, rootGetters) => {
      const priceList = rootGetters['priceList/selectedPriceList']
      if (!priceList) return null
      const { editions } = priceList
      const filtered = s.editions.filter(e => editions.includes(e._id))
      return filtered.find(e => e.active)
    },
  },
}
