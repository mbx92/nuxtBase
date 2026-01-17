<script setup lang="ts">
definePageMeta({
  layout: 'default',
})

const toast = useToast()

// State
const projects = ref<any[]>([])
const loading = ref(true)
const showModal = ref(false)
const isEditing = ref(false)
const selectedProject = ref<any>(null)

const form = ref({
  name: '',
  description: '',
  totalBudget: 15000000,
  dpPercent: 50,
  completionPercent: 40,
  bufferPercent: 10,
  safetyNetPercent: 10,
  managementFeePercent: 10,
  deploymentFee: 1000000,
  daysDuration: 12,
  estimatedTotalWeight: 327.5,
  status: 'active',
})

// Fetch projects
async function fetchProjects() {
  loading.value = true
  try {
    projects.value = await $fetch('/api/projects')
  } catch (error: any) {
    toast.add({
      title: 'Error',
      description: error.message || 'Failed to fetch projects',
      color: 'error',
    })
  } finally {
    loading.value = false
  }
}

// Create project
async function createProject() {
  try {
    const newProject = await $fetch('/api/projects', {
      method: 'POST',
      body: form.value,
    })
    projects.value.unshift(newProject)
    closeModal()
    toast.add({
      title: 'Success',
      description: 'Project created successfully',
      color: 'success',
    })
  } catch (error: any) {
    toast.add({
      title: 'Error',
      description: error.message || 'Failed to create project',
      color: 'error',
    })
  }
}

// Update project
async function updateProject() {
  if (!selectedProject.value) return
  try {
    const updatedProject = await $fetch(`/api/projects/${selectedProject.value.id}`, {
      method: 'PUT',
      body: form.value,
    })
    const index = projects.value.findIndex(p => p.id === selectedProject.value.id)
    if (index !== -1) {
      projects.value[index] = updatedProject
    }
    closeModal()
    toast.add({
      title: 'Success',
      description: 'Project updated successfully',
      color: 'success',
    })
  } catch (error: any) {
    toast.add({
      title: 'Error',
      description: error.message || 'Failed to update project',
      color: 'error',
    })
  }
}

// Delete project
const { confirm } = useConfirmDialog()

async function deleteProject(project: any) {
  const projectName = project.name || 'this project'
  const confirmed = await confirm({
    title: 'Delete Project',
    message: `Are you sure you want to delete "${projectName}"? This action cannot be undone.`,
    confirmText: 'Delete',
    cancelText: 'Cancel',
    color: 'error',
    icon: 'i-heroicons-trash',
  })
  
  if (!confirmed) return
  
  try {
    await $fetch(`/api/projects/${project.id}`, { method: 'DELETE' })
    projects.value = projects.value.filter(p => p.id !== project.id)
    toast.add({
      title: 'Success',
      description: 'Project deleted successfully',
      color: 'success',
    })
  } catch (error: any) {
    toast.add({
      title: 'Error',
      description: error.message || 'Failed to delete project',
      color: 'error',
    })
  }
}

// Modal handlers
function openCreateModal() {
  isEditing.value = false
  selectedProject.value = null
  form.value = {
    name: '',
    description: '',
    totalBudget: 15000000,
    dpPercent: 50,
    completionPercent: 40,
    bufferPercent: 10,
    safetyNetPercent: 10,
    managementFeePercent: 10,
    deploymentFee: 1000000,
    daysDuration: 12,
    estimatedTotalWeight: 327.5,
    status: 'active',
  }
  showModal.value = true
}

function openEditModal(project: any) {
  isEditing.value = true
  selectedProject.value = project
  form.value = {
    name: project.name,
    description: project.description || '',
    totalBudget: project.totalBudget,
    dpPercent: project.dpPercent || 50,
    completionPercent: project.completionPercent || 40,
    bufferPercent: project.bufferPercent || 10,
    safetyNetPercent: project.safetyNetPercent,
    managementFeePercent: project.managementFeePercent,
    deploymentFee: project.deploymentFee,
    daysDuration: project.daysDuration,
    estimatedTotalWeight: project.estimatedTotalWeight || 327.5,
    status: project.status,
  }
  showModal.value = true
}

function closeModal() {
  showModal.value = false
}

function handleSubmit() {
  if (isEditing.value) {
    updateProject()
  } else {
    createProject()
  }
}

// Format currency
function formatCurrency(value: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value)
}

// Status options
const statusOptions = [
  { label: 'Active', value: 'active' },
  { label: 'Completed', value: 'completed' },
  { label: 'Cancelled', value: 'cancelled' },
]

onMounted(() => {
  fetchProjects()
})
</script>

<template>
  <div class="p-6">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold">Projects</h1>
        <p class="text-gray-500 dark:text-gray-400">Manage your project budgets and configurations</p>
      </div>
      <UButton icon="i-heroicons-plus" @click="openCreateModal">
        New Project
      </UButton>
    </div>

    <!-- Projects Grid -->
    <div v-if="loading" class="flex items-center justify-center h-64">
      <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 animate-spin text-primary" />
    </div>

    <div v-else-if="projects.length === 0" class="text-center py-12">
      <UIcon name="i-heroicons-folder-open" class="w-12 h-12 mx-auto text-gray-400" />
      <h3 class="mt-2 text-lg font-medium">No projects yet</h3>
      <p class="mt-1 text-gray-500">Get started by creating a new project.</p>
      <UButton class="mt-4" @click="openCreateModal">
        Create Project
      </UButton>
    </div>

    <div v-else class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <UCard v-for="project in projects" :key="project.id" class="hover:shadow-lg transition-shadow">
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="font-semibold truncate">{{ project.name }}</h3>
            <UBadge :color="project.status === 'active' ? 'success' : project.status === 'completed' ? 'info' : 'neutral'">
              {{ project.status }}
            </UBadge>
          </div>
        </template>

        <div class="space-y-3">
          <p v-if="project.description" class="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
            {{ project.description }}
          </p>
          
          <div class="space-y-2 text-sm">
            <div class="flex justify-between">
              <span class="text-gray-500">Total Budget</span>
              <span class="font-medium">{{ formatCurrency(project.totalBudget) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">Down Payment</span>
              <span class="text-green-600 font-medium">{{ project.dpPercent || 50 }}%</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">Duration</span>
              <span>{{ project.daysDuration }} days</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">Estimated Weight</span>
              <span>{{ project.estimatedTotalWeight || 327.5 }} pts</span>
            </div>
          </div>
        </div>

        <template #footer>
          <div class="flex gap-2">
            <UButton
              size="sm"
              color="primary"
              variant="ghost"
              :to="`/projects/${project.id}`"
            >
              View Details
            </UButton>
            <UButton
              size="sm"
              color="neutral"
              variant="ghost"
              icon="i-heroicons-pencil"
              @click="openEditModal(project)"
            />
            <UButton
              size="sm"
              color="error"
              variant="ghost"
              icon="i-heroicons-trash"
              @click="deleteProject(project)"
            />
          </div>
        </template>
      </UCard>
    </div>

    <!-- Create/Edit Modal -->
    <UModal v-model:open="showModal">
      <template #content>
        <UCard>
          <template #header>
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-semibold">{{ isEditing ? 'Edit Project' : 'Create Project' }}</h3>
              <UButton
                color="neutral"
                variant="ghost"
                icon="i-heroicons-x-mark"
                size="sm"
                @click="closeModal"
              />
            </div>
          </template>

          <form class="space-y-4" @submit.prevent="handleSubmit">
            <UFormField label="Project Name" required>
              <UInput v-model="form.name" placeholder="e.g., Kos-Man Backend" class="w-full" />
            </UFormField>

            <UFormField label="Description">
              <UTextarea v-model="form.description" placeholder="Project description..." :rows="2" class="w-full" />
            </UFormField>

            <div class="grid grid-cols-2 gap-4">
              <UFormField label="Total Budget (Rp)" required>
                <UInput v-model.number="form.totalBudget" type="number" class="w-full" />
              </UFormField>
              <UFormField label="Duration (Days)">
                <UInput v-model.number="form.daysDuration" type="number" class="w-full" />
              </UFormField>
            </div>

            <UFormField label="Estimated Total Work Weight (pts)">
              <UInput v-model.number="form.estimatedTotalWeight" type="number" step="0.5" min="100" class="w-full" />
              <template #hint>
                <span class="text-xs text-gray-400">Total work weight estimate for all tasks (default: 327.5 pts based on methodology)</span>
              </template>
            </UFormField>

            <div class="border-t pt-4 mt-4">
              <h4 class="font-medium mb-3">Payment Structure</h4>
              
              <div class="grid grid-cols-2 gap-4">
                <UFormField label="Down Payment (DP) %">
                  <UInput v-model.number="form.dpPercent" type="number" min="0" max="100" class="w-full" />
                </UFormField>
                <UFormField label="Completion Payment %">
                  <UInput v-model.number="form.completionPercent" type="number" min="0" max="100" class="w-full" />
                </UFormField>
              </div>

              <div class="mt-2">
                <UFormField label="Buffer/Retention %">
                  <UInput v-model.number="form.bufferPercent" type="number" min="0" max="100" class="w-full" />
                  <template #hint>
                    <span class="text-xs text-gray-400">Payment held until warranty period ends</span>
                  </template>
                </UFormField>
              </div>
            </div>

            <div class="grid grid-cols-3 gap-4">
              <UFormField label="Safety Net %">
                <UInput v-model.number="form.safetyNetPercent" type="number" min="0" max="100" class="w-full" />
              </UFormField>
              <UFormField label="Management Fee %">
                <UInput v-model.number="form.managementFeePercent" type="number" min="0" max="100" class="w-full" />
              </UFormField>
              <UFormField label="Deployment Fee">
                <UInput v-model.number="form.deploymentFee" type="number" class="w-full" />
              </UFormField>
            </div>

            <UFormField label="Status">
              <USelect v-model="form.status" :items="statusOptions" value-attribute="value" option-attribute="label" class="w-full" />
            </UFormField>

            <div class="flex justify-end gap-2">
              <UButton variant="outline" type="button" @click="closeModal">
                Cancel
              </UButton>
              <UButton type="submit">
                {{ isEditing ? 'Update' : 'Create' }}
              </UButton>
            </div>
          </form>
        </UCard>
      </template>
    </UModal>
  </div>
</template>
