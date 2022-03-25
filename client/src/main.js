import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

import 'normalize.css'
import '@/assets/index.scss'

import AppButton from '@/components/UI/AppButton.vue'

const app = createApp(App)

//global components
app.component('AppButton', AppButton)

app.use(router)
app.use(store)

app.mount('#app')
