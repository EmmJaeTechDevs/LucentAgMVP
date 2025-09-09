import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, countdown, variant, ...props }) {
        return (
          <Toast key={id} variant={variant} {...props}>
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
            {/* Countdown Progress Bar */}
            <div className="absolute bottom-0 left-0 w-full h-1 bg-black/10 dark:bg-white/10 overflow-hidden rounded-b-md">
              <div 
                className={`h-full transition-all duration-75 ease-linear ${
                  variant === "destructive" 
                    ? "bg-red-400 dark:bg-red-300" 
                    : "bg-green-500 dark:bg-green-400"
                }`}
                style={{ 
                  width: `${countdown || 0}%`,
                  transition: 'width 0.05s linear'
                }}
              />
            </div>
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
