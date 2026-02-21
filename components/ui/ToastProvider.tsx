"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle, AlertCircle } from "lucide-react";

// ----------------------------------------------------------------------
// Alert Modal (단일 확인)
// ----------------------------------------------------------------------
type ToastContextType = {
    toast: (message: string) => Promise<void>;
    confirm: (message: string, options?: { confirmText?: string; cancelText?: string }) => Promise<boolean>;
};

const ToastContext = createContext<ToastContextType | null>(null);

export function useToast() {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error("useToast must be used within ToastProvider");
    return ctx;
}

export default function ToastProvider({ children }: { children: React.ReactNode }) {
    const [alertState, setAlertState] = useState<{ message: string; resolve: () => void } | null>(null);
    const [confirmState, setConfirmState] = useState<{
        message: string;
        confirmText: string;
        cancelText: string;
        resolve: (ok: boolean) => void;
    } | null>(null);

    const toast = useCallback((message: string) => {
        return new Promise<void>((resolve) => {
            setAlertState({ message, resolve });
        });
    }, []);

    const confirm = useCallback((message: string, options?: { confirmText?: string; cancelText?: string }) => {
        return new Promise<boolean>((resolve) => {
            setConfirmState({
                message,
                confirmText: options?.confirmText ?? "확인",
                cancelText: options?.cancelText ?? "취소",
                resolve,
            });
        });
    }, []);

    const closeAlert = useCallback(() => {
        alertState?.resolve();
        setAlertState(null);
    }, [alertState]);

    const closeConfirm = useCallback((ok: boolean) => {
        confirmState?.resolve(ok);
        setConfirmState(null);
    }, [confirmState]);

    return (
        <ToastContext.Provider value={{ toast, confirm }}>
            {children}

            {/* Alert Modal */}
            {alertState && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6 animate-fade-in" role="alertdialog">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeAlert} />
                    <div className="relative z-10 w-full max-w-[340px] rounded-[2rem] bg-white p-8 shadow-2xl border border-slate-100 animate-fade-in-up">
                        <div className="flex justify-center mb-6">
                            <div className="w-14 h-14 rounded-full bg-rose-50 flex items-center justify-center">
                                <CheckCircle size={28} className="text-rose-500" />
                            </div>
                        </div>
                        <p className="text-center text-slate-800 text-[15px] leading-relaxed whitespace-pre-line font-medium">
                            {alertState.message}
                        </p>
                        <button
                            onClick={closeAlert}
                            className="mt-8 w-full py-4 bg-slate-900 text-white rounded-2xl font-bold text-[15px] hover:bg-slate-800 active:scale-[0.98] transition"
                        >
                            확인
                        </button>
                    </div>
                </div>
            )}

            {/* Confirm Modal */}
            {confirmState && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6 animate-fade-in" role="alertdialog">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => closeConfirm(false)} />
                    <div className="relative z-10 w-full max-w-[340px] rounded-[2rem] bg-white p-8 shadow-2xl border border-slate-100 animate-fade-in-up">
                        <div className="flex justify-center mb-6">
                            <div className="w-14 h-14 rounded-full bg-amber-50 flex items-center justify-center">
                                <AlertCircle size={28} className="text-amber-600" />
                            </div>
                        </div>
                        <p className="text-center text-slate-800 text-[15px] leading-relaxed whitespace-pre-line font-medium">
                            {confirmState.message}
                        </p>
                        <div className="mt-8 flex gap-3">
                            <button
                                onClick={() => closeConfirm(false)}
                                className="flex-1 py-4 border border-slate-200 text-slate-600 rounded-2xl font-bold text-[15px] hover:bg-slate-50 active:scale-[0.98] transition"
                            >
                                {confirmState.cancelText}
                            </button>
                            <button
                                onClick={() => closeConfirm(true)}
                                className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-bold text-[15px] hover:bg-slate-800 active:scale-[0.98] transition"
                            >
                                {confirmState.confirmText}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </ToastContext.Provider>
    );
}
