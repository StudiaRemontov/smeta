import axios from '../../axios/index.js'

export default {
  namespaced: true,
  state: {
    editions: [],
    contentLoaded: false,
    clonedDirectories: [],
    selectedEdition: null,
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
    updateKey(state, { id, keyId, value, field = 'checked' }) {
      const directory = state.clonedDirectories.find(d => d._id === id)
      const key = directory.keys.find(k => k.id === keyId)
      key[field] = value
    },
    setClonedDirectories(state, payload) {
      state.clonedDirectories = payload.map(d => {
        const { values, keys } = d
        if (keys) {
          d.keys = keys.map(k => ({
            ...k,
            checked: true,
            readonly: true,
          }))
        }

        if (values) {
          d.selectedValues = []
        }

        return d
      })
    },
    setSelectedValues(state, { id, value }) {
      const directory = state.clonedDirectories.find(d => d._id === id)
      directory.selectedValues = value
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
    setSubItems({ state, commit }, { id, value }) {
      const dir = state.clonedDirectories.find(d => d._id === id)
      if (value.length === 0) {
        dir.subItems.forEach(item => {
          const { values } = item
          if (values) {
            commit('setSelectedValues', { id: item._id, value: [] })
          }
        })
      }
      if (value.length > 0) {
        value.forEach(item => {
          const { values } = item
          if (!values) {
            return
          }
          const newValues =
            item.selectedValues.length > 0 ? item.selectedValues : values
          commit('setSelectedValues', { id: item._id, value: newValues })
        })
      }

      dir.subItems = value
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
    async remove({ commit, rootGetters, dispatch }, payload) {
      try {
        const response = await axios.delete(`/edition/${payload}`)
        // commit('removeEdition', payload)
        // const selectedPriceList = rootGetters['priceList/selectedPriceList']
        // const newEditions = selectedPriceList.editions.filter(
        //   e => e !== payload,
        // )
        // if (newEditions.length > 0) {
        //   await dispatch(
        //     'priceList/updateEditions',
        //     {
        //       id: selectedPriceList._id,
        //       editions: newEditions,
        //     },
        //     { root: true },
        //   )
        //   return response
        // }
        // await dispatch('priceList/remove', selectedPriceList._id, {
        //   root: true,
        // })

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
  },
}
