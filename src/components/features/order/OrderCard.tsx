// src/components/features/order/OrderCard.tsx
import Link from "next/link";
import { ChevronRight, Package, MapPin, Calendar } from "lucide-react";
import OrderStatusBadge from "./OrderStatusBadge";
import { Order } from "@/services/order.service";

interface OrderCardProps {
  order: Order;
}

export default function OrderCard({ order }: OrderCardProps) {
  // Format date
  const orderDate = new Date(order.created_at).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  // Calculate total items
  const totalItems = order.order_details?.reduce((sum, item) => sum + item.qty, 0) || 0;

  // Format total money
  const formattedTotal = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(order.total_money || 0);

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
      <Link href={`/profile/orders/${order.id}`}>
        <div className="p-4 md:p-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <Package className="text-gray-400" size={20} />
              <div>
                <h3 className="font-semibold text-gray-900">
                  Đơn hàng #{order.id}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <Calendar size={14} className="text-gray-400" />
                  <span className="text-sm text-gray-500">{orderDate}</span>
                </div>
              </div>
            </div>
            <OrderStatusBadge status={order.status} />
          </div>

          {/* Order Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="space-y-1">
              <p className="text-sm text-gray-500">Sản phẩm</p>
              <p className="font-medium">
                {totalItems} {totalItems > 1 ? "sản phẩm" : "sản phẩm"}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-500">Tổng tiền</p>
              <p className="font-medium text-lg text-blue-600">{formattedTotal}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-500">Phương thức thanh toán</p>
              <p className="font-medium">
                {order.payment_method === "cod" ? "Thanh toán khi nhận hàng" : "VNPAY"}
              </p>
            </div>
          </div>

          {/* Delivery Address */}
          {order.address && (
            <div className="flex items-start gap-2 p-3 bg-gray-50 rounded-md">
              <MapPin size={16} className="text-gray-400 mt-0.5" />
              <div className="text-sm text-gray-600">
                <span className="font-medium">Giao đến:</span> {order.address}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
            <div className="text-sm text-gray-500">
              Nhấn để xem chi tiết đơn hàng
            </div>
            <ChevronRight size={20} className="text-gray-400" />
          </div>
        </div>
      </Link>
    </div>
  );
}