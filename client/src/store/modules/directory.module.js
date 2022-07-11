import axios from '../../modules/axios'
import { InputType } from '../../enum/InputType'
import Key from '../../helpers/Key'
import idb from '../local/idb'
import { directoryName } from '../../enum/roomDirectoryData'

export const getChildren = (directory, directories) => {
  const children = directories.filter(d => d.parent === directory._id)

  const subChildren = children.map(c => getChildren(c, directories))
  return [...children, ...subChildren].flat()
}

const getArchitectires = (root, directories) => {
  const children = getChildren(root, directories)

  return children.filter(d => d.values)
}

export default {
  namespaced: true,
  state: {
    root: null,
    directories: [],
    contentLoaded: false,
    loading: false,
  },
  mutations: {
    setLoading(state, payload) {
      state.loading = payload
    },
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
    updateDirectoryValues(state, { id, values }) {
      const directory = state.directories.find(d => d._id === id)
      directory.values = values
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
        await idb.saveDataInCollection('directories', response.data)
        return response
      } catch (error) {
        console.log(error)
        return Promise.reject(error)
      }
    },
    async fetchAll({ state, commit, rootGetters }) {
      if (state.contentLoaded || rootGetters.isOffline) {
        return
      }
      try {
        const response = await axios.get('/directory')
        commit('setDirectories', response.data)
        commit('setContentLoaded', true)
        await idb.setArrayToCollection('directories', response.data)
        return response
      } catch (error) {
        console.log(error)
      }
    },
    async updateDirectoryValues(_, { id, values }) {
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
        await axios.put(`/directory/${id}`, data)
        await idb.saveDataInCollection('directories', data)
      } catch (error) {
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
        await idb.saveDataInCollection('directories', response.data)
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
        await idb.removeDataInCollection('directories', payload)
        return response
      } catch (error) {
        console.log(error)
        return Promise.reject(error)
      }
    },
    async createKey({ state, getters, dispatch }, { name, type }) {
      try {
        const key = new Key(name, type)
        const { directories } = state
        const root = directories.find(d => d._id === getters.root._id)
        const rootClone = JSON.parse(JSON.stringify(root))
        rootClone.keys.push(key)
        const defaultValue = Key.getDefaultValue(key.type)
        if (rootClone.values) {
          rootClone.values = rootClone.values.map(row => {
            row.data[key.id] = defaultValue
            return row
          })
        }
        const response = await dispatch('updateById', {
          id: root._id,
          data: rootClone,
        })
        if (key.type === InputType.COUNTER) {
          return response
        }
        const architectures = getArchitectires(root, directories)
        return await Promise.all(
          architectures.map(async arc => {
            const clone = JSON.parse(JSON.stringify(arc))
            if (!clone.values.length) {
              return
            }
            clone.values = arc.values.map(row => {
              row.data[key.id] = defaultValue
              return row
            })

            return await dispatch('updateById', { id: arc._id, data: arc })
          }),
        )
      } catch (error) {
        return Promise.reject(error)
      }
    },
    async removeKey({ state, dispatch, getters }, keyId) {
      try {
        const { directories } = state
        const root = directories.find(d => d._id === getters.root._id)
        const rootClone = JSON.parse(JSON.stringify(root))
        rootClone.keys = rootClone.keys.filter(k => k.id !== keyId)
        await dispatch('updateById', { id: root._id, data: rootClone })
        const architectures = getArchitectires(root, directories)
        return await Promise.all(
          architectures.map(async arc => {
            const clone = JSON.parse(JSON.stringify(arc))
            if (!clone.values.length) {
              return
            }
            clone.values = arc.values.map(row => {
              row.data = Object.entries(row.data).reduce(
                (acc, [key, value]) => {
                  if (keyId !== key) {
                    acc[key] = value
                  }
                  return acc
                },
                {},
              )
              return row
            })
            return await dispatch('updateById', { id: arc._id, data: arc })
          }),
        )
      } catch (error) {
        return Promise.reject(error)
      }
    },
    async updateKey({ state, getters, dispatch }, { id, newKey }) {
      try {
        const { directories } = state
        const root = directories.find(d => d._id === getters.root._id)
        const clone = JSON.parse(JSON.stringify(root))
        const { keys } = clone
        clone.keys = keys.map(k => {
          if (k.id === id) {
            return {
              id,
              ...newKey,
            }
          }
          return k
        })
        return await dispatch('updateById', { id: root._id, data: clone })
      } catch (error) {
        return Promise.reject(error)
      }
    },
    async updateValues({ state, commit }, { id, values }) {
      try {
        const directory = state.directories.find(d => d._id === id)
        const clone = JSON.parse(JSON.stringify(directory))
        const removedValues = clone.values.filter(r => r.removed)
        clone.values = [...values, ...removedValues]
        const response = await axios.put(`/directory/${id}`, clone)
        const newValues = response.data.values
        commit('updateDirectoryValues', { id, values: newValues })
        await idb.saveDataInCollection('directories', response.data)
        return response
      } catch (error) {
        return Promise.reject(error)
      }
    },
  },
  getters: {
    loading: s => s.loading,
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
    roomDirectory: s => {
      const { directories } = s
      const roomDirectory = directories.find(d => d.name === directoryName)
      return roomDirectory
    },
  },
}
