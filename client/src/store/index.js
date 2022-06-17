import { createStore } from 'vuex'

//modules
import directory from './modules/directory.module'
import priceList from './modules/priceList.module'
import edition from './modules/edition.module'
import outlay from './modules/outlay.module'
import outlays from './modules/outlays.module'
import acts from './modules/acts.module'
import OutlayService from '../api/OutlayService'
import collections from './local/collections'
import idb from './local/idb'

const store = createStore({
  state: {
    isOffline: false,
  },
  mutations: {
    setIsOffline(state, payload) {
      state.isOffline = payload
      OutlayService.isOffline = payload
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
    acts,
  },
  actions: {
    async initApp({ commit }) {
      if (navigator.onLine) {
        return
      }
      commit('setIsOffline', true)
    },
    async fetchAll({ dispatch, commit, state }) {
      try {
        if (state.isOffline) {
          return await Promise.all(
            Object.keys(collections).map(async k => {
              const data = await idb.getCollectionData(k)
              const { variableNameInModule, moduleName } = collections[k]
              state[moduleName][variableNameInModule] = data
              return data
            }),
          )
        }
        commit('directory/setContentLoaded', false, { root: true })
        commit('edition/setContentLoaded', false, { root: true })
        commit('priceList/setContentLoaded', false, { root: true })
        commit('outlays/setContentLoaded', false, { root: true })

        return await Promise.all([
          dispatch('directory/fetchAll', null, { root: true }),
          dispatch('edition/fetchAll', null, { root: true }),
          dispatch('priceList/fetchAll', null, { root: true }),
          dispatch('outlays/fetchAll', null, { root: true }),
        ])
      } catch (error) {
        return Promise.reject(error)
      }
    },
  },
})

export default store
