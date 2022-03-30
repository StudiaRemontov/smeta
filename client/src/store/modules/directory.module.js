import axios from '../../axios'

import { createMongoId } from '@/helpers/createMongoId'
import { updatableMutations } from '../mutations/directory'

export default {
  namespaced: true,
  state: {
    directories: [],
    selectedDirectory: null,
    parent: null,
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
    setSelectedDirectory(state, payload) {
      state.selectedDirectoryBackup = JSON.parse(JSON.stringify(payload))
      state.selectedDirectory = payload
    },
    setParent(state, payload) {
      state.parent = payload
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
    [updatableMutations.UPDATE_SUBDIRECTORY](state, { id, data }) {
      state.selectedDirectory.dirs = state.selectedDirectory.dirs.map(d => {
        if (d._id === id) {
          return data
        }
        return d
      })
    },
    [updatableMutations.CREATE_SUBDIRECTORY](state, name) {
      if (!state.selectedDirectory) {
        return
      }
      const directory = {
        _id: createMongoId(),
        name,
        dirs: [],
        data: false,
      }

      state.selectedDirectory.dirs.push(directory)
    },
    [updatableMutations.REMOVE_SUBDIRECTORY](_, { parent, subId }) {
      parent.dirs = parent.dirs.filter(d => d._id !== subId)
    },
    [updatableMutations.CREATE_ARCHITECTURE](state) {
      state.selectedDirectory.data = {
        keys: [],
        values: [],
      }
    },
    [updatableMutations.UPDATE_ARCHITECTURE](state, data) {
      state.selectedDirectory.data = {
        ...state.selectedDirectory.data,
        ...data,
      }
    },
  },
  actions: {
    async createDirectory({ commit }, name) {
      try {
        const response = await axios.post('/directory', {
          name,
        })
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
