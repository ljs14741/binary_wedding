"use client";

/** 만들기·수정 폼 상단 고정 바로가기 칩 */
export default function FormSectionNav({ sections }: { sections: { id: string; label: string }[] }) {
    const go = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    return (
        <nav aria-label="입력 항목 바로가기"
             className="sticky top-16 sm:top-[76px] z-30 -mx-4 px-4 py-3 mb-8 bg-[#FDFCFB]/90 backdrop-blur-md">
            <div className="flex gap-2 overflow-x-auto no-scrollbar">
                {sections.map((s, i) => (
                    <button key={s.id} type="button" onClick={() => go(s.id)}
                            className="shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white border border-slate-200 text-xs font-bold text-slate-600 shadow-sm hover:border-rose-300 hover:text-rose-500 transition">
                        <span className="w-4 h-4 rounded-full bg-slate-100 text-[10px] flex items-center justify-center text-slate-500">{i + 1}</span>
                        {s.label}
                    </button>
                ))}
            </div>
        </nav>
    );
}
