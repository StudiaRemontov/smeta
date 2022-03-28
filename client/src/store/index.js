import { createStore } from 'vuex'

//modules
import directory from './modules/directory.module'

const store = createStore({
  state: {},
  modules: {
    directory,
  },
})

export default store
