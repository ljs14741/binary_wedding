"use client";

import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { getPublicDonations } from "@/app/actions-donations";
import type { PublicDonation } from "@/lib/donations";

const COLLAPSED_COUNT = 3;

/** 후원해주신 분들 목록. 아직 후원이 없으면 아무것도 안 그림 */
export default function DonorWall({ className = "" }: { className?: string }) {
    const [data, setData] = useState<{ count: number; items: PublicDonation[] } | null>(null);
    const [expanded, setExpanded] = useState(false);

    useEffect(() => {
        getPublicDonations().then(setData).catch(() => setData(null));
    }, []);

    if (!data || data.count === 0) return null;

    const visible = expanded ? data.items : data.items.slice(0, COLLAPSED_COUNT);
    const canExpand = data.items.length > COLLAPSED_COUNT;

    return (
        <div className={`bg-rose-50/60 border border-rose-100 rounded-2xl p-4 text-left ${className}`}>
            <p className="text-xs font-bold text-rose-500 flex items-center gap-1.5 mb-2.5">
                <Heart size={12} fill="currentColor"/> 후원해주신 분들 {data.count}명, 정말 감사합니다
            </p>
            <ul className={`space-y-1.5 ${expanded ? "max-h-56 overflow-y-auto pr-1" : ""}`}>
                {visible.map((d) => (
                    <li key={d.id} className="flex items-center justify-between gap-3 text-xs">
                        <span className="font-bold text-slate-700">{d.name}님</span>
                        <span className="flex items-center gap-2 text-slate-500 tabular-nums">
                            <span className="font-bold text-slate-700">{d.amount.toLocaleString()}원</span>
                            <span className="text-slate-400">{d.date.slice(2).replace(/-/g, ".")}</span>
                        </span>
                    </li>
                ))}
            </ul>
            {canExpand && (
                <button type="button" onClick={() => setExpanded((v) => !v)}
                        className="mt-2.5 text-[11px] font-bold text-slate-400 hover:text-rose-500">
                    {expanded ? "접기" : `전체 보기 (${data.items.length})`}
                </button>
            )}
        </div>
    );
}
