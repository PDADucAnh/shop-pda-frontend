import { api } from "@/lib/axios";

export interface Promotion {
  id: number;
  name: string;
  product_id: number;
  product_name?: string;
  price_sale: number;
  date_begin: string;
  date_end: string;
  status: number;
}

export interface PromotionBatchPayload {
  name: string;
  date_begin: string;
  date_end: string;
  products: {
    sale_id?: number | null;
    product_id: number;
    price_sale: number;
  }[];
}

export interface PromotionUpdatePayload {
  name: string;
  product_id: number;
  price_sale: number;
  date_begin: string;
  date_end: string;
}

export interface PromotionListResponse {
  status: boolean;
  data: Promotion[];
  message?: string;
}

export interface BaseResponse {
  status: boolean;
  message?: string;
  [key: string]: unknown;
}

export const promotionService = {
  getPromotions: async (): Promise<PromotionListResponse> => {
    return await api.get<PromotionListResponse>("/product-sales");
  },

  // Create Batch
  createPromotion: async (data: PromotionBatchPayload): Promise<BaseResponse> => {
    return await api.post<BaseResponse>("/product-sales", data);
  },

  // Update Single
  updatePromotion: async (id: number, data: PromotionUpdatePayload): Promise<BaseResponse> => {
    return await api.put<BaseResponse>(`/product-sales/${id}`, data);
  },

  // Save Batch Promotions
  saveBatchPromotions: async (payload: PromotionBatchPayload): Promise<BaseResponse> => {
    return await api.post<BaseResponse>("/product-sales/batch", payload);
  },

  // Delete
  deletePromotion: async (id: number): Promise<BaseResponse> => {
    return await api.delete<BaseResponse>(`/product-sales/${id}`);
  },

  // Import Excel
  importPromotion: async (formData: FormData): Promise<BaseResponse> => {
    return await api.post<BaseResponse>("/product-sales/import", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
};