"use client";

import { useState, useEffect, use, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
    ShoppingBag,
    Heart,
    Ruler,
    Truck,
    ShieldCheck,
    AlertCircle,
    Info,
} from "lucide-react";
import { productService, Product } from "@/services/product.service";
import { useCartStore } from "@/store/useCartStore";

interface Props {
    params: Promise<{ slug: string }>;
}

export default function ProductDetailPage({ params }: Props) {
    const { slug } = use(params);
    const { addItem } = useCartStore();

    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(0);
    const [quantity, setQuantity] = useState(1);

    // State lưu các thuộc tính đã chọn (VD: { Size: 'M', Color: 'Red' })
    const [selectedAttributes, setSelectedAttributes] = useState<
        Record<string, string>
    >({});

    // State thông báo lỗi (VD: Chưa chọn size, Vượt quá tồn kho)
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                const res = await productService.getProductBySlug(slug);
                if (res.status) {
                    setProduct(res.product);
                } else {
                    notFound();
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchDetail();
    }, [slug]);

    // --- 1. XỬ LÝ ATTRIBUTES (Gom nhóm) ---
    const groupedAttributes = useMemo(() => {
        if (!product?.product_attributes) return {};

        const groups: Record<string, string[]> = {};
        product.product_attributes.forEach((attr) => {
            // Cố gắng lấy tên thuộc tính từ API trả về (nếu có trường attribute.name)
            // Nếu không có thì fallback về logic cũ hoặc hiển thị "Option"
            let key = attr.attribute?.name || "Tùy chọn";

            // Fallback logic nếu backend chưa trả về attribute name
            if (!attr.attribute?.name) {
                if (["S", "M", "L", "XL", "XXL", "XXXL"].includes(attr.value))
                    key = "Size";
                else if (
                    [
                        "Red",
                        "Blue",
                        "Green",
                        "Black",
                        "White",
                        "Yellow",
                        "Pink",
                    ].includes(attr.value)
                )
                    key = "Color";
                else if (attr.attribute_id)
                    key = `Thuộc tính ${attr.attribute_id}`;
            }

            if (!groups[key]) groups[key] = [];
            if (!groups[key].includes(attr.value)) groups[key].push(attr.value);
        });
        return groups;
    }, [product]);

    // --- 2. LOGIC TỒN KHO & GIÁ ---
    if (loading)
        return (
            <div className="h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
        );
    if (!product)
        return <div className="text-center py-20">Không tìm thấy sản phẩm</div>;

    const productImages = [
        product.thumbnail,
        ...(product.images?.map((img) => img.image) || []),
    ].map((img) =>
        img && img.startsWith("http")
            ? img
            : `${process.env.NEXT_PUBLIC_BACKEND_URL}/storage/${img}`
    );

    const hasSale =
        product.sale_price !== null && product.sale_price !== undefined;
    const currentPrice = hasSale
        ? Number(product.sale_price)
        : Number(product.price_buy);
    const oldPrice = hasSale ? Number(product.price_buy) : 0;
    const discountPercent =
        hasSale && oldPrice > 0
            ? Math.round(((oldPrice - currentPrice) / oldPrice) * 100)
            : 0;

    // Lấy số lượng tồn kho
    const stockQty = product.store ? product.store.qty : 0;
    const isOutOfStock = stockQty <= 0;

    const formatPrice = (price: number) =>
        new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(Number(price));

    // --- 3. HANDLERS ---

    const handleSelectAttribute = (key: string, value: string) => {
        setSelectedAttributes((prev) => ({ ...prev, [key]: value }));
        setErrorMsg(null);
    };

    const handleQuantityChange = (val: number) => {
        if (val < 1) return;
        if (val > stockQty) {
            setErrorMsg(`Xin lỗi, trong kho chỉ còn ${stockQty} sản phẩm.`);
            setQuantity(stockQty);
        } else {
            setErrorMsg(null);
            setQuantity(val);
        }
    };

    const handleAddToCart = () => {
        // 1. Check Tồn kho
        if (isOutOfStock) {
            setErrorMsg("Sản phẩm này hiện đang tạm hết hàng.");
            return;
        }

        // 2. Check số lượng mua vs tồn kho
        if (quantity > stockQty) {
            setErrorMsg(`Số lượng yêu cầu vượt quá tồn kho (${stockQty}).`);
            return;
        }

        // 3. Check chọn thuộc tính (Validate)
        const requiredKeys = Object.keys(groupedAttributes);
        const missingKeys = requiredKeys.filter(
            (key) => !selectedAttributes[key]
        );

        if (missingKeys.length > 0) {
            setErrorMsg(
                `Vui lòng chọn ${missingKeys.join(
                    ", "
                )} trước khi thêm vào giỏ.`
            );
            return;
        }

        // 4. Thêm vào giỏ
        addItem({
            id: product.id,
            name: product.name,
            slug: product.slug,
            price: currentPrice,
            image: productImages[0],
            size: selectedAttributes["Size"] || "",
            color:
                selectedAttributes["Color"] ||
                selectedAttributes["Màu sắc"] ||
                "",
            quantity: quantity,
        });

        alert("Đã thêm vào giỏ hàng thành công!");
        setErrorMsg(null);
    };

    return (
        <div className="bg-white pb-20">
            <div className="container mx-auto px-4 py-4 text-xs md:text-sm text-gray-500 flex gap-2">
                <Link href="/" className="hover:text-black">
                    Trang chủ
                </Link>{" "}
                /{" "}
                <Link href="/products" className="hover:text-black">
                    Sản phẩm
                </Link>{" "}
                /{" "}
                <span className="text-black font-medium truncate">
                    {product.name}
                </span>
            </div>

            <div className="container mx-auto px-4 mt-6">
                <div className="flex flex-col lg:flex-row gap-10 lg:gap-16">
                    {/* --- LEFT: HÌNH ẢNH --- */}
                    <div className="w-full lg:w-[55%] flex gap-4 sticky top-24 h-fit">
                        <div className="hidden lg:flex flex-col gap-4 w-[90px] flex-shrink-0">
                            {productImages.map((img, index) => (
                                <div
                                    key={index}
                                    className={`relative w-full aspect-[3/4] cursor-pointer border transition-all duration-200 ${
                                        selectedImage === index
                                            ? "border-black ring-1 ring-black"
                                            : "border-transparent hover:border-gray-300"
                                    }`}
                                    onClick={() => setSelectedImage(index)}
                                    onMouseEnter={() => setSelectedImage(index)}
                                >
                                    <Image
                                        src={img}
                                        alt="thumb"
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                            ))}
                        </div>
                        <div className="flex-1 relative aspect-[3/4] bg-gray-50 overflow-hidden group">
                            <Image
                                src={productImages[selectedImage]}
                                alt={product.name}
                                fill
                                className="object-cover animate-fadeIn transition-transform duration-700 group-hover:scale-105"
                                priority
                            />
                            {hasSale && (
                                <span className="absolute top-4 left-4 bg-red-600 text-white text-xs font-bold px-3 py-1">
                                    -{discountPercent}%
                                </span>
                            )}
                        </div>
                    </div>

                    {/* --- RIGHT: THÔNG TIN --- */}
                    <div className="w-full lg:w-[45%]">
                        <div className="h-full flex flex-col">
                            <h1 className="text-3xl font-medium uppercase tracking-wide mb-2 text-gray-900 leading-tight">
                                {product.name}
                            </h1>

                            {/* Tình trạng kho */}
                            <div className="mb-4 flex items-center gap-2 text-sm">
                                <span
                                    className={`flex items-center gap-1 font-medium ${
                                        isOutOfStock
                                            ? "text-red-500"
                                            : "text-green-600"
                                    }`}
                                >
                                    {isOutOfStock ? (
                                        <AlertCircle size={14} />
                                    ) : (
                                        <ShieldCheck size={14} />
                                    )}
                                    {isOutOfStock ? "Hết hàng" : "Còn hàng"}
                                </span>
                                <span className="text-gray-400">|</span>
                                <span className="text-gray-500">
                                    Mã SP: SKU-{product.id}
                                </span>
                            </div>

                            {/* Giá */}
                            <div className="flex items-center gap-4 mb-8 border-b border-gray-100 pb-6">
                                <span className="text-2xl font-bold text-black tracking-tight">
                                    {formatPrice(currentPrice)}
                                </span>
                                {hasSale && (
                                    <span className="text-lg text-gray-400 line-through">
                                        {formatPrice(oldPrice)}
                                    </span>
                                )}
                            </div>

                            {/* --- SELECT ATTRIBUTES --- */}
                            {/* Render mỗi nhóm thuộc tính trên một hàng riêng biệt */}
                            <div className="space-y-6 mb-8">
                                {Object.entries(groupedAttributes).map(
                                    ([attrName, values]) => (
                                        <div
                                            key={attrName}
                                            className="border-b border-gray-50 pb-4 last:border-0 last:pb-0"
                                        >
                                            <div className="flex justify-between items-center mb-3">
                                                <span className="font-bold text-sm text-gray-800 uppercase tracking-wide">
                                                    {attrName}:{" "}
                                                    <span className="font-normal text-gray-600 ml-1">
                                                        {
                                                            selectedAttributes[
                                                                attrName
                                                            ]
                                                        }
                                                    </span>
                                                </span>
                                                {attrName === "Size" && (
                                                    <button className="text-xs text-gray-500 underline hover:text-black flex items-center gap-1">
                                                        <Ruler size={12} />{" "}
                                                        Hướng dẫn chọn size
                                                    </button>
                                                )}
                                            </div>

                                            {/* Flex wrap để xuống dòng nếu nhiều lựa chọn */}
                                            <div className="flex flex-wrap gap-2">
                                                {values.map((val) => {
                                                    const isSelected =
                                                        selectedAttributes[
                                                            attrName
                                                        ] === val;
                                                    return (
                                                        <button
                                                            key={val}
                                                            onClick={() =>
                                                                handleSelectAttribute(
                                                                    attrName,
                                                                    val
                                                                )
                                                            }
                                                            className={`min-w-[48px] px-4 py-2 border text-sm font-medium transition-all duration-200 uppercase
                                ${
                                    isSelected
                                        ? "border-black bg-black text-white shadow-md"
                                        : "border-gray-200 text-gray-700 hover:border-gray-800 hover:bg-gray-50"
                                }`}
                                                        >
                                                            {val}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )
                                )}
                            </div>

                            {/* --- QUANTITY & ADD TO CART --- */}
                            <div className="flex flex-col gap-4 mb-8">
                                {/* Error Message */}
                                {errorMsg && (
                                    <div className="bg-red-50 text-red-600 px-4 py-3 rounded-md text-sm flex items-center gap-2 animate-pulse">
                                        <AlertCircle size={16} /> {errorMsg}
                                    </div>
                                )}

                                <div className="flex gap-4">
                                    <div className="flex items-center border border-gray-300 h-12 w-32 group hover:border-gray-800 transition">
                                        <button
                                            onClick={() =>
                                                handleQuantityChange(
                                                    quantity - 1
                                                )
                                            }
                                            disabled={
                                                quantity <= 1 || isOutOfStock
                                            }
                                            className="w-10 h-full flex items-center justify-center text-gray-500 hover:text-black disabled:opacity-30"
                                        >
                                            -
                                        </button>
                                        <input
                                            type="text"
                                            value={quantity}
                                            readOnly
                                            className="w-full h-full text-center outline-none font-bold text-gray-800 bg-transparent"
                                        />
                                        <button
                                            onClick={() =>
                                                handleQuantityChange(
                                                    quantity + 1
                                                )
                                            }
                                            disabled={
                                                isOutOfStock ||
                                                quantity >= stockQty
                                            }
                                            className="w-10 h-full flex items-center justify-center text-gray-500 hover:text-black disabled:opacity-30"
                                        >
                                            +
                                        </button>
                                    </div>
                                    <button
                                        onClick={handleAddToCart}
                                        disabled={isOutOfStock}
                                        className={`flex-1 h-12 font-bold uppercase tracking-wider transition flex items-center justify-center gap-2 
                      ${
                          isOutOfStock
                              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                              : "bg-black text-white hover:bg-gray-800 shadow-md hover:shadow-lg"
                      }`}
                                    >
                                        {isOutOfStock ? (
                                            "Tạm hết hàng"
                                        ) : (
                                            <>
                                                <ShoppingBag size={18} /> Thêm
                                                vào giỏ
                                            </>
                                        )}
                                    </button>

                                    <button className="w-12 h-12 border border-gray-300 flex items-center justify-center hover:border-red-500 hover:text-red-500 transition text-gray-400">
                                        <Heart size={20} />
                                    </button>
                                </div>
                                {stockQty > 0 && stockQty < 10 && (
                                    <p className="text-xs text-orange-600 font-medium flex items-center gap-1">
                                        <Info size={12} /> Chỉ còn {stockQty}{" "}
                                        sản phẩm trong kho!
                                    </p>
                                )}
                            </div>

                            {/* --- POLICY INFO --- */}
                            <div className="grid grid-cols-2 gap-4 mb-8 text-sm text-gray-600 bg-gray-50 p-4 rounded-lg">
                                <div className="flex items-center gap-2">
                                    <Truck size={18} className="text-black" />
                                    <span>
                                        Miễn phí vận chuyển đơn {">"} 500k
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <ShieldCheck
                                        size={18}
                                        className="text-black"
                                    />
                                    <span>Bảo hành chính hãng 12 tháng</span>
                                </div>
                            </div>

                            {/* --- DETAILED CONTENT --- */}
                            <div className="border-t border-gray-200 pt-8 mt-auto">
                                <h3 className="font-bold mb-4 uppercase text-sm tracking-wide flex items-center gap-2">
                                    Chi tiết sản phẩm
                                    <div className="flex-1 h-[1px] bg-gray-200"></div>
                                </h3>
                                <div className="prose prose-sm max-w-none text-gray-600 leading-relaxed">
                                    {/* Render HTML content safely */}
                                    {product.content ? (
                                        <div
                                            dangerouslySetInnerHTML={{
                                                __html: product.content,
                                            }}
                                        />
                                    ) : (
                                        <p className="italic text-gray-400">
                                            Chưa có mô tả chi tiết cho sản phẩm
                                            này.
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
