"use client";

import { useState, useEffect } from "react";
import { X, AlertTriangle } from "lucide-react";

const STORAGE_KEY = "wedding_testmode_dismissed";

export default function TestModeModal() {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        if (typeof window === "undefined") return;
        const dismissed = sessionStorage.getItem(STORAGE_KEY);
        if (!dismissed) {
            setIsOpen(true);
        }
    }, []);

    const handleClose = () => {
        sessionStorage.setItem(STORAGE_KEY, "1");
        setIsOpen(false);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 relative animate-fade-in-up">
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 text-slate-300 hover:text-slate-600 transition"
                >
                    <X size={20} />
                </button>
                <div className="flex flex-col items-center text-center gap-4">
                    <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center">
                        <AlertTriangle size={28} className="text-amber-600" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg text-slate-900">테스트 중입니다</h3>
                        <p className="text-sm text-slate-500 mt-2">
                            구경·사용은 자유롭게 하셔도 됩니다.
                            <br />
                            <span className="text-amber-600 font-medium">다만 데이터가 언제든 삭제될 수 있으니</span>
                            <br />
                            중요한 내용은 백업해 주세요.
                        </p>
                    </div>
                    <button
                        onClick={handleClose}
                        className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition"
                    >
                        확인
                    </button>
                </div>
            </div>
        </div>
    );
}
