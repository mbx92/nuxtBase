<script setup lang="ts">
definePageMeta({
  layout: false,
  auth: false,
})

const toast = useToast()
const router = useRouter()

const loading = ref(false)
const loginForm = ref({
  email: '',
  password: '',
})

// Dev credentials for quick testing
const devCredentials = {
  email: 'admin@billman.dev',
  password: 'admin',
}

function fillDevCredentials() {
  loginForm.value.email = devCredentials.email
  loginForm.value.password = devCredentials.password
}

async function handleLogin() {
  if (!loginForm.value.email || !loginForm.value.password) {
    toast.add({
      title: 'Error',
      description: 'Email and password are required',
      color: 'error',
    })
    return
  }

  loading.value = true
  try {
    const response = await $fetch('/api/auth/login', {
      method: 'POST',
      body: loginForm.value,
    })

    toast.add({
      title: 'Success',
      description: `Welcome back, ${response.user.name}!`,
      color: 'success',
    })

    // Redirect to dashboard
    await router.push('/dashboard')
  } catch (error: any) {
    toast.add({
      title: 'Login Failed',
      description: error.data?.message || 'Invalid email or password',
      color: 'error',
    })
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
    <UCard class="w-full max-w-md">
      <template #header>
        <div class="text-center">
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">BillMan</h1>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Developer Login</p>
        </div>
      </template>

      <form @submit.prevent="handleLogin" class="space-y-4">
        <UFormField label="Email" required>
          <UInput
            v-model="loginForm.email"
            type="email"
            placeholder="your.email@example.com"
            icon="i-heroicons-envelope"
            size="lg"
            class="w-full"
            :disabled="loading"
          />
        </UFormField>

        <UFormField label="Password" required>
          <UInput
            v-model="loginForm.password"
            type="password"
            placeholder="Enter your password"
            icon="i-heroicons-lock-closed"
            size="lg"
            class="w-full"
            :disabled="loading"
          />
        </UFormField>

        <UButton
          type="submit"
          size="lg"
          block
          :loading="loading"
          :disabled="loading"
        >
          Sign In
        </UButton>

        <UButton
          type="button"
          size="lg"
          block
          variant="outline"
          color="info"
          icon="i-heroicons-code-bracket"
          @click="fillDevCredentials"
        >
          Fill Dev Credentials
        </UButton>
      </form>

      <template #footer>
        <div class="text-center text-sm text-gray-500 dark:text-gray-400">
          <p>Don't have an account? Contact your administrator.</p>
        </div>
      </template>
    </UCard>
  </div>
</template>
