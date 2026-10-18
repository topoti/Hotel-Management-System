<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/api'
import { useAuthStore } from '@/stores/auth'
import { formatPrice, nightsBetween, today, tomorrow, nextDay } from '@/utils'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const room = ref(null)
const loading = ref(true)
const error = ref('')

// Booking form - starts with the dates from the search (if any)
const checkIn = ref(route.query.checkIn || today())
const checkOut = ref(route.query.checkOut || tomorrow())
const guests = ref(Number(route.query.guests) || 1)

const nights = computed(() => nightsBetween(checkIn.value, checkOut.value))
const total = computed(() => (room.value ? nights.value * room.value.price : 0))

const booking = ref(false) // true while the booking request is running
const bookingError = ref('')

async function bookRoom() {
  bookingError.value = ''

  // Must be logged in to book. After login, come back to this page with the same dates.
  if (!auth.isLoggedIn) {
    router.push({
      name: 'login',
      query: { redirect: router.resolve({ path: route.path, query: { checkIn: checkIn.value, checkOut: checkOut.value, guests: guests.value } }).fullPath },
    })
    return
  }

  if (!confirm(`Book ${room.value.type} Room ${room.value.roomNumber} for ${nights.value} night(s), total ${formatPrice(total.value)}?`)) {
    return
  }

  booking.value = true
  try {
    await api.post('/bookings', {
      roomId: room.value._id,
      checkIn: checkIn.value,
      checkOut: checkOut.value,
      guests: guests.value,
    })
    router.push({ name: 'my-bookings', query: { booked: '1' } })
  } catch (err) {
    bookingError.value = err.response?.data?.message || 'Booking failed. Please try again.'
  } finally {
    booking.value = false
  }
}

onMounted(async () => {
  try {
    const res = await api.get(`/rooms/${route.params.id}`)
    room.value = res.data
  } catch (err) {
    error.value = err.response?.data?.message || 'Could not load room'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div v-if="loading" class="text-center py-5">
    <div class="spinner-border text-primary"></div>
  </div>

  <div v-else-if="error" class="alert alert-danger">
    {{ error }} <RouterLink to="/rooms">Back to rooms</RouterLink>
  </div>

  <div v-else class="row g-4">
    <!-- Left: room info -->
    <div class="col-lg-8">
      <RouterLink :to="{ path: '/rooms', query: route.query }" class="d-inline-block mb-3">← Back to rooms</RouterLink>
      <img :src="room.image" class="img-fluid rounded mb-3 w-100 room-img" :alt="room.type + ' room'" />
      <h2>{{ room.type }} Room <small class="text-muted fs-5">No. {{ room.roomNumber }}</small></h2>
      <p class="text-muted">Up to {{ room.capacity }} guest(s)</p>
      <p>{{ room.description }}</p>

      <h5 class="mt-4">Amenities</h5>
      <div class="d-flex flex-wrap gap-2">
        <span v-for="a in room.amenities" :key="a" class="badge rounded-pill text-bg-light border p-2">
          ✓ {{ a }}
        </span>
      </div>
    </div>

    <!-- Right: price box -->
    <div class="col-lg-4">
      <div class="card shadow-sm sticky-top" style="top: 1rem">
        <div class="card-body">
          <h4>{{ formatPrice(room.price) }} <span class="fs-6 text-muted">/ night</span></h4>
          <hr />
          <div class="mb-2">
            <label class="form-label small mb-1">Check-in</label>
            <input v-model="checkIn" type="date" class="form-control" :min="today()" />
          </div>
          <div class="mb-2">
            <label class="form-label small mb-1">Check-out</label>
            <input v-model="checkOut" type="date" class="form-control" :min="nextDay(checkIn)" />
          </div>
          <div class="mb-3">
            <label class="form-label small mb-1">Guests</label>
            <input v-model.number="guests" type="number" class="form-control" min="1" :max="room.capacity" />
          </div>

          <div v-if="nights > 0" class="d-flex justify-content-between">
            <span>{{ formatPrice(room.price) }} × {{ nights }} night(s)</span>
            <strong>{{ formatPrice(total) }}</strong>
          </div>
          <div v-else class="text-danger small">Check-out must be after check-in</div>

          <div v-if="bookingError" class="alert alert-danger small mt-3 mb-0">{{ bookingError }}</div>

          <button class="btn btn-primary w-100 mt-3" :disabled="nights < 1 || booking" @click="bookRoom">
            {{ booking ? 'Booking...' : auth.isLoggedIn ? 'Book Now' : 'Login to Book' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.room-img {
  max-height: 420px;
  object-fit: cover;
}
</style>
