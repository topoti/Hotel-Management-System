import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

import HomeView from '@/views/HomeView.vue'
import RoomsView from '@/views/RoomsView.vue'
import RoomDetailView from '@/views/RoomDetailView.vue'
import LoginView from '@/views/LoginView.vue'
import RegisterView from '@/views/RegisterView.vue'
import MyBookingsView from '@/views/MyBookingsView.vue'
import DashboardView from '@/views/admin/DashboardView.vue'
import ManageRoomsView from '@/views/admin/ManageRoomsView.vue'
import AllBookingsView from '@/views/admin/AllBookingsView.vue'
import NotFoundView from '@/views/NotFoundView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: HomeView, meta: { title: 'Home' } },
    { path: '/rooms', name: 'rooms', component: RoomsView, meta: { title: 'Rooms' } },
    { path: '/rooms/:id', name: 'room-detail', component: RoomDetailView, meta: { title: 'Room Details' } },
    { path: '/login', name: 'login', component: LoginView, meta: { title: 'Login', guestOnly: true } },
    { path: '/register', name: 'register', component: RegisterView, meta: { title: 'Register', guestOnly: true } },
    { path: '/my-bookings', name: 'my-bookings', component: MyBookingsView, meta: { title: 'My Bookings', requiresAuth: true } },
    { path: '/admin', name: 'admin-dashboard', component: DashboardView, meta: { title: 'Admin Dashboard', requiresAdmin: true } },
    { path: '/admin/rooms', name: 'admin-rooms', component: ManageRoomsView, meta: { title: 'Manage Rooms', requiresAdmin: true } },
    { path: '/admin/bookings', name: 'admin-bookings', component: AllBookingsView, meta: { title: 'All Bookings', requiresAdmin: true } },
    // Any other URL shows the "page not found" page (must be the last route)
    { path: '/:pathMatch(.*)*', name: 'not-found', component: NotFoundView, meta: { title: 'Page Not Found' } },
  ],
  // Always start new pages at the top
  scrollBehavior() {
    return { top: 0 }
  },
})

// Runs before every page change and decides if the user may open the page
router.beforeEach((to) => {
  const auth = useAuthStore()

  // Not logged in -> go to login, then come back to this page after login
  if ((to.meta.requiresAuth || to.meta.requiresAdmin) && !auth.isLoggedIn) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  // Logged in but not admin -> go home
  if (to.meta.requiresAdmin && !auth.isAdmin) {
    return { name: 'home' }
  }

  // Already logged in -> no need to see login/register pages
  if (to.meta.guestOnly && auth.isLoggedIn) {
    return { name: 'home' }
  }
})

// Set the browser tab title, e.g. "Rooms | Hotel Booking"
router.afterEach((to) => {
  document.title = to.meta.title ? `${to.meta.title} | Hotel Booking` : 'Hotel Booking'
})

export default router
