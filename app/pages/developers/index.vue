<script setup lang="ts">
definePageMeta({
  layout: 'default',
})

const toast = useToast()

// State
const developers = ref<any[]>([])
const loading = ref(true)
const showModal = ref(false)
const isEditing = ref(false)
const selectedDeveloper = ref<any>(null)

const form = ref({
  name: '',
  email: '',
  role: '',
  skillFocus: '',
  isActive: true,
})

// Fetch developers
async function fetchDevelopers() {
  loading.value = true
  try {
    developers.value = await $fetch('/api/developers')
  } catch (error: any) {
    toast.add({ title: 'Error', description: error.message, color: 'error' })
  } finally {
    loading.value = false
  }
}

// Create developer
async function createDeveloper() {
  try {
    const newDev = await $fetch('/api/developers', {
      method: 'POST',
      body: form.value,
    })
    developers.value.unshift(newDev)
    closeModal()
    toast.add({ title: 'Success', description: 'Developer added', color: 'success' })
  } catch (error: any) {
    toast.add({ title: 'Error', description: error.message, color: 'error' })
  }
}

// Update developer
async function updateDeveloper() {
  if (!selectedDeveloper.value) return
  try {
    const updatedDev = await $fetch(`/api/developers/${selectedDeveloper.value.id}`, {
      method: 'PUT',
      body: form.value,
    })
    const index = developers.value.findIndex(d => d.id === selectedDeveloper.value.id)
    if (index !== -1) developers.value[index] = updatedDev
    closeModal()
    toast.add({ title: 'Success', description: 'Developer updated', color: 'success' })
  } catch (error: any) {
    toast.add({ title: 'Error', description: error.message, color: 'error' })
  }
}

// Delete developer
const { confirm } = useConfirmDialog()

async function deleteDeveloper(dev: any) {
  const confirmed = await confirm({
    title: 'Delete Developer',
    message: `Are you sure you want to delete "${dev.name}"? This action cannot be undone.`,
    confirmText: 'Delete',
    cancelText: 'Cancel',
    color: 'error',
    icon: 'i-heroicons-trash',
  })
  
  if (!confirmed) return
  
  try {
    await $fetch(`/api/developers/${dev.id}`, { method: 'DELETE' })
    developers.value = developers.value.filter(d => d.id !== dev.id)
    toast.add({ title: 'Success', description: 'Developer deleted', color: 'success' })
  } catch (error: any) {
    toast.add({ title: 'Error', description: error.message, color: 'error' })
  }
}

// Modal handlers
function openCreateModal() {
  isEditing.value = false
  selectedDeveloper.value = null
  form.value = { name: '', email: '', role: '', skillFocus: '', isActive: true }
  showModal.value = true
}

function openEditModal(dev: any) {
  isEditing.value = true
  selectedDeveloper.value = dev
  form.value = { name: dev.name, email: dev.email || '', role: dev.role || '', skillFocus: dev.skillFocus || '', isActive: dev.isActive }
  showModal.value = true
}

function closeModal() {
  showModal.value = false
}

function handleSubmit() {
  if (isEditing.value) updateDeveloper()
  else createDeveloper()
}

onMounted(fetchDevelopers)
</script>

<template>
  <div class="p-6">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold">Developers</h1>
        <p class="text-gray-500">Manage your team members</p>
      </div>
      <UButton icon="i-heroicons-plus" @click="openCreateModal">
        Add Developer
      </UButton>
    </div>

    <div v-if="loading" class="flex items-center justify-center h-64">
      <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 animate-spin text-primary" />
    </div>

    <div v-else-if="developers.length === 0" class="text-center py-12">
      <UIcon name="i-heroicons-users" class="w-12 h-12 mx-auto text-gray-400" />
      <h3 class="mt-2 text-lg font-medium">No developers yet</h3>
      <UButton class="mt-4" @click="openCreateModal">Add Developer</UButton>
    </div>

    <div v-else class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <UCard v-for="dev in developers" :key="dev.id">
        <template #header>
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <UAvatar :alt="dev.name" size="md" />
              <div>
                <h3 class="font-semibold">{{ dev.name }}</h3>
                <p v-if="dev.email" class="text-sm text-gray-500">{{ dev.email }}</p>
              </div>
            </div>
            <UBadge :color="dev.isActive ? 'success' : 'neutral'">
              {{ dev.isActive ? 'Active' : 'Inactive' }}
            </UBadge>
          </div>
        </template>

        <div class="space-y-2 text-sm">
          <div v-if="dev.role" class="flex justify-between">
            <span class="text-gray-500">Role</span>
            <span>{{ dev.role }}</span>
          </div>
          <div v-if="dev.skillFocus" class="flex justify-between">
            <span class="text-gray-500">Skills</span>
            <span class="text-right">{{ dev.skillFocus }}</span>
          </div>
        </div>

        <template #footer>
          <div class="flex gap-2">
            <UButton size="sm" variant="ghost" icon="i-heroicons-pencil" @click="openEditModal(dev)" />
            <UButton size="sm" variant="ghost" color="error" icon="i-heroicons-trash" @click="deleteDeveloper(dev)" />
          </div>
        </template>
      </UCard>
    </div>

    <!-- Modal -->
    <UModal v-model:open="showModal">
      <template #content>
        <UCard>
          <template #header>
            <h3 class="font-semibold">{{ isEditing ? 'Edit Developer' : 'Add Developer' }}</h3>
          </template>
          <form class="space-y-4" @submit.prevent="handleSubmit">
            <UFormField label="Name" required>
              <UInput v-model="form.name" placeholder="Developer name" class="w-full" />
            </UFormField>
            <UFormField label="Email">
              <UInput v-model="form.email" type="email" placeholder="email@example.com" class="w-full" />
            </UFormField>
            <UFormField label="Role">
              <UInput v-model="form.role" placeholder="e.g., Auth Lead, Core APIs" class="w-full" />
            </UFormField>
            <UFormField label="Skills Focus">
              <UInput v-model="form.skillFocus" placeholder="e.g., Prisma, JWT, Security" class="w-full" />
            </UFormField>
            <UFormField>
              <label class="flex items-center gap-2">
                <input v-model="form.isActive" type="checkbox" class="rounded">
                <span>Active</span>
              </label>
            </UFormField>
            <div class="flex justify-end gap-2">
              <UButton variant="outline" @click="closeModal">Cancel</UButton>
              <UButton type="submit">{{ isEditing ? 'Update' : 'Add' }}</UButton>
            </div>
          </form>
        </UCard>
      </template>
    </UModal>
  </div>
</template>
