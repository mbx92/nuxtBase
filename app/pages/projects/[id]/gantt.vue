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
    
    // Debug log to check task dates
    console.log('📊 Gantt Chart - Tasks loaded:', tasksData.map((t: any) => ({
      name: t.name,
      startDate: t.startDate,
      endDate: t.endDate,
      status: t.status
    })))
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

// Calculate timeline
const timeline = computed(() => {
  if (!tasks.value.length) return { start: new Date(), end: new Date(), days: 0 }
  
  const dates = tasks.value
    .filter(t => t.startDate && t.endDate)
    .flatMap(t => [new Date(t.startDate), new Date(t.endDate)])
  
  if (!dates.length) {
    const today = new Date()
    return { 
      start: today, 
      end: new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000),
      days: 30
    }
  }
  
  const start = new Date(Math.min(...dates.map(d => d.getTime())))
  const end = new Date(Math.max(...dates.map(d => d.getTime())))
  const days = Math.ceil((end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000))
  
  return { start, end, days }
})

// Generate timeline weeks
const timelineWeeks = computed(() => {
  const weeks: Date[] = []
  const start = new Date(timeline.value.start)
  start.setDate(start.getDate() - start.getDay()) // Start from Sunday
  
  const end = timeline.value.end
  let current = new Date(start)
  
  while (current <= end) {
    weeks.push(new Date(current))
    current.setDate(current.getDate() + 7)
  }
  
  return weeks
})

// Calculate task position and width
function getTaskStyle(task: any) {
  if (!task.startDate || !task.endDate) return { left: '0%', width: '0%' }
  
  const start = timeline.value.start.getTime()
  const totalDuration = timeline.value.end.getTime() - start
  
  const taskStart = new Date(task.startDate).getTime()
  const taskEnd = new Date(task.endDate).getTime()
  
  const left = ((taskStart - start) / totalDuration) * 100
  const width = ((taskEnd - taskStart) / totalDuration) * 100
  
  return {
    left: `${Math.max(0, left)}%`,
    width: `${Math.max(2, width)}%`
  }
}

// Format date
function formatDate(date: Date) {
  return new Intl.DateTimeFormat('id-ID', { 
    day: 'numeric',
    month: 'short' 
  }).format(date)
}

// Status colors (mapping database values to colors)
type BadgeColor = 'primary' | 'success' | 'warning' | 'error' | 'neutral' | 'info' | 'secondary'
const statusColors: Record<string, BadgeColor> = {
  'pending': 'neutral',
  'in_progress': 'primary',
  'review': 'warning',
  'completed': 'success',
}

// Calculate task completion
function calculateCompletion(task: any) {
  if (task.status === 'completed') return 100
  if (task.status === 'review') return 80
  if (task.status === 'in_progress') return 40
  return 0
}

// Category colors
const categoryColors: Record<string, BadgeColor> = {
  backend: 'primary',
  frontend: 'success',
  devops: 'warning',
}

// Category icons
const categoryIcons: Record<string, string> = {
  backend: 'i-heroicons-server',
  frontend: 'i-heroicons-device-phone-mobile',
  devops: 'i-heroicons-cog-6-tooth',
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
        <h1 class="text-2xl font-bold">{{ project?.name || 'Project' }} - Gantt Chart</h1>
      </div>
      <p class="text-gray-500 dark:text-gray-400">Timeline view for project planning</p>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center h-64">
      <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 animate-spin text-primary" />
    </div>

    <!-- Gantt Chart -->
    <div v-else class="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
      <div class="overflow-x-auto">
        <div class="min-w-300">
          <!-- Timeline Header -->
          <div class="flex border-b-2 border-gray-300 dark:border-gray-600 mb-2 pb-3 sticky top-0 bg-white dark:bg-gray-900 z-10">
            <div class="w-80 shrink-0 font-semibold text-gray-700 dark:text-gray-300">Task</div>
            <div class="flex-1 flex border-l border-gray-200 dark:border-gray-700">
              <div
                v-for="(week, index) in timelineWeeks"
                :key="index"
                class="flex-1 text-center text-sm font-medium text-gray-600 dark:text-gray-400 border-r border-gray-200 dark:border-gray-700 px-2"
              >
                {{ formatDate(week) }}
              </div>
            </div>
          </div>

        <!-- Tasks -->
        <div class="space-y-2">
          <div
            v-for="task in tasks"
            :key="task.id"
            class="flex items-center hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg p-2"
          >
            <!-- Task Info -->
            <div class="w-80 shrink-0">
              <div class="space-y-1">
                <div class="font-medium text-sm line-clamp-1">{{ task.name }}</div>
                <div class="flex items-center gap-2">
                  <UBadge
                    size="xs"
                    :color="statusColors[task.status || 'pending']"
                    variant="subtle"
                  >
                    {{ task.status === 'in_progress' ? 'In Progress' : task.status === 'completed' ? 'Completed' : task.status === 'pending' ? 'Pending' : task.status }}
                  </UBadge>
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
              </div>
            </div>

            <!-- Timeline Bar -->
            <div class="flex-1 relative h-8">
              <div
                v-if="task.startDate && task.endDate"
                class="absolute top-1 h-6 rounded-lg flex items-center px-2 shadow-sm transition-all hover:shadow-md"
                :class="{
                  'bg-primary-500': task.status === 'in_progress',
                  'bg-success-500': task.status === 'completed',
                  'bg-warning-500': task.status === 'review',
                  'bg-gray-400': task.status === 'pending' || !task.status,
                }"
                :style="getTaskStyle(task)"
              >
                <!-- Progress indicator -->
                <div
                  class="absolute inset-0 bg-white/30 rounded-lg transition-all"
                  :style="{ width: `${calculateCompletion(task)}%` }"
                />
                <span class="text-xs text-white font-medium relative z-10 truncate drop-shadow">
                  {{ task.name }}
                </span>
              </div>
              <div
                v-else
                class="absolute top-1 h-6 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center px-2"
                style="left: 0%; width: 10%"
              >
                <span class="text-xs text-gray-500 font-medium">No dates</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-if="!tasks.length" class="text-center py-12">
          <UIcon name="i-heroicons-calendar-days" class="w-12 h-12 mx-auto text-gray-400" />
          <h3 class="mt-2 text-lg font-medium">No tasks yet</h3>
          <p class="mt-1 text-gray-500">Create tasks with start and end dates to see them in the Gantt chart.</p>
        </div>
        </div>
      </div>
    </div>

    <!-- Legend -->
    <div class="mt-8 flex items-center gap-6 text-sm">
      <div class="flex items-center gap-2">
        <div class="w-4 h-4 bg-gray-400 rounded"></div>
        <span>Pending</span>
      </div>
      <div class="flex items-center gap-2">
        <div class="w-4 h-4 bg-primary-500 rounded"></div>
        <span>In Progress</span>
      </div>
      <div class="flex items-center gap-2">
        <div class="w-4 h-4 bg-warning-500 rounded"></div>
        <span>Review</span>
      </div>
      <div class="flex items-center gap-2">
        <div class="w-4 h-4 bg-success-500 rounded"></div>
        <span>Completed</span>
      </div>
    </div>
  </div>
</template>
