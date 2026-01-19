'use client';

import { useEffect, useState } from 'react';
import { inventoryService, ProductStore } from '@/services/inventory.service';
import { productService, Product } from '@/services/product.service';
import { Plus, Package, Edit, Trash2, X, Save, Calendar, Clock } from 'lucide-react';
import Image from 'next/image';
import { AxiosError } from 'axios';

// Hàm helper format ngày giờ chi tiết
const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString('vi-VN', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit', second: '2-digit'
    });
};

export default function InventoryPage() {
    const [stocks, setStocks] = useState<ProductStore[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    
    // UI States
    const [showImportForm, setShowImportForm] = useState(false);
    const [editingStock, setEditingStock] = useState<ProductStore | null>(null);

    // Form Data
    const [importData, setImportData] = useState({ product_id: '', qty: 10, price_root: 0 });
    const [editData, setEditData] = useState({ qty: 0, price_root: 0 });

    const fetchData = async () => {
        setLoading(true);
        try {
            const [stockRes, prodRes] = await Promise.all([
                inventoryService.getInventory(),
                productService.getProducts({ limit: 1000 })
            ]);
            
            if (stockRes.status) setStocks(stockRes.data);
            if (prodRes.status) setProducts(prodRes.products.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // 1. NHẬP KHO (Tạo lô hàng mới - Create)
    const handleImport = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await inventoryService.importStock({
                product_id: Number(importData.product_id),
                qty: Number(importData.qty),
                price_root: Number(importData.price_root)
            });
            alert("Nhập kho thành công! Lô hàng mới đã được tạo.");
            setShowImportForm(false);
            // Reset form
            setImportData({ product_id: '', qty: 10, price_root: 0 });
            fetchData(); 
        } catch (error) {
            const err = error as AxiosError<{ message: string }>;
            alert("Lỗi: " + (err.response?.data?.message || err.message));
        }
    };

    // 2. CẬP NHẬT KHO (Sửa thông tin lô hàng cũ)
    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingStock) return;
        try {
            await inventoryService.updateStock(editingStock.id, editData);
            alert("Cập nhật lô hàng thành công!");
            setEditingStock(null);
            fetchData();
        } catch (error) {
            const err = error as AxiosError<{ message: string }>;
            alert("Lỗi: " + (err.response?.data?.message || err.message));
        }
    };

    // 3. XÓA KHO
    const handleDelete = async (id: number) => {
        if (!confirm("Bạn có chắc chắn muốn xóa lô hàng này? Dữ liệu thống kê có thể bị ảnh hưởng.")) return;
        try {
            await inventoryService.deleteStock(id);
            alert("Đã xóa lô hàng khỏi kho!");
            fetchData();
        } catch (error) {
            const err = error as AxiosError<{ message: string }>;
            alert("Lỗi: " + (err.response?.data?.message || err.message));
        }
    };

    // Mở modal sửa
    const openEditModal = (stock: ProductStore) => {
        setEditingStock(stock);
        setEditData({ qty: stock.qty, price_root: stock.price_root });
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Quản lý nhập kho</h1>
                    <p className="text-sm text-gray-500">Theo dõi lịch sử nhập hàng theo từng lô</p>
                </div>
                <button 
                    onClick={() => setShowImportForm(!showImportForm)}
                    className="bg-green-600 text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-green-700 transition shadow-sm"
                >
                    <Plus size={18} /> Tạo phiếu nhập
                </button>
            </div>

            {/* FORM NHẬP KHO (Toggle) */}
            {showImportForm && (
                <div className="bg-white p-6 rounded-lg shadow-md border border-green-200 mb-8 animate-fadeIn">
                    <h3 className="font-bold text-lg mb-4 text-green-800 flex items-center gap-2">
                        <Package size={20}/> Nhập hàng mới (Tạo lô mới)
                    </h3>
                    <form onSubmit={handleImport} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                        <div className="md:col-span-1">
                            <label className="block text-sm font-medium mb-1">Sản phẩm</label>
                            <select 
                                className="w-full border p-2 rounded focus:ring-2 focus:ring-green-500"
                                required
                                value={importData.product_id}
                                onChange={(e) => setImportData({...importData, product_id: e.target.value})}
                            >
                                <option value="">-- Chọn sản phẩm --</option>
                                {products.map(p => (
                                    <option key={p.id} value={p.id}>{p.name} (ID: {p.id})</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Giá nhập (VNĐ)</label>
                            <input type="number" className="w-full border p-2 rounded focus:ring-2 focus:ring-green-500" required min="0"
                                value={importData.price_root}
                                onChange={(e) => setImportData({...importData, price_root: Number(e.target.value)})}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Số lượng nhập</label>
                            <input type="number" className="w-full border p-2 rounded focus:ring-2 focus:ring-green-500" required min="1"
                                value={importData.qty}
                                onChange={(e) => setImportData({...importData, qty: Number(e.target.value)})}
                            />
                        </div>
                        <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded font-bold hover:bg-green-700 h-[42px] transition">
                            Xác nhận nhập
                        </button>
                    </form>
                </div>
            )}

            {/* MODAL SỬA (Overlay) */}
            {editingStock && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl border-t-4 border-blue-600">
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <h3 className="font-bold text-lg">Cập nhật Lô #{editingStock.id}</h3>
                                <p className="text-xs text-gray-500">{editingStock.product_name}</p>
                            </div>
                            <button onClick={() => setEditingStock(null)} className="p-1 hover:bg-gray-100 rounded"><X size={20}/></button>
                        </div>
                        <form onSubmit={handleUpdate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Giá vốn (VNĐ)</label>
                                <input type="number" className="w-full border p-2 rounded" required min="0"
                                    value={editData.price_root}
                                    onChange={(e) => setEditData({...editData, price_root: Number(e.target.value)})}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Số lượng tồn kho</label>
                                <input type="number" className="w-full border p-2 rounded" required min="0"
                                    value={editData.qty}
                                    onChange={(e) => setEditData({...editData, qty: Number(e.target.value)})}
                                />
                            </div>
                            <div className="flex gap-2 pt-2">
                                <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded font-bold hover:bg-blue-700 flex items-center justify-center gap-2">
                                    <Save size={18}/> Lưu thay đổi
                                </button>
                                <button type="button" onClick={() => setEditingStock(null)} className="px-4 py-2 border rounded hover:bg-gray-50">Hủy</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* BẢNG TỒN KHO */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-600 uppercase">
                        <tr>
                            <th className="px-4 py-3 w-[80px]">ID Lô</th>
                            <th className="px-4 py-3">Sản phẩm</th>
                            <th className="px-4 py-3">Giá nhập (Vốn)</th>
                            <th className="px-4 py-3 text-center">Số lượng</th>
                            {/* --- CỘT MỚI: NGÀY NHẬP --- */}
                            <th className="px-4 py-3">
                                <div className="flex items-center gap-1"><Calendar size={14}/> Ngày nhập kho</div>
                            </th>
                            <th className="px-4 py-3 text-xs text-gray-500">Cập nhật cuối</th>
                            <th className="px-4 py-3 text-right">Hành động</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 text-sm">
                        {loading ? (
                            <tr><td colSpan={7} className="text-center py-8 text-gray-500">Đang tải dữ liệu kho...</td></tr>
                        ) : stocks.map((item) => {
                            // Xử lý ảnh sản phẩm
                            let imageUrl = null;
                            if (item.product_image) {
                                const rawImg = item.product_image.trim();
                                if (rawImg.startsWith('http') || rawImg.startsWith('https')) {
                                    imageUrl = rawImg;
                                } else {
                                    imageUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}/storage/${rawImg}`;
                                }
                            }

                            return (
                                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-4 py-3 text-gray-500">#{item.id}</td>
                                    
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 relative bg-gray-100 rounded overflow-hidden border flex-shrink-0">
                                                {imageUrl ? (
                                                    <Image src={imageUrl} alt={item.product_name || ""} fill className="object-cover"/>
                                                ) : <Package className="p-2 text-gray-400 w-full h-full"/>}
                                            </div>
                                            <div>
                                                <div className="font-medium text-gray-800 truncate max-w-[200px]" title={item.product_name}>{item.product_name}</div>
                                                <div className="text-[10px] text-gray-400">Mã SP: {item.product_id}</div>
                                            </div>
                                        </div>
                                    </td>

                                    <td className="px-4 py-3 text-red-600 font-bold">
                                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price_root)}
                                    </td>

                                    <td className="px-4 py-3 text-center">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${item.qty < 10 ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                                            {item.qty}
                                        </span>
                                    </td>

                                    {/* --- HIỂN THỊ NGÀY NHẬP --- */}
                                    <td className="px-4 py-3 text-gray-700 text-xs">
                                        {formatDate(item.created_at)}
                                    </td>

                                    {/* --- HIỂN THỊ NGÀY UPDATE --- */}
                                    <td className="px-4 py-3 text-gray-400 text-[10px] italic">
                                        {item.updated_at !== item.created_at ? (
                                            <div className="flex items-center gap-1">
                                                <Clock size={10}/> {formatDate(item.updated_at)}
                                            </div>
                                        ) : "-"}
                                    </td>

                                    <td className="px-4 py-3 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button onClick={() => openEditModal(item)} className="p-2 text-blue-600 hover:bg-blue-50 rounded transition" title="Sửa lô này">
                                                <Edit size={18}/>
                                            </button>
                                            <button onClick={() => handleDelete(item.id)} className="p-2 text-red-600 hover:bg-red-50 rounded transition" title="Xóa lô này">
                                                <Trash2 size={18}/>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                        {!loading && stocks.length === 0 && (
                            <tr><td colSpan={7} className="text-center py-8 text-gray-400">Kho hàng trống. Hãy nhập hàng.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}