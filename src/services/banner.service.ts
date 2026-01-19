import axiosInstance from "@/lib/axios";

export interface Banner {
    id: number;
    name: string;
    image: string;
    image_url?: string; // URL đầy đủ nếu backend trả về accessor
    link?: string;
    position: "slideshow" | "ads";
    sort_order: number;
    description?: string;
    status: number;
    created_at: string;
}

export interface BannerPayload {
    name: string;
    link?: string;
    position: string;
    sort_order?: number;
    description?: string;
    status: string; // Form data gửi lên thường là string "1" hoặc "0"
    image?: FileList;
}

export const bannerService = {
    // 1. Lấy tất cả (Dùng cho Admin)
    getAll: async (params?: Record<string, unknown>) => {
        return await axiosInstance.get<
            unknown,
            { status: boolean; banners: Banner[] }
        >("/banners", { params });
    },

    // 2. Lấy theo ID (Dùng cho Edit)
    getById: async (id: number) => {
        return await axiosInstance.get<
            unknown,
            { status: boolean; banner: Banner }
        >(`/banners/${id}`);
    },

    // 3. Lấy Banner cho Trang chủ (Public) - THÊM MỚI
    getBanners: async (position: string = "slideshow") => {
        // Gọi API với tham số position và chỉ lấy banner đang hiện (status=1)
        return await axiosInstance.get<
            unknown,
            { status: boolean; banners: Banner[] }
        >("/banners", {
            params: {
                position,
                status: 1,
                sort: "sort_order", // Sắp xếp theo thứ tự hiển thị
            },
        });
    },

    // 4. Tạo mới
    create: async (formData: FormData) => {
        return await axiosInstance.post("/banners", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
    },

    // 5. Cập nhật (Dùng POST để xử lý file upload, giả lập PUT ở backend nếu cần hoặc POST trực tiếp)
    update: async (id: number, formData: FormData) => {
        // Laravel update có file thường yêu cầu POST với _method=PUT hoặc xử lý POST trực tiếp
        // Nếu route backend là Route::post('banners/{id}'), ta dùng POST
        return await axiosInstance.post(`/banners/${id}`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
    },

    // 6. Xóa
    delete: async (id: number) => {
        return await axiosInstance.delete(`/banners/${id}`);
    },
};
