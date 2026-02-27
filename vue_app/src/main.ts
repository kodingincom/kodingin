import { createApp } from 'vue'
import { VueQueryPlugin } from '@tanstack/vue-query'
import './style.css'
import Root from './Root.vue'
import router from './router'

const app = createApp(Root)

app.use(router)
app.use(VueQueryPlugin)
app.mount('#app')
