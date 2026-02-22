"use client";

import React, { useState, useEffect, useCallback, useId } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
    Star,
    Plus,
    Pencil,
    Trash2,
    X,
    ChevronDown,
    MessageSquare,
} from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { useToast } from "@/components/ui/ToastProvider";
import {
    getReviews,
    createReview,
    updateReview,
    deleteReview,
} from "@/app/actions";

interface Review {
    id: number;
    author_name: string;
    content: string;
    rating: number | null;
    created_at: Date;
}

export default function ReviewsPage() {
    const { toast } = useToast();
    const [data, setData] = useState<{
        items: Review[];
        total: number;
        totalPages: number;
        currentPage: number;
        averageRating: number | null;
        ratingCount: number;
    } | null>(null);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [isWriteOpen, setIsWriteOpen] = useState(false);
    const [editTarget, setEditTarget] = useState<Review | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<Review | null>(null);

    const load = useCallback(async (page: number = 1, append = false) => {
        if (append) setLoadingMore(true);
        else setLoading(true);
        try {
            const res = await getReviews(page);
            setData((prev) => {
                if (append && prev) {
                    return {
                        ...res,
                        items: [...prev.items, ...res.items],
                    };
                }
                return res;
            });
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, []);

    useEffect(() => {
        load(1);
    }, [load]);

    const handleLoadMore = () => {
        if (!data || data.currentPage >= data.totalPages) return;
        load(data.currentPage + 1, true);
    };

    return (
        <div className="min-h-screen bg-[#FAFAFA] font-sans flex flex-col">
            <SiteHeader />
            <main className="flex-1 pt-28 pb-24 px-4 sm:px-6">
                <div className="max-w-4xl mx-auto">
                    <Link
                        href="/"
                        className="text-xs font-semibold text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-wider inline-flex items-center gap-1 mb-10"
                    >
                        ← 메인으로
                    </Link>

                    {/* 헤더 - 판교 스타일 */}
                    <div className="mb-14">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 text-slate-500 text-xs font-semibold tracking-wider mb-4">
                            <Star size={12} className="text-amber-400 fill-amber-400" />
                            실제 사용자 후기
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight mb-3">
                            이용후기
                        </h1>
                        <p className="text-slate-500 text-[15px] max-w-xl mb-6">
                            Binary Wedding을 이용해 주신 분들의 생생한 후기입니다.
                            후기를 남겨주시면 다른 예비 부부분들께 큰 도움이 됩니다.
                        </p>
                        {data && data.averageRating != null && data.ratingCount > 0 && (
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1">
                                    <Star size={20} className="text-amber-400 fill-amber-400" />
                                    <span className="text-xl font-bold text-slate-900">{data.averageRating.toFixed(1)}</span>
                                </div>
                                <span className="text-slate-400 text-sm">
                                    별점 {data.ratingCount}개
                                </span>
                            </div>
                        )}
                    </div>

                    {/* 작성 버튼 */}
                    <button
                        onClick={() => setIsWriteOpen(true)}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-4 bg-slate-900 text-white rounded-xl font-semibold text-sm hover:bg-slate-800 transition-all shadow-sm hover:shadow-md mb-12"
                    >
                        <Plus size={18} /> 후기 작성하기
                    </button>

                    {/* 리스트 */}
                    {loading ? (
                        <div className="grid gap-4 sm:gap-5">
                            {[1, 2, 3].map((i) => (
                                <div
                                    key={i}
                                    className="h-32 bg-slate-100 rounded-xl animate-pulse"
                                />
                            ))}
                        </div>
                    ) : data?.items.length === 0 ? (
                        <div className="py-24 text-center rounded-2xl border border-dashed border-slate-200 bg-white/50">
                            <MessageSquare className="mx-auto text-slate-300 mb-4" size={48} />
                            <p className="text-slate-500 font-medium">아직 등록된 후기가 없습니다.</p>
                            <p className="text-slate-400 text-sm mt-2">첫 번째 후기를 남겨주세요!</p>
                        </div>
                    ) : (
                        <div className="grid gap-4 sm:gap-5">
                            <AnimatePresence mode="popLayout">
                                {data?.items.map((item, idx) => (
                                    <motion.article
                                        key={item.id}
                                        initial={{ opacity: 0, y: 16 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.3, delay: idx * 0.03 }}
                                        className="group bg-white rounded-2xl p-6 sm:p-7 border border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200 transition-all duration-200"
                                    >
                                        <div className="flex justify-between items-start gap-4">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <p className="text-slate-900 font-semibold text-[15px]">
                                                        {item.author_name}
                                                    </p>
                                                    {item.rating != null && (
                                                        <div className="flex items-center gap-0.5">
                                                            {[1, 2, 3, 4, 5].map((n) => (
                                                                <Star
                                                                    key={n}
                                                                    size={14}
                                                                    className={n <= item.rating! ? "text-amber-400 fill-amber-400" : "text-slate-200"}
                                                                />
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                                <p className="text-slate-600 text-[14px] leading-[1.7] whitespace-pre-wrap">
                                                    {item.content}
                                                </p>
                                                <time className="text-slate-400 text-xs mt-4 block">
                                                    {new Date(item.created_at).toLocaleDateString("ko-KR", {
                                                        year: "numeric",
                                                        month: "long",
                                                        day: "numeric",
                                                    })}
                                                </time>
                                            </div>
                                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => setEditTarget(item)}
                                                    className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                                                    title="수정"
                                                >
                                                    <Pencil size={16} />
                                                </button>
                                                <button
                                                    onClick={() => setDeleteTarget(item)}
                                                    className="p-2 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition"
                                                    title="삭제"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    </motion.article>
                                ))}
                            </AnimatePresence>

                            {/* 더 보기 */}
                            {data &&
                                data.currentPage < data.totalPages &&
                                !loadingMore && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="flex justify-center pt-6"
                                    >
                                        <button
                                            onClick={handleLoadMore}
                                            className="flex items-center gap-2 px-6 py-3 rounded-xl border border-slate-200 text-slate-600 font-medium text-sm hover:bg-slate-50 hover:border-slate-300 transition"
                                        >
                                            <ChevronDown size={18} />
                                            더 보기 ({data.items.length} / {data.total})
                                        </button>
                                    </motion.div>
                                )}
                            {loadingMore && (
                                <div className="flex justify-center py-6">
                                    <div className="w-8 h-8 border-2 border-slate-200 border-t-slate-600 rounded-full animate-spin" />
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>
            <SiteFooter />

            {/* 작성 모달 */}
            {isWriteOpen && (
                <ReviewWriteModal
                    onClose={() => setIsWriteOpen(false)}
                    onSuccess={async (msg) => {
                        setIsWriteOpen(false);
                        await toast(msg);
                        load(1);
                    }}
                />
            )}

            {/* 수정 모달 */}
            {editTarget && (
                <ReviewEditModal
                    entry={editTarget}
                    onClose={() => setEditTarget(null)}
                    onSuccess={async (msg) => {
                        setEditTarget(null);
                        await toast(msg);
                        load(1);
                    }}
                />
            )}

            {/* 삭제 모달 */}
            {deleteTarget && (
                <ReviewDeleteModal
                    entry={deleteTarget}
                    onClose={() => setDeleteTarget(null)}
                    onSuccess={async (msg) => {
                        setDeleteTarget(null);
                        await toast(msg);
                        load(1);
                    }}
                />
            )}
        </div>
    );
}

function StarRatingInput({
    name,
    value,
    onChange,
}: {
    name?: string;
    value?: number | null;
    onChange?: (v: number | null) => void;
}) {
    const id = useId();
    const isControlled = onChange != null;
    const [internal, setInternal] = useState<number | null>(value ?? null);
    const current = isControlled ? (value ?? null) : internal;

    const handleClick = (n: number) => {
        const next = current === n ? null : n;
        if (isControlled) onChange?.(next);
        else setInternal(next);
    };

    return (
        <div className="flex items-center gap-1">
            {name && <input type="hidden" name={name} value={current ?? ""} />}
            {[1, 2, 3, 4, 5].map((n) => (
                <button
                    key={n}
                    type="button"
                    onClick={() => handleClick(n)}
                    className="p-0.5 rounded hover:bg-amber-50 transition"
                    aria-label={`${n}점`}
                >
                    <Star
                        size={24}
                        className={n <= (current ?? 0) ? "text-amber-400 fill-amber-400" : "text-slate-200"}
                    />
                </button>
            ))}
        </div>
    );
}

function ReviewWriteModal({
    onClose,
    onSuccess,
}: {
    onClose: () => void;
    onSuccess: (msg: string) => Promise<void>;
}) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError("");
        const formData = new FormData(e.currentTarget);
        const result = await createReview(formData);
        setIsSubmitting(false);
        if (result.success) {
            await onSuccess(result.message);
        } else {
            setError(result.message || "등록에 실패했습니다.");
        }
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6" role="dialog">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="relative z-10 w-full max-w-[420px] bg-white rounded-2xl p-8 shadow-xl border border-slate-100"
            >
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 text-slate-300 hover:text-slate-500 transition"
                >
                    <X size={22} />
                </button>
                <h3 className="text-xl font-bold text-slate-900 mb-6">후기 작성</h3>
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                            별점 <span className="text-slate-400 font-normal">(선택)</span>
                        </label>
                        <StarRatingInput name="rating" />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">닉네임</label>
                        <input
                            name="author_name"
                            type="text"
                            placeholder="닉네임을 입력해주세요"
                            required
                            maxLength={50}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 focus:border-transparent"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                            비밀번호 <span className="text-slate-400 font-normal">(수정/삭제 시 필요)</span>
                        </label>
                        <input
                            name="password"
                            type="password"
                            placeholder="4~20자"
                            required
                            minLength={4}
                            maxLength={20}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 focus:border-transparent"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">후기 내용</label>
                        <textarea
                            name="content"
                            rows={4}
                            placeholder="Binary Wedding 이용 후기를 자유롭게 작성해주세요"
                            required
                            maxLength={1000}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 focus:border-transparent resize-none leading-relaxed"
                        />
                        <p className="text-xs text-slate-400 mt-1">최대 1000자</p>
                    </div>
                    {error && <p className="text-rose-500 text-sm font-medium">{error}</p>}
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-4 bg-slate-900 text-white rounded-xl font-semibold text-sm hover:bg-slate-800 disabled:opacity-60 transition"
                    >
                        {isSubmitting ? "등록 중..." : "등록하기"}
                    </button>
                </form>
            </motion.div>
        </div>
    );
}

function ReviewEditModal({
    entry,
    onClose,
    onSuccess,
}: {
    entry: Review;
    onClose: () => void;
    onSuccess: (msg: string) => Promise<void>;
}) {
    const [author_name, setAuthorName] = useState(entry.author_name);
    const [content, setContent] = useState(entry.content);
    const [rating, setRating] = useState<number | null>(entry.rating);
    const [password, setPassword] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!password) {
            setError("비밀번호를 입력해 주세요.");
            return;
        }
        setIsSubmitting(true);
        setError("");
        const result = await updateReview(entry.id, password, author_name, content, rating);
        setIsSubmitting(false);
        if (result.success) {
            await onSuccess(result.message);
        } else {
            setError(result.message || "수정에 실패했습니다.");
        }
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6" role="dialog">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="relative z-10 w-full max-w-[420px] bg-white rounded-2xl p-8 shadow-xl border border-slate-100"
            >
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 text-slate-300 hover:text-slate-500 transition"
                >
                    <X size={22} />
                </button>
                <h3 className="text-xl font-bold text-slate-900 mb-6">후기 수정</h3>
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                            별점 <span className="text-slate-400 font-normal">(선택)</span>
                        </label>
                        <StarRatingInput name="rating" value={rating} onChange={setRating} />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">닉네임</label>
                        <input
                            type="text"
                            value={author_name}
                            onChange={(e) => setAuthorName(e.target.value)}
                            required
                            maxLength={50}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">내용</label>
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            rows={4}
                            required
                            maxLength={1000}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 resize-none leading-relaxed"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">비밀번호</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="작성 시 입력한 비밀번호"
                            required
                            minLength={4}
                            maxLength={20}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
                        />
                    </div>
                    {error && <p className="text-rose-500 text-sm font-medium">{error}</p>}
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-4 bg-slate-900 text-white rounded-xl font-semibold text-sm hover:bg-slate-800 disabled:opacity-60 transition"
                    >
                        {isSubmitting ? "수정 중..." : "수정하기"}
                    </button>
                </form>
            </motion.div>
        </div>
    );
}

function ReviewDeleteModal({
    entry,
    onClose,
    onSuccess,
}: {
    entry: Review;
    onClose: () => void;
    onSuccess: (msg: string) => Promise<void>;
}) {
    const [password, setPassword] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!password) {
            setError("비밀번호를 입력해 주세요.");
            return;
        }
        setIsSubmitting(true);
        setError("");
        const result = await deleteReview(entry.id, password);
        setIsSubmitting(false);
        if (result.success) {
            await onSuccess(result.message);
        } else {
            setError(result.message || "삭제에 실패했습니다.");
        }
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6" role="dialog">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="relative z-10 w-full max-w-[400px] bg-white rounded-2xl p-8 shadow-xl border border-slate-100"
            >
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 text-slate-300 hover:text-slate-500 transition"
                >
                    <X size={22} />
                </button>
                <h3 className="text-xl font-bold text-slate-900 mb-2">후기 삭제</h3>
                <p className="text-slate-500 text-sm mb-6">
                    "{entry.content.slice(0, 60)}{entry.content.length > 60 ? "..." : ""}"
                </p>
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">비밀번호</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="작성 시 입력한 비밀번호"
                            required
                            minLength={4}
                            maxLength={20}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
                        />
                    </div>
                    {error && <p className="text-rose-500 text-sm font-medium">{error}</p>}
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-4 border border-slate-200 text-slate-600 rounded-xl font-semibold text-sm hover:bg-slate-50 transition"
                        >
                            취소
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 py-4 bg-rose-500 text-white rounded-xl font-semibold text-sm hover:bg-rose-600 disabled:opacity-60 transition"
                        >
                            {isSubmitting ? "삭제 중..." : "삭제"}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}
