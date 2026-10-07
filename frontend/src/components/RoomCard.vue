<script setup>
import { formatPrice } from '@/utils'

// room = one room object from the API
// query = the search dates, passed on to the details page
defineProps({
  room: { type: Object, required: true },
  query: { type: Object, default: () => ({}) },
})
</script>

<template>
  <div class="card h-100 shadow-sm">
    <img :src="room.image" class="card-img-top room-img" :alt="room.type + ' room'" />
    <div class="card-body d-flex flex-column">
      <div class="d-flex justify-content-between align-items-start">
        <h5 class="card-title mb-1">{{ room.type }} Room</h5>
        <span class="badge text-bg-secondary">No. {{ room.roomNumber }}</span>
      </div>
      <p class="text-muted small mb-2">Up to {{ room.capacity }} guest(s)</p>
      <p class="card-text small flex-grow-1">{{ room.description }}</p>
      <div class="d-flex justify-content-between align-items-center">
        <span>
          <strong class="fs-5">{{ formatPrice(room.price) }}</strong>
          <span class="text-muted small"> / night</span>
        </span>
        <RouterLink :to="{ path: `/rooms/${room._id}`, query }" class="btn btn-outline-primary btn-sm">
          View Details
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<style scoped>
.room-img {
  height: 200px;
  object-fit: cover;
}
</style>
