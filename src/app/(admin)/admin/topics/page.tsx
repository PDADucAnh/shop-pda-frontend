"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { topicService, Topic } from "@/services/topic.service";
import { Plus, Edit, Trash2, Loader2 } from "lucide-react";
import { AxiosError } from "axios";

export default function TopicListPage() {
    const [topics, setTopics] = useState<Topic[]>([]);
    const [loading, setLoading] = useState(true);

    // Load dữ liệu
    const fetchTopics = async () => {
        try {
            const res = await topicService.getAll();
            console.log("Dữ liệu Topics trả về:", res);
            // Kiểm tra kỹ cấu trúc trước khi set
            if (res && res.status) {
                setTopics(res.topics);
            } else {
                console.error("API trả về lỗi hoặc sai cấu trúc:", res);
                setTopics([]); // Set rỗng để tránh lỗi map
            }
        } catch (error) {
            console.error("Failed to fetch topics", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTopics();
    }, []);

    // Xử lý xóa
    const handleDelete = async (id: number) => {
        if (!confirm("Bạn có chắc chắn muốn xóa chủ đề này?")) return;
        try {
            await topicService.delete(id);
            setTopics(topics.filter((t) => t.id !== id));
            alert("Xóa thành công!");
        } catch (error) {
            const err = error as AxiosError<{ message: string }>;
            alert("Lỗi: " + (err.response?.data?.message || "Không thể xóa"));
        }
    };

    if (loading)
        return (
            <div className="p-6">
                <Loader2 className="animate-spin" />
            </div>
        );

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">
                    Quản lý Chủ đề
                </h1>
                <Link
                    href="/admin/topics/create"
                    className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-blue-700"
                >
                    <Plus size={20} /> Thêm mới
                </Link>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                ID
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Tên chủ đề
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Slug
                            </th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                                Thứ tự
                            </th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                                Trạng thái
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                Hành động
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {topics.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={6}
                                    className="px-6 py-4 text-center text-gray-500"
                                >
                                    Chưa có dữ liệu
                                </td>
                            </tr>
                        ) : (
                            topics.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        #{item.id}
                                    </td>
                                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                        {item.name}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {item.slug}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-center">
                                        {item.sort_order}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span
                                            className={`px-2 py-1 text-xs rounded-full ${
                                                item.status === 1
                                                    ? "bg-green-100 text-green-800"
                                                    : "bg-red-100 text-red-800"
                                            }`}
                                        >
                                            {item.status === 1
                                                ? "Hiển thị"
                                                : "Ẩn"}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right flex justify-end gap-3">
                                        <Link
                                            href={`/admin/topics/edit/${item.id}`}
                                            className="text-blue-600 hover:text-blue-800"
                                        >
                                            <Edit size={18} />
                                        </Link>
                                        <button
                                            onClick={() =>
                                                handleDelete(item.id)
                                            }
                                            className="text-red-600 hover:text-red-800"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
