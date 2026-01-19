"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { promotionService, PromotionBatchPayload } from "@/services/promotion.service";
import { productService, Product } from "@/services/product.service";
import { Plus, Loader2, X, Save, Percent, DollarSign, Calculator, ArrowRight, ArrowLeft } from "lucide-react";
import Image from "next/image";
import { AxiosError } from "axios"; // Import AxiosError

interface SelectedProduct extends Product {
  price_sale: number;
  sale_id?: number;
}

interface PromotionFormProps {
  initialData?: {
    name: string;
    date_begin: string;
    date_end: string;
    products: SelectedProduct[];
  };
  isEditMode?: boolean;
}

export default function PromotionForm({ initialData, isEditMode = false }: PromotionFormProps) {
  const router = useRouter();
  
  // State
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>(initialData?.products || []);
  const [campaignName, setCampaignName] = useState(initialData?.name || "");
  const [startDate, setStartDate] = useState(initialData?.date_begin || "");
  const [endDate, setEndDate] = useState(initialData?.date_end || "");
  
  const [isLoading, setIsLoading] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Quick Setup State
  const [discountType, setDiscountType] = useState<"percent" | "fixed">("percent");
  const [discountValue, setDiscountValue] = useState<number>(10);

  // Load Products for Modal
  useEffect(() => {
    productService.getProducts({ limit: 1000 }).then((res) => {
      if (res.status) setAllProducts(res.products.data);
    });
  }, []);

  // --- LOGIC ---
  const handleAddProduct = (product: Product) => {
    if (selectedProducts.find((p) => p.id === product.id)) return;
    
    // Default logic
    let defaultSale = product.price_buy;
    if (discountType === 'percent') {
        defaultSale = Math.floor(product.price_buy * ((100 - discountValue) / 100));
    } else {
        defaultSale = Math.max(0, product.price_buy - discountValue);
    }
    if(defaultSale > product.price_buy) defaultSale = product.price_buy;

    setSelectedProducts([...selectedProducts, { ...product, price_sale: defaultSale }]);
  };

  const handleRemoveProduct = async (product: SelectedProduct) => {
    if (product.sale_id && isEditMode) {
       if (!confirm("Xóa sản phẩm này khỏi danh sách?")) return;
    }
    setSelectedProducts((prev) => prev.filter((p) => p.id !== product.id));
  };

  const applyBulkDiscount = () => {
    if (selectedProducts.length === 0) return alert("Hãy chọn sản phẩm trước!");
    const updated = selectedProducts.map(p => {
        let newPrice = p.price_buy;
        if (discountType === 'percent') {
            newPrice = Math.floor(p.price_buy * ((100 - discountValue) / 100));
        } else {
            newPrice = p.price_buy - discountValue;
        }
        if (newPrice < 0) newPrice = 0;
        if (newPrice > p.price_buy) newPrice = p.price_buy;
        return { ...p, price_sale: newPrice };
    });
    setSelectedProducts(updated);
  };

  const handleSubmit = async () => {
    if (!startDate || !endDate) return alert("Vui lòng chọn thời gian");
    if (new Date(startDate) >= new Date(endDate)) return alert("Ngày kết thúc phải sau ngày bắt đầu");
    if (selectedProducts.length === 0) return alert("Chọn ít nhất 1 sản phẩm");

    setIsLoading(true);
    try {
      const payload: PromotionBatchPayload = {
        name: campaignName,
        date_begin: startDate,
        date_end: endDate,
        products: selectedProducts.map((p) => ({
          sale_id: p.sale_id || null,
          product_id: p.id,
          price_sale: p.price_sale,
        })),
      };

      await promotionService.saveBatchPromotions(payload);
      alert(isEditMode ? "Cập nhật thành công!" : "Tạo chương trình thành công!");
      router.push("/admin/promotions"); // Quay về danh sách
      router.refresh();
    } catch (error) {
      // FIX 1: Handle error properly with AxiosError type
      const err = error as AxiosError<{ message: string }>;
      alert("Lỗi: " + (err.response?.data?.message || err.message));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6 pb-4 border-b">
        <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full">
            <ArrowLeft size={20}/>
        </button>
        <h1 className="text-xl font-bold text-gray-800">
            {isEditMode ? "Chỉnh sửa chương trình" : "Tạo chương trình khuyến mãi mới"}
        </h1>
      </div>

      {/* Form Fields */}
      <div className="space-y-6">
        <div>
            <label className="block text-sm font-medium mb-1">Tên chương trình</label>
            <input
                type="text"
                className="w-full border p-2 rounded"
                value={campaignName}
                onChange={(e) => setCampaignName(e.target.value)}
                placeholder="VD: Flash Sale tháng 12"
            />
        </div>
        <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium mb-1">Bắt đầu</label>
                <input type="datetime-local" className="w-full border p-2 rounded" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div>
                <label className="block text-sm font-medium mb-1">Kết thúc</label>
                <input type="datetime-local" className="w-full border p-2 rounded" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
        </div>

        {/* Quick Setup */}
        <div className="bg-orange-50 p-4 rounded border border-orange-100">
            <h4 className="text-sm font-bold text-orange-800 flex items-center gap-2 mb-3">
                <Calculator size={16}/> Thiết lập giá nhanh
            </h4>
            <div className="flex gap-2">
                <div className="flex border rounded bg-white overflow-hidden">
                    <button onClick={() => setDiscountType('percent')} className={`px-3 py-1 text-xs ${discountType === 'percent' ? 'bg-orange-600 text-white' : 'text-gray-600'}`}><Percent size={12}/></button>
                    <button onClick={() => setDiscountType('fixed')} className={`px-3 py-1 text-xs ${discountType === 'fixed' ? 'bg-orange-600 text-white' : 'text-gray-600'}`}><DollarSign size={12}/></button>
                </div>
                <input 
                    type="number" 
                    className="border p-1.5 rounded text-sm w-32"
                    value={discountValue}
                    onChange={(e) => setDiscountValue(Number(e.target.value))}
                />
                <button onClick={applyBulkDiscount} className="bg-gray-800 text-white px-3 py-1 rounded text-xs flex items-center">
                    Áp dụng <ArrowRight size={12} className="ml-1"/>
                </button>
            </div>
        </div>

        {/* Product List */}
        <div>
            <div className="flex justify-between items-center mb-2">
                <span className="font-bold">Sản phẩm ({selectedProducts.length})</span>
                <button onClick={() => setShowProductModal(true)} className="text-blue-600 text-sm flex items-center gap-1 hover:underline">
                    <Plus size={14}/> Thêm sản phẩm
                </button>
            </div>
            <div className="border rounded max-h-[400px] overflow-y-auto">
                {selectedProducts.map((p) => (
                    <div key={p.id} className="flex items-center gap-4 p-3 border-b last:border-0 hover:bg-gray-50">
                        <div className="w-10 h-10 relative rounded overflow-hidden border">
                            <Image src={p.thumbnail_url || `${process.env.NEXT_PUBLIC_BACKEND_URL}/storage/${p.thumbnail}`} alt="" fill className="object-cover" />
                        </div>
                        <div className="flex-1">
                            <div className="text-sm font-medium">{p.name}</div>
                            <div className="text-xs text-gray-500 line-through">{p.price_buy.toLocaleString()} đ</div>
                        </div>
                        <input 
                            type="number" 
                            className="w-24 border p-1 rounded text-right font-bold text-orange-600 text-sm"
                            value={p.price_sale}
                            onChange={(e) => {
                                const val = Number(e.target.value);
                                if(val > p.price_buy) return alert("Giá KM không được lớn hơn giá gốc");
                                setSelectedProducts(selectedProducts.map(sp => sp.id === p.id ? {...sp, price_sale: val} : sp));
                            }}
                        />
                        <button onClick={() => handleRemoveProduct(p)} className="text-gray-400 hover:text-red-500"><X size={16}/></button>
                    </div>
                ))}
                {selectedProducts.length === 0 && <div className="p-8 text-center text-gray-400">Chưa có sản phẩm nào</div>}
            </div>
        </div>

        {/* Submit */}
        <button onClick={handleSubmit} disabled={isLoading} className="w-full bg-orange-600 text-white py-3 rounded font-bold hover:bg-orange-700 flex justify-center items-center gap-2">
            {isLoading && <Loader2 className="animate-spin" size={18}/>}
            <Save size={18}/> {isEditMode ? "Cập nhật chương trình" : "Lưu chương trình"}
        </button>
      </div>

      {/* Modal */}
      {showProductModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-2xl rounded-lg shadow-xl flex flex-col max-h-[80vh]">
                <div className="p-4 border-b flex justify-between">
                    <h3 className="font-bold">Chọn sản phẩm</h3>
                    <button onClick={() => setShowProductModal(false)}><X size={20}/></button>
                </div>
                <div className="p-4 border-b">
                    <input type="text" placeholder="Tìm sản phẩm..." className="w-full border p-2 rounded" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                </div>
                <div className="flex-1 overflow-y-auto p-2">
                    {allProducts.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())).map(p => {
                        const isSelected = selectedProducts.some(sp => sp.id === p.id);
                        return (
                            <div key={p.id} onClick={() => !isSelected && handleAddProduct(p)} className={`flex items-center gap-3 p-3 border-b cursor-pointer ${isSelected ? 'opacity-50 bg-blue-50' : 'hover:bg-gray-50'}`}>
                                <div className="w-10 h-10 relative border rounded overflow-hidden">
                                    <Image src={p.thumbnail_url || `${process.env.NEXT_PUBLIC_BACKEND_URL}/storage/${p.thumbnail}`} alt="" fill className="object-cover" />
                                </div>
                                <div className="flex-1">
                                    <div className="font-medium">{p.name}</div>
                                    <div className="text-xs text-gray-500">{p.price_buy.toLocaleString()} đ</div>
                                </div>
                                {!isSelected && <Plus size={16} className="text-gray-400"/>}
                            </div>
                        )
                    })}
                </div>
                <div className="p-4 border-t text-right">
                    <button onClick={() => setShowProductModal(false)} className="bg-black text-white px-6 py-2 rounded text-sm font-bold">XONG</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}