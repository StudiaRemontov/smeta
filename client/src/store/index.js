import { createStore } from 'vuex'

//modules
import directory from './modules/directory.module'
import priceList from './modules/priceList.module'
import edition from './modules/edition.module'
import outlay from './modules/outlay.module'

const store = createStore({
  state: {},
  modules: {
    directory,
    priceList,
    edition,
    outlay,
  },
})

export default store
