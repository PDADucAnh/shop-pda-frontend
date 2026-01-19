"use client";

import { useEffect, useState, useRef } from "react";
import { promotionService, Promotion } from "@/services/promotion.service";
import Link from "next/link";
import { Plus, RefreshCw, Tag, Edit, Trash2, MoreVertical, Calendar, Package } from "lucide-react";

interface CampaignGroup {
  name: string;
  date_begin: string;
  date_end: string;
  items: Promotion[];
}

export default function PromotionsListPage() {
  const [campaigns, setCampaigns] = useState<CampaignGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null); // Quản lý menu nào đang mở

  // Ref để xử lý click ra ngoài thì đóng menu
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Sự kiện đóng menu khi click ra ngoài
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await promotionService.getPromotions();
      if (res.status) {
        // Group by Name
        const groups: { [key: string]: CampaignGroup } = {};
        res.data.forEach((sale) => {
          if (!groups[sale.name]) {
            groups[sale.name] = {
              name: sale.name,
              date_begin: sale.date_begin,
              date_end: sale.date_end,
              items: [],
            };
          }
          groups[sale.name].items.push(sale);
        });
        setCampaigns(Object.values(groups));
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Hàm xử lý xóa chiến dịch (Xóa từng item trong chiến dịch)
  const handleDeleteCampaign = async (items: Promotion[]) => {
    if (!confirm(`Bạn có chắc muốn xóa toàn bộ chiến dịch "${items[0].name}"? Hành động này không thể hoàn tác.`)) return;
    
    try {
        // Xóa song song tất cả items (Trong thực tế nên có API xóa theo Group Name từ Backend thì tốt hơn)
        await Promise.all(items.map(item => promotionService.deletePromotion(item.id)));
        
        alert("Đã xóa chiến dịch thành công!");
        loadData(); // Reload lại data
    } catch (error) {
        alert("Có lỗi xảy ra khi xóa.");
        console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6" onClick={() => setOpenMenuId(null)}> {/* Click nền đóng menu */}
      
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <Tag className="text-orange-600"/> Quản lý Khuyến Mãi
            </h1>
            <p className="text-gray-500 text-sm mt-1">Quản lý các đợt giảm giá và sự kiện</p>
        </div>
        
        <div className="flex gap-3">
            <button 
                onClick={(e) => { e.stopPropagation(); loadData(); }} 
                className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-blue-600 transition shadow-sm"
                title="Làm mới"
            >
                <RefreshCw size={18}/>
            </button>
            <Link 
                href="/admin/promotions/create" 
                className="bg-gray-900 text-white px-5 py-2 rounded-lg flex items-center gap-2 hover:bg-black transition shadow-lg shadow-gray-300/50"
            >
                <Plus size={18}/> Tạo chương trình
            </Link>
        </div>
      </div>

      {/* Grid Content */}
      <div className="grid grid-cols-1 gap-6">
        {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                <RefreshCw className="animate-spin mb-2" size={30}/>
                <p>Đang tải dữ liệu...</p>
            </div>
        ) : campaigns.map((camp, idx) => {
            const isActive = new Date(camp.date_end) > new Date();
            const campaignId = encodeURIComponent(camp.name); 
            // Tạo ID duy nhất cho menu dropdown (dùng tên làm key)
            const isMenuOpen = openMenuId === camp.name;

            return (
                <div key={idx} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 group relative">
                    
                    {/* Card Header */}
                    <div className="flex justify-between items-start mb-5">
                        <div className="flex-1">
                            <div className="flex items-center gap-3">
                                <h3 className="font-bold text-xl text-gray-800 group-hover:text-orange-600 transition-colors cursor-pointer">
                                    <Link href={`/admin/promotions/edit/${campaignId}`}>{camp.name}</Link>
                                </h3>
                                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${isActive ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-gray-100 text-gray-500 border border-gray-200'}`}>
                                    {isActive ? 'Active' : 'Expired'}
                                </span>
                            </div>
                            
                            <div className="text-sm text-gray-500 mt-2 flex items-center gap-4">
                                <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded">
                                    <Calendar size={14} className="text-gray-400"/>
                                    <span>{new Date(camp.date_begin).toLocaleDateString('vi-VN')} - {new Date(camp.date_end).toLocaleDateString('vi-VN')}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Package size={14} className="text-gray-400"/>
                                    <span>{camp.items.length} sản phẩm</span>
                                </div>
                            </div>
                        </div>

                        {/* --- ACTION DROPDOWN --- */}
                        <div className="relative" ref={isMenuOpen ? menuRef : null}>
                            <button 
                                onClick={(e) => {
                                    e.stopPropagation(); // Ngăn click lan ra ngoài
                                    setOpenMenuId(isMenuOpen ? null : camp.name);
                                }}
                                className={`p-2 rounded-full hover:bg-gray-100 transition ${isMenuOpen ? 'bg-gray-100 text-gray-900' : 'text-gray-400'}`}
                            >
                                <MoreVertical size={20}/>
                            </button>

                            {/* Dropdown Menu */}
                            {isMenuOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-100 z-10 animate-fadeIn origin-top-right overflow-hidden">
                                    <div className="py-1">
                                        <Link 
                                            href={`/admin/promotions/edit/${campaignId}`}
                                            className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition w-full text-left"
                                        >
                                            <Edit size={16}/> Chỉnh sửa
                                        </Link>
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteCampaign(camp.items);
                                            }}
                                            className="flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition w-full text-left border-t border-gray-50"
                                        >
                                            <Trash2 size={16}/> Xóa chiến dịch
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                        {/* --- END ACTION DROPDOWN --- */}

                    </div>

                    {/* Product Preview List */}
                    <div className="mt-4">
                        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-200">
                            {camp.items.slice(0, 6).map((item, i) => (
                                <div key={i} className="flex-shrink-0 w-32 border border-gray-200 rounded-lg p-2 bg-gray-50/50 flex flex-col items-center text-center">
                                    <div className="w-full text-xs font-medium truncate text-gray-700 mb-1" title={item.product_name}>
                                        {item.product_name}
                                    </div>
                                    <div className="text-sm font-bold text-orange-600">
                                        {new Intl.NumberFormat("vi-VN", { style: "decimal" }).format(item.price_sale)}đ
                                    </div>
                                </div>
                            ))}
                            {camp.items.length > 6 && (
                                <div className="flex-shrink-0 w-24 flex flex-col items-center justify-center text-xs text-gray-500 font-medium border border-dashed border-gray-300 rounded-lg bg-white">
                                    <span className="text-lg font-bold">+{camp.items.length - 6}</span>
                                    <span>Sản phẩm</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )
        })}
        
        {!loading && campaigns.length === 0 && (
            <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4 text-gray-400">
                    <Tag size={32} />
                </div>
                <h3 className="text-lg font-medium text-gray-900">Chưa có chương trình nào</h3>
                <p className="text-gray-500 mt-1 mb-6">Hãy tạo chương trình khuyến mãi đầu tiên để thu hút khách hàng.</p>
                <Link href="/admin/promotions/create" className="bg-orange-600 text-white px-6 py-2.5 rounded-lg hover:bg-orange-700 transition shadow">
                    Tạo chương trình ngay
                </Link>
            </div>
        )}
      </div>
    </div>
  );
}