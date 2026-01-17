<script setup lang="ts">
definePageMeta({
  layout: 'default',
})

const toast = useToast()
const router = useRouter()

// State
const loading = ref(true)
const stats = ref<any>(null)
const user = ref<any>(null)
const dashboardSummary = ref<any>(null)

// Fetch dashboard data
async function fetchDashboard() {
  loading.value = true
  try {
    const [sessionData, statsData, summaryData] = await Promise.all([
      $fetch('/api/auth/session'),
      $fetch('/api/auth/stats').catch(() => null), // May fail if no tasks assigned
      $fetch('/api/dashboard/summary'),
    ])

    if (!sessionData.user) {
      await router.push('/login')
      return
    }

    user.value = sessionData.user
    stats.value = statsData
    dashboardSummary.value = summaryData
  } catch (error: any) {
    toast.add({
      title: 'Error',
      description: error.message || 'Failed to load dashboard',
      color: 'error',
    })
    // Redirect to login if unauthorized
    if (error.statusCode === 401) {
      await router.push('/login')
    }
  } finally {
    loading.value = false
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

// Format date
function formatDate(date: any) {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

// Get status color
function getStatusColor(status: string) {
  const colors: Record<string, any> = {
    pending: 'neutral',
    in_progress: 'primary',
    completed: 'success',
  }
  return colors[status] || 'neutral'
}

// Get status label
function getStatusLabel(status: string) {
  const labels: Record<string, string> = {
    pending: 'Pending',
    in_progress: 'In Progress',
    completed: 'Completed',
  }
  return labels[status] || status
}

onMounted(fetchDashboard)
</script>

<template>
  <div class="p-6">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold">Dashboard</h1>
        <p v-if="user" class="text-gray-500 dark:text-gray-400 mt-1">
          Welcome back, {{ user.name }}!
        </p>
      </div>
      <div class="flex items-center gap-2">
        <UButton
          to="/projects"
          variant="outline"
          icon="i-heroicons-folder"
          size="sm"
        >
          All Projects
        </UButton>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center h-64">
      <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 animate-spin text-primary" />
    </div>

    <!-- Dashboard Content -->
    <template v-else-if="dashboardSummary">
      <!-- Project Summary Overview -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <!-- Total Projects -->
        <UCard>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-500 dark:text-gray-400">Total Projects</p>
              <p class="text-3xl font-bold mt-1">{{ dashboardSummary.summary.totalProjects }}</p>
              <p class="text-xs text-gray-500 mt-1">
                {{ dashboardSummary.summary.inProgressProjects }} active
              </p>
            </div>
            <div class="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
              <UIcon name="i-heroicons-folder" class="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
            </div>
          </div>
        </UCard>

        <!-- Total Budget -->
        <UCard>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-500 dark:text-gray-400">Total Budget</p>
              <p class="text-2xl font-bold mt-1 text-green-600">{{ formatCurrency(dashboardSummary.summary.totalBudget) }}</p>
              <p class="text-xs text-gray-500 mt-1">
                {{ formatCurrency(dashboardSummary.summary.totalPaid) }} paid
              </p>
            </div>
            <div class="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <UIcon name="i-heroicons-banknotes" class="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </UCard>

        <!-- Developers -->
        <UCard>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-500 dark:text-gray-400">Developers</p>
              <p class="text-3xl font-bold mt-1">{{ dashboardSummary.summary.activeDevelopers }}</p>
              <p class="text-xs text-gray-500 mt-1">
                {{ dashboardSummary.summary.totalDevelopers }} total registered
              </p>
            </div>
            <div class="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <UIcon name="i-heroicons-user-group" class="w-8 h-8 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </UCard>

        <!-- All Tasks Progress -->
        <UCard>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-500 dark:text-gray-400">All Tasks</p>
              <p class="text-3xl font-bold mt-1">{{ dashboardSummary.summary.totalTasks }}</p>
              <p class="text-xs text-gray-500 mt-1">
                {{ dashboardSummary.summary.taskCompletionRate }}% completed
              </p>
            </div>
            <div class="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <UIcon name="i-heroicons-clipboard-document-check" class="w-8 h-8 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </UCard>
      </div>

      <!-- My Stats Overview (if available) -->
      <template v-if="stats && stats.stats">
        <h2 class="text-lg font-semibold mb-4">My Tasks Overview</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <!-- Total Tasks -->
        <UCard>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-500 dark:text-gray-400">Total Tasks</p>
              <p class="text-3xl font-bold mt-1">{{ stats.stats.totalTasks }}</p>
            </div>
            <div class="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <UIcon name="i-heroicons-clipboard-document-list" class="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </UCard>

        <!-- Completed Tasks -->
        <UCard>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-500 dark:text-gray-400">Completed</p>
              <p class="text-3xl font-bold mt-1 text-green-600">{{ stats.stats.completedTasks }}</p>
              <p class="text-xs text-gray-500 mt-1">{{ stats.stats.completionRate }}% complete</p>
            </div>
            <div class="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <UIcon name="i-heroicons-check-circle" class="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </UCard>

        <!-- In Progress -->
        <UCard>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-500 dark:text-gray-400">In Progress</p>
              <p class="text-3xl font-bold mt-1 text-blue-600">{{ stats.stats.inProgressTasks }}</p>
            </div>
            <div class="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
              <UIcon name="i-heroicons-clock" class="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
        </UCard>

        <!-- Work Weight -->
        <UCard>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-500 dark:text-gray-400">Total Weight</p>
              <p class="text-3xl font-bold mt-1">{{ stats.stats.totalWeight }}</p>
              <p class="text-xs text-gray-500 mt-1">{{ stats.stats.completedWeight }} completed</p>
            </div>
            <div class="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <UIcon name="i-heroicons-chart-bar" class="w-8 h-8 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </UCard>
      </div>
      </template>

      <!-- Projects Earnings (if user has assigned tasks) -->
      <template v-if="stats && stats.projects">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <!-- Projects List -->
        <UCard>
          <template #header>
            <h3 class="font-semibold">Your Projects</h3>
          </template>

          <div v-if="stats.projects.length === 0" class="text-center py-8 text-gray-500">
            No projects assigned yet
          </div>

          <div v-else class="space-y-3">
            <div
              v-for="project in stats.projects"
              :key="project.projectId"
              class="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
            >
              <div class="flex items-start justify-between mb-2">
                <div>
                  <h4 class="font-medium">{{ project.projectName }}</h4>
                  <p class="text-xs text-gray-500 mt-1">
                    {{ project.taskCount }} tasks ({{ project.completedCount }} completed)
                  </p>
                </div>
                <UBadge size="sm" :color="project.completedCount === project.taskCount ? 'success' : 'neutral'">
                  {{ Math.round((project.completedCount / project.taskCount) * 100) }}%
                </UBadge>
              </div>

              <div class="space-y-1 text-sm">
                <div class="flex justify-between">
                  <span class="text-gray-500">Weight</span>
                  <span class="font-medium">{{ project.totalWeight.toFixed(1) }} pts</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-500">Estimated Fee</span>
                  <span class="font-semibold text-green-600">{{ formatCurrency(project.estimatedFee) }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-500">Completed Fee</span>
                  <span class="font-medium">{{ formatCurrency(project.completedFee) }}</span>
                </div>
              </div>

              <!-- Progress bar -->
              <div class="mt-3">
                <div class="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    class="h-full bg-green-500 transition-all"
                    :style="{ width: `${Math.round((project.completedCount / project.taskCount) * 100)}%` }"
                  />
                </div>
              </div>
            </div>
          </div>
        </UCard>

        <!-- Recent Tasks -->
        <UCard>
          <template #header>
            <h3 class="font-semibold">Recent Activity</h3>
          </template>

          <div v-if="stats.recentTasks.length === 0" class="text-center py-8 text-gray-500">
            No recent activity
          </div>

          <div v-else class="space-y-3">
            <div
              v-for="task in stats.recentTasks"
              :key="task.id"
              class="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
            >
              <div class="flex items-start justify-between mb-2">
                <div class="flex-1">
                  <h4 class="font-medium text-sm">{{ task.name }}</h4>
                  <p class="text-xs text-gray-500 mt-1">
                    {{ task.projectName }} • {{ task.phaseName }}
                  </p>
                </div>
                <UBadge size="xs" :color="getStatusColor(task.status)">
                  {{ getStatusLabel(task.status) }}
                </UBadge>
              </div>
              <div class="flex items-center justify-between text-xs">
                <span class="text-gray-500">{{ formatDate(task.updatedAt) }}</span>
                <span class="font-medium">{{ task.weight }} pts</span>
              </div>
            </div>
          </div>
        </UCard>
      </div>
      </template>

      <!-- Profile Info -->
      <UCard v-if="user">
        <template #header>
          <h3 class="font-semibold">Profile</h3>
        </template>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p class="text-sm text-gray-500">Name</p>
            <p class="font-medium">{{ user.name }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-500">Email</p>
            <p class="font-medium">{{ user.email }}</p>
          </div>
          <div v-if="user.role">
            <p class="text-sm text-gray-500">Role</p>
            <p class="font-medium">{{ user.role }}</p>
          </div>
          <div v-if="stats?.developer?.skillFocus">
            <p class="text-sm text-gray-500">Skills</p>
            <p class="font-medium">{{ stats.developer.skillFocus }}</p>
          </div>
        </div>
      </UCard>
    </template>
  </div>
</template>
