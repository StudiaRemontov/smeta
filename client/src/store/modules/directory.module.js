import axios from '../../axios'
import { InputType } from '../../enum/InputType'

export default {
  namespaced: true,
  state: {
    root: null,
    directories: [],
    contentLoaded: false,
  },
  mutations: {
    setRoot(state, payload) {
      state.root = payload
    },
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
    removeEmptyRows(state, { id }) {
      const directory = state.directories.find(d => d._id === id)
      if (!directory) return

      directory.values = directory.values.filter(row => {
        const isRowEmpty = Object.values(row.data).every(value => !value)
        return !isRowEmpty
      })
    },
  },
  actions: {
    createTableRow({ getters }, dirId) {
      const directory = getters.directories.find(d => d._id === dirId)

      if (!directory) return
      const { values } = directory

      const keys = !directory.parent ? directory.keys : getters.root.keys

      const newRow = keys.reduce((acc, item) => {
        acc[item.id] = item.type === InputType.NUMBER ? 0 : ''
        return acc
      }, {})

      values.push({
        id: Date.now() + '',
        data: newRow,
      })
    },
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
    async updateDirectoryKeys({ dispatch, state }, keys) {
      try {
        const data = {
          keys,
        }
        await dispatch('updateById', { id: state.root, data })
      } catch (error) {
        console.log(error)
      }
    },
    async updateDirectoryValues({ dispatch }, { id, values }) {
      try {
        values =
          values &&
          values.filter(row => {
            const isRowEmpty = Object.values(row.data).every(value => !value)
            return !isRowEmpty
          })
        const data = {
          values,
        }
        await dispatch('updateById', { id, data })
      } catch (error) {
        console.log(error)
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
        response.data.forEach(d => {
          commit('removeDirectory', d._id)
        })
        return response
      } catch (error) {
        console.log(error)
        return Promise.reject(error)
      }
    },
  },
  getters: {
    root: s => {
      if (!s.root) {
        return null
      }
      return s.directories.find(d => d._id === s.root)
    },
    roots: s => {
      return s.directories.filter(d => !d.parent)
    },
    directories: s => s.directories,
  },
}
