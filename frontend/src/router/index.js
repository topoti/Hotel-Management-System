import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

import HomeView from '@/views/HomeView.vue'
import RoomsView from '@/views/RoomsView.vue'
import RoomDetailView from '@/views/RoomDetailView.vue'
import LoginView from '@/views/LoginView.vue'
import RegisterView from '@/views/RegisterView.vue'
import MyBookingsView from '@/views/MyBookingsView.vue'
import DashboardView from '@/views/admin/DashboardView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/rooms', name: 'rooms', component: RoomsView },
    { path: '/rooms/:id', name: 'room-detail', component: RoomDetailView },
    { path: '/login', name: 'login', component: LoginView, meta: { guestOnly: true } },
    { path: '/register', name: 'register', component: RegisterView, meta: { guestOnly: true } },
    { path: '/my-bookings', name: 'my-bookings', component: MyBookingsView, meta: { requiresAuth: true } },
    { path: '/admin', name: 'admin-dashboard', component: DashboardView, meta: { requiresAdmin: true } },
  ],
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

export default router
