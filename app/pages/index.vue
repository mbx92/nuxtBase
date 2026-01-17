<script setup lang="ts">
// Redirect to dashboard on page load
onMounted(async () => {
  await navigateTo('/dashboard')
})
</script>

<template>
  <div class="min-h-screen flex items-center justify-center">
    <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 animate-spin text-primary" />
  </div>
</template>
