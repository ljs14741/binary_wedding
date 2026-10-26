"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

type Props = {
    label: string;
    /** 버튼 옆 작은 설명 */
    hint?: string;
    /** 이미 값이 있으면 펼친 채로 시작 (수정 화면·임시저장 복원) */
    defaultOpen?: boolean;
    children: React.ReactNode;
};

/**
 * 선택 항목을 "+ 추가" 버튼 뒤로 접어둠
 * 접혀 있어도 내용은 숨기기만 해서 폼 값은 그대로 제출됨 (수정 시 기존 값 지워짐 방지)
 */
export default function FormReveal({ label, hint, defaultOpen = false, children }: Props) {
    const [open, setOpen] = useState(defaultOpen);
    return (
        <div>
            {!open && (
                <button type="button" onClick={() => setOpen(true)}
                        className="w-full flex items-center gap-2 px-5 py-3.5 rounded-2xl border border-dashed border-slate-200 text-sm font-bold text-slate-500 hover:border-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-all text-left">
                    <Plus size={16} className="shrink-0"/>
                    <span>{label}</span>
                    {hint && <span className="text-xs font-medium text-slate-400 truncate">{hint}</span>}
                </button>
            )}
            <div className={open ? "space-y-6" : "hidden"}>{children}</div>
        </div>
    );
}
