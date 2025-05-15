
// Re-export from the Shadcn UI toast components
import { toast as shadcnToast } from "@/components/ui/toast";
import { useToast as useShacnToast } from "@/components/ui/toast";

export const toast = shadcnToast;
export const useToast = useShacnToast;
