import { createStore } from 'vuex'

//modules
import directory from './modules/directory.module'
import priceList from './modules/priceList.module'
import edition from './modules/edition.module'
import outlay from './modules/outlay.module'
import outlays from './modules/outlays.module'
//plugins
import collections from './local/collections'
import idb from './local/idb'

const store = createStore({
  state: {
    isOffline: false,
  },
  mutations: {
    setIsOffline(state, payload) {
      state.isOffline = payload
    },
  },
  getters: {
    isOffline: s => s.isOffline,
  },
  modules: {
    directory,
    priceList,
    edition,
    outlay,
    outlays,
  },
  actions: {
    async initApp({ state, commit }) {
      if (navigator.onLine) {
        return
      }
      commit('setIsOffline', true)
      return await Promise.all(
        Object.keys(collections).map(async k => {
          const data = await idb.getCollectionData(k)
          const { variableNameInModule, moduleName } = collections[k]
          state[moduleName][variableNameInModule] = data
          return data
        }),
      )
    },
  },
})

export default store
