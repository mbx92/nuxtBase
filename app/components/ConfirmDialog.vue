<script setup lang="ts">
const { isOpen, options, handleConfirm, handleCancel } = useConfirmDialog()
</script>

<template>
  <UModal 
    v-model:open="isOpen"
    :close="false"
    :ui="{ footer: 'justify-center' }"
  >
    <template #body>
      <div class="text-center py-2">
        <!-- Icon -->
        <div 
          class="mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-4 ring-8"
          :class="{
            'bg-red-50 dark:bg-red-900/20 ring-red-50 dark:ring-red-900/10': options.color === 'error',
            'bg-yellow-50 dark:bg-yellow-900/20 ring-yellow-50 dark:ring-yellow-900/10': options.color === 'warning',
            'bg-blue-50 dark:bg-blue-900/20 ring-blue-50 dark:ring-blue-900/10': options.color === 'primary',
            'bg-green-50 dark:bg-green-900/20 ring-green-50 dark:ring-green-900/10': options.color === 'success',
          }"
        >
          <UIcon 
            :name="options.icon" 
            class="w-6 h-6"
            :class="{
              'text-red-600 dark:text-red-400': options.color === 'error',
              'text-yellow-600 dark:text-yellow-400': options.color === 'warning',
              'text-blue-600 dark:text-blue-400': options.color === 'primary',
              'text-green-600 dark:text-green-400': options.color === 'success',
            }"
          />
        </div>
        
        <!-- Title & Message -->
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          {{ options.title }}
        </h3>
        <p class="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
          {{ options.message }}
        </p>
      </div>
    </template>

    <template #footer>
      <UButton
        variant="outline"
        color="neutral"
        class="flex-1"
        @click="handleCancel"
      >
        {{ options.cancelText }}
      </UButton>
      <UButton
        :color="options.color"
        class="flex-1"
        @click="handleConfirm"
      >
        {{ options.confirmText }}
      </UButton>
    </template>
  </UModal>
</template>


