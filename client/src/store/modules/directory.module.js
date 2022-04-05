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
    createTableRow(state, dirId) {
      const directory = state.directories.find(d => d._id === dirId)
      if (!directory) return

      const { data } = directory

      const newRow = data.keys.reduce((acc, item) => {
        acc[item.id] = ''
        return acc
      }, {})

      data.values.push({
        id: Date.now(),
        data: newRow,
      })
    },
  },
  actions: {
    async createDirectory({ commit }, payload) {
      try {
        const response = await axios.post('/directory', payload)
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
    async updateTableArchitecture({ state, dispatch }, { id, data }) {
      try {
        const directory = state.directories.find(d => d._id === id)
        if (!directory) return

        data.values = data.values.filter(row => {
          const isRowEmpty = Object.values(row.data).every(value => !value)
          return !isRowEmpty
        })

        const newData = {
          data: {
            ...directory.data,
            ...data,
          },
        }
        await dispatch('updateById', { id: directory._id, data: newData })
      } catch (error) {
        console.log(error)
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
