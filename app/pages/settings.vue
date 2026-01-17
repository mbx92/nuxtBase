<script setup lang="ts">
definePageMeta({
  layout: 'default',
})

const colorMode = useColorMode()

// Toggle color mode
function toggleColorMode() {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
}
</script>

<template>
  <div class="p-6 max-w-2xl mx-auto">
    <h1 class="text-2xl font-bold mb-6">Settings</h1>

    <div class="space-y-4">
      <!-- Theme Setting -->
      <UCard>
        <template #header>
          <h3 class="font-semibold">Appearance</h3>
        </template>

        <div class="flex items-center justify-between">
          <div>
            <p class="font-medium">Dark Mode</p>
            <p class="text-sm text-gray-500">Toggle between light and dark theme</p>
          </div>
          <ClientOnly>
            <UButton
              :icon="colorMode.value === 'dark' ? 'i-heroicons-sun' : 'i-heroicons-moon'"
              :color="colorMode.value === 'dark' ? 'warning' : 'neutral'"
              variant="soft"
              @click="toggleColorMode"
            >
              {{ colorMode.value === 'dark' ? 'Light Mode' : 'Dark Mode' }}
            </UButton>
          </ClientOnly>
        </div>
      </UCard>

      <!-- App Info -->
      <UCard>
        <template #header>
          <h3 class="font-semibold">About</h3>
        </template>

        <div class="space-y-2 text-sm">
          <div class="flex justify-between">
            <span class="text-gray-500">App Name</span>
            <span class="font-medium">BillMan</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-500">Version</span>
            <span class="font-medium">1.0.0</span>
          </div>
        </div>
      </UCard>
    </div>
  </div>
</template>
