// src/components/features/order/OrderStatusBadge.tsx
import {
  CheckCircle,
  Truck,
  XCircle,
  AlertCircle,
  Package,
} from "lucide-react";

interface OrderStatusBadgeProps {
  status: number;
  size?: "sm" | "md" | "lg";
}

export default function OrderStatusBadge({
  status,
  size = "md",
}: OrderStatusBadgeProps) {
  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-3 py-1 text-sm",
    lg: "px-4 py-2 text-base",
  };

  const getStatusConfig = (status: number) => {
    switch (status) {
      case 1: // Mới
        return {
          text: "Chờ xác nhận",
          icon: AlertCircle,
          bgColor: "bg-gray-100",
          textColor: "text-gray-700",
          iconColor: "text-gray-500",
        };
      case 2: // Đã xác nhận
        return {
          text: "Đã xác nhận",
          icon: CheckCircle,
          bgColor: "bg-blue-100",
          textColor: "text-blue-700",
          iconColor: "text-blue-500",
        };
      case 3: // Đang giao
        return {
          text: "Đang giao hàng",
          icon: Truck,
          bgColor: "bg-yellow-100",
          textColor: "text-yellow-700",
          iconColor: "text-yellow-500",
        };
      case 4: // Hoàn thành
        return {
          text: "Đã giao hàng",
          icon: Package,
          bgColor: "bg-green-100",
          textColor: "text-green-700",
          iconColor: "text-green-500",
        };
      case 5: // Đã hủy
        return {
          text: "Đã hủy",
          icon: XCircle,
          bgColor: "bg-red-100",
          textColor: "text-red-700",
          iconColor: "text-red-500",
        };
      default:
        return {
          text: "Không xác định",
          icon: AlertCircle,
          bgColor: "bg-gray-100",
          textColor: "text-gray-700",
          iconColor: "text-gray-500",
        };
    }
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1 ${config.bgColor} ${config.textColor} ${sizeClasses[size]} rounded-full font-medium`}
    >
      <Icon size={size === "sm" ? 12 : size === "md" ? 14 : 16} className={config.iconColor} />
      {config.text}
    </span>
  );
}