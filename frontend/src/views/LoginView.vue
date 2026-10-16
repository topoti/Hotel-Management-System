<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()

const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

async function handleLogin() {
  error.value = ''
  loading.value = true
  try {
    await auth.login(email.value, password.value)
    // Go back to the page the user wanted, or home
    router.push(route.query.redirect || '/')
  } catch (err) {
    error.value = err.response?.data?.message || 'Login failed. Is the server running?'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="row justify-content-center">
    <div class="col-md-6 col-lg-4">
      <div class="card shadow-sm">
        <div class="card-body p-4">
          <h3 class="card-title text-center mb-4">Login</h3>

          <div v-if="error" class="alert alert-danger">{{ error }}</div>

          <form @submit.prevent="handleLogin">
            <div class="mb-3">
              <label class="form-label">Email</label>
              <input v-model="email" type="email" class="form-control" required />
            </div>
            <div class="mb-3">
              <label class="form-label">Password</label>
              <input v-model="password" type="password" class="form-control" required />
            </div>
            <button class="btn btn-primary w-100" :disabled="loading">
              {{ loading ? 'Logging in...' : 'Login' }}
            </button>
          </form>

          <p class="text-center mt-3 mb-0">
            No account? <RouterLink to="/register">Register</RouterLink>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
