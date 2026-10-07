<script setup>
// Shows all rooms, or only the available ones if dates are in the URL
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/api'
import SearchBox from '@/components/SearchBox.vue'
import RoomCard from '@/components/RoomCard.vue'
import { nightsBetween } from '@/utils'

const route = useRoute()
const router = useRouter()

const rooms = ref([])
const loading = ref(false)
const error = ref('')

const isSearch = computed(() => route.query.checkIn && route.query.checkOut)
const nights = computed(() => nightsBetween(route.query.checkIn, route.query.checkOut))

async function loadRooms() {
  if (route.name !== 'rooms') return // we are leaving this page
  loading.value = true
  error.value = ''
  try {
    // route.query becomes ?checkIn=...&checkOut=...&guests=...&type=...
    const res = await api.get('/rooms', { params: route.query })
    rooms.value = res.data
  } catch (err) {
    error.value = err.response?.data?.message || 'Could not load rooms'
  } finally {
    loading.value = false
  }
}

// Change the room type filter by updating the URL
function setType(type) {
  const query = { ...route.query, type }
  if (!type) delete query.type
  router.push({ path: '/rooms', query })
}

// Load again every time the URL query changes (new search or filter)
watch(() => route.query, loadRooms, { immediate: true })
</script>

<template>
  <SearchBox class="mb-4" />

  <div class="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-2">
    <h3 class="mb-0">
      {{ isSearch ? `Available rooms (${nights} night${nights > 1 ? 's' : ''})` : 'All rooms' }}
    </h3>

    <!-- Room type filter -->
    <div class="btn-group btn-group-sm">
      <button
        v-for="t in ['', 'Single', 'Double', 'Suite']"
        :key="t"
        class="btn"
        :class="(route.query.type || '') === t ? 'btn-primary' : 'btn-outline-primary'"
        @click="setType(t)"
      >
        {{ t || 'All' }}
      </button>
    </div>
  </div>

  <div v-if="loading" class="text-center py-5">
    <div class="spinner-border text-primary"></div>
  </div>

  <div v-else-if="error" class="alert alert-danger">{{ error }}</div>

  <div v-else-if="rooms.length === 0" class="alert alert-info">
    No rooms available for your search. Try different dates or fewer guests.
  </div>

  <div v-else class="row g-4">
    <div v-for="room in rooms" :key="room._id" class="col-md-6 col-lg-4">
      <RoomCard :room="room" :query="route.query" />
    </div>
  </div>
</template>
