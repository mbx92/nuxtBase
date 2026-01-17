<script setup lang="ts">
interface Props {
  colorMode?: string
}

defineProps<Props>()

const emit = defineEmits<{
  toggleSidebar: []
  toggleDesktopSidebar: []
  toggleColorMode: []
}>()

const router = useRouter()
const toast = useToast()

// User session
const user = ref<any>(null)

async function fetchUser() {
  try {
    const session = await $fetch('/api/auth/session')
    user.value = session?.user || null
  } catch {
    user.value = null
  }
}

async function handleLogout() {
  try {
    await $fetch('/api/auth/logout', { method: 'POST' })
    toast.add({
      title: 'Success',
      description: 'Logged out successfully',
      color: 'success',
    })
    await router.push('/login')
  } catch (error: any) {
    toast.add({
      title: 'Error',
      description: error.message || 'Failed to logout',
      color: 'error',
    })
  }
}

// Search
const searchOpen = ref(false)
const searchQuery = ref('')

// User dropdown items
const userItems = computed(() => [
  [
    { label: 'Profile', icon: 'i-heroicons-user', to: '/profile' },
    { label: 'Settings', icon: 'i-heroicons-cog-6-tooth', to: '/settings' }
  ],
  [
    { label: 'Sign out', icon: 'i-heroicons-arrow-right-on-rectangle', onSelect: handleLogout }
  ]
])

// Keyboard shortcut for search
onMounted(() => {
  fetchUser()
  
  const handleKeydown = (e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault()
      searchOpen.value = true
    }
  }
  window.addEventListener('keydown', handleKeydown)
  onUnmounted(() => window.removeEventListener('keydown', handleKeydown))
})
</script>

<template>
  <div class="h-full px-4 flex items-center justify-between gap-4">
    <!-- Left section -->
    <div class="flex items-center gap-4">
      <!-- Desktop sidebar toggle -->
      <UButton
        icon="i-heroicons-bars-3"
        variant="ghost"
        color="neutral"
        class="hidden lg:flex"
        @click="emit('toggleDesktopSidebar')"
      />

      <!-- Mobile menu toggle -->
      <UButton
        icon="i-heroicons-bars-3"
        variant="ghost"
        color="neutral"
        class="lg:hidden"
        @click="emit('toggleSidebar')"
      />

      <!-- Breadcrumb -->
      <div class="hidden md:flex items-center gap-2 text-sm">
        <UIcon name="i-heroicons-home" class="w-4 h-4 text-gray-500" />
        <span class="text-gray-500">/</span>
        <span class="text-gray-900 dark:text-white">Dashboard</span>
      </div>
    </div>

    <!-- Right section -->
    <div class="flex items-center gap-2">
      <!-- Search button -->
      <UButton
        icon="i-heroicons-magnifying-glass"
        variant="ghost"
        color="neutral"
        class="hidden sm:flex"
        @click="searchOpen = true"
      >
        <span class="hidden lg:inline text-sm text-gray-500">Search...</span>
        <UKbd class="hidden lg:inline ml-2">⌘K</UKbd>
      </UButton>

      <!-- Color mode toggle -->
      <ClientOnly>
        <UButton
          :icon="colorMode === 'dark' ? 'i-heroicons-sun' : 'i-heroicons-moon'"
          variant="ghost"
          color="neutral"
          @click="emit('toggleColorMode')"
        />
      </ClientOnly>

      <!-- User dropdown -->
      <UDropdownMenu :items="userItems">
        <UButton variant="ghost" color="neutral" class="gap-2" trailing-icon="i-heroicons-chevron-down">
          <UAvatar
            icon="i-heroicons-user"
            size="xs"
            class="bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-200"
          />
          <span class="hidden lg:inline text-sm">{{ user?.name || 'User' }}</span>
        </UButton>
      </UDropdownMenu>
    </div>

    <!-- Search Modal -->
    <UModal v-model:open="searchOpen">
      <template #content>
        <div class="p-4">
          <UInput
            v-model="searchQuery"
            icon="i-heroicons-magnifying-glass"
            placeholder="Search components, pages..."
            size="lg"
            autofocus
          />
          
          <div class="mt-4">
            <p class="text-xs text-gray-500 dark:text-gray-400 mb-2">Quick Links</p>
            <div class="space-y-1">
              <NuxtLink
                v-for="link in [
                  { label: 'Button', to: '/components/elements/button' },
                  { label: 'Input', to: '/components/forms/input' },
                  { label: 'Table', to: '/components/data/table' },
                  { label: 'Modal', to: '/components/overlays/modal' }
                ]"
                :key="link.to"
                :to="link.to"
                class="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                @click="searchOpen = false"
              >
                <UIcon name="i-heroicons-cube" class="w-4 h-4 text-gray-400" />
                <span class="text-sm text-gray-700 dark:text-gray-300">{{ link.label }}</span>
              </NuxtLink>
            </div>
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>
