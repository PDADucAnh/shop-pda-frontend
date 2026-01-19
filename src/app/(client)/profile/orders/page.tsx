// src/app/(client)/profile/orders/page.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { orderService, Order } from "@/services/order.service";
import OrderCard from "@/components/features/order/OrderCard";
import { Package, ShoppingBag, RefreshCw, Filter } from "lucide-react";
import Link from "next/link";

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<number | "all">("all");
  const { user, isAuthenticated } = useAuthStore();

  // Sửa: Dùng useCallback để tránh dependency warning
  const fetchOrders = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // Gọi API lấy đơn hàng của user
      const response = await orderService.getUserOrders();
      
      // SỬA LỖI: response.data là object chứ không phải array
      if (response.status && response.data) {
        // SỬA: response.data có cấu trúc { data: Order[], ... }
        // Nếu API trả về pagination: response.data.data là array
        // Nếu API trả về trực tiếp array: response.data là array
        
        let ordersData: Order[] = [];
        
        // Kiểm tra cấu trúc response
        if (Array.isArray(response.data)) {
          // Trường hợp 1: response.data là array trực tiếp
          ordersData = response.data;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          // Trường hợp 2: response.data có property data là array (pagination)
          ordersData = response.data.data;
        } else if (Array.isArray(response.data)) {
          // Trường hợp 3: response.data là array
          ordersData = response.data;
        }
        
        // Filter theo status nếu cần
        let filteredOrders = ordersData;
        if (filterStatus !== "all") {
          filteredOrders = ordersData.filter(
            (order: Order) => order.status === filterStatus
          );
        }
        
        // SỬA: Truyền array vào setOrders, không truyền cả object
        setOrders(filteredOrders);
      }
    } catch (error) {
      console.error("Lỗi tải đơn hàng:", error);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user, filterStatus]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]); // SỬA: Chỉ dependency vào fetchOrders

  if (!isAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <Package size={64} className="mx-auto text-gray-400 mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Vui lòng đăng nhập
        </h2>
        <p className="text-gray-600 mb-6">
          Bạn cần đăng nhập để xem lịch sử đơn hàng
        </p>
        <Link
          href="/login"
          className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Đăng nhập ngay
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <ShoppingBag size={28} className="text-blue-600" />
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Lịch sử đơn hàng
          </h1>
        </div>
        <p className="text-gray-600">
          Xem và theo dõi tất cả đơn hàng của bạn
        </p>
      </div>

      {/* Filter Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Filter size={20} className="text-gray-500" />
            <span className="font-medium text-gray-700">Lọc theo trạng thái:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilterStatus("all")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                filterStatus === "all"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Tất cả
            </button>
            {[1, 2, 3, 4, 5].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  filterStatus === status
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {status === 1 && "Chờ xác nhận"}
                {status === 2 && "Đã xác nhận"}
                {status === 3 && "Đang giao"}
                {status === 4 && "Hoàn thành"}
                {status === 5 && "Đã hủy"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="text-center py-12">
          <RefreshCw size={40} className="mx-auto animate-spin text-blue-600 mb-4" />
          <p className="text-gray-600">Đang tải đơn hàng...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
          <Package size={64} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            {filterStatus === "all" 
              ? "Chưa có đơn hàng nào" 
              : "Không có đơn hàng với trạng thái này"}
          </h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            {filterStatus === "all"
              ? "Bạn chưa có đơn hàng nào. Hãy bắt đầu mua sắm ngay!"
              : "Không tìm thấy đơn hàng nào với trạng thái đã chọn."}
          </p>
          {filterStatus === "all" && (
            <Link
              href="/products"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Mua sắm ngay
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}

      {/* Stats */}
      {orders.length > 0 && (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-sm text-gray-500">Tổng đơn hàng</div>
            <div className="text-2xl font-bold text-gray-900">{orders.length}</div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-sm text-gray-500">Đang xử lý</div>
            <div className="text-2xl font-bold text-yellow-600">
              {orders.filter(o => o.status === 1 || o.status === 2 || o.status === 3).length}
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-sm text-gray-500">Hoàn thành</div>
            <div className="text-2xl font-bold text-green-600">
              {orders.filter(o => o.status === 4).length}
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-sm text-gray-500">Tổng chi tiêu</div>
            <div className="text-2xl font-bold text-blue-600">
              {new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
              }).format(
                orders.reduce((sum, order) => sum + (order.total_money || 0), 0)
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}