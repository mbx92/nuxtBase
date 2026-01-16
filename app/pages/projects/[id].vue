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
  developerId: '',
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

async function deletePhase(phase: any) {
  if (!confirm(`Delete phase "${phase.name}"?`)) return
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
  if (!confirm(`Delete task "${task.name}"?`)) return
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
  taskForm.value = task ? {
    ...task,
    developerId: task.developerId || '',
  } : {
    phaseId,
    developerId: '',
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

onMounted(fetchData)
</script>

<template>
  <div class="p-6">
    <!-- Back button -->
    <UButton to="/projects" variant="ghost" icon="i-heroicons-arrow-left" class="mb-4">
      Back to Projects
    </UButton>

    <div v-if="loading" class="flex items-center justify-center h-64">
      <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 animate-spin text-primary" />
    </div>

    <template v-else-if="project">
      <!-- Project Header -->
      <div class="mb-6">
        <h1 class="text-2xl font-bold">{{ project.name }}</h1>
        <p v-if="project.description" class="text-gray-500 mt-1">{{ project.description }}</p>
      </div>

      <!-- Fee Distribution Overview -->
      <UCard v-if="feeDistribution" class="mb-6">
        <template #header>
          <h3 class="font-semibold">💰 Fee Distribution</h3>
        </template>
        
        <div class="grid md:grid-cols-2 gap-6">
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
          </div>

          <!-- Developer Distribution -->
          <div>
            <h4 class="font-medium mb-3">Developer Distribution (Total Weight: {{ feeDistribution.totalWeight }} pts)</h4>
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
                    <span>DP (50%)</span>
                    <span>{{ formatCurrency(dev.dpAmount) }}</span>
                  </div>
                  <div class="flex justify-between text-blue-600">
                    <span>Completion (40%)</span>
                    <span>{{ formatCurrency(dev.completionAmount) }}</span>
                  </div>
                  <div class="flex justify-between text-orange-600">
                    <span>Buffer (10%)</span>
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
                  <th class="px-3 py-2 text-center">Developer</th>
                  <th class="px-3 py-2 text-center">K</th>
                  <th class="px-3 py-2 text-center">W</th>
                  <th class="px-3 py-2 text-center">R</th>
                  <th class="px-3 py-2 text-center">D</th>
                  <th class="px-3 py-2 text-center">S</th>
                  <th class="px-3 py-2 text-center">Weight</th>
                  <th class="px-3 py-2 text-center">Status</th>
                  <th class="px-3 py-2"></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="task in getTasksByPhase(phase.id)" :key="task.id" class="border-t border-gray-200 dark:border-gray-700">
                  <td class="px-3 py-2">{{ task.name }}</td>
                  <td class="px-3 py-2 text-center">{{ task.developer?.name || '-' }}</td>
                  <td class="px-3 py-2 text-center">{{ task.complexity }}</td>
                  <td class="px-3 py-2 text-center">{{ task.time }}</td>
                  <td class="px-3 py-2 text-center">{{ task.risk }}</td>
                  <td class="px-3 py-2 text-center">{{ task.dependency }}</td>
                  <td class="px-3 py-2 text-center">{{ task.skill }}</td>
                  <td class="px-3 py-2 text-center font-medium text-primary">{{ task.calculatedWeight }}</td>
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
            <h3 class="font-semibold">{{ isEditingPhase ? 'Edit Phase' : 'Add Phase' }}</h3>
          </template>
          <form class="space-y-4" @submit.prevent="isEditingPhase ? updatePhase() : createPhase()">
            <UFormField label="Phase Name" required>
              <UInput v-model="phaseForm.name" placeholder="e.g., Phase 1: Setup" />
            </UFormField>
            <UFormField label="Description">
              <UTextarea v-model="phaseForm.description" rows="2" />
            </UFormField>
            <div class="grid grid-cols-2 gap-4">
              <UFormField label="Day Start">
                <UInput v-model.number="phaseForm.dayStart" type="number" min="1" />
              </UFormField>
              <UFormField label="Day End">
                <UInput v-model.number="phaseForm.dayEnd" type="number" min="1" />
              </UFormField>
            </div>
            <div class="flex justify-end gap-2">
              <UButton variant="outline" @click="closePhaseModal">Cancel</UButton>
              <UButton type="submit">{{ isEditingPhase ? 'Update' : 'Create' }}</UButton>
            </div>
          </form>
        </UCard>
      </template>
    </UModal>

    <!-- Task Modal -->
    <UModal v-model:open="showTaskModal">
      <template #content>
        <UCard>
          <template #header>
            <h3 class="font-semibold">{{ isEditingTask ? 'Edit Task' : 'Add Task' }}</h3>
          </template>
          <form class="space-y-4" @submit.prevent="isEditingTask ? updateTask() : createTask()">
            <UFormField label="Task Name" required>
              <UInput v-model="taskForm.name" placeholder="e.g., POST /api/auth/login" />
            </UFormField>
            <UFormField label="Description">
              <UTextarea v-model="taskForm.description" rows="2" />
            </UFormField>
            <div class="grid grid-cols-2 gap-4">
              <UFormField label="Developer">
                <USelect 
                  v-model="taskForm.developerId" 
                  :items="[{ label: 'Unassigned', value: '' }, ...developers.map(d => ({ label: d.name, value: d.id }))]" 
                />
              </UFormField>
              <UFormField label="Estimated Hours">
                <UInput v-model.number="taskForm.estimatedHours" type="number" step="0.5" />
              </UFormField>
            </div>

            <!-- Work Weight Scoring -->
            <div class="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div class="flex items-center justify-between mb-3">
                <h4 class="font-medium">Work Weight Scoring</h4>
                <span class="text-lg font-bold text-primary">{{ calculatedWeightPreview }} pts</span>
              </div>
              <div class="grid grid-cols-5 gap-2">
                <UFormField label="K (Kompleksitas)" class="text-center">
                  <UInput v-model.number="taskForm.complexity" type="number" min="1" max="5" class="text-center" />
                </UFormField>
                <UFormField label="W (Waktu)" class="text-center">
                  <UInput v-model.number="taskForm.time" type="number" min="1" max="5" class="text-center" />
                </UFormField>
                <UFormField label="R (Risiko)" class="text-center">
                  <UInput v-model.number="taskForm.risk" type="number" min="1" max="5" class="text-center" />
                </UFormField>
                <UFormField label="D (Dependensi)" class="text-center">
                  <UInput v-model.number="taskForm.dependency" type="number" min="1" max="5" class="text-center" />
                </UFormField>
                <UFormField label="S (Skill)" class="text-center">
                  <UInput v-model.number="taskForm.skill" type="number" min="1" max="5" class="text-center" />
                </UFormField>
              </div>
              <p class="text-xs text-gray-500 mt-2">Formula: (K×2) + (W×1.5) + (R×1.5) + (D×1) + (S×1)</p>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <UFormField label="Status">
                <USelect v-model="taskForm.status" :items="statusOptions" />
              </UFormField>
              <UFormField label="Priority">
                <USelect v-model="taskForm.priority" :items="priorityOptions" />
              </UFormField>
            </div>

            <div class="flex justify-end gap-2">
              <UButton variant="outline" @click="closeTaskModal">Cancel</UButton>
              <UButton type="submit">{{ isEditingTask ? 'Update' : 'Create' }}</UButton>
            </div>
          </form>
        </UCard>
      </template>
    </UModal>
  </div>
</template>
