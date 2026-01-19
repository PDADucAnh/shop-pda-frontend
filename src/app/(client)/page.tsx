"use client";

import { AxiosError } from "axios";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import ProductCard from "@/components/features/product/ProductCard";
import { productService, Product } from "@/services/product.service";
import { bannerService, Banner } from "@/services/banner.service";
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";

export default function HomePage() {
    const [newProducts, setNewProducts] = useState<Product[]>([]);
    const [banners, setBanners] = useState<Banner[]>([]);
    const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [bannerRes, productRes] = await Promise.all([
                    bannerService.getBanners("slideshow"),
                    productService.getProducts({ is_new: 1, limit: 8 }),
                ]);

                if (bannerRes.status) {
                    // FIX: Access 'banners' property instead of 'data'
                    setBanners(bannerRes.banners);
                }

                if (productRes.status) {
                    setNewProducts(productRes.products.data);
                }
            } catch (error) {
                const err = error as AxiosError;
                console.error("Lỗi tải dữ liệu:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // ... (rest of the component remains unchanged)
    // Logic tự động chạy Slide (Auto-play)
    useEffect(() => {
        if (banners.length <= 1) return;
        const interval = setInterval(() => {
            setCurrentBannerIndex((prev) => (prev + 1) % banners.length);
        }, 5000); // 5 giây đổi ảnh 1 lần
        return () => clearInterval(interval);
    }, [banners.length]);

    // Hàm chuyển slide thủ công
    const nextSlide = () => {
        setCurrentBannerIndex((prev) => (prev + 1) % banners.length);
    };
    const prevSlide = () => {
        setCurrentBannerIndex(
            (prev) => (prev - 1 + banners.length) % banners.length
        );
    };

    // Helper: Lấy URL ảnh banner
    const getBannerUrl = (imagePath: string) => {
        if (imagePath.startsWith("http")) return imagePath;
        return `${process.env.NEXT_PUBLIC_BACKEND_URL}/storage/${imagePath}`;
    };

    return (
        <div className="bg-white">
            {/* --- HERO BANNER (DYNAMIC SLIDER) --- */}
            <section className="relative w-full h-[500px] md:h-[700px] overflow-hidden group">
                {loading && banners.length === 0 ? (
                    // Skeleton Loading khi chưa có banner
                    <div className="w-full h-full bg-gray-200 animate-pulse flex items-center justify-center">
                        <Loader2
                            className="animate-spin text-gray-400"
                            size={40}
                        />
                    </div>
                ) : banners.length > 0 ? (
                    <>
                        {/* Hiển thị Banner hiện tại */}
                        <div className="relative w-full h-full">
                            <Image
                                src={getBannerUrl(
                                    banners[currentBannerIndex].image
                                )}
                                alt={banners[currentBannerIndex].name}
                                fill
                                className="object-cover transition-all duration-700 ease-in-out"
                                priority
                            />
                            {/* Overlay tối để chữ dễ đọc */}
                            <div className="absolute inset-0 bg-black/20"></div>

                            {/* Nội dung Banner (Nếu có) */}
                            <div className="absolute bottom-20 left-0 right-0 text-center text-white p-4 animate-fadeIn">
                                <h2 className="text-4xl md:text-6xl font-thin uppercase tracking-widest mb-6 drop-shadow-md">
                                    {banners[currentBannerIndex].name}
                                </h2>
                                <Link
                                    href={
                                        banners[currentBannerIndex].link ||
                                        "/products"
                                    }
                                    className="inline-block bg-white text-black px-10 py-3 font-medium text-sm uppercase tracking-wider hover:bg-black hover:text-white transition duration-300 shadow-lg"
                                >
                                    Shop Now
                                </Link>
                            </div>
                        </div>

                        {/* Nút điều hướng (Chỉ hiện khi có > 1 banner) */}
                        {banners.length > 1 && (
                            <>
                                <button
                                    onClick={prevSlide}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/30 hover:bg-white/50 p-2 rounded-full text-white backdrop-blur-sm transition opacity-0 group-hover:opacity-100"
                                >
                                    <ChevronLeft size={30} />
                                </button>
                                <button
                                    onClick={nextSlide}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/30 hover:bg-white/50 p-2 rounded-full text-white backdrop-blur-sm transition opacity-0 group-hover:opacity-100"
                                >
                                    <ChevronRight size={30} />
                                </button>

                                {/* Dots indicator */}
                                <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2">
                                    {banners.map((_, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() =>
                                                setCurrentBannerIndex(idx)
                                            }
                                            className={`w-2.5 h-2.5 rounded-full transition-all ${
                                                idx === currentBannerIndex
                                                    ? "bg-white w-8"
                                                    : "bg-white/50 hover:bg-white"
                                            }`}
                                        />
                                    ))}
                                </div>
                            </>
                        )}
                    </>
                ) : (
                    // Fallback nếu không có banner nào từ API (Dùng ảnh tĩnh mặc định)
                    <div className="relative w-full h-full">
                        <Image
                            src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070"
                            alt="Default Banner"
                            fill
                            className="object-cover"
                        />
                        <div className="absolute inset-0 bg-black/10"></div>
                        <div className="absolute bottom-20 left-0 right-0 text-center text-white p-4">
                            <h2 className="text-5xl md:text-7xl font-thin uppercase tracking-widest mb-6">
                                New Collection
                            </h2>
                            <Link
                                href="/products"
                                className="inline-block bg-white text-black px-10 py-3 font-medium text-sm uppercase tracking-wider hover:bg-black hover:text-white transition duration-300"
                            >
                                Shop Now
                            </Link>
                        </div>
                    </div>
                )}
            </section>

            {/* --- SECTION: SẢN PHẨM MỚI --- */}
            <section className="container mx-auto px-4 py-16">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-light uppercase tracking-[0.2em] mb-2">
                        Sản phẩm mới
                    </h2>
                    <p className="text-gray-500 text-sm">
                        Các thiết kế mới nhất từ PDA Fashion
                    </p>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="animate-spin" size={40} />
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
                        {newProducts.map((product) => {
                            // Logic giá sản phẩm
                            const hasSale =
                                product.sale_price !== null &&
                                product.sale_price !== undefined;
                            const currentPrice = hasSale
                                ? Number(product.sale_price)
                                : Number(product.price_buy);
                            const oldPrice = hasSale
                                ? Number(product.price_buy)
                                : 0;

                            return (
                                <ProductCard
                                    key={product.id}
                                    data={{
                                        id: product.id,
                                        name: product.name,
                                        slug: product.slug,
                                        price: currentPrice,
                                        original_price: oldPrice,
                                        is_sale: hasSale,
                                        is_new: Boolean(product.is_new),
                                        image:
                                            product.thumbnail_url ||
                                            (product.thumbnail.startsWith(
                                                "http"
                                            )
                                                ? product.thumbnail
                                                : `${process.env.NEXT_PUBLIC_BACKEND_URL}/storage/${product.thumbnail}`),
                                    }}
                                />
                            );
                        })}
                    </div>
                )}

                <div className="text-center mt-12">
                    <Link
                        href="/products"
                        className="inline-block border border-black px-12 py-3 text-sm font-medium uppercase hover:bg-black hover:text-white transition"
                    >
                        Xem tất cả
                    </Link>
                </div>
            </section>
        </div>
    );
}
