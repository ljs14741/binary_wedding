"use client";

import { useRef, useState } from "react";
import { Music, Upload, VolumeX, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/ToastProvider";
import { DEFAULT_BGM_SRC, MAX_BGM_SIZE, MAX_BGM_SIZE_LABEL, bgmModeOf, type BgmMode } from "@/lib/bgm";

type Props = {
    /** 수정 화면에서 현재 저장된 bgm_url */
    defaultValue?: string | null;
};

const OPTIONS: { mode: BgmMode; label: string; icon: typeof Music }[] = [
    { mode: "default", label: "기본 음악", icon: Music },
    { mode: "custom", label: "직접 올리기", icon: Upload },
    { mode: "none", label: "음악 없음", icon: VolumeX },
];

/** 만들기·수정 폼의 "배경음악" 섹션. bgm_mode / bgm_url hidden input으로 폼에 실린다 */
export default function BgmPicker({ defaultValue }: Props) {
    const { toast } = useToast();
    const initialMode = bgmModeOf(defaultValue);
    const [mode, setMode] = useState<BgmMode>(initialMode);
    const [customUrl, setCustomUrl] = useState(initialMode === "custom" ? defaultValue! : "");
    const [fileName, setFileName] = useState(initialMode === "custom" ? "저장된 음악" : "");
    const [isUploading, setIsUploading] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        e.target.value = "";
        if (!file) return;
        // 서버 가기 전에 용량 먼저 거름
        if (file.size > MAX_BGM_SIZE) {
            toast(`음악 파일은 ${MAX_BGM_SIZE_LABEL} 이하만 올릴 수 있습니다. (현재: ${(file.size / 1024 / 1024).toFixed(1)}MB)`);
            return;
        }
        setIsUploading(true);
        try {
            const fd = new FormData();
            fd.append("file", file);
            const res = await fetch("/api/uploads/audio", { method: "POST", body: fd });
            const json = await res.json();
            if (!res.ok || !json?.success || !json?.url) throw new Error(json?.message || "음악 업로드에 실패했습니다.");
            setCustomUrl(json.url);
            setFileName(file.name);
        } catch (err) {
            toast(err instanceof Error ? err.message : "음악 업로드에 실패했습니다.");
        } finally {
            setIsUploading(false);
        }
    };

    const previewSrc = mode === "default" ? DEFAULT_BGM_SRC : mode === "custom" ? customUrl : "";

    return (
        <section className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-white ring-1 ring-slate-100">
            <h3 className="text-xl font-bold mb-8 flex items-center gap-3 text-slate-800 border-b border-slate-100 pb-4">
                <span className="w-10 h-10 rounded-2xl bg-violet-50 text-violet-500 flex items-center justify-center shadow-sm"><Music size={18}/></span>
                <span className="flex-1">배경음악</span>
            </h3>
            <input type="hidden" name="bgm_mode" value={mode}/>
            {mode === "custom" && customUrl && <input type="hidden" name="bgm_url" value={customUrl}/>}
            {mode === "custom" && isUploading && <input type="hidden" name="bgm_uploading" value="1"/>}

            <div className="grid grid-cols-3 gap-3">
                {OPTIONS.map(({ mode: m, label, icon: Icon }) => {
                    const active = mode === m;
                    return (
                        <button key={m} type="button" onClick={() => setMode(m)} aria-pressed={active}
                                className={`flex flex-col items-center gap-2 py-4 rounded-2xl border-2 text-sm font-bold transition-all ${active ? "border-rose-400 text-rose-500 bg-rose-50/50" : "border-slate-100 text-slate-500 hover:border-slate-300"}`}>
                            <Icon size={20}/>
                            {label}
                        </button>
                    );
                })}
            </div>

            {mode === "custom" && (
                <div className="mt-5 space-y-2">
                    <input ref={inputRef} type="file" accept=".mp3,.m4a,audio/mpeg,audio/mp4,audio/x-m4a" className="hidden" onChange={handleFile}/>
                    <button type="button" onClick={() => inputRef.current?.click()} disabled={isUploading}
                            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-dashed border-slate-200 text-sm font-bold text-slate-600 hover:border-rose-300 disabled:opacity-60">
                        {isUploading ? <><Loader2 size={16} className="animate-spin"/> 업로드 중...</> : <><Upload size={16}/> {customUrl ? "다른 음악으로 바꾸기" : "음악 파일 선택"}</>}
                    </button>
                    {fileName && customUrl && !isUploading && (
                        <p className="text-xs text-slate-500 truncate">🎵 {fileName}</p>
                    )}
                    <p className="text-[11px] text-slate-400">MP3, M4A · 최대 {MAX_BGM_SIZE_LABEL}</p>
                </div>
            )}

            {previewSrc && (
                <audio key={previewSrc} controls preload="none" src={previewSrc} className="w-full mt-5 h-10"/>
            )}
            {mode === "none" && (
                <p className="mt-5 text-xs text-slate-400">청첩장에 배경음악과 음악 버튼이 표시되지 않습니다.</p>
            )}
        </section>
    );
}
