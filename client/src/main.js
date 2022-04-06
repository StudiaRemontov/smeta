import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

import 'normalize.css'
import '@/assets/index.scss'
import 'vue-select/dist/vue-select.css'
//global components
import AppButton from '@/components/UI/AppButton.vue'
import AppInput from '@/components/UI/AppInput.vue'
import DirectoryList from '@/components/PriceLists/Create/DirectoryList.vue'

const app = createApp(App)

//global components
app.component('AppButton', AppButton)
app.component('AppInput', AppInput)
app.component('DirectoryList', DirectoryList)

app.use(router)
app.use(store)

app.mount('#app')
