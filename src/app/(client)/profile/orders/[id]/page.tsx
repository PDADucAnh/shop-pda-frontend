"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { orderService, Order } from "@/services/order.service";
import OrderStatusBadge from "@/components/features/order/OrderStatusBadge";
import { 
  ArrowLeft, Package, MapPin, CreditCard, Phone, Mail, 
  Calendar, FileText, Printer, Loader2, AlertCircle 
} from "lucide-react";
import Link from "next/link";
import Image from "next/image"; // Import Image từ next/image

export default function OrderDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  
  // State xử lý loading khi huỷ đơn
  const [cancelling, setCancelling] = useState(false);

  const { isAuthenticated } = useAuthStore();

  // FIX 1 & 2: Bọc hàm này trong useCallback để làm dependency cho useEffect
  const fetchOrderDetail = useCallback(async () => {
      setLoading(true);
      try {
        const response = await orderService.getOrderDetailForUser(Number(id));
        
        if (response.status && response.data) {
          setOrder(response.data);
        } else {
          router.push("/profile/orders");
        }
      } catch (error) {
        console.error("Lỗi tải chi tiết đơn hàng:", error);
        router.push("/profile/orders");
      } finally {
        setLoading(false);
      }
    }, [id, router]); // Dependency của useCallback

  // FIX 2: Thêm fetchOrderDetail vào dependency array
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    if (id) {
      fetchOrderDetail();
    }
  }, [id, isAuthenticated, router, fetchOrderDetail]);

  // Hàm xử lý Huỷ đơn hàng
  const handleCancelOrder = async () => {
    if (!window.confirm("Bạn có chắc chắn muốn huỷ đơn hàng này không?")) return;

    setCancelling(true);
    try {
      await orderService.cancelUserOrder(Number(id));
      
      alert("Đã huỷ đơn hàng thành công!");
      
      // Load lại dữ liệu
      fetchOrderDetail();
    // FIX 3: Thay 'any' bằng 'unknown' và ép kiểu bên trong
    } catch (error: unknown) {
      console.error("Lỗi huỷ đơn:", error);
      // Ép kiểu tạm thời để lấy message từ response axios
      const err = error as { response?: { data?: { message?: string } } };
      const msg = err.response?.data?.message || "Không thể huỷ đơn hàng này.";
      alert(msg);
    } finally {
      setCancelling(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Đang tải thông tin đơn hàng...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <Package size={64} className="mx-auto text-gray-400 mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Không tìm thấy đơn hàng
        </h2>
        <p className="text-gray-600 mb-6">
          Đơn hàng không tồn tại hoặc bạn không có quyền truy cập
        </p>
        <Link
          href="/profile/orders"
          className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Quay lại danh sách
        </Link>
      </div>
    );
  }

  const orderDate = new Date(order.created_at).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <Link
            href="/profile/orders"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-2"
          >
            <ArrowLeft size={20} />
            <span>Quay lại danh sách</span>
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Đơn hàng #{order.id}
          </h1>
          <div className="flex items-center gap-2 mt-2">
            <Calendar size={16} className="text-gray-400" />
            <span className="text-gray-600">{orderDate}</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <OrderStatusBadge status={order.status} size="lg" />
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
          >
            <Printer size={18} />
            In đơn hàng
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Order Details */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Customer Information */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin size={20} className="text-blue-600" />
              Thông tin giao hàng
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Họ tên</p>
                <p className="font-medium">{order.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Số điện thoại</p>
                <div className="flex items-center gap-2">
                  <Phone size={16} className="text-gray-400" />
                  <p className="font-medium">{order.phone}</p>
                </div>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm text-gray-500">Email</p>
                <div className="flex items-center gap-2">
                  <Mail size={16} className="text-gray-400" />
                  <p className="font-medium">{order.email}</p>
                </div>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm text-gray-500">Địa chỉ nhận hàng</p>
                <p className="font-medium">{order.address}</p>
              </div>
              {order.note && (
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-500">Ghi chú</p>
                  <div className="flex items-start gap-2 mt-1">
                    <FileText size={16} className="text-gray-400 mt-0.5" />
                    <p className="text-gray-700">{order.note}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Package size={20} className="text-blue-600" />
              Sản phẩm đã đặt
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                      Sản phẩm
                    </th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-gray-700">
                      Số lượng
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">
                      Đơn giá
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">
                      Thành tiền
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {order.order_details?.map((item, index) => {
                    const price = typeof item.price === "string" 
                      ? parseFloat(item.price) 
                      : item.price || 0;
                    const amount = typeof item.amount === "string" 
                      ? parseFloat(item.amount) 
                      : item.amount || 0;
                    
                    return (
                      <tr key={index} className="border-b border-gray-100 last:border-0">
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-16 h-16 bg-gray-100 rounded-md flex items-center justify-center overflow-hidden shrink-0">
                              {/* FIX 4: Thay img bằng Image của Next.js */}
                              {item.product?.thumbnail ? (
                                <Image
                                  src={item.product.thumbnail}
                                  alt={item.product.name}
                                  width={64}
                                  height={64}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <Package size={24} className="text-gray-400" />
                              )}
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">
                                {item.product?.name || `Sản phẩm #${item.product_id}`}
                              </h4>
                              <p className="text-sm text-gray-500">ID: {item.product_id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="text-center py-4 px-4">
                          <span className="font-medium">{item.qty}</span>
                        </td>
                        <td className="text-right py-4 px-4">
                          <span className="font-medium">
                            {new Intl.NumberFormat("vi-VN").format(price)}
                          </span>
                        </td>
                        <td className="text-right py-4 px-4">
                          <span className="font-medium text-blue-600">
                            {new Intl.NumberFormat("vi-VN").format(amount)}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-2">
             {order.status === 1 && (
                <button 
                    onClick={handleCancelOrder}
                    disabled={cancelling}
                    className="px-6 py-2.5 bg-red-50 text-red-600 border border-red-200 rounded-lg font-semibold hover:bg-red-100 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                    {cancelling ? <Loader2 size={18} className="animate-spin" /> : <AlertCircle size={18} />}
                    {cancelling ? "Đang huỷ..." : "Huỷ đơn hàng"}
                </button>
             )}

             {(order.status === 4 || order.status === 0) && (
                 <button 
                     onClick={() => alert("Chức năng Mua lại đang phát triển")} 
                     className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
                 >
                     Mua lại đơn này
                 </button>
             )}
          </div>

        </div>

        {/* Right Column - Order Summary */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <CreditCard size={20} className="text-blue-600" />
              Tóm tắt đơn hàng
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Tạm tính:</span>
                <span className="font-medium">
                  {new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(order.total_money || 0)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Phí vận chuyển:</span>
                <span className="font-medium">Miễn phí</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Phương thức thanh toán:</span>
                <span className="font-medium">
                  {order.payment_method === "cod" 
                    ? "Thanh toán khi nhận hàng" 
                    : "VNPAY (Đã thanh toán)"}
                </span>
              </div>
              <div className="border-t border-gray-200 pt-3 mt-3">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-900">Tổng cộng:</span>
                  <span className="text-xl font-bold text-blue-600">
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(order.total_money || 0)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Trạng thái đơn hàng</h3>
            <div className="space-y-4">
              {[
                { status: 1, label: "Đơn hàng đã được đặt", desc: orderDate },
                { status: 2, label: "Đơn hàng đã được xác nhận", desc: "Đang chờ xử lý" },
                { status: 3, label: "Đơn hàng đang được giao", desc: "Đang trên đường đến bạn" },
                { status: 4, label: "Đơn hàng đã giao thành công", desc: "Giao hàng thành công" },
              ].map((item, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className={`w-3 h-3 rounded-full mt-1 ${
                    order.status >= item.status 
                      ? "bg-green-500" 
                      : "bg-gray-300"
                  }`}></div>
                  <div>
                    <p className={`font-medium ${
                      order.status >= item.status 
                        ? "text-gray-900" 
                        : "text-gray-400"
                    }`}>
                      {item.label}
                    </p>
                    <p className="text-sm text-gray-500">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg border border-blue-100 p-6">
            <h3 className="font-semibold text-blue-900 mb-2">Cần hỗ trợ?</h3>
            <p className="text-blue-700 text-sm mb-4">
              Nếu bạn có bất kỳ câu hỏi nào về đơn hàng, vui lòng liên hệ với chúng tôi.
            </p>
            <Link
              href="/contact"
              className="inline-block px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition"
            >
              Liên hệ hỗ trợ
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}