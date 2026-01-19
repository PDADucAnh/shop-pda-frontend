"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
    Search,
    ShoppingBag,
    User as UserIcon,
    Menu,
    X,
    LogOut,
    FileText,
    Heart,
    User,
} from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { useAuthStore } from "@/store/useAuthStore";
import { authService } from "@/services/auth.service";

export default function Header() {
    const items = useCartStore((state) => state.items);
    const { user, logout } = useAuthStore();
    const router = useRouter();

    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [keyword, setKeyword] = useState("");

    // State để kiểm soát hydration
    const [mounted, setMounted] = useState(false);

    // FIX: Dùng setTimeout để tránh lỗi ESLint "setState synchronously"
    useEffect(() => {
        const timer = setTimeout(() => {
            setMounted(true);
        }, 0);
        return () => clearTimeout(timer);
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (keyword.trim()) {
            router.push(`/search?q=${encodeURIComponent(keyword)}`);
            setIsSearchOpen(false);
        }
    };

    const handleLogout = async () => {
        await authService.logout();
        logout();
        router.push("/login");
    };

    // Chỉ render nội dung phụ thuộc client sau khi đã mounted để tránh lỗi giao diện
    if (!mounted) {
        return (
            <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-100 font-sans h-20">
                {/* Skeleton loading hoặc Header tĩnh để tránh layout shift */}
                <div className="container mx-auto px-4 h-full flex items-center justify-between">
                    <div className="w-8 h-8 bg-gray-100 rounded animate-pulse lg:hidden"></div>
                    <div className="w-32 h-12 bg-gray-100 rounded animate-pulse"></div>
                    <div className="hidden lg:flex gap-8 w-1/3 bg-gray-100 h-4 rounded animate-pulse"></div>
                    <div className="flex gap-4 w-20 bg-gray-100 h-8 rounded animate-pulse"></div>
                </div>
            </header>
        );
    }

    return (
        <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-100 font-sans">
            <div className="container mx-auto px-4 h-20 flex items-center justify-between relative">
                {/* 1. Mobile Menu */}
                <button className="lg:hidden p-2 text-gray-600 hover:text-black transition">
                    <Menu size={24} />
                </button>

                {/* 2. Logo */}
                <Link href="/" className="flex-shrink-0">
                    <div className="relative w-32 h-10 md:h-12">
                        <Image
                            src="/logo.png"
                            alt="PDA Fashion"
                            fill
                            className="object-contain"
                            priority
                        />
                    </div>
                </Link>

                {/* 3. Navigation (Desktop) */}
                <nav className="hidden lg:flex items-center gap-8 font-medium text-sm uppercase tracking-wide text-gray-700">
                    <Link
                        href="/products"
                        className="hover:text-black transition relative group"
                    >
                        Sản phẩm
                        <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-black transition-all group-hover:w-full"></span>
                    </Link>
                    <Link
                        href="/products?category=new"
                        className="hover:text-black transition relative group"
                    >
                        Sản phẩm mới
                        <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-black transition-all group-hover:w-full"></span>
                    </Link>
                    <Link
                        href="/products?category=sale"
                        className="text-red-600 hover:text-red-700 transition font-bold relative group"
                    >
                        Sale Online
                        <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-red-600 transition-all group-hover:w-full"></span>
                    </Link>
                    <Link
                        href="/about"
                        className="hover:text-black transition relative group"
                    >
                        Bộ sưu tập
                        <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-black transition-all group-hover:w-full"></span>
                    </Link>
                </nav>

                {/* 4. Icons & User Menu */}
                <div className="flex items-center gap-2 md:gap-4 text-gray-700">
                    {/* --- SEARCH --- */}
                    <div className="relative">
                        <button
                            onClick={() => setIsSearchOpen(!isSearchOpen)}
                            className="hover:text-black p-2 transition rounded-full hover:bg-gray-50"
                        >
                            {isSearchOpen ? (
                                <X size={22} />
                            ) : (
                                <Search size={22} strokeWidth={1.5} />
                            )}
                        </button>

                        {isSearchOpen && (
                            <div className="absolute top-full right-0 mt-4 w-[280px] md:w-[320px] bg-white shadow-xl border border-gray-100 p-4 animate-fadeIn z-50 rounded-lg">
                                <div className="absolute -top-2 right-3 w-4 h-4 bg-white border-t border-l border-gray-100 transform rotate-45"></div>
                                <form
                                    onSubmit={handleSearch}
                                    className="relative flex"
                                >
                                    <input
                                        type="text"
                                        placeholder="Tìm kiếm sản phẩm..."
                                        value={keyword}
                                        onChange={(e) =>
                                            setKeyword(e.target.value)
                                        }
                                        autoFocus
                                        className="w-full border border-gray-200 bg-gray-50 pl-4 pr-10 py-2.5 text-sm rounded-md focus:outline-none focus:border-black focus:bg-white transition"
                                    />
                                    <button
                                        type="submit"
                                        className="absolute right-1 top-1 h-8 w-8 bg-black text-white rounded flex items-center justify-center hover:bg-gray-800 transition"
                                    >
                                        <Search size={14} />
                                    </button>
                                </form>
                            </div>
                        )}
                    </div>

                    {/* --- USER MENU (STYLE GIỐNG NEMSHOP) --- */}
                    {user ? (
                        <div className="relative group h-full flex items-center">
                            {/* 1. Icon & Name */}
                            <Link
                                href="/profile"
                                className="flex items-center gap-1 hover:text-black cursor-pointer py-2 relative z-20"
                            >
                                <UserIcon size={24} strokeWidth={1.5} />
                                <span className="text-sm font-medium hidden md:block max-w-[120px] truncate ml-1">
                                    {user.name}
                                </span>
                            </Link>

                            {/* 2. Cầu nối trong suốt (Invisible Bridge) 
            Giúp chuột không bị mất focus khi di chuyển từ icon xuống menu 
        */}
                            <div className="absolute top-full left-0 w-full h-4 bg-transparent z-10"></div>

                            {/* 3. Dropdown Menu */}
                            <div className="absolute top-[calc(100%+10px)] right-0 w-64 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.1)] border border-gray-100 rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform group-hover:translate-y-[-10px] z-50">
                                {/* Mũi tên nhỏ trỏ lên (Triangle) */}
                                <div className="absolute -top-1.5 right-6 w-3 h-3 bg-white border-t border-l border-gray-100 transform rotate-45"></div>

                                {/* Nội dung Menu */}
                                <div className="py-2">
                                    {/* Header nhỏ trong menu */}
                                    <div className="px-4 py-3 border-b border-gray-50 mb-1 bg-gray-50/50">
                                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                                            Tài khoản
                                        </p>
                                        <p className="text-sm font-bold text-gray-900 truncate">
                                            {user.name}
                                        </p>
                                    </div>

                                    <Link
                                        href="/profile"
                                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-black transition-colors"
                                    >
                                        <User size={16} /> Thông tin cá nhân
                                    </Link>

                                    <Link
                                        href="/profile/orders"
                                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-black transition-colors"
                                    >
                                        <FileText size={16} /> Đơn hàng của tôi
                                    </Link>

                                    <Link
                                        href="/profile/wishlist"
                                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-black transition-colors"
                                    >
                                        <Heart size={16} /> Sản phẩm yêu thích
                                    </Link>

                                    <div className="border-t border-gray-100 mt-2 pt-2">
                                        <button
                                            onClick={handleLogout}
                                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
                                        >
                                            <LogOut size={16} /> Đăng xuất
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        // CHƯA ĐĂNG NHẬP
                        <Link
                            href="/login"
                            className="hover:text-black p-1 transition-transform hover:scale-110"
                            title="Đăng nhập"
                        >
                            <UserIcon size={24} strokeWidth={1.5} />
                        </Link>
                    )}
                    {/* --- CART --- */}
                    <Link
                        href="/cart"
                        className="hover:text-black p-2 rounded-full hover:bg-gray-50 transition relative group"
                    >
                        <ShoppingBag size={22} strokeWidth={1.5} />
                        {items.length > 0 && (
                            <span className="absolute top-0 right-0 bg-red-600 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold shadow-sm border border-white transform group-hover:scale-110 transition">
                                {items.length}
                            </span>
                        )}
                    </Link>
                </div>
            </div>
        </header>
    );
}
