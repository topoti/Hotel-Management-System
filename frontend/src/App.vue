<script setup>
import { onMounted } from 'vue'
import Navbar from '@/components/Navbar.vue'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()

// When the app opens, check that the saved login is still valid
onMounted(() => auth.fetchMe())
</script>

<template>
  <Navbar />
  <main class="container py-4">
    <RouterView />
  </main>
</template>
