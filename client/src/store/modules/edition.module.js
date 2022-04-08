import axios from '../../axios/index.js'

export default {
  namespaced: true,
  state: {
    editions: [],
    contentLoaded: false,
    tree: [],
    clonedDirectories: [],
  },
  mutations: {
    setEditions(state, payload) {
      state.editions = payload
    },
    setContentLoaded(state, payload) {
      state.contentLoaded = payload
    },
    checkDirectory(state, { id, value }) {
      const directory = state.clonedDirectories.find(d => d._id === id)
      if (!directory.parent) {
        state.clonedDirectories.forEach(d => {
          if (!d.parent && d.values) {
            d.checked = false
            d.values.forEach(r => (r.checked = false))
          }
        })
      }
      directory.checked = value
      if (directory.values) {
        directory.values.forEach(r => (r.checked = value))
      }
    },
    checkRow(state, { id, rowId, value }) {
      const directory = state.clonedDirectories.find(d => d._id === id)
      directory.data.values.forEach(r => {
        if (r.id === rowId) {
          r.checked = value
        }
      })
    },
    checkAllRows(state, { id, value }) {
      const directory = state.clonedDirectories.find(d => d._id === id)
      directory.data.values.forEach(r => (r.checked = value))
    },
    updateKey(state, { id, keyId, value, field = 'checked' }) {
      const directory = state.clonedDirectories.find(d => d._id === id)
      const key = directory.keys.find(k => k.id === keyId)
      key[field] = value
    },
    setTree(state, payload) {
      state.tree = payload
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
          d.values = values.map(r => ({
            ...r,
            checked: true,
          }))
        }
        return {
          ...d,
          checked: false,
        }
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
    async checkDirectory({ state, dispatch, commit }, { id, value }) {
      const directory = state.clonedDirectories.find(d => d._id === id)
      //если корневая и значение true всем остальные корневым ставим checked false
      if (!directory.parent && value) {
        state.clonedDirectories = state.clonedDirectories.map(d => {
          if (!d.parent) {
            d.checked = false
          }
          return d
        })
      }
      if (directory.parent && value) {
        const parents = await dispatch('getParents', directory.parent)
        parents.forEach(d => (d.checked = value))
      }

      if (directory.data) {
        commit('checkAllRows', { id: directory._id, value })
      }

      directory.checked = value
    },
    async getParents({ state, dispatch }, id) {
      const parent = state.clonedDirectories.find(d => d._id === id)
      if (!parent.parent) {
        return [parent]
      }
      return [parent, ...(await dispatch('getParents', parent.parent))]
    },
  },
  getters: {
    editions: s => s.editions,
    tree: s => s.tree,
    clonedDirectories: s => s.clonedDirectories,
  },
}
