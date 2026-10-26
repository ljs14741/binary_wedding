"use client";

import { createElement, useEffect, useMemo, useRef, useState } from "react";
import { Music, Upload, VolumeX } from "lucide-react";
import { getTemplateComponent } from "@/components/templates";
import type { InvitationData } from "@/components/invitation/types";
import { DEFAULT_BGM_SRC, type BgmMode } from "@/lib/bgm";

type Props = {
    templateId: string;
    /** 서버에서 만든 샘플 데이터 (날짜 hydration 어긋남 방지) */
    sample: InvitationData;
};

/** 샘플 페이지: 배경음악을 바꿔보며 템플릿 미리보기. 고른 파일은 서버에 안 올리고 브라우저에서만 재생 */
export default function SampleBgmDemo({ templateId, sample }: Props) {
    const [mode, setMode] = useState<BgmMode>("default");
    const [localUrl, setLocalUrl] = useState("");
    const [fileName, setFileName] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);

    // 이전 object URL 해제
    useEffect(() => () => { if (localUrl) URL.revokeObjectURL(localUrl); }, [localUrl]);

    const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        e.target.value = "";
        if (!file) return;
        setLocalUrl(URL.createObjectURL(file));
        setFileName(file.name);
        setMode("custom");
    };

    const bgm = mode === "default" ? DEFAULT_BGM_SRC : mode === "custom" ? localUrl : "";
    const data = useMemo(() => ({ ...sample, bgm }), [sample, bgm]);

    const btn = (active: boolean) =>
        `flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-bold border transition-all ${active ? "bg-rose-500 border-rose-500 text-white" : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"}`;

    return (
        <>
            <div className="max-w-[430px] mx-auto mb-4 px-4">
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
                    <p className="text-sm font-bold text-slate-700 mb-1">🎵 배경음악 바꿔보기</p>
                    <p className="text-[11px] text-slate-400 mb-3">청첩장을 만들 때 기본 음악·내 음악·음악 없음 중에 고를 수 있어요.</p>
                    <input ref={inputRef} type="file" accept=".mp3,.m4a,audio/mpeg,audio/mp4,audio/x-m4a" className="hidden" onChange={handleFile}/>
                    <div className="flex flex-wrap gap-2">
                        <button type="button" onClick={() => setMode("default")} className={btn(mode === "default")}>
                            <Music size={14}/> 기본 음악
                        </button>
                        <button type="button" onClick={() => (localUrl ? setMode("custom") : inputRef.current?.click())} className={btn(mode === "custom")}>
                            <Upload size={14}/> 내 음악
                        </button>
                        <button type="button" onClick={() => setMode("none")} className={btn(mode === "none")}>
                            <VolumeX size={14}/> 없음
                        </button>
                    </div>
                    {mode === "custom" && fileName && (
                        <div className="mt-2 flex items-center justify-between gap-2 text-[11px] text-slate-500">
                            <span className="truncate">🎵 {fileName}</span>
                            <button type="button" onClick={() => inputRef.current?.click()} className="shrink-0 font-bold text-rose-500">다른 곡</button>
                        </div>
                    )}
                </div>
            </div>
            {createElement(getTemplateComponent(templateId), { data, isSample: true })}
        </>
    );
}
