<script setup>
import { ref, onMounted } from 'vue'
import api from '@/api'
import AdminNav from '@/components/AdminNav.vue'
import { formatDate, formatPrice, statusColors, statusLabel } from '@/utils'

const stats = ref(null)
const error = ref('')

async function loadStats() {
  try {
    const res = await api.get('/stats')
    stats.value = res.data
  } catch (err) {
    error.value = err.response?.data?.message || 'Could not load dashboard'
  }
}

// Check a guest in or out straight from the dashboard
async function changeStatus(booking, status) {
  try {
    await api.put(`/bookings/${booking._id}/status`, { status })
    await loadStats() // refresh all numbers
  } catch (err) {
    alert(err.response?.data?.message || 'Could not update booking')
  }
}

onMounted(loadStats)
</script>

<template>
  <AdminNav />

  <div v-if="error" class="alert alert-danger">{{ error }}</div>

  <div v-else-if="!stats" class="text-center py-5">
    <div class="spinner-border text-primary"></div>
  </div>

  <template v-else>
    <!-- Number cards -->
    <div class="row g-3 mb-4">
      <div class="col-6 col-lg">
        <div class="card text-bg-primary h-100">
          <div class="card-body">
            <div class="small">Total Rooms</div>
            <div class="fs-2 fw-bold">{{ stats.totalRooms }}</div>
          </div>
        </div>
      </div>
      <div class="col-6 col-lg">
        <div class="card text-bg-success h-100">
          <div class="card-body">
            <div class="small">Occupied Now</div>
            <div class="fs-2 fw-bold">{{ stats.occupiedRooms }} / {{ stats.totalRooms }}</div>
          </div>
        </div>
      </div>
      <div class="col-6 col-lg">
        <div class="card text-bg-info h-100">
          <div class="card-body">
            <div class="small">Total Bookings</div>
            <div class="fs-2 fw-bold">{{ stats.totalBookings }}</div>
          </div>
        </div>
      </div>
      <div class="col-6 col-lg">
        <div class="card text-bg-warning h-100">
          <div class="card-body">
            <div class="small">Registered Guests</div>
            <div class="fs-2 fw-bold">{{ stats.totalGuests }}</div>
          </div>
        </div>
      </div>
      <div class="col-12 col-lg">
        <div class="card text-bg-dark h-100">
          <div class="card-body">
            <div class="small">Total Revenue</div>
            <div class="fs-2 fw-bold">{{ formatPrice(stats.revenue) }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Today's arrivals and departures -->
    <div class="row g-4 mb-4">
      <div class="col-lg-6">
        <div class="card h-100">
          <div class="card-header fw-semibold">🛬 Arriving Today ({{ stats.arrivals.length }})</div>
          <ul class="list-group list-group-flush">
            <li v-if="stats.arrivals.length === 0" class="list-group-item text-muted">No arrivals today</li>
            <li v-for="b in stats.arrivals" :key="b._id" class="list-group-item d-flex justify-content-between align-items-center">
              <span>
                <strong>{{ b.user?.name }}</strong> – Room {{ b.room?.roomNumber }}
                <small class="text-muted d-block">{{ b.user?.phone }}</small>
              </span>
              <button class="btn btn-sm btn-success" @click="changeStatus(b, 'checked_in')">Check In</button>
            </li>
          </ul>
        </div>
      </div>
      <div class="col-lg-6">
        <div class="card h-100">
          <div class="card-header fw-semibold">🛫 Leaving Today ({{ stats.departures.length }})</div>
          <ul class="list-group list-group-flush">
            <li v-if="stats.departures.length === 0" class="list-group-item text-muted">No departures today</li>
            <li v-for="b in stats.departures" :key="b._id" class="list-group-item d-flex justify-content-between align-items-center">
              <span>
                <strong>{{ b.user?.name }}</strong> – Room {{ b.room?.roomNumber }}
                <small class="text-muted d-block">{{ b.user?.phone }}</small>
              </span>
              <button class="btn btn-sm btn-secondary" @click="changeStatus(b, 'checked_out')">Check Out</button>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Recent bookings -->
    <div class="card">
      <div class="card-header d-flex justify-content-between">
        <span class="fw-semibold">Recent Bookings</span>
        <RouterLink to="/admin/bookings">View all →</RouterLink>
      </div>
      <div class="table-responsive">
        <table class="table mb-0 align-middle">
          <thead>
            <tr><th>Guest</th><th>Room</th><th>Dates</th><th>Total</th><th>Status</th></tr>
          </thead>
          <tbody>
            <tr v-if="stats.recentBookings.length === 0">
              <td colspan="5" class="text-muted text-center">No bookings yet</td>
            </tr>
            <tr v-for="b in stats.recentBookings" :key="b._id">
              <td>{{ b.user?.name || 'Deleted user' }}</td>
              <td>{{ b.room ? `${b.room.roomNumber} (${b.room.type})` : 'Deleted room' }}</td>
              <td>{{ formatDate(b.checkIn) }} → {{ formatDate(b.checkOut) }}</td>
              <td>{{ formatPrice(b.totalPrice) }}</td>
              <td><span class="badge" :class="`text-bg-${statusColors[b.status]}`">{{ statusLabel(b.status) }}</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </template>
</template>
