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
const developers = ref<any[]>([])
const feeDistribution = ref<any>(null)
const loading = ref(true)

// Modal state
const showPhaseModal = ref(false)
const showTaskModal = ref(false)
const isEditingPhase = ref(false)
const isEditingTask = ref(false)
const selectedPhase = ref<any>(null)
const selectedTask = ref<any>(null)

const phaseForm = ref({
  name: '',
  description: '',
  dayStart: 1,
  dayEnd: 1,
  sortOrder: 0,
})

const taskForm = ref({
  phaseId: '',
  developerId: null as string | null,
  category: 'backend' as 'backend' | 'frontend' | 'devops',
  name: '',
  description: '',
  estimatedHours: null as number | null,
  complexity: 1,
  time: 1,
  risk: 1,
  dependency: 1,
  skill: 1,
  status: 'pending',
  priority: 'medium',
  startDate: null as string | null,
  endDate: null as string | null,
})

// Computed calculated weight preview
const calculatedWeightPreview = computed(() => {
  const k = taskForm.value.complexity
  const w = taskForm.value.time
  const r = taskForm.value.risk
  const d = taskForm.value.dependency
  const s = taskForm.value.skill
  return (k * 2) + (w * 1.5) + (r * 1.5) + (d * 1) + (s * 1)
})

// Fetch data
async function fetchData() {
  loading.value = true
  try {
    const [projectData, phasesData, tasksData, devsData, feeData] = await Promise.all([
      $fetch(`/api/projects/${projectId}`),
      $fetch('/api/phases', { query: { projectId } }),
      $fetch('/api/tasks', { query: { projectId } }),
      $fetch('/api/developers'),
      $fetch('/api/calculations/fee-distribution', { query: { projectId } }).catch(() => null),
    ])
    project.value = projectData
    phases.value = phasesData as any[]
    tasks.value = tasksData as any[]
    developers.value = devsData as any[]
    feeDistribution.value = feeData
  } catch (error: any) {
    toast.add({ title: 'Error', description: error.message, color: 'error' })
  } finally {
    loading.value = false
  }
}

// Phase CRUD
async function createPhase() {
  try {
    const newPhase = await $fetch('/api/phases', {
      method: 'POST',
      body: { ...phaseForm.value, projectId },
    })
    phases.value.push(newPhase)
    closePhaseModal()
    toast.add({ title: 'Success', description: 'Phase created', color: 'success' })
    fetchData()
  } catch (error: any) {
    toast.add({ title: 'Error', description: error.message, color: 'error' })
  }
}

async function updatePhase() {
  if (!selectedPhase.value) return
  try {
    await $fetch(`/api/phases/${selectedPhase.value.id}`, {
      method: 'PUT',
      body: phaseForm.value,
    })
    closePhaseModal()
    fetchData()
    toast.add({ title: 'Success', description: 'Phase updated', color: 'success' })
  } catch (error: any) {
    toast.add({ title: 'Error', description: error.message, color: 'error' })
  }
}

// Confirm dialog
const { confirm } = useConfirmDialog()

async function deletePhase(phase: any) {
  const confirmed = await confirm({
    title: 'Delete Phase',
    message: `Are you sure you want to delete "${phase.name}"? All tasks in this phase will also be affected.`,
    confirmText: 'Delete',
    cancelText: 'Cancel',
    color: 'error',
    icon: 'i-heroicons-trash',
  })
  
  if (!confirmed) return
  
  try {
    await $fetch(`/api/phases/${phase.id}`, { method: 'DELETE' })
    fetchData()
    toast.add({ title: 'Success', description: 'Phase deleted', color: 'success' })
  } catch (error: any) {
    toast.add({ title: 'Error', description: error.message, color: 'error' })
  }
}

// Task CRUD
async function createTask() {
  try {
    await $fetch('/api/tasks', {
      method: 'POST',
      body: taskForm.value,
    })
    closeTaskModal()
    fetchData()
    toast.add({ title: 'Success', description: 'Task created', color: 'success' })
  } catch (error: any) {
    toast.add({ title: 'Error', description: error.message, color: 'error' })
  }
}

async function updateTask() {
  if (!selectedTask.value) return
  try {
    await $fetch(`/api/tasks/${selectedTask.value.id}`, {
      method: 'PUT',
      body: taskForm.value,
    })
    closeTaskModal()
    fetchData()
    toast.add({ title: 'Success', description: 'Task updated', color: 'success' })
  } catch (error: any) {
    toast.add({ title: 'Error', description: error.message, color: 'error' })
  }
}

async function deleteTask(task: any) {
  const confirmed = await confirm({
    title: 'Delete Task',
    message: `Are you sure you want to delete "${task.name}"? This action cannot be undone.`,
    confirmText: 'Delete',
    cancelText: 'Cancel',
    color: 'error',
    icon: 'i-heroicons-trash',
  })
  
  if (!confirmed) return
  
  try {
    await $fetch(`/api/tasks/${task.id}`, { method: 'DELETE' })
    fetchData()
    toast.add({ title: 'Success', description: 'Task deleted', color: 'success' })
  } catch (error: any) {
    toast.add({ title: 'Error', description: error.message, color: 'error' })
  }
}

// Modal handlers
function openPhaseModal(phase?: any) {
  isEditingPhase.value = !!phase
  selectedPhase.value = phase
  phaseForm.value = phase ? { ...phase } : { name: '', description: '', dayStart: 1, dayEnd: 1, sortOrder: phases.value.length }
  showPhaseModal.value = true
}

function closePhaseModal() {
  showPhaseModal.value = false
}

function openTaskModal(phaseId: string, task?: any) {
  isEditingTask.value = !!task
  selectedTask.value = task
  
  // Helper to format date for input[type="date"]
  const formatDateForInput = (date: any) => {
    if (!date) return null
    const d = new Date(date)
    return d.toISOString().split('T')[0] // Returns YYYY-MM-DD
  }
  
  taskForm.value = task ? {
    ...task,
    developerId: task.developerId || null,
    startDate: formatDateForInput(task.startDate),
    endDate: formatDateForInput(task.endDate),
  } : {
    phaseId,
    developerId: null,
    category: 'backend',
    name: '',
    description: '',
    estimatedHours: null,
    complexity: 1,
    time: 1,
    risk: 1,
    dependency: 1,
    skill: 1,
    status: 'pending',
    priority: 'medium',
    startDate: null,
    endDate: null,
  }
  showTaskModal.value = true
}

function closeTaskModal() {
  showTaskModal.value = false
}

// Helper
function formatCurrency(value: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value)
}

function getTasksByPhase(phaseId: string) {
  return tasks.value.filter(t => t.phaseId === phaseId)
}

const statusOptions = [
  { label: 'Pending', value: 'pending' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Completed', value: 'completed' },
]

const priorityOptions = [
  { label: 'Low', value: 'low' },
  { label: 'Medium', value: 'medium' },
  { label: 'High', value: 'high' },
]

const categoryOptions = [
  { label: 'Backend', value: 'backend', icon: 'i-heroicons-server' },
  { label: 'Frontend', value: 'frontend', icon: 'i-heroicons-device-phone-mobile' },
  { label: 'DevOps', value: 'devops', icon: 'i-heroicons-cog-6-tooth' },
]

// Auto-suggest work weight scoring based on task details
function autoSuggestScoring() {
  const name = taskForm.value.name.toLowerCase()
  const desc = (taskForm.value.description || '').toLowerCase()
  const text = name + ' ' + desc
  
  let complexity = 2
  let time = 2
  let risk = 2
  let dependency = 2
  let skill = 2
  
  // Complexity Analysis
  if (text.match(/auth|security|jwt|bcrypt|encryption|middleware/)) complexity = 4
  if (text.match(/crud|simple|basic|get|list/)) complexity = 2
  if (text.match(/search|filter|pagination|complex query/)) complexity = 3
  if (text.match(/payment|billing|calculation|algorithm/)) complexity = 4
  if (text.match(/migration|setup|config/)) complexity = 3
  if (text.match(/research|poc|proof of concept/)) complexity = 3
  if (text.match(/integration|third.?party|api/)) complexity = 4
  
  // Time Estimation (based on task type)
  if (text.match(/post|put|create|update|delete/)) time = 2
  if (text.match(/get.*\/.*:id|get single|detail/)) time = 1
  if (text.match(/get.*list|get all/)) time = 2
  if (text.match(/auth|login|register/)) time = 3
  if (text.match(/middleware|validation/)) time = 2
  if (text.match(/billing|payment|calculation/)) time = 4
  if (text.match(/setup|config|migration/)) time = 3
  if (text.match(/ui|frontend|component/)) time = 3
  if (text.match(/test|testing|unit test/)) time = 3
  
  // Risk Assessment
  if (text.match(/auth|security|password|token/)) risk = 5
  if (text.match(/payment|billing|money|transaction/)) risk = 4
  if (text.match(/delete|remove/)) risk = 3
  if (text.match(/migration|database|schema/)) risk = 4
  if (text.match(/get|read|list/)) risk = 1
  if (text.match(/post|create/)) risk = 2
  if (text.match(/integration|third.?party/)) risk = 4
  
  // Dependency Analysis
  if (text.match(/auth|middleware|setup|config/)) dependency = 5
  if (text.match(/database|schema|migration/)) dependency = 5
  if (text.match(/foundation|base|core/)) dependency = 4
  if (text.match(/independent|standalone/)) dependency = 1
  if (text.match(/crud/) && !text.match(/auth/)) dependency = 3
  
  // Skill Required
  if (text.match(/auth|jwt|security|encryption/)) skill = 4
  if (text.match(/algorithm|complex.*logic|calculation/)) skill = 4
  if (text.match(/devops|deployment|ci.?cd|docker/)) skill = 4
  if (text.match(/simple|basic|crud/)) skill = 2
  if (text.match(/frontend|ui|ux/)) skill = 3
  if (text.match(/database|sql|query optimization/)) skill = 3
  if (text.match(/integration|api.*design/)) skill = 3
  
  // Apply suggestions
  taskForm.value.complexity = Math.min(5, Math.max(1, complexity))
  taskForm.value.time = Math.min(5, Math.max(1, time))
  taskForm.value.risk = Math.min(5, Math.max(1, risk))
  taskForm.value.dependency = Math.min(5, Math.max(1, dependency))
  taskForm.value.skill = Math.min(5, Math.max(1, skill))
  
  toast.add({
    title: 'Auto-Suggest Applied',
    description: `Scoring suggestion based on task analysis (Weight: ${calculatedWeightPreview.value} pts)`,
    color: 'success',
  })
}

// Calculate estimated fee for a task based on work weight
// Fee per Point = Team Fee Pool / Estimated Total Weight (from project settings)
function calculateTaskFee(weight: number): number {
  if (!feeDistribution.value || !project.value) return 0
  
  const teamFeePool = feeDistribution.value.breakdown.teamFeePool
  const estimatedTotalWeight = project.value.estimatedTotalWeight || 327.5
  
  // Fee per point is based on estimated total weight
  const feePerPoint = teamFeePool / estimatedTotalWeight
  
  return weight * feePerPoint
}

// Calculate fee per point (based on estimated total weight)
const feePerPoint = computed(() => {
  if (!feeDistribution.value || !project.value) return 0
  const estimatedTotalWeight = project.value.estimatedTotalWeight || 327.5
  return feeDistribution.value.breakdown.teamFeePool / estimatedTotalWeight
})

// Computed: Category breakdown
const categoryBreakdown = computed(() => {
  if (!tasks.value.length) return []
  
  const breakdown: Record<string, { weight: number; count: number; fee: number }> = {
    backend: { weight: 0, count: 0, fee: 0 },
    frontend: { weight: 0, count: 0, fee: 0 },
    devops: { weight: 0, count: 0, fee: 0 },
  }
  
  tasks.value.forEach(task => {
    const category = task.category || 'backend'
    breakdown[category].weight += task.calculatedWeight || 0
    breakdown[category].count += 1
    breakdown[category].fee += calculateTaskFee(task.calculatedWeight || 0)
  })
  
  return [
    { label: 'Backend', category: 'backend', icon: 'i-heroicons-server', ...breakdown.backend },
    { label: 'Frontend', category: 'frontend', icon: 'i-heroicons-device-phone-mobile', ...breakdown.frontend },
    { label: 'DevOps', category: 'devops', icon: 'i-heroicons-cog-6-tooth', ...breakdown.devops },
  ]
})

onMounted(fetchData)
</script>

<template>
  <div class="p-6">
    <!-- Header with Navigation -->
    <div class="mb-6">
      <UButton to="/projects" variant="ghost" icon="i-heroicons-arrow-left" size="sm" class="mb-3">
        Back to Projects
      </UButton>

      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold">{{ project?.name }}</h1>
          <p v-if="project?.description" class="text-gray-500 dark:text-gray-400 mt-1">{{ project.description }}</p>
        </div>
        
        <div class="flex items-center gap-2">
          <UButton
            :to="`/projects/${projectId}/board`"
            variant="outline"
            icon="i-heroicons-view-columns"
            size="sm"
          >
            Board
          </UButton>
          <UButton
            :to="`/projects/${projectId}/gantt`"
            variant="outline"
            icon="i-heroicons-chart-bar"
            size="sm"
          >
            Gantt
          </UButton>
        </div>
      </div>
    </div>

    <div v-if="loading" class="flex items-center justify-center h-64">
      <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 animate-spin text-primary" />
    </div>

    <template v-else-if="project">
      <!-- Fee Distribution Overview -->
      <UCard v-if="feeDistribution" class="mb-6">
        <template #header>
          <h3 class="font-semibold">Fee Distribution</h3>
        </template>
        
        <div class="grid md:grid-cols-3 gap-6">
          <!-- Breakdown -->
          <div class="space-y-2">
            <h4 class="font-medium mb-3">Budget Breakdown</h4>
            <div class="flex justify-between text-sm">
              <span>Total Budget</span>
              <span class="font-medium">{{ formatCurrency(feeDistribution.breakdown.totalBudget) }}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span>Safety Net ({{ project.safetyNetPercent }}%)</span>
              <span class="text-orange-500">- {{ formatCurrency(feeDistribution.breakdown.safetyNetAmount) }}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span>Management Fee ({{ project.managementFeePercent }}%)</span>
              <span class="text-orange-500">- {{ formatCurrency(feeDistribution.breakdown.managementFeeAmount) }}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span>Deployment Fee</span>
              <span class="text-orange-500">- {{ formatCurrency(feeDistribution.breakdown.deploymentFeeAmount) }}</span>
            </div>
            <hr class="my-2 border-gray-200 dark:border-gray-700">
            <div class="flex justify-between font-medium">
              <span>Team Fee Pool</span>
              <span class="text-green-600">{{ formatCurrency(feeDistribution.breakdown.teamFeePool) }}</span>
            </div>
            <div class="flex justify-between text-xs mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
              <span class="text-gray-500">Fee per Point</span>
              <span class="font-medium">{{ formatCurrency(feeDistribution.breakdown.feePerPoint) }}/pt</span>
            </div>
            <div class="flex justify-between text-xs">
              <span class="text-gray-500">Work Progress</span>
              <span :class="feeDistribution.totalWeight > feeDistribution.estimatedTotalWeight ? 'text-red-600' : 'text-gray-700'">
                {{ feeDistribution.totalWeight }} / {{ feeDistribution.estimatedTotalWeight }} pts
              </span>
            </div>
          </div>

          <!-- Category Breakdown -->
          <div>
            <h4 class="font-medium mb-3">Work Category Breakdown</h4>
            <div class="space-y-3">
              <div v-for="cat in categoryBreakdown" :key="cat.category" class="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div class="flex justify-between items-center mb-1">
                  <div class="flex items-center gap-2">
                    <UIcon :name="cat.icon" class="w-4 h-4" />
                    <span class="font-medium text-sm">{{ cat.label }}</span>
                  </div>
                  <span class="text-xs text-gray-500">{{ cat.count }} tasks</span>
                </div>
                <div class="text-xs space-y-1">
                  <div class="flex justify-between">
                    <span class="text-gray-500">Weight</span>
                    <span class="font-medium">{{ cat.weight.toFixed(1) }} pts</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-500">Est. Fee</span>
                    <span class="font-medium text-green-600">{{ formatCurrency(cat.fee) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Developer Distribution -->
          <div>
            <h4 class="font-medium mb-3">Developer Distribution ({{ feeDistribution.totalWeight }} pts)</h4>
            <div class="space-y-3">
              <div v-for="dev in feeDistribution.developers" :key="dev.developerId" class="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div class="flex justify-between items-center mb-2">
                  <span class="font-medium">{{ dev.developerName }}</span>
                  <span class="text-sm text-gray-500">{{ dev.totalWeight }} pts ({{ dev.percentage }}%)</span>
                </div>
                <div class="text-sm space-y-1">
                  <div class="flex justify-between">
                    <span>Base Fee</span>
                    <span class="font-medium">{{ formatCurrency(dev.baseFee) }}</span>
                  </div>
                  <div class="flex justify-between text-green-600">
                    <span>DP ({{ feeDistribution.project.dpPercent || 50 }}%)</span>
                    <span>{{ formatCurrency(dev.dpAmount) }}</span>
                  </div>
                  <div class="flex justify-between text-blue-600">
                    <span>Completion ({{ feeDistribution.project.completionPercent || 40 }}%)</span>
                    <span>{{ formatCurrency(dev.completionAmount) }}</span>
                  </div>
                  <div class="flex justify-between text-orange-600">
                    <span>Buffer ({{ feeDistribution.project.bufferPercent || 10 }}%)</span>
                    <span>{{ formatCurrency(dev.bufferAmount) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </UCard>

      <!-- Phases & Tasks -->
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-xl font-semibold">Phases & Tasks</h2>
        <UButton icon="i-heroicons-plus" size="sm" @click="openPhaseModal()">
          Add Phase
        </UButton>
      </div>

      <div v-if="phases.length === 0" class="text-center py-8 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <p class="text-gray-500">No phases yet. Add a phase to start organizing tasks.</p>
      </div>

      <div v-else class="space-y-4">
        <UCard v-for="phase in phases" :key="phase.id">
          <template #header>
            <div class="flex items-center justify-between">
              <div>
                <h3 class="font-semibold">{{ phase.name }}</h3>
                <p class="text-sm text-gray-500">Day {{ phase.dayStart }} - {{ phase.dayEnd }}</p>
              </div>
              <div class="flex gap-2">
                <UButton size="xs" variant="soft" icon="i-heroicons-plus" @click="openTaskModal(phase.id)">
                  Add Task
                </UButton>
                <UButton size="xs" variant="ghost" icon="i-heroicons-pencil" @click="openPhaseModal(phase)" />
                <UButton size="xs" variant="ghost" color="error" icon="i-heroicons-trash" @click="deletePhase(phase)" />
              </div>
            </div>
          </template>

          <!-- Tasks Table -->
          <div v-if="getTasksByPhase(phase.id).length > 0" class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead class="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th class="px-3 py-2 text-left">Task</th>
                  <th class="px-3 py-2 text-center">Category</th>
                  <th class="px-3 py-2 text-center">Developer</th>
                  <th class="px-3 py-2 text-center">K</th>
                  <th class="px-3 py-2 text-center">W</th>
                  <th class="px-3 py-2 text-center">R</th>
                  <th class="px-3 py-2 text-center">D</th>
                  <th class="px-3 py-2 text-center">S</th>
                  <th class="px-3 py-2 text-center">Weight</th>
                  <th class="px-3 py-2 text-center">Est. Fee</th>
                  <th class="px-3 py-2 text-center">Status</th>
                  <th class="px-3 py-2"></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="task in getTasksByPhase(phase.id)" :key="task.id" class="border-t border-gray-200 dark:border-gray-700">
                  <td class="px-3 py-2">
                    <div>
                      <div class="font-medium">{{ task.name }}</div>
                      <div v-if="task.description" class="text-xs text-gray-500 line-clamp-1">{{ task.description }}</div>
                    </div>
                  </td>
                  <td class="px-3 py-2 text-center">
                    <div class="flex items-center justify-center gap-1">
                      <UIcon 
                        :name="task.category === 'backend' ? 'i-heroicons-server' : task.category === 'frontend' ? 'i-heroicons-device-phone-mobile' : 'i-heroicons-cog-6-tooth'" 
                        class="w-3 h-3"
                      />
                      <UBadge 
                        :color="task.category === 'backend' ? 'primary' : task.category === 'frontend' ? 'success' : 'neutral'" 
                        size="xs"
                      >
                        {{ task.category }}
                      </UBadge>
                    </div>
                  </td>
                  <td class="px-3 py-2 text-center">{{ task.developer?.name || '-' }}</td>
                  <td class="px-3 py-2 text-center">{{ task.complexity }}</td>
                  <td class="px-3 py-2 text-center">{{ task.time }}</td>
                  <td class="px-3 py-2 text-center">{{ task.risk }}</td>
                  <td class="px-3 py-2 text-center">{{ task.dependency }}</td>
                  <td class="px-3 py-2 text-center">{{ task.skill }}</td>
                  <td class="px-3 py-2 text-center font-medium text-primary">{{ task.calculatedWeight }}</td>
                  <td class="px-3 py-2 text-center text-xs">
                    <span v-if="feeDistribution" class="font-medium text-green-600">
                      {{ formatCurrency(calculateTaskFee(task.calculatedWeight)) }}
                    </span>
                    <span v-else>-</span>
                  </td>
                  <td class="px-3 py-2 text-center">
                    <UBadge :color="task.status === 'completed' ? 'success' : task.status === 'in_progress' ? 'warning' : 'neutral'" size="xs">
                      {{ task.status }}
                    </UBadge>
                  </td>
                  <td class="px-3 py-2">
                    <div class="flex gap-1">
                      <UButton size="xs" variant="ghost" icon="i-heroicons-pencil" @click="openTaskModal(phase.id, task)" />
                      <UButton size="xs" variant="ghost" color="error" icon="i-heroicons-trash" @click="deleteTask(task)" />
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p v-else class="text-gray-500 text-sm">No tasks in this phase.</p>
        </UCard>
      </div>
    </template>

    <!-- Phase Modal -->
    <UModal v-model:open="showPhaseModal">
      <template #content>
        <UCard>
          <template #header>
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-semibold">{{ isEditingPhase ? 'Edit Phase' : 'Add Phase' }}</h3>
              <UButton
                color="neutral"
                variant="ghost"
                icon="i-heroicons-x-mark"
                size="sm"
                @click="closePhaseModal"
              />
            </div>
          </template>

          <template #description>
            <span class="sr-only">Form to {{ isEditingPhase ? 'edit' : 'create' }} a project phase</span>
          </template>

          <form class="space-y-4" @submit.prevent="isEditingPhase ? updatePhase() : createPhase()">
            <UFormField label="Phase Name" required>
              <UInput v-model="phaseForm.name" placeholder="e.g., Phase 1: Setup" class="w-full" />
            </UFormField>
            <UFormField label="Description">
              <UTextarea v-model="phaseForm.description" :rows="2" class="w-full" />
            </UFormField>
            <div class="grid grid-cols-2 gap-4">
              <UFormField label="Day Start">
                <UInput v-model.number="phaseForm.dayStart" type="number" min="1" class="w-full" />
              </UFormField>
              <UFormField label="Day End">
                <UInput v-model.number="phaseForm.dayEnd" type="number" min="1" class="w-full" />
              </UFormField>
            </div>
            <div class="flex justify-end gap-2">
              <UButton variant="outline" type="button" @click="closePhaseModal">Cancel</UButton>
              <UButton type="submit">{{ isEditingPhase ? 'Update' : 'Create' }}</UButton>
            </div>
          </form>
        </UCard>
      </template>
    </UModal>

    <!-- Task Modal -->
    <UModal v-model:open="showTaskModal">
      <template #content>
        <UCard class="max-h-[90vh] overflow-y-auto">
          <template #header>
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-semibold">{{ isEditingTask ? 'Edit Task' : 'Add Task' }}</h3>
              <UButton
                color="neutral"
                variant="ghost"
                icon="i-heroicons-x-mark"
                size="sm"
                @click="closeTaskModal"
              />
            </div>
          </template>

          <template #description>
            <span class="sr-only">Form to {{ isEditingTask ? 'edit' : 'create' }} a task with work weight scoring</span>
          </template>

          <form class="space-y-5" @submit.prevent="isEditingTask ? updateTask() : createTask()">
            <!-- Basic Information -->
            <div class="space-y-4">
              <div class="grid grid-cols-2 gap-4">
                <UFormField label="Task Name" required>
                  <UInput v-model="taskForm.name" placeholder="e.g., POST /api/auth/login" class="w-full" />
                </UFormField>
                <UFormField label="Category" required>
                  <USelect 
                    v-model="taskForm.category" 
                    :items="categoryOptions" 
                    value-attribute="value" 
                    option-attribute="label"
                    class="w-full"
                  />
                </UFormField>
              </div>
              
              <UFormField label="Description">
                <UTextarea v-model="taskForm.description" placeholder="Describe the task..." :rows="3" class="w-full" />
                <template #hint>
                  <span class="text-xs text-gray-400">Detailed description helps auto-suggest feature analyze task complexity</span>
                </template>
              </UFormField>
              
              <div class="grid grid-cols-2 gap-4">
                <UFormField label="Developer">
                  <USelect 
                    v-model="taskForm.developerId" 
                    :items="[{ label: 'Unassigned', value: null }, ...developers.map(d => ({ label: d.name, value: d.id }))]"
                    value-attribute="value"
                    option-attribute="label"
                    class="w-full"
                  />
                </UFormField>
                <UFormField label="Estimated Hours">
                  <UInput v-model.number="taskForm.estimatedHours" type="number" step="0.5" min="0" placeholder="0.0" class="w-full" />
                </UFormField>
              </div>
            </div>

            <!-- Work Weight Scoring -->
            <div class="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-800/50">
              <div class="flex items-center justify-between mb-4">
                <div>
                  <h4 class="font-semibold text-sm">Work Weight Scoring</h4>
                  <p class="text-xs text-gray-500 mt-0.5">Rate each factor from 1-5</p>
                </div>
                <div class="flex items-center gap-3">
                  <UButton 
                    size="xs" 
                    variant="soft" 
                    icon="i-heroicons-sparkles"
                    @click="autoSuggestScoring"
                    :disabled="!taskForm.name"
                  >
                    Auto Suggest
                  </UButton>
                  <div class="text-right">
                    <div class="text-xs text-gray-500">Total Score</div>
                    <div class="text-2xl font-bold text-primary">{{ calculatedWeightPreview }}</div>
                  </div>
                </div>
              </div>
              
              <div class="grid grid-cols-5 gap-3">
                <div class="space-y-1.5">
                  <label class="text-xs font-medium text-gray-700 dark:text-gray-300 block text-center">Kompleksitas</label>
                  <UInput v-model.number="taskForm.complexity" type="number" min="1" max="5" class="text-center" />
                  <span class="text-xs text-gray-500 block text-center">K × 2</span>
                </div>
                <div class="space-y-1.5">
                  <label class="text-xs font-medium text-gray-700 dark:text-gray-300 block text-center">Waktu</label>
                  <UInput v-model.number="taskForm.time" type="number" min="1" max="5" class="text-center" />
                  <span class="text-xs text-gray-500 block text-center">W × 1.5</span>
                </div>
                <div class="space-y-1.5">
                  <label class="text-xs font-medium text-gray-700 dark:text-gray-300 block text-center">Risiko</label>
                  <UInput v-model.number="taskForm.risk" type="number" min="1" max="5" class="text-center" />
                  <span class="text-xs text-gray-500 block text-center">R × 1.5</span>
                </div>
                <div class="space-y-1.5">
                  <label class="text-xs font-medium text-gray-700 dark:text-gray-300 block text-center">Dependensi</label>
                  <UInput v-model.number="taskForm.dependency" type="number" min="1" max="5" class="text-center" />
                  <span class="text-xs text-gray-500 block text-center">D × 1</span>
                </div>
                <div class="space-y-1.5">
                  <label class="text-xs font-medium text-gray-700 dark:text-gray-300 block text-center">Skill</label>
                  <UInput v-model.number="taskForm.skill" type="number" min="1" max="5" class="text-center" />
                  <span class="text-xs text-gray-500 block text-center">S × 1</span>
                </div>
              </div>
              
              <div class="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                <div class="space-y-2 text-sm">
                  <div class="flex justify-between items-center">
                    <span class="text-xs text-gray-500">Formula:</span>
                    <span class="text-xs font-mono text-gray-600 dark:text-gray-400">
                      (K × 2) + (W × 1.5) + (R × 1.5) + (D × 1) + (S × 1) = {{ calculatedWeightPreview }} pts
                    </span>
                  </div>
                  <div v-if="feeDistribution" class="space-y-1">
                    <div class="flex justify-between items-center">
                      <span class="text-xs text-gray-500">Current Total Weight:</span>
                      <span class="text-xs font-medium" :class="feeDistribution.totalWeight > (project.estimatedTotalWeight || 327.5) ? 'text-red-600' : ''">
                        {{ feeDistribution.totalWeight }} / {{ project.estimatedTotalWeight || 327.5 }} pts
                      </span>
                    </div>
                    <div class="flex justify-between items-center">
                      <span class="text-xs text-gray-500">Fee per Point:</span>
                      <span class="text-xs font-medium">{{ formatCurrency(feePerPoint) }} / pt</span>
                    </div>
                    <div class="flex justify-between items-center pt-1 border-t border-gray-200 dark:border-gray-700">
                      <span class="text-xs text-gray-500">Estimated Fee:</span>
                      <span class="text-sm font-semibold text-green-600 dark:text-green-400">
                        {{ formatCurrency(calculateTaskFee(calculatedWeightPreview)) }}
                      </span>
                    </div>
                    <p class="text-xs text-gray-400 italic mt-1">
                      * {{ calculatedWeightPreview }} pts × {{ formatCurrency(feePerPoint) }}/pt = {{ formatCurrency(calculateTaskFee(calculatedWeightPreview)) }}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Status & Priority -->
            <div class="grid grid-cols-2 gap-4">
              <UFormField label="Status">
                <USelect v-model="taskForm.status" :items="statusOptions" value-attribute="value" option-attribute="label" class="w-full" />
              </UFormField>
              <UFormField label="Priority">
                <USelect v-model="taskForm.priority" :items="priorityOptions" value-attribute="value" option-attribute="label" class="w-full" />
              </UFormField>
            </div>

            <!-- Timeline (for Gantt) -->
            <div class="grid grid-cols-2 gap-4">
              <UFormField label="Start Date">
                <UInput v-model="taskForm.startDate" type="date" class="w-full" />
              </UFormField>
              <UFormField label="End Date">
                <UInput v-model="taskForm.endDate" type="date" class="w-full" />
              </UFormField>
            </div>

            <!-- Actions -->
            <div class="flex justify-end gap-2 pt-2">
              <UButton variant="outline" type="button" @click="closeTaskModal">
                Cancel
              </UButton>
              <UButton type="submit" :loading="loading">
                {{ isEditingTask ? 'Update Task' : 'Create Task' }}
              </UButton>
            </div>
          </form>
        </UCard>
      </template>
    </UModal>
  </div>
</template>
