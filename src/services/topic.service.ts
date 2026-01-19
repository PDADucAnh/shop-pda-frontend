import axiosInstance from "@/lib/axios";

export interface Topic {
  id: number;
  name: string;
  slug: string;
  sort_order: number;
  description?: string;
  status: number;
  created_at?: string;
}

// Định nghĩa kiểu trả về từ API
interface TopicResponse {
    status: boolean;
    topics: Topic[];
    message?: string;
}

interface TopicDetailResponse {
    status: boolean;
    topic: Topic;
    message?: string;
}

export const topicService = {
  // 1. Lấy danh sách
  getAll: async () => {
    // FIX: Thay 'any' bằng 'unknown'
    return await axiosInstance.get<unknown, TopicResponse>("/topics");
  },

  // 2. Lấy chi tiết
  getById: async (id: number) => {
    // FIX: Thay 'any' bằng 'unknown'
    return await axiosInstance.get<unknown, TopicDetailResponse>(`/topics/${id}`);
  },

  // 3. Tạo mới
  create: async (data: Partial<Topic>) => {
    return await axiosInstance.post("/topics", data);
  },

  // 4. Cập nhật
  update: async (id: number, data: Partial<Topic>) => {
    return await axiosInstance.put(`/topics/${id}`, data);
  },

  // 5. Xóa
  delete: async (id: number) => {
    return await axiosInstance.delete(`/topics/${id}`);
  },
};