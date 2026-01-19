"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import PromotionForm from "@/components/promotions/PromotionForm";
import { promotionService } from "@/services/promotion.service";
import { productService, Product } from "@/services/product.service";

// 1. Define the type for the product with sales data (extends the base Product)
interface SelectedProduct extends Product {
  price_sale: number;
  sale_id?: number;
}

// 2. Define the type for the Initial Data object
interface PromotionInitialData {
  name: string;
  date_begin: string;
  date_end: string;
  products: SelectedProduct[];
}

export default function EditPromotionPage() {
  const params = useParams();
  const campaignName = decodeURIComponent(params.id as string);
  
  // 3. Replace <any> with <PromotionInitialData | null>
  const [initialData, setInitialData] = useState<PromotionInitialData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const promoRes = await promotionService.getPromotions();
        const prodRes = await productService.getProducts({ limit: 1000 });
        
        if (promoRes.status && prodRes.status) {
          const items = promoRes.data.filter((p) => p.name === campaignName);
          
          if (items.length > 0) {
            const firstItem = items[0];
            const allProds = prodRes.products.data;

            // Map and cast to SelectedProduct[]
            const productsForForm = items.map((item) => {
                const productInfo = allProds.find(p => p.id === item.product_id);
                if (!productInfo) return null;
                
                const mappedItem: SelectedProduct = {
                    ...productInfo,
                    price_sale: item.price_sale,
                    sale_id: item.id 
                };
                return mappedItem;
            }).filter((item): item is SelectedProduct => item !== null); // Type predicate to remove nulls

            setInitialData({
                name: firstItem.name,
                date_begin: firstItem.date_begin.slice(0, 16),
                date_end: firstItem.date_end.slice(0, 16),
                products: productsForForm
            });
          }
        }
      } catch (error) {
        console.error("Lỗi tải dữ liệu", error);
      } finally {
        setLoading(false);
      }
    };

    if (campaignName) fetchData();
  }, [campaignName]);

  if (loading) return <div className="p-10 text-center">Đang tải dữ liệu...</div>;
  if (!initialData) return <div className="p-10 text-center">Không tìm thấy chương trình này.</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <PromotionForm initialData={initialData} isEditMode={true} />
    </div>
  );
}