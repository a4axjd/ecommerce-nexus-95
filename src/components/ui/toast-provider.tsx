
import { Toaster as SonnerToaster } from "sonner";
import { useTheme } from "next-themes";

export function ToastProvider() {
  const { theme = "system" } = useTheme();
  
  return (
    <SonnerToaster
      theme={theme as any}
      position="bottom-right"
      closeButton
      richColors
      toastOptions={{
        duration: 3000,
        className: "my-toast-class",
        style: {
          zIndex: 9999, // Ensure toasts appear above dialogs
        },
      }}
    />
  );
}
