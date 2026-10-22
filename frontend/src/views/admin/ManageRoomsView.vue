<script setup>
import { ref, reactive, onMounted } from 'vue'
import api from '@/api'
import AdminNav from '@/components/AdminNav.vue'
import { formatPrice } from '@/utils'

const rooms = ref([])
const loading = ref(true)
const error = ref('')

// Form state
const showForm = ref(false)
const editingId = ref(null) // null = adding a new room, otherwise the id of the room being edited
const formError = ref('')
const saving = ref(false)

const emptyForm = {
  roomNumber: '',
  type: 'Single',
  price: '',
  capacity: 1,
  image: '',
  description: '',
  amenities: '', // typed as "WiFi, AC, TV" and turned into an array when saving
}
const form = reactive({ ...emptyForm })

async function loadRooms() {
  try {
    const res = await api.get('/rooms')
    rooms.value = res.data.sort((a, b) => a.roomNumber.localeCompare(b.roomNumber))
  } catch (err) {
    error.value = err.response?.data?.message || 'Could not load rooms'
  } finally {
    loading.value = false
  }
}

function openAddForm() {
  Object.assign(form, emptyForm)
  editingId.value = null
  formError.value = ''
  showForm.value = true
}

function openEditForm(room) {
  Object.assign(form, emptyForm, { ...room, amenities: room.amenities.join(', ') })
  editingId.value = room._id
  formError.value = ''
  showForm.value = true
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

async function saveRoom() {
  formError.value = ''
  saving.value = true

  const data = {
    roomNumber: form.roomNumber,
    type: form.type,
    price: form.price,
    capacity: form.capacity,
    image: form.image,
    description: form.description,
    // "WiFi, AC, , TV" -> ['WiFi', 'AC', 'TV']
    amenities: form.amenities.split(',').map((a) => a.trim()).filter((a) => a),
  }

  try {
    if (editingId.value) {
      await api.put(`/rooms/${editingId.value}`, data)
    } else {
      await api.post('/rooms', data)
    }
    showForm.value = false
    await loadRooms()
  } catch (err) {
    formError.value = err.response?.data?.message || 'Could not save room'
  } finally {
    saving.value = false
  }
}

async function deleteRoom(room) {
  if (!confirm(`Delete room ${room.roomNumber}? This cannot be undone.`)) return
  try {
    await api.delete(`/rooms/${room._id}`)
    rooms.value = rooms.value.filter((r) => r._id !== room._id)
  } catch (err) {
    alert(err.response?.data?.message || 'Could not delete room')
  }
}

onMounted(loadRooms)
</script>

<template>
  <AdminNav />

  <div class="d-flex justify-content-between align-items-center mb-3">
    <h3 class="mb-0">Manage Rooms</h3>
    <button v-if="!showForm" class="btn btn-primary" @click="openAddForm">+ Add Room</button>
  </div>

  <!-- Add / Edit form -->
  <div v-if="showForm" class="card shadow-sm mb-4">
    <div class="card-header fw-semibold">{{ editingId ? `Edit Room ${form.roomNumber}` : 'Add New Room' }}</div>
    <div class="card-body">
      <div v-if="formError" class="alert alert-danger">{{ formError }}</div>

      <form @submit.prevent="saveRoom">
        <div class="row g-3">
          <div class="col-md-3">
            <label class="form-label">Room Number</label>
            <input v-model="form.roomNumber" class="form-control" required />
          </div>
          <div class="col-md-3">
            <label class="form-label">Type</label>
            <select v-model="form.type" class="form-select">
              <option>Single</option>
              <option>Double</option>
              <option>Suite</option>
            </select>
          </div>
          <div class="col-md-3">
            <label class="form-label">Price per Night ($)</label>
            <input v-model.number="form.price" type="number" min="1" class="form-control" required />
          </div>
          <div class="col-md-3">
            <label class="form-label">Max Guests</label>
            <input v-model.number="form.capacity" type="number" min="1" max="10" class="form-control" required />
          </div>
          <div class="col-md-9">
            <label class="form-label">Image URL</label>
            <input v-model="form.image" type="url" class="form-control" placeholder="https://..." />
          </div>
          <div class="col-md-3">
            <!-- Preview of the image -->
            <img v-if="form.image" :src="form.image" class="img-thumbnail preview" alt="Preview" />
          </div>
          <div class="col-12">
            <label class="form-label">Description</label>
            <textarea v-model="form.description" class="form-control" rows="2"></textarea>
          </div>
          <div class="col-12">
            <label class="form-label">Amenities <small class="text-muted">(separate with commas)</small></label>
            <input v-model="form.amenities" class="form-control" placeholder="WiFi, AC, TV" />
          </div>
        </div>

        <div class="mt-3 d-flex gap-2">
          <button class="btn btn-primary" :disabled="saving">{{ saving ? 'Saving...' : 'Save' }}</button>
          <button type="button" class="btn btn-outline-secondary" @click="showForm = false">Cancel</button>
        </div>
      </form>
    </div>
  </div>

  <!-- Rooms table -->
  <div v-if="loading" class="text-center py-5"><div class="spinner-border text-primary"></div></div>
  <div v-else-if="error" class="alert alert-danger">{{ error }}</div>
  <div v-else class="card">
    <div class="table-responsive">
      <table class="table table-hover mb-0 align-middle">
        <thead>
          <tr><th>Image</th><th>No.</th><th>Type</th><th>Price</th><th>Guests</th><th>Amenities</th><th class="text-end">Actions</th></tr>
        </thead>
        <tbody>
          <tr v-if="rooms.length === 0"><td colspan="7" class="text-center text-muted">No rooms yet</td></tr>
          <tr v-for="room in rooms" :key="room._id">
            <td><img v-if="room.image" :src="room.image" class="thumb rounded" alt="" /></td>
            <td class="fw-semibold">{{ room.roomNumber }}</td>
            <td>{{ room.type }}</td>
            <td>{{ formatPrice(room.price) }}</td>
            <td>{{ room.capacity }}</td>
            <td><small>{{ room.amenities.join(', ') }}</small></td>
            <td class="text-end text-nowrap">
              <button class="btn btn-sm btn-outline-primary me-1" @click="openEditForm(room)">Edit</button>
              <button class="btn btn-sm btn-outline-danger" @click="deleteRoom(room)">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.thumb {
  width: 70px;
  height: 50px;
  object-fit: cover;
}
.preview {
  max-height: 80px;
}
</style>
