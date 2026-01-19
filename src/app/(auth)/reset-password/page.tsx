"use client";

import { useState, useEffect, Suspense } from "react"; // Thêm Suspense để bọc useSearchParams
import { useRouter, useSearchParams } from "next/navigation";
import { authService } from "@/services/auth.service";
import { Loader2, Lock, Eye, EyeOff } from "lucide-react";
// FIX: Xóa import Link không dùng đến

// Component con để tránh lỗi Suspense khi dùng useSearchParams
function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const token = searchParams.get("token");
  const emailParam = searchParams.get("email");

  const [formData, setFormData] = useState({
    email: emailParam || "",
    password: "",
    password_confirmation: "",
  });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (emailParam) {
        setFormData(prev => ({ ...prev, email: emailParam }));
    }
  }, [emailParam]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
        setError("Token không hợp lệ.");
        return;
    }
    
    if (formData.password !== formData.password_confirmation) {
        setError("Mật khẩu xác nhận không khớp.");
        return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await authService.resetPassword({
        email: formData.email,
        token: token,
        password: formData.password,
        password_confirmation: formData.password_confirmation
      });

      if (res.status) {
        setMessage("Đặt lại mật khẩu thành công! Đang chuyển hướng...");
        setTimeout(() => router.push("/login"), 3000);
      }
    // FIX: Thay 'any' bằng 'unknown' và ép kiểu an toàn
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { message?: string } } };
      setError(errorObj.response?.data?.message || "Token đã hết hạn hoặc không hợp lệ.");
    } finally {
      setLoading(false);
    }
  };

  if (!token) return <div className="text-red-500 text-center">Đường dẫn không hợp lệ.</div>;

  return (
    <>
      {message ? (
          <div className="bg-green-50 text-green-700 p-4 rounded-lg text-center">
            {message}
          </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && <div className="bg-red-50 text-red-600 p-3 rounded text-sm">{error}</div>}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              required
              readOnly
              value={formData.email}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu mới</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type={showPass ? "text" : "password"}
                required
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Tối thiểu 6 ký tự"
              />
              <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-3 text-gray-400">
                {showPass ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Xác nhận mật khẩu</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type={showPass ? "text" : "password"}
                required
                value={formData.password_confirmation}
                onChange={(e) => setFormData({...formData, password_confirmation: e.target.value})}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Nhập lại mật khẩu"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 transition flex items-center justify-center font-medium"
          >
            {loading ? <Loader2 className="animate-spin" /> : "Đổi mật khẩu"}
          </button>
        </form>
      )}
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Đặt lại mật khẩu</h1>
        </div>
        <Suspense fallback={<div className="text-center">Đang tải...</div>}>
             <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}