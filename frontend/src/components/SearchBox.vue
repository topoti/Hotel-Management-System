<script setup>
// Search form: check-in, check-out and guests.
// On submit it opens the rooms page with the values in the URL, e.g.
// /rooms?checkIn=2026-11-01&checkOut=2026-11-03&guests=2
import { reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { today, tomorrow, nextDay } from '@/utils'

const route = useRoute()
const router = useRouter()

// Start with the values already in the URL (if any)
const form = reactive({
  checkIn: route.query.checkIn || today(),
  checkOut: route.query.checkOut || tomorrow(),
  guests: Number(route.query.guests) || 1,
})
const error = ref('')

// If the user moves check-in to after check-out, move check-out too
watch(
  () => form.checkIn,
  (newCheckIn) => {
    if (form.checkOut <= newCheckIn) form.checkOut = nextDay(newCheckIn)
  },
)

function search() {
  error.value = ''
  if (form.checkOut <= form.checkIn) {
    error.value = 'Check-out must be after check-in'
    return
  }
  router.push({ path: '/rooms', query: { ...route.query, ...form } })
}
</script>

<template>
  <form class="card card-body shadow-sm" @submit.prevent="search">
    <div class="row g-2 align-items-end">
      <div class="col-md-4">
        <label class="form-label small mb-1">Check-in</label>
        <input v-model="form.checkIn" type="date" class="form-control" :min="today()" required />
      </div>
      <div class="col-md-4">
        <label class="form-label small mb-1">Check-out</label>
        <input v-model="form.checkOut" type="date" class="form-control" :min="nextDay(form.checkIn)" required />
      </div>
      <div class="col-md-2">
        <label class="form-label small mb-1">Guests</label>
        <input v-model.number="form.guests" type="number" class="form-control" min="1" max="10" required />
      </div>
      <div class="col-md-2 d-grid">
        <button class="btn btn-primary">Search</button>
      </div>
    </div>
    <div v-if="error" class="text-danger small mt-2">{{ error }}</div>
  </form>
</template>
