import { api } from "@/lib/axios";

// 1. Định nghĩa kiểu cho tham số tìm kiếm đơn hàng
export interface OrderQueryParams {
    page?: number;
    limit?: number;
    status?: number;
    keyword?: string;
    [key: string]: unknown;
}

// 2. Định nghĩa chi tiết đơn hàng
export interface OrderDetail {
    id: number;
    order_id: number;
    product_id: number;
    product_name?: string;
    product?: {
        id: number;
        name: string;
        thumbnail: string;
    };
    price: number | string;
    qty: number;
    amount: number | string;
    discount?: number | string;
}

// 3. Định nghĩa Order khớp với Backend Laravel
export interface Order {
    id: number;
    user_id: number | null;
    name: string;
    phone: string;
    address: string;
    email: string;
    note?: string | null;
    created_by?: number;
    updated_by?: number | null;
    status: number;
    created_at: string;
    updated_at: string;
    total_money?: number; // Thêm optional vì backend có thể chưa có
    payment_method?: string; // Thêm optional
    order_details?: OrderDetail[];
}

// 4. Interface phản hồi danh sách từ Laravel - SỬA THÀNH "data"
export interface OrderListResponse {
    status: boolean;
    data: {
        // <-- THAY "orders" BẰNG "data"
        data: Order[];
        current_page: number;
        last_page: number;
        total: number;
        per_page?: number;
        from?: number;
        to?: number;
        first_page_url?: string;
        last_page_url?: string;
        next_page_url?: string | null;
        prev_page_url?: string | null;
        links?: Array<{
            url: string | null;
            label: string;
            active: boolean;
        }>;
    };
    message?: string;
}

// 5. Interface phản hồi chi tiết - SỬA THÀNH "data"
export interface OrderDetailResponse {
    status: boolean;
    data: Order; // <-- THAY "order" BẰNG "data"
    message?: string;
}

// 6. Interface cho response update/delete
export interface BaseResponse {
    status: boolean;
    message?: string;
    [key: string]: unknown;
}

export const orderService = {
    // Lấy danh sách đơn hàng
    getOrders: async (
        params?: OrderQueryParams,
    ): Promise<OrderListResponse> => {
        return await api.get<OrderListResponse>("/orders", { params });
    },

    // Lấy chi tiết đơn hàng
    getOrderById: async (id: number): Promise<OrderDetailResponse> => {
        return await api.get<OrderDetailResponse>(`/orders/${id}`);
    },

    // Cập nhật trạng thái đơn hàng
    updateStatus: async (id: number, status: number): Promise<BaseResponse> => {
        return await api.put<BaseResponse>(`/orders/${id}`, { status });
    },

    // Xóa đơn hàng
    deleteOrder: async (id: number): Promise<BaseResponse> => {
        return await api.delete<BaseResponse>(`/orders/${id}`);
    },
    // Get orders for authenticated user
    getUserOrders: async (): Promise<OrderListResponse> => {
        return await api.get<OrderListResponse>("/my/orders");
    },

    // Get order detail for authenticated user
    getOrderDetailForUser: async (id: number): Promise<OrderDetailResponse> => {
        return await api.get<OrderDetailResponse>(`/my/orders/${id}`);
    },

    // Cancel order (user)
    cancelUserOrder: async (id: number): Promise<BaseResponse> => {
        return await api.post<BaseResponse>(`/my/orders/${id}/cancel`);
    },
};
