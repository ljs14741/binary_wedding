"use client";

import { useState } from "react";
import { adminLogin } from "@/lib/admin-auth";
import { Lock, Shield } from "lucide-react";

export default function AdminLoginForm() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        const formData = new FormData(e.currentTarget);
        const res = await adminLogin(formData);
        if (res.success) {
            window.location.reload();
        } else {
            setError(res.message ?? "로그인에 실패했습니다.");
        }
        setLoading(false);
    };

    return (
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-slate-100 rounded-xl">
                    <Shield className="text-slate-600" size={28} />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-slate-900">관리자 로그인</h1>
                    <p className="text-sm text-slate-500">ADMIN_SECRET 입력</p>
                </div>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5">비밀번호</label>
                    <div className="relative">
                        <Lock className="absolute left-4 top-4 text-slate-400" size={18} />
                        <input
                            name="password"
                            type="password"
                            required
                            autoComplete="current-password"
                            placeholder="관리자 비밀번호"
                            className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-slate-600 focus:ring-1 focus:ring-slate-600 outline-none font-mono text-slate-900"
                        />
                    </div>
                </div>
                {error && (
                    <div className="p-3 bg-rose-50 text-rose-600 text-sm font-medium rounded-lg border border-rose-100">
                        {error}
                    </div>
                )}
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {loading ? "확인 중..." : "로그인"}
                </button>
            </form>
        </div>
    );
}
