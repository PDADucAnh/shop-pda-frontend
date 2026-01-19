import { api } from "@/lib/axios";

// --- INTERFACES ---

export interface Attribute {
    id: number;
    name: string;
}

export interface ProductAttributeInput {
    attribute_id: number;
    value: string;
}

export interface ProductImage {
    id: number;
    image: string;
    product_id: number;
    image_url?: string;
}

export interface ProductAttribute {
    id: number;
    attribute_id: number;
    value: string;
    product_id: number;
    attribute?: {
        id: number;
        name: string;
    };
}

export interface ProductStore {
    product_id: number;
    qty: number;
    price_root: number;
    status?: number;
}

export interface Product {
    id: number;
    name: string;
    slug: string;
    thumbnail: string;
    thumbnail_url?: string;
    price_buy: number;
    sale_price?: number;
    original_price?: number;
    description: string;
    content?: string;
    is_new: number;
    is_actually_new: boolean;
    is_sale: boolean | number;
    status?: number;
    category_id?: number;
    category?: { id: number; name: string; slug: string };

    // Relations
    images?: ProductImage[];
    product_attributes?: ProductAttribute[];
    attributes?: ProductAttribute[];
    store?: ProductStore;
}

export interface ProductQueryParams {
    page?: number;
    limit?: number;
    is_new?: number | boolean;
    is_sale?: number | boolean;
    category_id?: number;
    keyword?: string;
    sort?: string;
    price_min?: number;
    price_max?: number;
    [key: string]: unknown;
}

export interface Category {
    id: number;
    name: string;
    slug: string;
    status?: number;
}

// --- RESPONSE INTERFACES ---

export interface CategoryListResponse {
    status: boolean;
    categories: Category[];
    message?: string;
}

export interface ProductListResponse {
    status: boolean;
    products: {
        data: Product[];
        current_page: number;
        last_page: number;
        total: number;
    };
    message?: string;
}

export interface ProductDetailResponse {
    status: boolean;
    product: Product;
    related_products?: Product[];
    message?: string;
}

export interface AttributeListResponse {
    status: boolean;
    attributes: Attribute[];
    message?: string;
}

export interface BaseResponse {
    status: boolean;
    message?: string;
    [key: string]: unknown;
}

// --- SERVICE ---

export const productService = {
    // Get available attributes (Size, Color...)
    getAttributes: async (): Promise<AttributeListResponse> => {
        return await api.get<AttributeListResponse>("/attributes");
    },

    // Create product
    createProduct: async (formData: FormData): Promise<BaseResponse> => {
        return await api.post<BaseResponse>("/products", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
    },

    // 1. Get List
    getProducts: async (params?: ProductQueryParams): Promise<ProductListResponse> => {
        return await api.get<ProductListResponse>("/products", { params });
    },

    // 2. Get Detail by Slug (Frontend)
    getProductBySlug: async (slug: string): Promise<ProductDetailResponse> => {
        return await api.get<ProductDetailResponse>(`/products/${slug}`);
    },

    // 3. Get Detail by ID (Admin Edit)
    getProductById: async (id: number): Promise<ProductDetailResponse> => {
        return await api.get<ProductDetailResponse>(`/products/${id}`);
    },

    // 4. Get Categories
    getCategories: async (): Promise<CategoryListResponse> => {
        return await api.get<CategoryListResponse>("/categories");
    },

    // 5. Delete Product
    deleteProduct: async (id: number): Promise<BaseResponse> => {
        return await api.delete<BaseResponse>(`/products/${id}`);
    },

    // 6. Update Product
    updateProduct: async (id: number, formData: FormData): Promise<BaseResponse> => {
        return await api.post<BaseResponse>(`/products/${id}`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
    },

    // 7. Import Excel
    importProducts: async (file: File): Promise<BaseResponse> => {
        const formData = new FormData();
        formData.append("file", file);

        return await api.post<BaseResponse>("/products/import", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
    },

    // 8. Toggle Status
    toggleStatus: async (id: number): Promise<BaseResponse> => {
        return await api.patch<BaseResponse>(`/products/${id}/toggle-status`);
    },
};