import { createStore } from 'vuex'

//modules
import subcategory from './modules/subcategory.module'

const store = createStore({
  state: {},
  modules: {
    subcategory,
  },
})

export default store
