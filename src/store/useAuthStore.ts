import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
    authService,
    User,
    AuthResponse,
    RegisterPayload,
} from "@/services/auth.service";

// 1. CẬP NHẬT INTERFACE
interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;

    // Actions
    login: (email: string, password: string) => Promise<AuthResponse>;
    register: (data: RegisterPayload) => Promise<AuthResponse>;
    logout: () => Promise<void>;
    checkAuth: () => Promise<void>;

    // --- THÊM DÒNG NÀY ---
    fetchProfile: () => Promise<void>;
    updateUser: (data: { name: string; phone: string }) => Promise<void>;
    setUser: (user: User | null) => void;
}

// LƯU Ý QUAN TRỌNG: Phải có từ khóa 'export' ở đây
export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            isAuthenticated: false,
            isLoading: false,

            // --- LOGIN ---
            login: async (email, password) => {
                set({ isLoading: true });
                try {
                    const response = await authService.login({
                        email,
                        password,
                    });

                    // Cập nhật state sau khi login thành công
                    set({
                        user: response.user,
                        isAuthenticated: true,
                        isLoading: false,
                    });

                    return response;
                } catch (error) {
                    set({ isLoading: false });
                    throw error;
                }
            },

            // --- REGISTER ---
            register: async (data) => {
                set({ isLoading: true });
                try {
                    const response = await authService.register(data);

                    set({
                        user: response.user,
                        isAuthenticated: true,
                        isLoading: false,
                    });

                    return response;
                } catch (error) {
                    set({ isLoading: false });
                    throw error;
                }
            },

            // --- LOGOUT ---
            logout: async () => {
                try {
                    // Gọi API logout (không bắt buộc chờ thành công mới clear state)
                    await authService.logout();
                } catch (error) {
                    console.error("Logout error:", error);
                } finally {
                    // Luôn clear state ở client
                    set({ user: null, isAuthenticated: false });
                }
            },

            // --- CHECK AUTH ---
            checkAuth: async () => {
                try {
                    const result = await authService.checkAuth();
                    if (result.authenticated && result.user) {
                        set({ user: result.user, isAuthenticated: true });
                    } else {
                        set({ user: null, isAuthenticated: false });
                    }
                } catch (error) {
                    set({ user: null, isAuthenticated: false });
                }
            },

            // --- 2. IMPLEMENT FETCH PROFILE (THÊM ĐOẠN NÀY) ---
            fetchProfile: async () => {
                try {
                    // Gọi service lấy thông tin user mới nhất
                    const user = await authService.getProfile();
                    // Cập nhật lại store
                    set({ user, isAuthenticated: true });
                } catch (error) {
                    // Nếu lỗi (ví dụ token hết hạn), clear store
                    set({ user: null, isAuthenticated: false });
                    // Ném lỗi ra để component (ProfilePage) bắt được và redirect
                    throw error;
                }
            },
            updateUser: async (data) => {
                set({ isLoading: true });
                try {
                    const updatedUser = await authService.updateProfile(data);
                    // Cập nhật lại user trong store để UI tự đổi
                    set({ user: updatedUser, isLoading: false });
                } catch (error) {
                    set({ isLoading: false });
                    throw error;
                }
            },
            // --- SET USER MANUAL ---
            setUser: (user) => set({ user, isAuthenticated: !!user }),
        }),
        {
            name: "auth-storage", // Tên key trong localStorage

            // Cấu hình storage an toàn cho Next.js (Client-side only)
            storage: createJSONStorage(() => {
                if (typeof window !== "undefined") {
                    return localStorage;
                }
                return {
                    getItem: () => null,
                    setItem: () => {},
                    removeItem: () => {},
                };
            }),

            // Chỉ lưu user và isAuthenticated vào localStorage
            partialize: (state) => ({
                user: state.user,
                isAuthenticated: state.isAuthenticated,
            }),
        },
    ),
);
