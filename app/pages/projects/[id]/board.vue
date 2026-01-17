<script setup lang="ts">
definePageMeta({
  layout: 'default',
})

const route = useRoute()
const toast = useToast()
const projectId = route.params.id as string

// State
const project = ref<any>(null)
const phases = ref<any[]>([])
const tasks = ref<any[]>([])
const loading = ref(true)
const draggedTask = ref<any>(null)

// Task status columns
const columns = [
  { value: 'pending', label: 'To Do', color: 'neutral' as const, icon: 'i-heroicons-queue-list' },
  { value: 'in_progress', label: 'In Progress', color: 'primary' as const, icon: 'i-heroicons-arrow-path' },
  { value: 'review', label: 'Review', color: 'warning' as const, icon: 'i-heroicons-eye' },
  { value: 'completed', label: 'Done', color: 'success' as const, icon: 'i-heroicons-check-circle' },
]

// Computed tasks by status
const tasksByStatus = computed(() => {
  const grouped: Record<string, any[]> = {
    'pending': [],
    'in_progress': [],
    'review': [],
    'completed': [],
  }
  
  tasks.value.forEach(task => {
    const status = task.status || 'pending'
    if (grouped[status]) {
      grouped[status].push(task)
    }
  })
  
  return grouped
})

// Category icons
const categoryIcons: Record<string, string> = {
  backend: 'i-heroicons-server',
  frontend: 'i-heroicons-device-phone-mobile',
  devops: 'i-heroicons-cog-6-tooth',
}

// Category colors
type BadgeColor = 'primary' | 'success' | 'warning' | 'error' | 'neutral' | 'info' | 'secondary'
const categoryColors: Record<string, BadgeColor> = {
  backend: 'primary',
  frontend: 'success',
  devops: 'warning',
}

// Fetch data
async function fetchData() {
  loading.value = true
  try {
    const [projectData, phasesData, tasksData] = await Promise.all([
      $fetch(`/api/projects/${projectId}`),
      $fetch(`/api/phases?projectId=${projectId}`),
      $fetch(`/api/tasks?projectId=${projectId}`),
    ])
    project.value = projectData
    phases.value = phasesData
    tasks.value = tasksData
  } catch (error: any) {
    toast.add({
      title: 'Error',
      description: error.message || 'Failed to fetch data',
      color: 'error',
    })
  } finally {
    loading.value = false
  }
}

// Drag and drop handlers
function handleDragStart(task: any) {
  draggedTask.value = task
}

function handleDragOver(event: DragEvent) {
  event.preventDefault()
}

async function handleDrop(status: string) {
  if (!draggedTask.value) return
  
  try {
    const updatedTask = await $fetch(`/api/tasks/${draggedTask.value.id}`, {
      method: 'PUT',
      body: {
        ...draggedTask.value,
        status,
      },
    })
    
    // Update local state
    const taskIndex = tasks.value.findIndex(t => t.id === draggedTask.value.id)
    if (taskIndex !== -1) {
      tasks.value[taskIndex] = updatedTask
    }
    
    toast.add({
      title: 'Success',
      description: 'Task status updated',
      color: 'success',
    })
  } catch (error: any) {
    toast.add({
      title: 'Error',
      description: error.message || 'Failed to update task',
      color: 'error',
    })
  } finally {
    draggedTask.value = null
  }
}

// Get phase name
function getPhaseName(phaseId: string) {
  const phase = phases.value.find(p => p.id === phaseId)
  return phase?.name || 'No Phase'
}

// Calculate work weight
function calculateWorkWeight(task: any) {
  const K = task.complexity || 0
  const W = task.timeEstimate || 0
  const R = task.risk || 0
  const D = task.dependency || 0
  const S = task.skillLevel || 0
  return (K * 2) + (W * 1.5) + (R * 1.5) + (D * 1) + (S * 1)
}

onMounted(() => {
  fetchData()
})
</script>

<template>
  <div class="p-6">
    <!-- Header -->
    <div class="mb-6">
      <div class="flex items-center gap-2 mb-2">
        <UButton
          icon="i-heroicons-arrow-left"
          variant="ghost"
          size="sm"
          :to="`/projects/${projectId}`"
        />
        <h1 class="text-2xl font-bold">{{ project?.name || 'Project' }} - Board</h1>
      </div>
      <p class="text-gray-500 dark:text-gray-400">Kanban board view for task management</p>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center h-64">
      <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 animate-spin text-primary" />
    </div>

    <!-- Kanban Board -->
    <div v-else class="grid grid-cols-4 gap-4">
      <div
        v-for="column in columns"
        :key="column.value"
        class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 min-h-150"
        @dragover="handleDragOver"
        @drop="handleDrop(column.value)"
      >
        <!-- Column Header -->
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center gap-2">
            <UIcon :name="column.icon" class="w-5 h-5" />
            <h3 class="font-semibold">{{ column.label }}</h3>
          </div>
          <UBadge :color="column.color" variant="subtle">
            {{ tasksByStatus[column.value]?.length || 0 }}
          </UBadge>
        </div>

        <!-- Tasks -->
        <div class="space-y-3">
          <UCard
            v-for="task in tasksByStatus[column.value]"
            :key="task.id"
            class="cursor-move hover:shadow-md transition-shadow"
            draggable="true"
            @dragstart="handleDragStart(task)"
          >
            <div class="space-y-2">
              <!-- Task Name -->
              <h4 class="font-medium text-sm line-clamp-2">{{ task.name }}</h4>

              <!-- Description -->
              <p v-if="task.description" class="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                {{ task.description }}
              </p>

              <!-- Phase Badge -->
              <div class="flex items-center gap-2">
                <UBadge size="xs" color="neutral" variant="subtle">
                  {{ getPhaseName(task.phaseId) }}
                </UBadge>
                
                <!-- Category Badge -->
                <UBadge
                  v-if="task.category"
                  size="xs"
                  :color="categoryColors[task.category]"
                  variant="subtle"
                >
                  <div class="flex items-center gap-1">
                    <UIcon :name="categoryIcons[task.category]" class="w-3 h-3" />
                    <span>{{ task.category }}</span>
                  </div>
                </UBadge>
              </div>

              <!-- Work Weight -->
              <div class="flex items-center justify-between text-xs">
                <span class="text-gray-500">Work Weight</span>
                <span class="font-medium">{{ calculateWorkWeight(task).toFixed(1) }} pts</span>
              </div>
            </div>
          </UCard>
        </div>
      </div>
    </div>
  </div>
</template>
