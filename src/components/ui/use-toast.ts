
// Re-export toast from sonner
import { toast } from "sonner";

// Create a compatible useToast interface that uses sonner under the hood
export const useToast = () => {
  return {
    toast,
    dismiss: (toastId?: string) => {
      if (toastId) {
        toast.dismiss(toastId);
      } else {
        toast.dismiss();
      }
    },
    toasts: [] // This is not used in most components
  };
};

export { toast };
