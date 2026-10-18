<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import api from '@/api'
import { formatDate, formatPrice, nightsBetween, today, statusColors, statusLabel } from '@/utils'

const route = useRoute()

const bookings = ref([])
const loading = ref(true)
const error = ref('')
// Show a success message when we come here right after booking (?booked=1)
const justBooked = ref(route.query.booked === '1')

async function loadBookings() {
  try {
    const res = await api.get('/bookings/my')
    bookings.value = res.data
  } catch (err) {
    error.value = err.response?.data?.message || 'Could not load bookings'
  } finally {
    loading.value = false
  }
}

// A booking can be cancelled if it is confirmed and has not started yet
function canCancel(b) {
  return b.status === 'confirmed' && b.checkIn.slice(0, 10) >= today()
}

async function cancelBooking(b) {
  if (!confirm('Are you sure you want to cancel this booking?')) return
  try {
    const res = await api.put(`/bookings/${b._id}/cancel`)
    b.status = res.data.status // update the list without reloading
  } catch (err) {
    alert(err.response?.data?.message || 'Could not cancel booking')
  }
}

onMounted(loadBookings)
</script>

<template>
  <h2 class="mb-4">My Bookings</h2>

  <div v-if="justBooked" class="alert alert-success alert-dismissible">
    🎉 Your booking is confirmed!
    <button type="button" class="btn-close" @click="justBooked = false"></button>
  </div>

  <div v-if="loading" class="text-center py-5">
    <div class="spinner-border text-primary"></div>
  </div>

  <div v-else-if="error" class="alert alert-danger">{{ error }}</div>

  <div v-else-if="bookings.length === 0" class="text-center py-5">
    <p class="text-muted">You have no bookings yet.</p>
    <RouterLink to="/rooms" class="btn btn-primary">Browse Rooms</RouterLink>
  </div>

  <div v-else class="d-flex flex-column gap-3">
    <div v-for="b in bookings" :key="b._id" class="card shadow-sm">
      <div class="row g-0">
        <div class="col-md-3">
          <!-- b.room can be null if the admin deleted the room -->
          <img v-if="b.room" :src="b.room.image" class="booking-img rounded-start" alt="Room" />
        </div>
        <div class="col-md-9">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start">
              <h5 class="card-title">
                {{ b.room ? `${b.room.type} Room ${b.room.roomNumber}` : 'Room removed' }}
              </h5>
              <span class="badge" :class="`text-bg-${statusColors[b.status]}`">{{ statusLabel(b.status) }}</span>
            </div>
            <p class="mb-1">
              📅 {{ formatDate(b.checkIn) }} → {{ formatDate(b.checkOut) }}
              <span class="text-muted">({{ nightsBetween(b.checkIn, b.checkOut) }} night(s))</span>
            </p>
            <p class="mb-1">👤 {{ b.guests }} guest(s)</p>
            <p class="mb-2">💵 Total: <strong>{{ formatPrice(b.totalPrice) }}</strong></p>
            <small class="text-muted d-block mb-2">Booked on {{ formatDate(b.createdAt) }}</small>

            <button v-if="canCancel(b)" class="btn btn-outline-danger btn-sm" @click="cancelBooking(b)">
              Cancel Booking
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.booking-img {
  width: 100%;
  height: 100%;
  min-height: 160px;
  object-fit: cover;
}
</style>
