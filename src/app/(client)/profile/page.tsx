"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { Loader2, Save, X } from 'lucide-react'; 

export default function ProfilePage() {
  const { user, fetchProfile, updateUser } = useAuthStore(); 
  const router = useRouter();
  
  const [isLoading, setIsLoading] = useState(true);
  
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState({
      name: '',
      phone: ''
  });

  useEffect(() => {
    const initProfile = async () => {
        if (user) {
            setIsLoading(false);
            setFormData({ name: user.name, phone: user.phone || '' });
            return;
        }

        try {
            await fetchProfile();
        } catch {
            router.push('/login');
        } finally {
            setIsLoading(false);
        }
    };

    initProfile();
  }, [user, fetchProfile, router]);

  const handleStartEdit = () => {
      if (user) {
          setFormData({ name: user.name, phone: user.phone || '' });
          setIsEditing(true);
      }
  };

  const handleCancelEdit = () => {
      setIsEditing(false);
      if (user) {
          setFormData({ name: user.name, phone: user.phone || '' });
      }
  };

  const handleSave = async () => {
      if (!formData.name.trim()) {
          alert("Tên không được để trống");
          return;
      }

      setIsSaving(true);
      try {
          await updateUser(formData); 
          alert("Cập nhật thông tin thành công!");
          setIsEditing(false);
      } catch (error: unknown) { // FIX: Đổi 'any' thành 'unknown'
          console.error("Lỗi update:", error);
          
          // FIX: Ép kiểu để lấy message lỗi an toàn
          const err = error as { response?: { data?: { message?: string } } };
          const msg = err.response?.data?.message || "Cập nhật thất bại.";
          
          alert(msg);
      } finally {
          setIsSaving(false);
      }
  };

  if (isLoading) {
      return (
          <div className="min-h-[400px] flex flex-col items-center justify-center bg-white rounded-lg border border-gray-100">
              <Loader2 className="animate-spin text-blue-600 mb-4" size={40} />
              <p className="text-gray-500">Đang đồng bộ dữ liệu...</p>
          </div>
      );
  }

  if (!user) return null;

  return (
    <div className="bg-white border border-gray-100 rounded-lg p-6 md:p-8 shadow-sm">
        <div className="flex justify-between items-center mb-6 pb-4 border-b">
            <h3 className="text-xl font-bold text-gray-800">HỒ SƠ CỦA TÔI</h3>
            {isEditing && <span className="text-sm text-blue-600 font-medium">Đang chỉnh sửa...</span>}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl">
            {/* Cột trái */}
            <div className="space-y-6">
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Họ tên</label>
                    {isEditing ? (
                        <input 
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            className="w-full bg-white px-4 py-3 rounded border border-blue-500 text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                    ) : (
                        <div className="bg-gray-50 px-4 py-3 rounded border border-gray-200 text-gray-900 font-medium">
                            {user.name}
                        </div>
                    )}
                </div>

                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Email</label>
                    <div className="bg-gray-50 px-4 py-3 rounded border border-gray-200 text-gray-500 cursor-not-allowed" title="Không thể thay đổi email">
                        {user.email}
                    </div>
                </div>
            </div>

            {/* Cột phải */}
            <div className="space-y-6">
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Số điện thoại</label>
                    {isEditing ? (
                        <input 
                            type="text"
                            value={formData.phone}
                            onChange={(e) => setFormData({...formData, phone: e.target.value})}
                            placeholder="Nhập số điện thoại"
                            className="w-full bg-white px-4 py-3 rounded border border-blue-500 text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                    ) : (
                        <div className="bg-gray-50 px-4 py-3 rounded border border-gray-200 text-gray-700">
                            {user.phone || 'Chưa cập nhật'}
                        </div>
                    )}
                </div>

                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Loại tài khoản</label>
                    <div className="bg-gray-50 px-4 py-3 rounded border border-gray-200 text-gray-700 capitalize">
                        {user.roles || 'Khách hàng'}
                    </div>
                </div>
            </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-10 pt-6 border-t flex justify-end gap-3">
            {isEditing ? (
                <>
                    <button 
                        onClick={handleCancelEdit}
                        disabled={isSaving}
                        className="px-6 py-3 text-sm font-bold uppercase tracking-wider text-gray-600 hover:bg-gray-100 transition rounded flex items-center gap-2"
                    >
                        <X size={18} /> Hủy
                    </button>
                    <button 
                        onClick={handleSave}
                        disabled={isSaving}
                        className="bg-blue-600 text-white px-8 py-3 text-sm font-bold uppercase tracking-wider hover:bg-blue-700 transition rounded shadow-lg flex items-center gap-2 disabled:opacity-70"
                    >
                        {isSaving ? (
                            <Loader2 className="animate-spin" size={18} /> 
                        ) : (
                            <Save size={18} />
                        )}
                        Lưu thay đổi
                    </button>
                </>
            ) : (
                <button 
                    onClick={handleStartEdit}
                    className="bg-black text-white px-8 py-3 text-sm font-bold uppercase tracking-wider hover:bg-gray-800 transition rounded shadow-lg"
                >
                    Cập nhật thông tin
                </button>
            )}
        </div>
    </div>
  );
}