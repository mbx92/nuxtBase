import { ref } from 'vue'

interface ConfirmOptions {
  title?: string
  message: string
  confirmText?: string
  cancelText?: string
  color?: 'error' | 'warning' | 'primary' | 'success'
  icon?: string
}

const isOpen = ref(false)
const options = ref<ConfirmOptions>({
  title: 'Confirm',
  message: '',
  confirmText: 'Confirm',
  cancelText: 'Cancel',
  color: 'error',
  icon: 'i-heroicons-exclamation-triangle',
})
const resolvePromise = ref<((value: boolean) => void) | null>(null)

export function useConfirmDialog() {
  function confirm(opts: ConfirmOptions): Promise<boolean> {
    options.value = {
      title: opts.title || 'Confirm',
      message: opts.message,
      confirmText: opts.confirmText || 'Confirm',
      cancelText: opts.cancelText || 'Cancel',
      color: opts.color || 'error',
      icon: opts.icon || 'i-heroicons-exclamation-triangle',
    }
    isOpen.value = true

    return new Promise((resolve) => {
      resolvePromise.value = resolve
    })
  }

  function handleConfirm() {
    isOpen.value = false
    resolvePromise.value?.(true)
    resolvePromise.value = null
  }

  function handleCancel() {
    isOpen.value = false
    resolvePromise.value?.(false)
    resolvePromise.value = null
  }

  return {
    isOpen,
    options,
    confirm,
    handleConfirm,
    handleCancel,
  }
}
