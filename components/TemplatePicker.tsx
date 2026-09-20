"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Check, Eye, Palette } from "lucide-react";
import { TEMPLATES, DEFAULT_TEMPLATE_ID } from "@/components/templates/meta";

type Props = {
    /** 수정 화면에서 현재 저장된 템플릿 */
    defaultValue?: string;
};

/** 만들기·수정 폼의 "디자인 선택" 섹션. 선택값은 hidden input(template_type)으로 폼에 실린다 */
export default function TemplatePicker({ defaultValue }: Props) {
    const [selected, setSelected] = useState(defaultValue ?? DEFAULT_TEMPLATE_ID);

    return (
        <section className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-white ring-1 ring-slate-100">
            <h3 className="text-xl font-bold mb-8 flex items-center gap-3 text-slate-800 border-b border-slate-100 pb-4">
                <span className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center shadow-sm"><Palette size={18}/></span>
                <span className="flex-1">디자인 선택</span>
            </h3>
            <input type="hidden" name="template_type" value={selected}/>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {TEMPLATES.map((t) => {
                    const active = selected === t.id;
                    return (
                        <div key={t.id} className="space-y-2">
                            <button type="button" onClick={() => setSelected(t.id)}
                                    aria-pressed={active}
                                    className={`relative w-full aspect-[3/4] rounded-2xl overflow-hidden border-2 transition-all ${active ? "border-rose-400 shadow-lg shadow-rose-100 scale-[1.02]" : "border-slate-100 hover:border-slate-300"}`}>
                                <Image src={t.thumbnail} alt={t.name} fill className="object-cover"/>
                                {active && (
                                    <span className="absolute top-2 right-2 w-7 h-7 rounded-full bg-rose-500 text-white flex items-center justify-center shadow">
                                        <Check size={14}/>
                                    </span>
                                )}
                            </button>
                            <div className="px-1">
                                <p className={`text-sm font-bold ${active ? "text-rose-500" : "text-slate-700"}`}>{t.name}</p>
                                <p className="text-[11px] text-slate-400 leading-snug">{t.description}</p>
                                <Link href={t.samplePath} target="_blank" rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1 mt-1 text-[11px] text-slate-500 hover:text-rose-500 font-bold">
                                    <Eye size={12}/> 샘플 보기
                                </Link>
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
