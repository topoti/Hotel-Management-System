<script setup>
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()

// Mobile menu open/closed. Close it every time the page changes.
const menuOpen = ref(false)
watch(() => route.fullPath, () => (menuOpen.value = false))

function logout() {
  auth.logout()
  router.push('/')
}
</script>

<template>
  <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
    <div class="container">
      <RouterLink class="navbar-brand" to="/">🏨 Hotel Booking</RouterLink>

      <!-- Hamburger button for small screens -->
      <button class="navbar-toggler" type="button" @click="menuOpen = !menuOpen">
        <span class="navbar-toggler-icon"></span>
      </button>

      <div class="collapse navbar-collapse" :class="{ show: menuOpen }">
        <ul class="navbar-nav ms-auto align-items-lg-center">
          <li class="nav-item"><RouterLink class="nav-link" to="/">Home</RouterLink></li>
          <li class="nav-item"><RouterLink class="nav-link" to="/rooms">Rooms</RouterLink></li>

          <!-- Shown when NOT logged in -->
          <template v-if="!auth.isLoggedIn">
            <li class="nav-item"><RouterLink class="nav-link" to="/login">Login</RouterLink></li>
            <li class="nav-item"><RouterLink class="nav-link" to="/register">Register</RouterLink></li>
          </template>

          <!-- Shown when logged in -->
          <template v-else>
            <li class="nav-item"><RouterLink class="nav-link" to="/my-bookings">My Bookings</RouterLink></li>
            <li v-if="auth.isAdmin" class="nav-item">
              <RouterLink class="nav-link" to="/admin">Admin</RouterLink>
            </li>
            <li class="nav-item"><span class="navbar-text mx-lg-3">Hi, {{ auth.user?.name }}</span></li>
            <li class="nav-item">
              <button class="btn btn-outline-light btn-sm" @click="logout">Logout</button>
            </li>
          </template>
        </ul>
      </div>
    </div>
  </nav>
</template>
