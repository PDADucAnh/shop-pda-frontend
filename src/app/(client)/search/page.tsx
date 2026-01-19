"use client";

import { useEffect, useState, Suspense } from "react"; // 1. Import thêm Suspense
import { useSearchParams } from "next/navigation";
import {
    searchService,
    SearchProduct,
    SearchPost,
} from "@/services/search.service";
import Link from "next/link";
import Image from "next/image";
import {
    Loader2,
    Search,
    ShoppingBag,
    FileText,
    ArrowRight,
} from "lucide-react";

// 2. Tách toàn bộ logic tìm kiếm ra thành một Component con (SearchContent)
function SearchContent() {
    const searchParams = useSearchParams();
    const keyword = searchParams.get("q") || "";

    // (Không cần router nếu chưa dùng)
    // const router = useRouter();

    const [products, setProducts] = useState<SearchProduct[]>([]);
    const [posts, setPosts] = useState<SearchPost[]>([]);
    const [loading, setLoading] = useState(false);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [searched, setSearched] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            if (!keyword.trim()) {
                setProducts([]);
                setPosts([]);
                return;
            }

            setLoading(true);
            try {
                const res = await searchService.search(keyword);
                if (res.status) {
                    setProducts(res.data.products);
                    setPosts(res.data.posts);
                }
            } catch (error) {
                console.error("Lỗi tìm kiếm:", error);
            } finally {
                setLoading(false);
                setSearched(true);
            }
        };

        fetchData();
    }, [keyword]);

    // UI Loading
    if (loading) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center">
                <Loader2
                    className="animate-spin text-blue-600 mb-4"
                    size={40}
                />
                <p className="text-gray-500">
                    Đang tìm kiếm kết quả cho &quot;{keyword}&quot;...
                </p>
            </div>
        );
    }

    // UI Kết quả chính
    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header Kết quả */}
            <div className="mb-8 border-b pb-4">
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <Search className="text-blue-600" />
                    Kết quả tìm kiếm:{" "}
                    <span className="text-blue-600">&quot;{keyword}&quot;</span>
                </h1>
                <p className="text-gray-500 mt-2">
                    Tìm thấy {products.length} sản phẩm và {posts.length} bài
                    viết.
                </p>
            </div>

            {/* 1. KẾT QUẢ SẢN PHẨM */}
            <section className="mb-12">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <ShoppingBag size={20} /> Sản phẩm
                </h2>

                {products.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {products.map((product) => (
                            <Link
                                href={`/products/${product.slug}`}
                                key={product.id}
                                className="group border rounded-lg overflow-hidden hover:shadow-lg transition bg-white"
                            >
                                <div className="aspect-square relative overflow-hidden bg-gray-100">
                                    <Image
                                        src={
                                            product.image || "/placeholder.png"
                                        }
                                        alt={product.name}
                                        fill
                                        className="object-cover group-hover:scale-105 transition duration-300"
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                    />
                                </div>
                                <div className="p-3">
                                    <h3 className="font-medium text-gray-800 line-clamp-2 text-sm group-hover:text-blue-600">
                                        {product.name}
                                    </h3>
                                    <div className="mt-2 font-bold text-red-600">
                                        {new Intl.NumberFormat("vi-VN", {
                                            style: "currency",
                                            currency: "VND",
                                        }).format(
                                            product.price_sale || product.price,
                                        )}
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="text-gray-500 italic bg-gray-50 p-4 rounded-lg">
                        Không tìm thấy sản phẩm nào phù hợp.
                    </div>
                )}
            </section>

            {/* 2. KẾT QUẢ BÀI VIẾT */}
            <section>
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <FileText size={20} /> Tin tức & Bài viết
                </h2>

                {posts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {posts.map((post) => (
                            <Link
                                href={`/posts/${post.slug}`}
                                key={post.id}
                                className="flex gap-4 border p-4 rounded-lg hover:border-blue-500 transition group bg-white"
                            >
                                <div className="w-24 h-24 shrink-0 rounded overflow-hidden bg-gray-100 relative">
                                    <Image
                                        src={post.image || "/placeholder.png"}
                                        alt={post.title}
                                        width={96}
                                        height={96}
                                        className="object-cover w-full h-full"
                                    />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-gray-800 group-hover:text-blue-600 line-clamp-2">
                                        {post.title}
                                    </h3>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {new Date(
                                            post.created_at,
                                        ).toLocaleDateString("vi-VN")}
                                    </p>
                                    <span className="text-xs text-blue-600 mt-2 inline-flex items-center gap-1">
                                        Xem chi tiết <ArrowRight size={12} />
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="text-gray-500 italic bg-gray-50 p-4 rounded-lg">
                        Không tìm thấy bài viết nào phù hợp.
                    </div>
                )}
            </section>
        </div>
    );
}

// 3. Component chính Export ra ngoài chỉ làm nhiệm vụ bọc Suspense
export default function SearchPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-[60vh] flex flex-col items-center justify-center">
                    <Loader2
                        className="animate-spin text-blue-600 mb-4"
                        size={40}
                    />
                    <p className="text-gray-500">Đang tải...</p>
                </div>
            }
        >
            <SearchContent />
        </Suspense>
    );
}
