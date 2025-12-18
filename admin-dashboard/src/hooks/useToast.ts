import toast from 'react-hot-toast'

export const useToast = () => {
  return {
    success: (message: string) => {
      toast.success(message, {
        duration: 4000,
        position: 'top-right',
        style: {
          background: '#10b981',
          color: '#fff',
        },
        iconTheme: {
          primary: '#fff',
          secondary: '#10b981',
        },
      })
    },
    error: (message: string) => {
      toast.error(message, {
        duration: 5000,
        position: 'top-right',
        style: {
          background: '#ef4444',
          color: '#fff',
        },
        iconTheme: {
          primary: '#fff',
          secondary: '#ef4444',
        },
      })
    },
    info: (message: string) => {
      toast(message, {
        duration: 4000,
        position: 'top-right',
        icon: 'ℹ️',
        style: {
          background: '#3b82f6',
          color: '#fff',
        },
      })
    },
    warning: (message: string) => {
      toast(message, {
        duration: 4000,
        position: 'top-right',
        icon: '⚠️',
        style: {
          background: '#f59e0b',
          color: '#fff',
        },
      })
    },
    promise: <T,>(
      promise: Promise<T>,
      messages: {
        loading: string
        success: string
        error: string
      }
    ) => {
      return toast.promise(
        promise,
        {
          loading: messages.loading,
          success: messages.success,
          error: messages.error,
        },
        {
          position: 'top-right',
        }
      )
    },
  }
}
