"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, Suspense } from "react"; // Thêm Suspense
import Link from "next/link";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";

// Tách nội dung chính ra component con
function PaymentResultContent() {
  const searchParams = useSearchParams();
  const { clearCart } = useCartStore();

  // 1. Lấy mã phản hồi từ URL
  const responseCode = searchParams.get('vnp_ResponseCode');

  // 2. Tính toán trạng thái trực tiếp (Derived State)
  // Không cần useState, giúp code chạy nhanh hơn và không bị lỗi ESLint
  let status: 'success' | 'failed' | 'loading' = 'loading';

  if (responseCode === '00') {
    status = 'success';
  } else if (responseCode) {
    status = 'failed';
  }

  // 3. Side Effect: Xóa giỏ hàng khi thành công
  useEffect(() => {
    if (status === 'success') {
      clearCart();
    }
  }, [status, clearCart]);

  // --- Render Giao Diện ---
  
  // Trạng thái đang tải (hoặc chưa có params)
  if (status === 'loading') {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="flex flex-col items-center gap-2">
                <Loader2 className="animate-spin text-gray-500 w-8 h-8" />
                <p className="text-gray-500 text-sm">Đang xử lý kết quả...</p>
            </div>
        </div>
      );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md w-full">
        {status === 'success' ? (
            <>
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-gray-800 mb-2">Thanh toán thành công!</h1>
                <p className="text-gray-600 mb-6">Cảm ơn bạn đã mua hàng tại PDA Fashion.</p>
            </>
        ) : (
            <>
                <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-gray-800 mb-2">Thanh toán thất bại</h1>
                <p className="text-gray-600 mb-6">Giao dịch bị hủy hoặc có lỗi xảy ra.</p>
            </>
        )}
        
        <Link href="/" className="inline-block bg-black text-white px-6 py-2 rounded uppercase font-bold text-sm hover:bg-gray-800 transition">
            Về trang chủ
        </Link>
      </div>
    </div>
  );
}

// Component chính bọc Suspense để tránh lỗi useSearchParams trong Next.js
export default function PaymentResultPage() {
    return (
        <Suspense fallback={<div className="h-screen flex items-center justify-center">Đang tải...</div>}>
            <PaymentResultContent />
        </Suspense>
    );
}