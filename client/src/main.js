import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

import 'normalize.css'
import '@/assets/index.scss'
import '@vueform/multiselect/themes/default.css'
//global components
import AppButton from '@/components/UI/AppButton.vue'
import AppInput from '@/components/UI/AppInput.vue'

const app = createApp(App)

//global components
app.component('AppButton', AppButton)
app.component('AppInput', AppInput)

app.use(router)
app.use(store)

app.mount('#app')
