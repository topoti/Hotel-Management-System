import { createApp } from 'vue'
import { createPinia } from 'pinia'

import 'bootstrap/dist/css/bootstrap.min.css'

import App from './App.vue'
import router from './router'
import api from './api'
import { useAuthStore } from './stores/auth'

const app = createApp(App)

app.use(createPinia())
app.use(router)

// If the server says our login token is invalid or expired (401), log out and go to the login page
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const auth = useAuthStore()
    const isLoginRequest = error.config?.url?.startsWith('/auth/')
    if (error.response?.status === 401 && auth.isLoggedIn && !isLoginRequest) {
      auth.logout()
      router.push({ name: 'login', query: { redirect: router.currentRoute.value.fullPath } })
    }
    return Promise.reject(error)
  },
)

app.mount('#app')
