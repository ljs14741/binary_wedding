"use client";

import React, { useState } from "react";
import { X, MessageSquare } from "lucide-react";
import { createGuestbookEntry, updateGuestbookEntry, deleteGuestbookEntry } from "@/app/actions";
import type { GuestbookEntry } from "./types";

type Toast = (m: string) => Promise<void>;

const inputCls = "w-full px-5 py-4 bg-[#FDFBF9] border border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-1 focus:ring-rose-50 transition-all text-gray-900";
const labelCls = "text-[13px] font-bold text-gray-800 ml-1";
const primaryBtnCls = "w-full py-5 bg-[#B19888] text-white rounded-[1.5rem] font-bold text-[15px] shadow-lg shadow-rose-50/50 active:scale-[0.98] transition-all mt-4 disabled:opacity-70";

function ModalShell({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6" role="dialog" aria-modal="true">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}/>
            <div className="bg-white w-full max-w-[380px] rounded-[2.5rem] p-10 relative z-10 animate-fade-in-up shadow-2xl border border-rose-50">
                <button onClick={onClose} className="absolute top-8 right-8 text-gray-300 hover:text-gray-500 transition"><X/></button>
                {children}
            </div>
        </div>
    );
}

/** 방명록 작성. isSample이면 등록 대신 안내 토스트 */
export function GuestbookWriteModal({ toast, url_id, isSample, onClose, onSuccess }: {
    toast: Toast; url_id: string; isSample?: boolean; onClose: () => void; onSuccess: () => void;
}) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (isSample) {
            toast("샘플 페이지에서는 작성이 불가능합니다.");
            return;
        }
        setIsSubmitting(true);
        setError("");
        const formData = new FormData(e.currentTarget);
        formData.set("author_name", (formData.get("author_name") as string) || "");
        formData.set("password", (formData.get("password") as string) || "");
        formData.set("message", (formData.get("message") as string) || "");
        const result = await createGuestbookEntry(url_id, formData);
        setIsSubmitting(false);
        if (result.success) {
            await toast(result.message);
            onSuccess();
        } else {
            setError(result.message || "등록에 실패했습니다.");
        }
    };

    return (
        <ModalShell onClose={onClose}>
            <div className="text-center mb-10 text-gray-800">
                <MessageSquare className="mx-auto text-rose-100 mb-4" size={36}/>
                <h4 className="font-serif text-xl font-bold italic underline underline-offset-8 decoration-rose-50">축하 메시지 작성</h4>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6 text-left">
                <div className="space-y-2">
                    <label htmlFor="writerName" className={labelCls}>성함</label>
                    <input id="writerName" name="author_name" type="text" placeholder="성함을 입력해주세요" required maxLength={50}
                           className={`${inputCls} font-medium`}/>
                </div>
                <div className="space-y-2">
                    <label htmlFor="writerPw" className={labelCls}>비밀번호</label>
                    <input id="writerPw" name="password" type="password" placeholder="비밀번호 입력 (수정/삭제 시 필요)" required minLength={4} maxLength={20}
                           className={inputCls}/>
                </div>
                <div className="space-y-2">
                    <label htmlFor="writerMsg" className={labelCls}>메시지</label>
                    <textarea id="writerMsg" name="message" rows={4} placeholder="소중한 축하의 마음을 남겨주세요" required maxLength={500}
                              className={`${inputCls} resize-none leading-relaxed`}/>
                </div>
                {error && <p className="text-rose-500 text-sm font-bold">{error}</p>}
                <button type="submit" disabled={isSubmitting} className={primaryBtnCls}>
                    {isSubmitting ? "등록 중..." : "등록하기"}
                </button>
            </form>
        </ModalShell>
    );
}

export function GuestbookEditModal({ toast, entry, onClose, onSuccess }: {
    toast: Toast; entry: GuestbookEntry; onClose: () => void; onSuccess: () => void;
}) {
    const [author_name, setAuthorName] = useState(entry.author_name);
    const [message, setMessage] = useState(entry.message);
    const [password, setPassword] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!password) { setError("비밀번호를 입력해 주세요."); return; }
        setIsSubmitting(true);
        setError("");
        const result = await updateGuestbookEntry(entry.id, password, author_name, message);
        setIsSubmitting(false);
        if (result.success) {
            await toast(result.message);
            onSuccess();
        } else {
            setError(result.message || "수정에 실패했습니다.");
        }
    };

    return (
        <ModalShell onClose={onClose}>
            <div className="text-center mb-10 text-gray-800">
                <h4 className="font-serif text-xl font-bold italic underline underline-offset-8 decoration-rose-50">방명록 수정</h4>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6 text-left">
                <div className="space-y-2">
                    <label className={labelCls}>성함</label>
                    <input type="text" value={author_name} onChange={(e) => setAuthorName(e.target.value)} required maxLength={50}
                           className={`${inputCls} font-medium`}/>
                </div>
                <div className="space-y-2">
                    <label className={labelCls}>메시지</label>
                    <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={4} required maxLength={500}
                              className={`${inputCls} resize-none leading-relaxed`}/>
                </div>
                <div className="space-y-2">
                    <label className={labelCls}>비밀번호</label>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="작성 시 입력한 비밀번호" required minLength={4} maxLength={20}
                           className={inputCls}/>
                </div>
                {error && <p className="text-rose-500 text-sm font-bold">{error}</p>}
                <button type="submit" disabled={isSubmitting} className={primaryBtnCls}>
                    {isSubmitting ? "수정 중..." : "수정하기"}
                </button>
            </form>
        </ModalShell>
    );
}

export function GuestbookDeleteModal({ toast, entry, onClose, onSuccess }: {
    toast: Toast; entry: GuestbookEntry; onClose: () => void; onSuccess: () => void;
}) {
    const [password, setPassword] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!password) { setError("비밀번호를 입력해 주세요."); return; }
        setIsSubmitting(true);
        setError("");
        const result = await deleteGuestbookEntry(entry.id, password);
        setIsSubmitting(false);
        if (result.success) {
            await toast(result.message);
            onSuccess();
        } else {
            setError(result.message || "삭제에 실패했습니다.");
        }
    };

    const preview = entry.message.slice(0, 50) + (entry.message.length > 50 ? "..." : "");

    return (
        <ModalShell onClose={onClose}>
            <div className="text-center mb-10 text-gray-800">
                <h4 className="font-serif text-xl font-bold italic underline underline-offset-8 decoration-rose-50">방명록 삭제</h4>
                <p className="text-sm text-gray-500 mt-4 line-clamp-2">&ldquo;{preview}&rdquo;</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6 text-left">
                <div className="space-y-2">
                    <label className={labelCls}>비밀번호</label>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="작성 시 입력한 비밀번호" required minLength={4} maxLength={20}
                           className={inputCls}/>
                </div>
                {error && <p className="text-rose-500 text-sm font-bold">{error}</p>}
                <div className="flex gap-3">
                    <button type="button" onClick={onClose} className="flex-1 py-5 border border-gray-200 text-gray-600 rounded-[1.5rem] font-bold text-[15px] hover:bg-gray-50 transition">
                        취소
                    </button>
                    <button type="submit" disabled={isSubmitting}
                            className="flex-1 py-5 bg-rose-500 text-white rounded-[1.5rem] font-bold text-[15px] shadow-lg active:scale-[0.98] transition-all disabled:opacity-70">
                        {isSubmitting ? "삭제 중..." : "삭제하기"}
                    </button>
                </div>
            </form>
        </ModalShell>
    );
}
