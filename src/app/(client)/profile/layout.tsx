"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    User,
    ShoppingBag,
    MapPin,
    CreditCard,
    Settings,
    LogOut,
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { authService } from "@/services/auth.service";

export default function ProfileLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const { user, logout } = useAuthStore();

    // Hàm xử lý đăng xuất
    const handleLogout = async () => {
        const confirmLogout = window.confirm(
            "Bạn có chắc chắn muốn đăng xuất?",
        );
        if (confirmLogout) {
            try {
                await authService.logout();
                logout();
                router.push("/login");
            } catch (error) {
                console.error("Lỗi đăng xuất:", error);
            }
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pt-8 pb-20">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden sticky top-24">
                            <div className="p-4 bg-gray-50 border-b border-gray-100 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                                    <User size={20} />
                                </div>
                                <div>
                                    <span className="block text-xs text-gray-500">
                                        Tài khoản của
                                    </span>
                                    <span className="block text-sm font-bold text-gray-800 truncate max-w-[150px]">
                                        {user ? user.name : "Khách hàng"}
                                    </span>{" "}
                                </div>
                            </div>
                            <nav className="p-2">
                                <ul className="space-y-1">
                                    <li>
                                        <Link
                                            href="/profile"
                                            className="flex items-center gap-3 px-4 py-3 rounded-md hover:bg-gray-50 hover:text-black text-gray-600 transition"
                                        >
                                            <User size={18} />
                                            <span className="text-sm font-medium">
                                                Thông tin chung
                                            </span>
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            href="/profile/orders"
                                            className="flex items-center gap-3 px-4 py-3 rounded-md hover:bg-gray-50 hover:text-black text-gray-600 transition"
                                        >
                                            <ShoppingBag size={18} />
                                            <span className="text-sm font-medium">
                                                Đơn hàng của tôi
                                            </span>
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            href="/profile/address"
                                            className="flex items-center gap-3 px-4 py-3 rounded-md hover:bg-gray-50 hover:text-black text-gray-600 transition"
                                        >
                                            <MapPin size={18} />
                                            <span className="text-sm font-medium">
                                                Sổ địa chỉ
                                            </span>
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            href="/profile/payment-methods"
                                            className="flex items-center gap-3 px-4 py-3 rounded-md hover:bg-gray-50 hover:text-black text-gray-600 transition"
                                        >
                                            <CreditCard size={18} />
                                            <span className="text-sm font-medium">
                                                Thanh toán
                                            </span>
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            href="/profile/settings"
                                            className="flex items-center gap-3 px-4 py-3 rounded-md hover:bg-gray-50 hover:text-black text-gray-600 transition"
                                        >
                                            <Settings size={18} />
                                            <span className="text-sm font-medium">
                                                Cài đặt tài khoản
                                            </span>
                                        </Link>
                                    </li>

                                    {/* NÚT ĐĂNG XUẤT */}
                                    <li className="border-t border-gray-100 mt-2 pt-2">
                                        <button
                                            onClick={handleLogout}
                                            className="w-full flex items-center gap-3 px-4 py-3 rounded-md hover:bg-red-50 text-red-600 transition text-left"
                                        >
                                            <LogOut size={18} />
                                            <span className="text-sm font-medium">
                                                Đăng xuất
                                            </span>
                                        </button>
                                    </li>
                                </ul>
                            </nav>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-3">{children}</div>
                </div>
            </div>
        </div>
    );
}
