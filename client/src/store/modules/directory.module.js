export default {
  namespaced: true,
  state: {
    directories: [
      {
        data: false,
        dirs: [],
        id: 1,
        name: 'Test',
      },
    ],
    isCreateModalVisible: false,
  },
  mutations: {
    setIsCreateModalVisible(state, payload) {
      state.isCreateModalVisible = payload
    },
    pushDirectory(state, payload) {
      state.directories.push(payload)
    },
    updateDirectory(state, { id, data }) {
      state.directories = state.directories.map(d => {
        if (d.id === id) {
          return data
        }
        return d
      })
    },
    createSubdirectory(state, { dirId, name }) {
      const directory = state.directories.find(d => d.id === dirId)
      if (!directory) {
        return
      }
      const subDirectory = {
        id: Date.now(),
        name,
        data: false,
        dirs: [],
      }

      directory.data = false
      directory.dirs.push(subDirectory)
    },
    removeSubDirectory(state, { dirId, subId }) {
      const directory = state.directories.find(({ id }) => id === dirId)
      if (!directory) {
        return
      }

      directory.dirs = directory.dirs.filter(({ id }) => id !== subId)
    },
    createArchitecture(state, payload) {
      const directory = state.directories.find(d => d.id === payload)
      if (!directory) {
        return
      }
      directory.data = {
        keys: [],
        values: [],
      }
    },
  },
  actions: {
    async createDirectory({ commit }, name) {
      const directory = {
        id: Date.now(),
        name,
        data: false,
        dirs: [],
      }
      commit('pushDirectory', directory)
    },
  },
  getters: {
    isCreateModalVisible: s => s.isCreateModalVisible,
    directories: s => s.directories,
  },
}
