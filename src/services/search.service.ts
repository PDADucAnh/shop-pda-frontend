import { api } from "@/lib/axios";

// Định nghĩa Interface cho kết quả tìm kiếm
export interface SearchProduct {
    id: number;
    name: string;
    slug: string;
    price: number;
    price_sale?: number | null;
    image: string;
}

export interface SearchPost {
    id: number;
    title: string;
    slug: string;
    image: string;
    type: string;
    created_at: string;
}

export interface SearchResponse {
    status: boolean;
    data: {
        products: SearchProduct[];
        posts: SearchPost[];
    };
    message?: string;
}

export const searchService = {
    search: async (keyword: string): Promise<SearchResponse> => {
        return await api.get<SearchResponse>("/search", {
            params: { keyword }
        });
    }
};