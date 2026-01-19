"use client";

import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { topicService } from "@/services/topic.service";
import { Save, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { AxiosError } from "axios";

interface TopicFormInput {
    name: string;
    description: string;
    sort_order: number;
    status: boolean; // Dùng boolean cho checkbox, gửi lên server convert sang 1/0
}

export default function CreateTopicPage() {
    const router = useRouter();
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<TopicFormInput>({
        defaultValues: { sort_order: 0, status: true },
    });

    const onSubmit = async (data: TopicFormInput) => {
        try {
            await topicService.create({
                ...data,
                status: data.status ? 1 : 0,
            });
            alert("Thêm chủ đề thành công!");
            router.push("/admin/topics");
        } catch (error) {
            const err = error as AxiosError<{ message: string }>;
            alert("Lỗi: " + (err.response?.data?.message || err.message));
        }
    };

    return (
        <div className="p-6 max-w-2xl mx-auto">
            <div className="flex items-center gap-4 mb-6">
                <Link
                    href="/admin/topics"
                    className="p-2 bg-white border rounded hover:bg-gray-50"
                >
                    <ArrowLeft size={20} />
                </Link>
                <h1 className="text-2xl font-bold text-gray-800">
                    Thêm Chủ đề Mới
                </h1>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    {/* Tên chủ đề */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Tên chủ đề
                        </label>
                        <input
                            {...register("name", {
                                required: "Tên chủ đề là bắt buộc",
                            })}
                            className="w-full border border-gray-300 px-4 py-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="Nhập tên chủ đề..."
                        />
                        {errors.name && (
                            <span className="text-red-500 text-xs">
                                {errors.name.message}
                            </span>
                        )}
                    </div>

                    {/* Mô tả */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Mô tả
                        </label>
                        <textarea
                            {...register("description")}
                            rows={3}
                            className="w-full border border-gray-300 px-4 py-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                        ></textarea>
                    </div>

                    {/* Thứ tự & Trạng thái */}
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Thứ tự sắp xếp
                            </label>
                            <input
                                type="number"
                                {...register("sort_order")}
                                className="w-full border border-gray-300 px-4 py-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>

                        <div className="flex items-center mt-6">
                            <label className="flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    {...register("status")}
                                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                                />
                                <span className="ml-2 text-sm text-gray-700 font-medium">
                                    Kích hoạt (Hiển thị)
                                </span>
                            </label>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-blue-600 text-white py-2 px-4 rounded font-medium hover:bg-blue-700 flex items-center justify-center gap-2 disabled:opacity-70"
                        >
                            {isSubmitting ? (
                                "Đang lưu..."
                            ) : (
                                <>
                                    <Save size={20} /> Lưu Chủ đề
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
