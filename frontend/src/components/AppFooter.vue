<script setup>
const year = new Date().getFullYear()
</script>

<template>
  <footer class="bg-dark text-white-50 pt-4 pb-3 mt-auto">
    <div class="container">
      <div class="row g-4">
        <div class="col-md-5">
          <h5 class="text-white">🏨 Hotel Booking</h5>
          <p class="small mb-0">Comfortable rooms, friendly service and easy online booking.</p>
        </div>
        <div class="col-6 col-md-3">
          <h6 class="text-white">Quick Links</h6>
          <ul class="list-unstyled small mb-0">
            <li><RouterLink to="/" class="footer-link">Home</RouterLink></li>
            <li><RouterLink to="/rooms" class="footer-link">Rooms</RouterLink></li>
            <li><RouterLink to="/my-bookings" class="footer-link">My Bookings</RouterLink></li>
          </ul>
        </div>
        <div class="col-6 col-md-4">
          <h6 class="text-white">Contact</h6>
          <ul class="list-unstyled small mb-0">
            <li>📍 123 Hotel Street, Dhaka</li>
            <li>📞 +880 1700-000000</li>
            <li>✉️ info@hotelbooking.com</li>
          </ul>
        </div>
      </div>
      <hr class="border-secondary" />
      <p class="small text-center mb-0">© {{ year }} Hotel Booking. All rights reserved.</p>
    </div>
  </footer>
</template>

<style scoped>
.footer-link {
  color: inherit;
  text-decoration: none;
}
.footer-link:hover {
  color: #fff;
}
</style>
