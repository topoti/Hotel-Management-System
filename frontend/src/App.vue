<script setup>
import { onMounted } from 'vue'
import Navbar from '@/components/Navbar.vue'
import AppFooter from '@/components/AppFooter.vue'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()

// When the app opens, check that the saved login is still valid
onMounted(() => auth.fetchMe())
</script>

<template>
  <!-- min-vh-100 + flex column keeps the footer at the bottom on short pages -->
  <div class="d-flex flex-column min-vh-100">
    <Navbar />
    <main class="container py-4 flex-grow-1">
      <RouterView />
    </main>
    <AppFooter />
  </div>
</template>
