// Stores the logged-in user and token, and has login/register/logout actions
import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import api from '@/api'

export const useAuthStore = defineStore('auth', () => {
  // Load saved data so the user stays logged in after a page refresh
  const token = ref(localStorage.getItem('token'))
  const user = ref(JSON.parse(localStorage.getItem('user') || 'null'))

  const isLoggedIn = computed(() => !!token.value)
  const isAdmin = computed(() => user.value?.role === 'admin')

  function saveLogin(data) {
    token.value = data.token
    user.value = data.user
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data.user))
  }

  async function login(email, password) {
    const res = await api.post('/auth/login', { email, password })
    saveLogin(res.data)
  }

  async function register(form) {
    const res = await api.post('/auth/register', form)
    saveLogin(res.data)
  }

  function logout() {
    token.value = null
    user.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  // Checks with the server that the saved token is still valid
  async function fetchMe() {
    if (!token.value) return
    try {
      const res = await api.get('/auth/me')
      user.value = res.data.user
      localStorage.setItem('user', JSON.stringify(res.data.user))
    } catch {
      logout() // token expired or invalid
    }
  }

  return { token, user, isLoggedIn, isAdmin, login, register, logout, fetchMe }
})
