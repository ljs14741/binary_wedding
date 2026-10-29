"use client";

import { useState } from "react";

const OPTIONS = [
    { value: "white", label: "흰 글씨", hint: "어두운 사진", swatch: "bg-white ring-1 ring-slate-300" },
    { value: "dark", label: "검은 글씨", hint: "밝은 사진", swatch: "bg-slate-900" },
] as const;

/**
 * 클래식 메인 사진 위 이름·날짜 글자색. 기본 흰색, 밝은 사진이면 검정으로
 * (템플릿 바꿔도 값 유지하려고 숨기기만 함)
 */
export default function HeroTextColorPicker({ defaultValue, visible }: { defaultValue?: string | null; visible: boolean }) {
    const [value, setValue] = useState(defaultValue === "dark" ? "dark" : "white");
    return (
        <div className={visible ? "flex flex-wrap items-center gap-2" : "hidden"}>
            <input type="hidden" name="hero_text_color" value={value}/>
            <span className="text-xs font-bold text-slate-500 mr-1">사진 위 글자색</span>
            {OPTIONS.map((o) => (
                <button key={o.value} type="button" onClick={() => setValue(o.value)} aria-pressed={value === o.value}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold transition-all ${value === o.value ? "border-rose-400 bg-rose-50 text-rose-600" : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"}`}>
                    <span className={`w-3.5 h-3.5 rounded-full ${o.swatch}`}/>
                    {o.label}
                    <span className="font-medium text-[10px] opacity-60">{o.hint}</span>
                </button>
            ))}
        </div>
    );
}
