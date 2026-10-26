<script setup>
import { ref, onMounted } from 'vue'
import api from '@/api'
import SearchBox from '@/components/SearchBox.vue'
import RoomCard from '@/components/RoomCard.vue'

const featuredRooms = ref([])

const features = [
  { icon: '📶', title: 'Free WiFi', text: 'Fast internet in every room.' },
  { icon: '🍳', title: 'Breakfast', text: 'Fresh breakfast every morning.' },
  { icon: '🚗', title: 'Free Parking', text: 'Safe parking for all guests.' },
  { icon: '🕒', title: '24/7 Service', text: 'Our front desk never closes.' },
]

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

  <!-- Why choose us -->
  <h3 class="text-center mt-5 mb-4">Why Stay With Us</h3>
  <div class="row g-4 text-center">
    <div v-for="f in features" :key="f.title" class="col-6 col-lg-3">
      <div class="card h-100 border-0 bg-light">
        <div class="card-body">
          <div class="fs-1">{{ f.icon }}</div>
          <h6 class="mt-2">{{ f.title }}</h6>
          <p class="small text-muted mb-0">{{ f.text }}</p>
        </div>
      </div>
    </div>
  </div>

  <!-- About + contact -->
  <div id="about" class="row g-4 align-items-center mt-5">
    <div class="col-lg-6">
      <img
        src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=900"
        class="img-fluid rounded shadow-sm"
        alt="Hotel building"
      />
    </div>
    <div class="col-lg-6">
      <h3>About Our Hotel</h3>
      <p class="text-muted">
        Located in the heart of the city, our hotel offers clean and comfortable rooms for solo travellers,
        couples and families. Book online in a few clicks and manage your bookings any time.
      </p>
      <ul class="list-unstyled">
        <li>📍 123 Hotel Street, Dhaka</li>
        <li>📞 +880 1700-000000</li>
        <li>✉️ info@hotelbooking.com</li>
        <li>🕑 Check-in from 2:00 PM · Check-out until 12:00 PM</li>
      </ul>
      <RouterLink to="/rooms" class="btn btn-primary">Book a Room</RouterLink>
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
