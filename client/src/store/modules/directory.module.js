import axios from '../../axios'

export default {
  namespaced: true,
  state: {
    directories: [],
    contentLoaded: false,
    selectedDirectoryBackup: null,
  },
  mutations: {
    setDirectories(state, payload) {
      state.directories = payload
    },
    setContentLoaded(state, payload) {
      state.contentLoaded = payload
    },
    pushDirectory(state, payload) {
      state.directories.push(payload)
    },
    updateDirectory(state, { id, data }) {
      state.directories = state.directories.map(d => {
        if (d._id === id) {
          return data
        }
        return d
      })
    },
    removeDirectory(state, payload) {
      state.directories = state.directories.filter(d => d._id !== payload)
    },
  },
  actions: {
    async createDirectory({ commit, state }, payload) {
      try {
        const response = await axios.post('/directory', payload)
        if (payload.parent) {
          const parent = state.directories.find(d => d._id === payload.parent)
          parent.dirs.push(response.data._id)
        }
        commit('pushDirectory', response.data)
        return response
      } catch (error) {
        console.log(error)
        return Promise.reject(error)
      }
    },
    async fetchAll({ state, commit }) {
      if (state.contentLoaded) {
        return
      }
      try {
        const response = await axios.get('/directory')
        commit('setDirectories', response.data)
        commit('setContentLoaded', true)
        return response
      } catch (error) {
        console.log(error)
      }
    },
    async updateDirectory({ commit, getters, state }) {
      const parent = getters.parent
      if (!parent) {
        return
      }
      try {
        const response = await axios.put(`/directory/${parent._id}`, parent)
        commit('updateDirectory', {
          id: response.data._id,
          data: response.data,
        })
        return response
      } catch (error) {
        commit('setSelectedDirectory', state.selectedDirectoryBackup)
        return Promise.reject(error)
      }
    },
    async updateById({ commit }, { id, data }) {
      try {
        const response = await axios.put(`/directory/${id}`, data)
        commit('updateDirectory', {
          id: response.data._id,
          data: response.data,
        })
        return response
      } catch (error) {
        console.log(error)
        return Promise.reject(error)
      }
    },
    async removeDirectory({ commit }, payload) {
      if (!payload) {
        return
      }
      try {
        const response = await axios.delete(`/directory/${payload}`)
        commit('removeDirectory', payload)
        return response
      } catch (error) {
        console.log(error)
        return Promise.reject(error)
      }
    },
  },
  getters: {
    directories: s => s.directories,
    selectedDirectory: s => s.selectedDirectory,
    parent: s => s.parent,
  },
}
