import { createStore } from 'vuex'
import plugin from './plugins/AutoUpdateDirectory'

//modules
import directory from './modules/directory.module'

const store = createStore({
  state: {},
  modules: {
    directory,
  },
  plugins: [plugin],
})

export default store
