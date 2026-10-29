"use client";

import { useEffect, useRef, useState } from "react";
import { Sparkles } from "lucide-react";
import { suggestHeroText, type HeroText, type HeroTone } from "@/lib/heroText";

const ROWS = [
    { key: "top", name: "hero_text_top", label: "위쪽 글자", hint: "이름" },
    { key: "bottom", name: "hero_text_bottom", label: "아래쪽 글자", hint: "날짜·장소" },
] as const;

const TONES: { value: HeroTone; label: string; swatch: string }[] = [
    { value: "white", label: "흰색", swatch: "bg-white ring-1 ring-slate-300" },
    { value: "dark", label: "검정", swatch: "bg-slate-900" },
];

interface Props {
    defaultValue: HeroText;
    visible: boolean;
    /** 새로 올린 첫 메인 사진. 바뀌면 밝기를 보고 글자색을 골라둠 (직접 고른 뒤엔 안 바꿈) */
    suggestFrom?: string;
}

/**
 * 클래식 메인 사진 위 글자색 (위·아래 따로). 기본 흰색
 * 템플릿 바꿔도 값 유지하려고 숨기기만 함
 */
export default function HeroTextColorPicker({ defaultValue, visible, suggestFrom }: Props) {
    const [value, setValue] = useState<HeroText>(defaultValue);
    const [auto, setAuto] = useState(false);
    const touchedRef = useRef(false);

    useEffect(() => {
        if (!suggestFrom || touchedRef.current) return;
        let alive = true;
        suggestHeroText(suggestFrom).then((s) => {
            if (!alive || !s || touchedRef.current) return;
            setValue(s);
            setAuto(true);
        });
        return () => { alive = false; };
    }, [suggestFrom]);

    const pick = (key: keyof HeroText, tone: HeroTone) => {
        touchedRef.current = true;
        setAuto(false);
        setValue((v) => ({ ...v, [key]: tone }));
    };

    return (
        <div className={visible ? "rounded-2xl bg-slate-50 border border-slate-100 px-4 py-3 space-y-2" : "hidden"}>
            <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-slate-600">사진 위 글자색</span>
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    {auto ? <><Sparkles size={12} className="text-rose-400"/> 사진 밝기에 맞춰 골라뒀어요</> : "글자가 잘 안 보이면 바꿔 주세요"}
                </span>
            </div>
            {ROWS.map((row) => (
                <div key={row.key} className="flex items-center gap-2">
                    <input type="hidden" name={row.name} value={value[row.key]}/>
                    <span className="w-24 shrink-0 text-xs text-slate-500">
                        {row.label} <span className="text-[10px] text-slate-400">({row.hint})</span>
                    </span>
                    {TONES.map((t) => {
                        const active = value[row.key] === t.value;
                        return (
                            <button key={t.value} type="button" onClick={() => pick(row.key, t.value)} aria-pressed={active}
                                    aria-label={`${row.label} ${t.label}`}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold transition-all ${active ? "border-rose-400 bg-white text-rose-600" : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"}`}>
                                <span className={`w-3.5 h-3.5 rounded-full ${t.swatch}`}/>
                                {t.label}
                            </button>
                        );
                    })}
                </div>
            ))}
        </div>
    );
}
