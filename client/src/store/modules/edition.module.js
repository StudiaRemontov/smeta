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
    setSubItems(state, { id, value }) {
      const dir = state.clonedDirectories.find(d => d._id === id)
      dir.subItems = value
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
          d.selectedValues = values
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
  },
  getters: {
    editions: s => s.editions,
    clonedDirectories: s => s.clonedDirectories,
  },
}
