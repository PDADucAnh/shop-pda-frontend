// "use client";

// import { useEffect, useState, useMemo } from "react";
// import Image from "next/image";
// import Link from "next/link";
// import {
//     ChevronLeft,
//     ChevronRight,
//     Loader2,
//     CheckCircle,
//     AlertTriangle,
// } from "lucide-react";
// import { useCartStore } from "@/store/useCartStore";
// import { productService } from "@/services/product.service"; // Import service to check stock

// // Define a type for stock data map
// type StockMap = Record<number, number>;

// export default function CartPage() {
//     const { items, removeItem, updateQuantity } = useCartStore();

//     const [isClient, setIsClient] = useState(false);
//     const [note, setNote] = useState("");
//     const [isUpdating, setIsUpdating] = useState(false);
//     const [showToast, setShowToast] = useState(false);

//     // State to store real-time stock levels
//     const [stockLevels, setStockLevels] = useState<StockMap>({});
//     const [loadingStock, setLoadingStock] = useState(true);

//     useEffect(() => {
//         setIsClient(true);
//         // Fetch latest stock for all items in cart
//         const fetchStock = async () => {
//             if (items.length === 0) {
//                 setLoadingStock(false);
//                 return;
//             }

//             try {
//                 const stocks: StockMap = {};
//                 // ideally, create a bulk API: /api/products/stock?ids=1,2,3
//                 // For now, we loop (parallel requests)
//                 await Promise.all(
//                     items.map(async (item) => {
//                         try {
//                             // Assuming getProductById returns stock info in 'store' relation
//                             const res = await productService.getProductById(
//                                 item.id
//                             );
//                             if (
//                                 res.status &&
//                                 res.product &&
//                                 res.product.store
//                             ) {
//                                 stocks[item.id] = res.product.store.qty;
//                             } else {
//                                 stocks[item.id] = 0; // Product might be deleted or no store record
//                             }
//                         } catch (e) {
//                             console.error(
//                                 `Failed to fetch stock for ${item.id}`,
//                                 e
//                             );
//                             stocks[item.id] = 0; // Fail safe
//                         }
//                     })
//                 );
//                 setStockLevels(stocks);
//             } finally {
//                 setLoadingStock(false);
//             }
//         };

//         fetchStock();
//     }, [items.length]); // Re-fetch if number of distinct items changes (or mount)

//     // Calculate Total Price
//     const totalPrice = useMemo(() => {
//         return items.reduce(
//             (total, item) => total + item.price * item.quantity,
//             0
//         );
//     }, [items]);

//     // Check if ANY item exceeds stock
//     const hasStockIssues = useMemo(() => {
//         if (loadingStock) return false;
//         return items.some((item) => {
//             const currentStock = stockLevels[item.id] ?? 9999; // Default high if loading/unknown
//             return item.quantity > currentStock;
//         });
//     }, [items, stockLevels, loadingStock]);

//     const formatPrice = (price: number) =>
//         new Intl.NumberFormat("vi-VN", {
//             style: "currency",
//             currency: "VND",
//         }).format(price);

//     // Handle Quantity Update with Stock Check
//     const handleQuantityChange = (
//         itemId: number,
//         size: string,
//         color: string,
//         currentQty: number,
//         change: number
//     ) => {
//         const newQty = currentQty + change;
//         const maxStock = stockLevels[itemId] ?? 9999;

//         if (newQty < 1) return;

//         if (newQty > maxStock) {
//             alert(`Rất tiếc, sản phẩm này chỉ còn ${maxStock} trong kho.`);
//             return; // Do not update
//         }

//         updateQuantity(itemId, size, color, newQty);
//     };

//     const handleUpdateCart = () => {
//         setIsUpdating(true);
//         setTimeout(() => {
//             setIsUpdating(false);
//             setShowToast(true);
//             setTimeout(() => setShowToast(false), 3000);
//         }, 500);
//     };

//     if (!isClient) return null;

//     if (items.length === 0) {
//         return (
//             <div className="container mx-auto px-4 py-32 text-center animate-fadeIn">
//                 <h2 className="text-3xl font-light uppercase mb-6">Giỏ hàng</h2>
//                 <p className="text-gray-500 mb-8">
//                     Chưa có sản phẩm nào trong giỏ hàng.
//                 </p>
//                 <Link
//                     href="/products"
//                     className="inline-block bg-black text-white px-10 py-3 text-sm font-bold uppercase hover:bg-gray-800 transition"
//                 >
//                     Quay lại cửa hàng
//                 </Link>
//             </div>
//         );
//     }

//     return (
//         <div className="container mx-auto px-4 py-10 max-w-6xl relative">
//             {/* Toast Notification */}
//             <div
//                 className={`fixed bottom-5 right-5 z-50 transform transition-all duration-500 ${
//                     showToast
//                         ? "translate-y-0 opacity-100"
//                         : "translate-y-10 opacity-0 pointer-events-none"
//                 }`}
//             >
//                 <div className="bg-black text-white px-6 py-4 rounded shadow-lg flex items-center gap-3">
//                     <CheckCircle className="text-green-400" size={24} />
//                     <div>
//                         <h4 className="font-bold text-sm uppercase">
//                             Thành công
//                         </h4>
//                         <p className="text-xs text-gray-300">
//                             Giỏ hàng đã được cập nhật.
//                         </p>
//                     </div>
//                 </div>
//             </div>

//             <h1 className="text-3xl font-bold uppercase mb-8">Giỏ hàng</h1>

//             {/* Global Warning for Stock Issues */}
//             {hasStockIssues && !loadingStock && (
//                 <div className="bg-orange-50 border-l-4 border-orange-500 p-4 mb-8 flex items-start gap-3">
//                     <AlertTriangle className="text-orange-500 flex-shrink-0" />
//                     <div>
//                         <h4 className="font-bold text-orange-700">
//                             Lưu ý về số lượng tồn kho
//                         </h4>
//                         <p className="text-sm text-orange-600">
//                             Một số sản phẩm trong giỏ hàng của bạn vượt quá số
//                             lượng hiện có trong kho. Vui lòng điều chỉnh lại số
//                             lượng trước khi thanh toán.
//                         </p>
//                     </div>
//                 </div>
//             )}

//             {/* HEADER */}
//             <div className="hidden md:grid grid-cols-12 gap-8 border-b border-gray-200 pb-4 mb-6 text-sm text-gray-500">
//                 <div className="col-span-6 text-center">Sản phẩm</div>
//                 <div className="col-span-2 text-center">Giá</div>
//                 <div className="col-span-2 text-center">Số lượng</div>
//                 <div className="col-span-2 text-right">Tổng tiền</div>
//             </div>

//             {/* LIST ITEMS */}
//             <div className="space-y-8 mb-12 border-b border-gray-200 pb-12">
//                 {items.map((item) => {
//                     const stock = stockLevels[item.id] ?? 999;
//                     const isOverStock = item.quantity > stock;

//                     return (
//                         <div
//                             key={`${item.id}-${item.size}-${item.color}`}
//                             className={`flex flex-col md:grid md:grid-cols-12 gap-6 md:gap-8 items-center p-4 rounded-lg transition ${
//                                 isOverStock
//                                     ? "bg-red-50 border border-red-100"
//                                     : ""
//                             }`}
//                         >
//                             {/* 1. Sản phẩm */}
//                             <div className="col-span-6 w-full flex gap-6">
//                                 <Link
//                                     href={`/products/${item.slug}`}
//                                     className="relative w-32 aspect-[3/4] flex-shrink-0 bg-gray-100"
//                                 >
//                                     <Image
//                                         src={item.image}
//                                         alt={item.name}
//                                         fill
//                                         className="object-cover"
//                                     />
//                                 </Link>
//                                 <div className="flex flex-col pt-2">
//                                     <Link
//                                         href={`/products/${item.slug}`}
//                                         className="text-base font-bold text-gray-900 hover:text-gray-600 uppercase mb-2"
//                                     >
//                                         {item.name}
//                                     </Link>
//                                     <div className="text-sm text-gray-500 space-y-1 mb-2">
//                                         <p>
//                                             Phiên bản: {item.size} /{" "}
//                                             {item.color}
//                                         </p>
//                                         <p>
//                                             Kho còn:{" "}
//                                             <span className="font-medium text-black">
//                                                 {loadingStock ? "..." : stock}
//                                             </span>
//                                         </p>
//                                     </div>

//                                     {/* Inline Warning */}
//                                     {isOverStock && (
//                                         <p className="text-xs text-red-600 font-bold mb-3 flex items-center gap-1">
//                                             <AlertTriangle size={12} /> Quá số
//                                             lượng kho ({stock})
//                                         </p>
//                                     )}

//                                     <button
//                                         onClick={() =>
//                                             removeItem(
//                                                 item.id,
//                                                 item.size,
//                                                 item.color
//                                             )
//                                         }
//                                         className="text-sm text-gray-500 hover:text-red-600 hover:underline w-fit text-left mt-auto"
//                                     >
//                                         Xóa
//                                     </button>
//                                 </div>
//                             </div>

//                             {/* 2. Giá */}
//                             <div className="col-span-2 text-center">
//                                 <div className="flex flex-col items-center">
//                                     <span className="text-lg font-bold">
//                                         {formatPrice(item.price)}
//                                     </span>
//                                 </div>
//                             </div>

//                             {/* 3. Số lượng */}
//                             <div className="col-span-2 flex justify-center">
//                                 <div
//                                     className={`flex items-center border h-10 px-2 bg-white ${
//                                         isOverStock
//                                             ? "border-red-300"
//                                             : "border-gray-200"
//                                     }`}
//                                 >
//                                     <button
//                                         onClick={() =>
//                                             handleQuantityChange(
//                                                 item.id,
//                                                 item.size,
//                                                 item.color,
//                                                 item.quantity,
//                                                 -1
//                                             )
//                                         }
//                                         className="p-2 text-gray-500 hover:text-black disabled:opacity-30"
//                                         disabled={item.quantity <= 1}
//                                     >
//                                         <ChevronLeft size={16} />
//                                     </button>
//                                     <span
//                                         className={`w-8 text-center text-sm font-medium ${
//                                             isOverStock ? "text-red-600" : ""
//                                         }`}
//                                     >
//                                         {item.quantity}
//                                     </span>
//                                     <button
//                                         onClick={() =>
//                                             handleQuantityChange(
//                                                 item.id,
//                                                 item.size,
//                                                 item.color,
//                                                 item.quantity,
//                                                 1
//                                             )
//                                         }
//                                         className="p-2 text-gray-500 hover:text-black disabled:opacity-30"
//                                         disabled={item.quantity >= stock} // Disable increment if at limit
//                                     >
//                                         <ChevronRight size={16} />
//                                     </button>
//                                 </div>
//                             </div>

//                             {/* 4. Thành tiền từng món */}
//                             <div className="col-span-2 text-right">
//                                 <span className="text-lg font-bold">
//                                     {formatPrice(item.price * item.quantity)}
//                                 </span>
//                             </div>
//                         </div>
//                     );
//                 })}
//             </div>

//             {/* FOOTER */}
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
//                 <div>
//                     <label className="block text-sm text-gray-600 mb-2">
//                         Chú thích
//                     </label>
//                     <textarea
//                         rows={4}
//                         value={note}
//                         onChange={(e) => setNote(e.target.value)}
//                         className="w-full border border-gray-200 p-4 text-sm focus:outline-none focus:border-black resize-none"
//                         placeholder="Ghi chú thêm cho đơn hàng..."
//                     ></textarea>
//                 </div>

//                 <div className="flex flex-col items-end">
//                     <div className="flex items-center gap-2 mb-6 text-xl">
//                         <span className="text-gray-600">Tổng tiền</span>
//                         <span className="font-bold text-red-600">
//                             {formatPrice(totalPrice)}
//                         </span>
//                     </div>

//                     <div className="flex flex-col gap-3 w-full md:w-auto">
//                         {/* Nút Thanh toán bị disable nếu có lỗi kho */}
//                         {hasStockIssues ? (
//                             <button
//                                 disabled
//                                 className="bg-gray-300 text-gray-500 px-8 py-3 text-sm font-bold uppercase cursor-not-allowed rounded-full text-center"
//                             >
//                                 Vui lòng chỉnh lại số lượng
//                             </button>
//                         ) : (
//                             <Link
//                                 href="/checkout"
//                                 className="bg-black text-white px-8 py-3 text-sm font-bold uppercase hover:bg-gray-800 transition rounded-full flex items-center justify-center"
//                             >
//                                 Thanh toán
//                             </Link>
//                         )}

//                         <button
//                             onClick={handleUpdateCart}
//                             disabled={isUpdating}
//                             className="text-gray-500 text-xs hover:text-black hover:underline text-center mt-2"
//                         >
//                             {isUpdating
//                                 ? "Đang đồng bộ..."
//                                 : "Cập nhật giỏ hàng"}
//                         </button>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// }
//===========================================
"use client";

import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
    ChevronLeft,
    ChevronRight,
    Loader2,
    CheckCircle,
    AlertTriangle,
} from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { productService } from "@/services/product.service";

// Define a type for stock data map
type StockMap = Record<number, number>;

export default function CartPage() {
    const { items, removeItem, updateQuantity } = useCartStore();

    const [isClient, setIsClient] = useState(false);
    const [note, setNote] = useState("");
    const [isUpdating, setIsUpdating] = useState(false);
    const [showToast, setShowToast] = useState(false);

    // State to store real-time stock levels
    const [stockLevels, setStockLevels] = useState<StockMap>({});
    const [loadingStock, setLoadingStock] = useState(true);

    useEffect(() => {
        setIsClient(true);
        // Fetch latest stock for all items in cart
        const fetchStock = async () => {
            if (items.length === 0) {
                setLoadingStock(false);
                return;
            }

            try {
                const stocks: StockMap = {};
                // Use Promise.all to fetch stock for all items concurrently
                await Promise.all(
                    items.map(async (item) => {
                        try {
                            // Get product detail to access 'store' relation
                            const res = await productService.getProductById(
                                item.id
                            );
                            if (
                                res.status &&
                                res.product &&
                                res.product.store
                            ) {
                                stocks[item.id] = res.product.store.qty;
                            } else {
                                stocks[item.id] = 0; // Fail safe if store not found
                            }
                        } catch (e) {
                            console.error(
                                `Failed to fetch stock for ${item.id}`,
                                e
                            );
                            stocks[item.id] = 0;
                        }
                    })
                );
                setStockLevels(stocks);
            } finally {
                setLoadingStock(false);
            }
        };

        fetchStock();
    }, [items.length]);

    // Calculate Total Price
    const totalPrice = useMemo(() => {
        return items.reduce(
            (total, item) => total + item.price * item.quantity,
            0
        );
    }, [items]);

    // Check if ANY item exceeds stock to disable checkout
    const hasStockIssues = useMemo(() => {
        if (loadingStock) return false;
        return items.some((item) => {
            const currentStock = stockLevels[item.id] ?? 9999;
            return item.quantity > currentStock;
        });
    }, [items, stockLevels, loadingStock]);

    const formatPrice = (price: number) =>
        new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(price);

    // --- LOGIC XỬ LÝ TĂNG/GIẢM SỐ LƯỢNG ---
    const handleQuantityChange = (
        itemId: number,
        size: string,
        color: string,
        currentQty: number,
        change: number
    ) => {
        const newQty = currentQty + change;

        // Lấy tồn kho hiện tại (mặc định 0 nếu chưa tải xong)
        const maxStock = stockLevels[itemId] ?? 0;

        // 1. Không cho giảm dưới 1
        if (newQty < 1) return;

        // 2. LOGIC QUAN TRỌNG: Không cho tăng vượt quá tồn kho
        if (newQty > maxStock) {
            alert(
                `Xin lỗi, sản phẩm này chỉ còn tối đa ${maxStock} cái trong kho.`
            );
            // Nếu số lượng hiện tại đã lớn hơn kho (do lỗi gì đó), reset về maxStock
            if (currentQty > maxStock) {
                updateQuantity(itemId, size, color, maxStock);
            }
            return;
        }

        updateQuantity(itemId, size, color, newQty);
    };

    const handleUpdateCart = () => {
        setIsUpdating(true);
        setTimeout(() => {
            setIsUpdating(false);
            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000);
        }, 500);
    };

    if (!isClient) return null;

    if (items.length === 0) {
        return (
            <div className="container mx-auto px-4 py-32 text-center animate-fadeIn">
                <h2 className="text-3xl font-light uppercase mb-6">Giỏ hàng</h2>
                <p className="text-gray-500 mb-8">
                    Chưa có sản phẩm nào trong giỏ hàng.
                </p>
                <Link
                    href="/products"
                    className="inline-block bg-black text-white px-10 py-3 text-sm font-bold uppercase hover:bg-gray-800 transition"
                >
                    Quay lại cửa hàng
                </Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-10 max-w-6xl relative">
            {/* Toast Notification */}
            <div
                className={`fixed bottom-5 right-5 z-50 transform transition-all duration-500 ${
                    showToast
                        ? "translate-y-0 opacity-100"
                        : "translate-y-10 opacity-0 pointer-events-none"
                }`}
            >
                <div className="bg-black text-white px-6 py-4 rounded shadow-lg flex items-center gap-3">
                    <CheckCircle className="text-green-400" size={24} />
                    <div>
                        <h4 className="font-bold text-sm uppercase">
                            Thành công
                        </h4>
                        <p className="text-xs text-gray-300">
                            Giỏ hàng đã được cập nhật.
                        </p>
                    </div>
                </div>
            </div>

            <h1 className="text-3xl font-bold uppercase mb-8">Giỏ hàng</h1>

            {/* Cảnh báo chung nếu có sản phẩm vượt quá tồn kho */}
            {hasStockIssues && !loadingStock && (
                <div className="bg-orange-50 border-l-4 border-orange-500 p-4 mb-8 flex items-start gap-3">
                    <AlertTriangle className="text-orange-500 flex-shrink-0" />
                    <div>
                        <h4 className="font-bold text-orange-700">
                            Lưu ý về số lượng tồn kho
                        </h4>
                        <p className="text-sm text-orange-600">
                            Một số sản phẩm trong giỏ hàng vượt quá số lượng có
                            sẵn. Vui lòng giảm số lượng các mục được đánh dấu đỏ
                            trước khi thanh toán.
                        </p>
                    </div>
                </div>
            )}

            {/* HEADER */}
            <div className="hidden md:grid grid-cols-12 gap-8 border-b border-gray-200 pb-4 mb-6 text-sm text-gray-500">
                <div className="col-span-6 text-center">Sản phẩm</div>
                <div className="col-span-2 text-center">Giá</div>
                <div className="col-span-2 text-center">Số lượng</div>
                <div className="col-span-2 text-right">Tổng tiền</div>
            </div>

            {/* LIST ITEMS */}
            <div className="space-y-8 mb-12 border-b border-gray-200 pb-12">
                {items.map((item) => {
                    const stock = stockLevels[item.id] ?? 999;
                    const isOverStock = item.quantity > stock;

                    return (
                        <div
                            key={`${item.id}-${item.size}-${item.color}`}
                            className={`flex flex-col md:grid md:grid-cols-12 gap-6 md:gap-8 items-center p-4 rounded-lg transition ${
                                isOverStock
                                    ? "bg-red-50 border border-red-200"
                                    : ""
                            }`}
                        >
                            {/* 1. Sản phẩm */}
                            <div className="col-span-6 w-full flex gap-6">
                                <Link
                                    href={`/products/${item.slug}`}
                                    className="relative w-32 aspect-[3/4] flex-shrink-0 bg-gray-100"
                                >
                                    <Image
                                        src={item.image}
                                        alt={item.name}
                                        fill
                                        className="object-cover"
                                    />
                                </Link>
                                <div className="flex flex-col pt-2">
                                    <Link
                                        href={`/products/${item.slug}`}
                                        className="text-base font-bold text-gray-900 hover:text-gray-600 uppercase mb-2"
                                    >
                                        {item.name}
                                    </Link>
                                    <div className="text-sm text-gray-500 space-y-1 mb-2">
                                        <p>
                                            Phiên bản: {item.size} /{" "}
                                            {item.color}
                                        </p>
                                        <p>
                                            Kho còn:{" "}
                                            <span
                                                className={`font-medium ${
                                                    stock === 0
                                                        ? "text-red-600"
                                                        : "text-black"
                                                }`}
                                            >
                                                {loadingStock ? "..." : stock}
                                            </span>
                                        </p>
                                    </div>

                                    {/* Inline Warning cho từng item */}
                                    {isOverStock && (
                                        <p className="text-xs text-red-600 font-bold mb-3 flex items-center gap-1 animate-pulse">
                                            <AlertTriangle size={12} /> Quá số
                                            lượng kho ({stock})
                                        </p>
                                    )}

                                    <button
                                        onClick={() =>
                                            removeItem(
                                                item.id,
                                                item.size,
                                                item.color
                                            )
                                        }
                                        className="text-sm text-gray-500 hover:text-red-600 hover:underline w-fit text-left mt-auto"
                                    >
                                        Xóa
                                    </button>
                                </div>
                            </div>

                            {/* 2. Giá */}
                            <div className="col-span-2 text-center">
                                <div className="flex flex-col items-center">
                                    <span className="text-lg font-bold">
                                        {formatPrice(item.price)}
                                    </span>
                                </div>
                            </div>

                            {/* 3. Số lượng */}
                            <div className="col-span-2 flex justify-center">
                                <div
                                    className={`flex items-center border h-10 px-2 bg-white ${
                                        isOverStock
                                            ? "border-red-500 ring-1 ring-red-500"
                                            : "border-gray-200"
                                    }`}
                                >
                                    <button
                                        onClick={() =>
                                            handleQuantityChange(
                                                item.id,
                                                item.size,
                                                item.color,
                                                item.quantity,
                                                -1
                                            )
                                        }
                                        className="p-2 text-gray-500 hover:text-black disabled:opacity-30"
                                        disabled={item.quantity <= 1}
                                    >
                                        <ChevronLeft size={16} />
                                    </button>

                                    <span
                                        className={`w-8 text-center text-sm font-medium ${
                                            isOverStock
                                                ? "text-red-600 font-bold"
                                                : ""
                                        }`}
                                    >
                                        {item.quantity}
                                    </span>

                                    <button
                                        onClick={() =>
                                            handleQuantityChange(
                                                item.id,
                                                item.size,
                                                item.color,
                                                item.quantity,
                                                1
                                            )
                                        }
                                        className="p-2 text-gray-500 hover:text-black disabled:opacity-30"
                                        // Disable nút tăng nếu đạt giới hạn kho
                                        disabled={
                                            !loadingStock &&
                                            item.quantity >= stock
                                        }
                                    >
                                        <ChevronRight size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* 4. Thành tiền từng món */}
                            <div className="col-span-2 text-right">
                                <span className="text-lg font-bold">
                                    {formatPrice(item.price * item.quantity)}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* FOOTER */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <label className="block text-sm text-gray-600 mb-2">
                        Chú thích
                    </label>
                    <textarea
                        rows={4}
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        className="w-full border border-gray-200 p-4 text-sm focus:outline-none focus:border-black resize-none"
                        placeholder="Ghi chú thêm cho đơn hàng..."
                    ></textarea>
                </div>

                <div className="flex flex-col items-end">
                    <div className="flex items-center gap-2 mb-6 text-xl">
                        <span className="text-gray-600">Tổng tiền</span>
                        <span className="font-bold text-red-600">
                            {formatPrice(totalPrice)}
                        </span>
                    </div>

                    <div className="flex flex-col gap-3 w-full md:w-auto">
                        {/* Nút Thanh toán bị disable nếu có lỗi kho */}
                        {hasStockIssues ? (
                            <button
                                disabled
                                className="bg-gray-300 text-gray-500 px-8 py-3 text-sm font-bold uppercase cursor-not-allowed rounded-full text-center shadow-none"
                            >
                                Vui lòng chỉnh lại số lượng
                            </button>
                        ) : (
                            <Link
                                href="/checkout"
                                className="bg-black text-white px-8 py-3 text-sm font-bold uppercase hover:bg-gray-800 transition rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                            >
                                Thanh toán
                            </Link>
                        )}

                        <button
                            onClick={handleUpdateCart}
                            disabled={isUpdating}
                            className="text-gray-500 text-xs hover:text-black hover:underline text-center mt-2"
                        >
                            {isUpdating
                                ? "Đang đồng bộ..."
                                : "Cập nhật giỏ hàng"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
