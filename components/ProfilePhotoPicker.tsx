"use client";

import { useRef, useState } from "react";
import { Camera, Loader2, UserRound, X } from "lucide-react";
import { useToast } from "@/components/ui/ToastProvider";
import { processImage } from "@/lib/image";
import Minimi from "@/components/templates/Minimi";

type Side = "groom" | "bride";

type Props = {
    /** 수정 화면에서 저장된 사진 경로 */
    defaultGroom?: string | null;
    defaultBride?: string | null;
};

/**
 * 웨딩홈피 테마 전용 신랑·신부 프로필 사진 (선택). 안 올리면 미니미로 표시
 * profile_photos 표시용 hidden input이 있어야 서버가 값을 반영함 (다른 템플릿이면 기존 사진 유지)
 */
export default function ProfilePhotoPicker({ defaultGroom, defaultBride }: Props) {
    const { toast } = useToast();
    const [urls, setUrls] = useState<Record<Side, string>>({ groom: defaultGroom ?? "", bride: defaultBride ?? "" });
    const [uploading, setUploading] = useState<Record<Side, boolean>>({ groom: false, bride: false });
    const inputRefs = { groom: useRef<HTMLInputElement>(null), bride: useRef<HTMLInputElement>(null) };

    const handleFile = async (side: Side, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        e.target.value = "";
        if (!file) return;
        setUploading((u) => ({ ...u, [side]: true }));
        try {
            const processed = await processImage(file);
            const fd = new FormData();
            fd.append("file", processed);
            const res = await fetch("/api/uploads/image", { method: "POST", body: fd });
            const json = await res.json();
            if (!res.ok || !json?.success || !json?.url) throw new Error(json?.message || "이미지 업로드에 실패했습니다.");
            setUrls((u) => ({ ...u, [side]: json.url }));
        } catch (err) {
            toast(err instanceof Error ? err.message : "이미지 업로드에 실패했습니다.");
        } finally {
            setUploading((u) => ({ ...u, [side]: false }));
        }
    };

    const slot = (side: Side, label: string) => (
        <div className="flex flex-col items-center gap-2">
            <input ref={inputRefs[side]} type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(side, e)}/>
            <button type="button" onClick={() => inputRefs[side].current?.click()} disabled={uploading[side]}
                    aria-label={`${label} 프로필 사진 선택`}
                    className="relative w-28 h-28 rounded-2xl overflow-hidden border-2 border-dashed border-slate-200 bg-[#FFF6E9] hover:border-rose-300 flex items-end justify-center">
                {urls[side] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={urls[side]} alt={`${label} 프로필`} className="absolute inset-0 w-full h-full object-cover"/>
                ) : (
                    <Minimi kind={side} className="h-24 opacity-60"/>
                )}
                <span className="absolute right-1.5 bottom-1.5 w-7 h-7 rounded-full bg-white/90 shadow flex items-center justify-center text-slate-600">
                    {uploading[side] ? <Loader2 size={14} className="animate-spin"/> : <Camera size={14}/>}
                </span>
            </button>
            <div className="flex items-center gap-1 text-sm font-bold text-slate-600">
                {label}
                {urls[side] && !uploading[side] && (
                    <button type="button" onClick={() => setUrls((u) => ({ ...u, [side]: "" }))}
                            className="ml-1 inline-flex items-center gap-0.5 text-[11px] text-slate-400 hover:text-rose-500">
                        <X size={12}/> 빼기
                    </button>
                )}
            </div>
            <input type="hidden" name={`${side}_photo_url`} value={urls[side]}/>
        </div>
    );

    return (
        <section className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-white ring-1 ring-slate-100">
            <h3 className="text-xl font-bold mb-2 flex items-center gap-3 text-slate-800 border-b border-slate-100 pb-4">
                <span className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-500 flex items-center justify-center shadow-sm"><UserRound size={18}/></span>
                <span className="flex-1">프로필 사진 <span className="text-sm font-medium text-slate-400">(선택)</span></span>
            </h3>
            <p className="text-xs text-slate-400 mb-6 mt-4">웨딩홈피 프로필 탭에 들어가는 사진이에요. 안 넣으면 미니미 캐릭터로 보여요.</p>
            <input type="hidden" name="profile_photos" value="1"/>
            {(uploading.groom || uploading.bride) && <input type="hidden" name="profile_uploading" value="1"/>}
            <div className="flex justify-center gap-8">
                {slot("groom", "신랑")}
                {slot("bride", "신부")}
            </div>
        </section>
    );
}
