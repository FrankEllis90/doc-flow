import { ref } from 'vue'

export interface Notification {
  id: string | number
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
  duration?: number
  autoClose?: boolean
}

// Global notification state
const notifications = ref<Notification[]>([])
let notificationHandlers = new Set<(notification: Notification) => void>()

export function useNotifications() {
  const addNotification = (notification: Omit<Notification, 'id'>) => {
    const fullNotification: Notification = {
      id: Date.now() + Math.random(),
      type: notification.type || 'info',
      title: notification.title,
      message: notification.message,
      duration: notification.duration || 5000,
      autoClose: notification.autoClose !== false
    }
    
    notifications.value.push(fullNotification)
    
    // Notify all registered handlers
    notificationHandlers.forEach(handler => {
      try {
        handler(fullNotification)
      } catch (error) {
        console.error('Notification handler error:', error)
      }
    })
    
    // Auto-remove if configured
    if (fullNotification.autoClose && fullNotification.duration && fullNotification.duration > 0) {
      setTimeout(() => {
        removeNotification(fullNotification.id)
      }, fullNotification.duration)
    }
    
    // Keep only last 20 notifications to prevent memory bloat
    if (notifications.value.length > 20) {
      notifications.value = notifications.value.slice(-20)
    }
    
    return fullNotification
  }
  
  const removeNotification = (id: string | number) => {
    const index = notifications.value.findIndex((n: Notification) => n.id === id)
    if (index > -1) {
      notifications.value.splice(index, 1)
    }
  }
  
  const clearAllNotifications = () => {
    notifications.value = []
  }
  
  const registerHandler = (handler: (notification: Notification) => void) => {
    notificationHandlers.add(handler)
    
    // Return cleanup function
    return () => {
      notificationHandlers.delete(handler)
    }
  }
  
  const showSuccess = (title: string, message: string, duration?: number) => {
    return addNotification({ type: 'success', title, message, duration })
  }
  
  const showError = (title: string, message: string, duration?: number) => {
    return addNotification({ type: 'error', title, message, duration: duration || 8000 })
  }
  
  const showWarning = (title: string, message: string, duration?: number) => {
    return addNotification({ type: 'warning', title, message, duration })
  }
  
  const showInfo = (title: string, message: string, duration?: number) => {
    return addNotification({ type: 'info', title, message, duration })
  }
  
  return {
    notifications,
    addNotification,
    removeNotification,
    clearAllNotifications,
    registerHandler,
    showSuccess,
    showError,
    showWarning,
    showInfo
  }
}

// Global instance for components that can't use composables
let globalNotificationInstance: ReturnType<typeof useNotifications> | null = null

export function getGlobalNotifications() {
  if (!globalNotificationInstance) {
    globalNotificationInstance = useNotifications()
  }
  return globalNotificationInstance
}

// Safe global access for legacy components
export function createSafeGlobalNotification() {
  const instance = getGlobalNotifications()
  
  // Create a safe wrapper that won't cause memory leaks
  const safeNotify = (notification: any) => {
    if (typeof notification === 'object' && notification.title && notification.message) {
      instance.addNotification(notification)
    } else {
      console.warn('Invalid notification format:', notification)
    }
  }
  
  return safeNotify
}