<script setup>
import { ref, onMounted } from 'vue'
import api from '@/api'
import SearchBox from '@/components/SearchBox.vue'
import RoomCard from '@/components/RoomCard.vue'

const featuredRooms = ref([])

// Show the first 3 rooms on the home page
onMounted(async () => {
  try {
    const res = await api.get('/rooms')
    featuredRooms.value = res.data.slice(0, 3)
  } catch {
    featuredRooms.value = []
  }
})
</script>

<template>
  <!-- Hero section -->
  <div class="hero rounded-3 mb-4 text-white text-center">
    <div class="hero-overlay rounded-3 py-5 px-3">
      <h1 class="display-5 fw-bold">Welcome to Our Hotel</h1>
      <p class="fs-5">Comfortable rooms at great prices. Book your stay today.</p>
    </div>
  </div>

  <!-- Search -->
  <div class="search-wrap mb-5">
    <SearchBox />
  </div>

  <!-- Featured rooms -->
  <div class="d-flex justify-content-between align-items-center mb-3">
    <h3 class="mb-0">Our Rooms</h3>
    <RouterLink to="/rooms">See all rooms →</RouterLink>
  </div>
  <div class="row g-4">
    <div v-for="room in featuredRooms" :key="room._id" class="col-md-6 col-lg-4">
      <RoomCard :room="room" />
    </div>
  </div>
</template>

<style scoped>
.hero {
  background: url('https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1600') center / cover;
}
.hero-overlay {
  background: rgba(0, 0, 0, 0.45);
  padding-bottom: 5rem !important;
}
/* pull the search box up so it overlaps the hero image */
.search-wrap {
  margin-top: -3.5rem;
  padding: 0 1rem;
}
</style>
