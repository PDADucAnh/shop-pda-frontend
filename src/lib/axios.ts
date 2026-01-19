// src/lib/axios.ts
import axios, {
    AxiosError,
    AxiosResponse,
    InternalAxiosRequestConfig,
    AxiosRequestConfig,
} from "axios";
import Cookies from "js-cookie"; // Cần import thư viện này

// Tạo instance axios với baseURL từ .env.local
const axiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
    timeout: 10000,
});

// 1. Request Interceptor - GẮN TOKEN VÀO ĐÂY
axiosInstance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        // Lấy token từ Cookie (đã lưu lúc login)
        const token = Cookies.get("access_token");

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => Promise.reject(error),
);

// 2. Response Interceptor - Xử lý lỗi trả về
axiosInstance.interceptors.response.use(
    (response: AxiosResponse) => {
        return response.data;
    },
    async (error: AxiosError) => {
        // Nếu lỗi 401 (Hết hạn token), tự động logout
        if (error.response?.status === 401) {
            Cookies.remove("access_token");
            Cookies.remove("user_info");
            // window.location.href = '/login'; // Có thể bật lại nếu muốn redirect cứng
        }

        // Trả về data lỗi từ server thay vì object axios đầy đủ
        return Promise.reject(error.response?.data || error);
    },
);

export default axiosInstance;

// Type definition giữ nguyên như cũ
export type ApiInstance = {
    get<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T>;
    post<T = unknown>(
        url: string,
        data?: unknown,
        config?: AxiosRequestConfig,
    ): Promise<T>;
    put<T = unknown>(
        url: string,
        data?: unknown,
        config?: AxiosRequestConfig,
    ): Promise<T>;
    patch<T = unknown>(
        url: string,
        data?: unknown,
        config?: AxiosRequestConfig,
    ): Promise<T>;
    delete<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T>;
};

export const api: ApiInstance = axiosInstance as ApiInstance;
