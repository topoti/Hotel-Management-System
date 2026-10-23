<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '@/api'
import AdminNav from '@/components/AdminNav.vue'
import { formatDate, formatPrice, nightsBetween, statusColors, statusLabel } from '@/utils'

const bookings = ref([])
const loading = ref(true)
const error = ref('')

const statusFilter = ref('') // '' = all
const search = ref('')

async function loadBookings() {
  try {
    const res = await api.get('/bookings')
    bookings.value = res.data
  } catch (err) {
    error.value = err.response?.data?.message || 'Could not load bookings'
  } finally {
    loading.value = false
  }
}

// Filter the list in the browser by status and by guest name / email / room number
const filteredBookings = computed(() => {
  const text = search.value.toLowerCase()
  return bookings.value.filter((b) => {
    if (statusFilter.value && b.status !== statusFilter.value) return false
    if (!text) return true
    return (
      b.user?.name.toLowerCase().includes(text) ||
      b.user?.email.toLowerCase().includes(text) ||
      b.room?.roomNumber.includes(text)
    )
  })
})

// How many bookings have each status (shown on the filter buttons)
function countOf(status) {
  return status ? bookings.value.filter((b) => b.status === status).length : bookings.value.length
}

async function changeStatus(booking, status) {
  const messages = {
    checked_in: 'Check in this guest?',
    checked_out: 'Check out this guest?',
    cancelled: 'Cancel this booking?',
  }
  if (!confirm(messages[status])) return

  try {
    const res = await api.put(`/bookings/${booking._id}/status`, { status })
    booking.status = res.data.status
  } catch (err) {
    alert(err.response?.data?.message || 'Could not update booking')
  }
}

onMounted(loadBookings)
</script>

<template>
  <AdminNav />
  <h3 class="mb-3">All Bookings</h3>

  <!-- Filters -->
  <div class="d-flex flex-wrap gap-2 justify-content-between mb-3">
    <div class="btn-group btn-group-sm flex-wrap">
      <button
        v-for="s in ['', 'confirmed', 'checked_in', 'checked_out', 'cancelled']"
        :key="s"
        class="btn"
        :class="statusFilter === s ? 'btn-primary' : 'btn-outline-primary'"
        @click="statusFilter = s"
      >
        {{ s ? statusLabel(s) : 'All' }} ({{ countOf(s) }})
      </button>
    </div>
    <input v-model="search" class="form-control form-control-sm search" placeholder="Search guest or room..." />
  </div>

  <div v-if="loading" class="text-center py-5"><div class="spinner-border text-primary"></div></div>
  <div v-else-if="error" class="alert alert-danger">{{ error }}</div>
  <div v-else class="card">
    <div class="table-responsive">
      <table class="table table-hover mb-0 align-middle">
        <thead>
          <tr><th>Guest</th><th>Room</th><th>Check-in</th><th>Check-out</th><th>Guests</th><th>Total</th><th>Status</th><th class="text-end">Actions</th></tr>
        </thead>
        <tbody>
          <tr v-if="filteredBookings.length === 0">
            <td colspan="8" class="text-center text-muted">No bookings found</td>
          </tr>
          <tr v-for="b in filteredBookings" :key="b._id">
            <td>
              {{ b.user?.name || 'Deleted user' }}
              <small class="text-muted d-block">{{ b.user?.email }}</small>
            </td>
            <td>{{ b.room ? `${b.room.roomNumber} (${b.room.type})` : 'Deleted room' }}</td>
            <td>{{ formatDate(b.checkIn) }}</td>
            <td>
              {{ formatDate(b.checkOut) }}
              <small class="text-muted d-block">{{ nightsBetween(b.checkIn, b.checkOut) }} night(s)</small>
            </td>
            <td>{{ b.guests }}</td>
            <td>{{ formatPrice(b.totalPrice) }}</td>
            <td><span class="badge" :class="`text-bg-${statusColors[b.status]}`">{{ statusLabel(b.status) }}</span></td>
            <td class="text-end text-nowrap">
              <!-- Only show the buttons that make sense for the current status -->
              <template v-if="b.status === 'confirmed'">
                <button class="btn btn-sm btn-success me-1" @click="changeStatus(b, 'checked_in')">Check In</button>
                <button class="btn btn-sm btn-outline-danger" @click="changeStatus(b, 'cancelled')">Cancel</button>
              </template>
              <button v-else-if="b.status === 'checked_in'" class="btn btn-sm btn-secondary" @click="changeStatus(b, 'checked_out')">
                Check Out
              </button>
              <span v-else class="text-muted small">—</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.search {
  max-width: 250px;
}
</style>
