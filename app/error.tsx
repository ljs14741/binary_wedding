"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, Home, RefreshCw } from "lucide-react";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="min-h-screen bg-[#FAFAFA] flex flex-col items-center justify-center px-6">
            <div className="max-w-md w-full text-center space-y-8">
                <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto">
                    <AlertCircle className="text-rose-500" size={40} />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-slate-900 mb-2">문제가 발생했어요</h1>
                    <p className="text-slate-500 text-sm leading-relaxed">
                        일시적인 오류일 수 있습니다.<br />
                        다시 시도하시거나 메인으로 돌아가 주세요.
                    </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                        onClick={reset}
                        className="flex items-center justify-center gap-2 px-6 py-4 bg-slate-900 text-white rounded-xl font-semibold text-sm hover:bg-slate-800 transition"
                    >
                        <RefreshCw size={18} /> 다시 시도
                    </button>
                    <Link
                        href="/"
                        className="flex items-center justify-center gap-2 px-6 py-4 border border-slate-200 text-slate-700 rounded-xl font-semibold text-sm hover:bg-slate-50 transition"
                    >
                        <Home size={18} /> 메인으로
                    </Link>
                </div>
            </div>
        </div>
    );
}
