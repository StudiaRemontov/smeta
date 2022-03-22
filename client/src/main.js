import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import '@/assets/index.scss'

//app components
import AppButton from './components/App/AppButton.vue'

const app = createApp(App)

//global components
app.component('AppButton', AppButton)

app.use(router)

app.mount('#app')
