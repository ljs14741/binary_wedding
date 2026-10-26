"use client";

import { useCallback, useEffect, useState } from "react";
import { Coffee, Trash2 } from "lucide-react";
import { getAdminDonations, createDonation, deleteDonation, type AdminDonation } from "@/app/actions-donations";
import { maskDonorName } from "@/lib/donations";

/** 오늘 날짜 YYYY-MM-DD (로컬 기준) */
function today(): string {
    const d = new Date();
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

/** 관리자: 카카오페이 후원 내역 직접 입력·삭제 */
export default function AdminDonations() {
    const [items, setItems] = useState<AdminDonation[] | null>(null);
    const [name, setName] = useState("");
    const [amount, setAmount] = useState("");
    const [date, setDate] = useState(today);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const load = useCallback(async () => {
        try {
            setItems(await getAdminDonations());
        } catch {
            setItems([]);
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError("");
        try {
            const res = await createDonation({ donor_name: name, amount: Number(amount.replace(/,/g, "")), date });
            if (!res.success) {
                setError(res.message ?? "저장에 실패했습니다.");
                return;
            }
            setName("");
            setAmount("");
            await load();
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (d: AdminDonation) => {
        if (!confirm(`${d.donor_name}님 ${d.amount.toLocaleString()}원 내역을 삭제할까요?`)) return;
        await deleteDonation(d.id);
        await load();
    };

    const total = items?.reduce((sum, d) => sum + d.amount, 0) ?? 0;

    return (
        <section>
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Coffee size={16} />
                후원 내역
                {items && items.length > 0 && (
                    <span className="normal-case tracking-normal font-medium text-slate-400">· {items.length}건 · 합계 {total.toLocaleString()}원</span>
                )}
            </h2>

            <form onSubmit={handleAdd} className="mb-4 grid grid-cols-2 sm:grid-cols-[1fr_1fr_1fr_auto] gap-2">
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="이름 (실명 입력, 공개 시 가려짐)" maxLength={20} required
                       className="col-span-2 sm:col-span-1 px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm outline-none focus:border-slate-400"/>
                <input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="금액 (원)" inputMode="numeric" required
                       className="px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm outline-none focus:border-slate-400"/>
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required
                       className="px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm outline-none focus:border-slate-400"/>
                <button type="submit" disabled={saving}
                        className="col-span-2 sm:col-span-1 px-5 py-3 bg-slate-900 text-white rounded-xl font-medium text-sm hover:bg-slate-800 disabled:opacity-60 transition">
                    {saving ? "저장 중..." : "추가"}
                </button>
            </form>
            {name.trim() && <p className="-mt-2 mb-3 text-xs text-slate-400">공개 표시: <b className="text-slate-600">{maskDonorName(name)}님</b></p>}
            {error && <p className="-mt-2 mb-3 text-xs text-rose-500">{error}</p>}

            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                {!items ? (
                    <div className="p-8 text-center text-slate-400 text-sm">로딩 중...</div>
                ) : items.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 text-sm">아직 등록된 후원 내역이 없습니다.</div>
                ) : (
                    <ul className="divide-y divide-slate-100">
                        {items.map((d) => (
                            <li key={d.id} className="px-4 py-3 flex items-center gap-3 text-sm">
                                <span className="font-medium text-slate-900 min-w-0 truncate">{d.donor_name}</span>
                                <span className="text-xs text-slate-400">({maskDonorName(d.donor_name)})</span>
                                <span className="ml-auto font-bold text-slate-700 tabular-nums">{d.amount.toLocaleString()}원</span>
                                <span className="text-slate-400 tabular-nums">{d.date}</span>
                                <button type="button" onClick={() => handleDelete(d)} aria-label="삭제"
                                        className="p-1.5 text-slate-300 hover:text-rose-500 transition">
                                    <Trash2 size={16} />
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </section>
    );
}
