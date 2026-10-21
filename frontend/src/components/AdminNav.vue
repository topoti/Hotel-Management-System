<!-- Tabs shown at the top of every admin page -->
<template>
  <ul class="nav nav-pills mb-4">
    <li class="nav-item">
      <RouterLink class="nav-link" exact-active-class="active" to="/admin">📊 Dashboard</RouterLink>
    </li>
    <li class="nav-item">
      <RouterLink class="nav-link" active-class="active" to="/admin/rooms">🛏️ Rooms</RouterLink>
    </li>
    <li class="nav-item">
      <RouterLink class="nav-link" active-class="active" to="/admin/bookings">📋 Bookings</RouterLink>
    </li>
  </ul>
</template>
