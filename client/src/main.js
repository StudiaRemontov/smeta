import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import PrimeVue from 'primevue/config'
import ToastService from 'primevue/toastservice'
import Tooltip from 'primevue/tooltip'
import { registerSW } from 'virtual:pwa-register'

import 'normalize.css'
import '@/assets/index.scss'
import 'primevue/resources/primevue.min.css'
import 'primevue/resources/themes/bootstrap4-light-blue/theme.css'
import 'primevue/resources/themes/saga-blue/theme.css'
import 'primeicons/primeicons.css'
//global components
import AppButton from '@/components/UI/AppButton.vue'
import AppInput from '@/components/UI/AppInput.vue'

const app = createApp(App)
app.config.unwrapInjectedRef = true
//global components
app.component('AppButton', AppButton)
app.component('AppInput', AppInput)
app.directive('tooltip', Tooltip)

app.use(router)
app.use(store)
app.use(PrimeVue)
app.use(ToastService)

app.mount('#app')

registerSW({
  immediate: true,
})
