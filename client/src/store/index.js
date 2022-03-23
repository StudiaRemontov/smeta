import { createStore } from 'vuex'

//modules
import subcategory from './modules/subcategory.module'
import category from './modules/category.module'
import roomType from './modules/roomType.module'

const store = createStore({
  state: {},
  modules: {
    subcategory,
    category,
    roomType,
  },
})

export default store
