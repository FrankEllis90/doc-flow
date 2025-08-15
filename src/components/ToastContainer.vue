<template>
  <div class="fixed top-4 right-4 z-50 space-y-3">
    <Toast
      v-for="toast in toasts"
      :key="toast.id"
      :type="toast.type"
      :title="toast.title"
      :message="toast.message"
      :duration="toast.duration"
      :auto-close="toast.autoClose"
      @close="removeToast(toast.id)"
    />
  </div>
</template>

<script>
import Toast from './Toast.vue'

export default {
  name: 'ToastContainer',
  components: {
    Toast
  },
  props: {
    toasts: {
      type: Array,
      default: () => []
    }
  },
  emits: ['remove-toast'],
  setup(props, { emit }) {
    const removeToast = (toastId) => {
      emit('remove-toast', toastId)
    }
    
    return {
      removeToast
    }
  }
}
</script>