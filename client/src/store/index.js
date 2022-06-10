import { createStore } from 'vuex'

//modules
import directory from './modules/directory.module'
import priceList from './modules/priceList.module'
import edition from './modules/edition.module'
import outlay from './modules/outlay.module'
import outlays from './modules/outlays.module'

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
    async initApp({ commit }) {
      if (navigator.onLine) {
        return
      }
      commit('setIsOffline', true)
    },
    async fetchAll({ dispatch }) {
      try {
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
