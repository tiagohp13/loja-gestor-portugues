import { 
  Package, 
  ShoppingCart, 
  FileText, 
  DollarSign, 
  Users, 
  Truck, 
  Bell 
} from "lucide-react";
import { NotificationType } from "@/hooks/useNotifications";

interface NotificationIconProps {
  type: NotificationType;
  priority: "low" | "medium" | "high";
  className?: string;
}

export const NotificationIcon = ({ type, priority, className = "h-5 w-5" }: NotificationIconProps) => {
  const getColor = () => {
    switch (priority) {
      case "high":
        return "text-destructive";
      case "medium":
        return "text-warning";
      case "low":
        return "text-muted-foreground";
      default:
        return "text-muted-foreground";
    }
  };

  const getIcon = () => {
    switch (type) {
      case "stock":
        return <Package className={`${className} ${getColor()}`} />;
      case "order":
        return <ShoppingCart className={`${className} ${getColor()}`} />;
      case "request":
        return <FileText className={`${className} ${getColor()}`} />;
      case "expense":
        return <DollarSign className={`${className} ${getColor()}`} />;
      case "client":
        return <Users className={`${className} ${getColor()}`} />;
      case "supplier":
        return <Truck className={`${className} ${getColor()}`} />;
      default:
        return <Bell className={`${className} ${getColor()}`} />;
    }
  };

  return getIcon();
};
