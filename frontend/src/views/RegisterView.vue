<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()

const form = reactive({ name: '', email: '', phone: '', password: '', confirmPassword: '' })
const error = ref('')
const loading = ref(false)

async function handleRegister() {
  error.value = ''

  if (form.password !== form.confirmPassword) {
    error.value = 'Passwords do not match'
    return
  }

  loading.value = true
  try {
    await auth.register({
      name: form.name,
      email: form.email,
      phone: form.phone,
      password: form.password,
    })
    router.push('/')
  } catch (err) {
    error.value = err.response?.data?.message || 'Registration failed. Is the server running?'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="row justify-content-center">
    <div class="col-md-6 col-lg-5">
      <div class="card shadow-sm">
        <div class="card-body p-4">
          <h3 class="card-title text-center mb-4">Create an Account</h3>

          <div v-if="error" class="alert alert-danger">{{ error }}</div>

          <form @submit.prevent="handleRegister">
            <div class="mb-3">
              <label class="form-label">Full Name</label>
              <input v-model="form.name" type="text" class="form-control" required />
            </div>
            <div class="mb-3">
              <label class="form-label">Email</label>
              <input v-model="form.email" type="email" class="form-control" required />
            </div>
            <div class="mb-3">
              <label class="form-label">Phone (optional)</label>
              <input v-model="form.phone" type="tel" class="form-control" />
            </div>
            <div class="mb-3">
              <label class="form-label">Password</label>
              <input v-model="form.password" type="password" class="form-control" minlength="6" required />
            </div>
            <div class="mb-3">
              <label class="form-label">Confirm Password</label>
              <input v-model="form.confirmPassword" type="password" class="form-control" required />
            </div>
            <button class="btn btn-primary w-100" :disabled="loading">
              {{ loading ? 'Creating account...' : 'Register' }}
            </button>
          </form>

          <p class="text-center mt-3 mb-0">
            Already have an account? <RouterLink to="/login">Login</RouterLink>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
