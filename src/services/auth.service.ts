import { api } from "@/lib/axios";
import Cookies from "js-cookie";
import { AxiosError } from "axios";

// --- INTERFACES ---
export interface User {
    id: number;
    name: string;
    email: string;
    phone?: string;
    username?: string;
    roles?: string;
    avatar?: string | null;
    status?: number;
    created_at?: string;
    updated_at?: string;
}

export interface AuthResponse {
    status?: boolean;
    access_token: string;
    token_type: string;
    expires_in: number;
    user: User;
}

export interface LoginPayload {
    email: string;
    password: string;
}

export interface RegisterPayload {
    name: string;
    email: string;
    phone: string;
    password: string;
}

// 1. Thêm interface cho Error Response
interface AuthErrorData {
    message?: string;
    error?: string;
    [key: string]: unknown; // Cho phép các key khác
}
// [THÊM] Interface cho payload
export interface ResetPasswordPayload {
    email: string;
    token: string;
    password: string;
    password_confirmation: string;
}
export const authService = {
    // LOGIN
    login: async (payload: LoginPayload): Promise<AuthResponse> => {
        try {
            console.log("🔵 [Auth Service] Login request:", payload);

            const data = await api.post<AuthResponse>("/auth/login", payload);

            console.log("🟢 [Auth Service] Login response:", data);

            if (!data || !data.access_token) {
                throw new Error("Không nhận được phản hồi từ server");
            }

            // Lưu cookie
            Cookies.set("access_token", data.access_token, {
                expires: 7,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
            });

            Cookies.set("user_info", JSON.stringify(data.user), {
                expires: 7,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
            });

            return data;
        } catch (error: unknown) {
            console.error("❌ [Auth Service] Login error:", error);

            let errorMessage = "Đăng nhập thất bại";

            if (error instanceof AxiosError) {
                // Trường hợp 1: Backend trả về JSON lỗi (400, 401, 422)
                if (
                    error.response?.data &&
                    typeof error.response.data === "object"
                ) {
                    // FIX 1: Thay 'any' bằng interface 'AuthErrorData'
                    const resData = error.response.data as AuthErrorData;
                    errorMessage =
                        resData.message || resData.error || error.message;
                }
                // Trường hợp 2: Backend trả về HTML hoặc String (Lỗi 500, Server chết)
                else if (typeof error.response?.data === "string") {
                    console.error(
                        "Server returned HTML error:",
                        error.response.data,
                    );
                    errorMessage = `Lỗi hệ thống (${error.response.status}). Vui lòng thử lại sau.`;
                } else {
                    errorMessage = error.message;
                }
            } else if (error instanceof Error) {
                errorMessage = error.message;
            }

            throw new Error(errorMessage);
        }
    },

    // REGISTER
    register: async (payload: RegisterPayload): Promise<AuthResponse> => {
        try {
            const data = await api.post<AuthResponse>(
                "/auth/register",
                payload,
            );

            if (data.access_token) {
                Cookies.set("access_token", data.access_token, { expires: 7 });
                Cookies.set("user_info", JSON.stringify(data.user), {
                    expires: 7,
                });
            }

            return data;
        } catch (error: unknown) {
            console.error("Register error:", error);

            let errorMessage = "Đăng ký thất bại";
            if (error instanceof AxiosError) {
                // FIX 2: Thay 'any' bằng interface 'AuthErrorData'
                const resData = error.response?.data as AuthErrorData;
                errorMessage = resData?.message || error.message;
            }
            throw new Error(errorMessage);
        }
    },

    // GET PROFILE
    getProfile: async (): Promise<User> => {
        try {
            return await api.get<User>("/auth/profile");
        } catch (error: unknown) {
            console.error("Get profile error:", error);
            throw error;
        }
    },

    // LOGOUT
    logout: async (): Promise<void> => {
        try {
            await api.post("/auth/logout");
        } catch (error: unknown) {
            console.error("Logout API error:", error);
        } finally {
            Cookies.remove("access_token");
            Cookies.remove("user_info");
            if (typeof window !== "undefined") {
                window.location.href = "/login";
            }
        }
    },

    // CHECK AUTH
    checkAuth: async (): Promise<{ authenticated: boolean; user?: User }> => {
        try {
            const user = await api.get<User>("/auth/profile");
            return {
                authenticated: true,
                user: user,
            };
        } catch {
            return { authenticated: false };
        }
    },
    // Thêm vào trong object authService
    updateProfile: async (data: { name: string; phone: string }) => {
        // Gọi API PUT /auth/profile (hoặc endpoint tương ứng của Laravel)
        const response = await api.put<{
            status: boolean;
            data: User;
            message: string;
        }>("/auth/profile", data);
        return response.data; // Trả về object User mới sau khi update
    },
    // [MỚI] Gửi yêu cầu quên mật khẩu
    forgotPassword: async (email: string) => {
        const response = await api.post<{ status: boolean; message: string }>(
            "/auth/forgot-password", 
            { email }
        );
        return response;
    },

    // [MỚI] Đặt lại mật khẩu
    resetPassword: async (payload: ResetPasswordPayload) => {
        const response = await api.post<{ status: boolean; message: string }>(
            "/auth/reset-password", 
            payload
        );
        return response;
    }
};
