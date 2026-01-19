// Để tránh duplicate interfaces, có thể tạo file shared types
export interface BaseResponse {
    status: boolean;
    message?: string;
    [key: string]: unknown;
}

export interface PaginatedResponse<T> {
    data: T[];
    current_page: number;
    last_page: number;
    total: number;
    per_page?: number;
}