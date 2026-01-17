<script setup lang="ts">
definePageMeta({
  layout: 'default',
})

const toast = useToast()

// User state
const loading = ref(true)
const user = ref<any>(null)

// Change password state
const showPasswordModal = ref(false)
const passwordLoading = ref(false)
const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
})

async function fetchUser() {
  loading.value = true
  try {
    const session = await $fetch('/api/auth/session')
    user.value = session?.user || null
  } catch (error: any) {
    toast.add({
      title: 'Error',
      description: 'Failed to load profile',
      color: 'error',
    })
  } finally {
    loading.value = false
  }
}

function openPasswordModal() {
  passwordForm.value = { currentPassword: '', newPassword: '', confirmPassword: '' }
  showPasswordModal.value = true
}

async function handleChangePassword() {
  // Validation
  if (!passwordForm.value.currentPassword || !passwordForm.value.newPassword) {
    toast.add({
      title: 'Error',
      description: 'All fields are required',
      color: 'error',
    })
    return
  }

  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    toast.add({
      title: 'Error',
      description: 'New passwords do not match',
      color: 'error',
    })
    return
  }

  if (passwordForm.value.newPassword.length < 4) {
    toast.add({
      title: 'Error',
      description: 'Password must be at least 4 characters',
      color: 'error',
    })
    return
  }

  passwordLoading.value = true
  try {
    await $fetch('/api/auth/change-password', {
      method: 'POST',
      body: {
        currentPassword: passwordForm.value.currentPassword,
        newPassword: passwordForm.value.newPassword,
      },
    })

    toast.add({
      title: 'Success',
      description: 'Password changed successfully',
      color: 'success',
    })
    showPasswordModal.value = false
  } catch (error: any) {
    toast.add({
      title: 'Error',
      description: error.data?.message || 'Failed to change password',
      color: 'error',
    })
  } finally {
    passwordLoading.value = false
  }
}

onMounted(fetchUser)
</script>

<template>
  <div class="p-6 max-w-2xl mx-auto">
    <h1 class="text-2xl font-bold mb-6">Profile</h1>

    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center h-32">
      <UIcon name="i-heroicons-arrow-path" class="w-6 h-6 animate-spin text-primary" />
    </div>

    <template v-else-if="user">
      <!-- Profile Card -->
      <UCard class="mb-4">
        <div class="flex items-center gap-4 mb-6">
          <UAvatar
            icon="i-heroicons-user"
            size="xl"
            class="bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-200"
          />
          <div>
            <h2 class="text-xl font-semibold">{{ user.name }}</h2>
            <p class="text-gray-500">{{ user.email }}</p>
          </div>
        </div>

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
            <UBadge :color="user.role === 'admin' ? 'success' : 'primary'">
              {{ user.role }}
            </UBadge>
          </div>
        </div>
      </UCard>

      <!-- Security Card -->
      <UCard>
        <template #header>
          <h3 class="font-semibold">Security</h3>
        </template>

        <div class="flex items-center justify-between">
          <div>
            <p class="font-medium">Password</p>
            <p class="text-sm text-gray-500">Change your account password</p>
          </div>
          <UButton
            icon="i-heroicons-key"
            variant="soft"
            @click="openPasswordModal"
          >
            Change Password
          </UButton>
        </div>
      </UCard>
    </template>

    <!-- Not logged in -->
    <UCard v-else class="text-center py-8">
      <p class="text-gray-500 mb-4">Please login to view your profile</p>
      <UButton to="/login">Go to Login</UButton>
    </UCard>

    <!-- Change Password Modal -->
    <UModal v-model:open="showPasswordModal">
      <template #content>
        <div class="p-6">
          <h3 class="text-lg font-semibold mb-4">Change Password</h3>
          
          <form @submit.prevent="handleChangePassword" class="space-y-4">
            <UFormField label="Current Password" required>
              <UInput
                v-model="passwordForm.currentPassword"
                type="password"
                placeholder="Enter current password"
                icon="i-heroicons-lock-closed"
                class="w-full"
                :disabled="passwordLoading"
              />
            </UFormField>

            <UFormField label="New Password" required>
              <UInput
                v-model="passwordForm.newPassword"
                type="password"
                placeholder="Enter new password"
                icon="i-heroicons-key"
                class="w-full"
                :disabled="passwordLoading"
              />
            </UFormField>

            <UFormField label="Confirm New Password" required>
              <UInput
                v-model="passwordForm.confirmPassword"
                type="password"
                placeholder="Confirm new password"
                icon="i-heroicons-key"
                class="w-full"
                :disabled="passwordLoading"
              />
            </UFormField>

            <div class="flex gap-2 justify-end pt-4">
              <UButton
                type="button"
                variant="ghost"
                :disabled="passwordLoading"
                @click="showPasswordModal = false"
              >
                Cancel
              </UButton>
              <UButton
                type="submit"
                :loading="passwordLoading"
                :disabled="passwordLoading"
              >
                Change Password
              </UButton>
            </div>
          </form>
        </div>
      </template>
    </UModal>
  </div>
</template>

