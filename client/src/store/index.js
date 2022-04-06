import { createStore } from 'vuex'

//modules
import directory from './modules/directory.module'
import priceList from './modules/priceList.module'
import edition from './modules/edition.module'

const store = createStore({
  state: {},
  modules: {
    directory,
    priceList,
    edition,
  },
})

export default store
