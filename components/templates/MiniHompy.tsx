"use client";

import React, { useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { Nanum_Gothic, Gaegu } from "next/font/google";
import { Play, Pause, Copy, Phone, MessageSquare, Share, Maximize2 } from "lucide-react";
import { useToast } from "@/components/ui/ToastProvider";
import ReminderSection from "@/components/ReminderSection";
import type { TemplateProps, GuestbookEntry, Person } from "@/components/invitation/types";
import NaverMap from "@/components/invitation/NaverMap";
import GalleryLightbox from "@/components/invitation/GalleryLightbox";
import { GuestbookWriteModal, GuestbookEditModal, GuestbookDeleteModal } from "@/components/invitation/GuestbookModals";
import { KakaoSdk, shareKakao } from "@/components/invitation/KakaoShare";
import { splitAccounts, accountLabel, formatGuestbookDate } from "@/components/invitation/accounts";
import { useWeddingDate, useCountdown, useBgm, useGallery } from "@/components/invitation/hooks";

const gothic = Nanum_Gothic({ subsets: ["latin"], weight: ["400", "700", "800"], variable: "--font-gothic" });
const gaegu = Gaegu({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-gaegu" });

type TabId = "home" | "profile" | "photo" | "diary" | "guest" | "gift" | "map";

const TABS: { id: TabId; label: string; color: string }[] = [
    { id: "home", label: "홈", color: "bg-[#FFD9E0]" },
    { id: "profile", label: "프로필", color: "bg-[#FFE9B8]" },
    { id: "photo", label: "사진첩", color: "bg-[#D6F0E0]" },
    { id: "diary", label: "다이어리", color: "bg-[#D9E8FF]" },
    { id: "guest", label: "방명록", color: "bg-[#EADCFF]" },
    { id: "gift", label: "선물", color: "bg-[#FFE0C2]" },
    { id: "map", label: "지도", color: "bg-[#E0F4FF]" },
];

/** url_id로 방문자 수를 그럴싸하게 만든다 (렌더마다 같도록 결정적) */
function fakeCounter(seed: string, day: number) {
    let h = 0;
    for (const ch of seed) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
    const total = 1200 + (h % 4000) + (day % 365) * 6;
    const today = 3 + ((h + day) % 40);
    return { today, total };
}

const pad2 = (n: number) => String(n).padStart(2, "0");
const ymd = (d: Date) => `${d.getFullYear()}.${pad2(d.getMonth() + 1)}.${pad2(d.getDate())}`;

/** 웨딩홈피 템플릿 — 2000년대 미니홈피 감성 */
export default function MiniHompy({ data, isSample = false }: TemplateProps) {
    const router = useRouter();
    const { toast } = useToast();

    const [tab, setTab] = useState<TabId>("home");
    const [isWriteOpen, setIsWriteOpen] = useState(false);
    const [editTarget, setEditTarget] = useState<GuestbookEntry | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<GuestbookEntry | null>(null);

    const wd = useWeddingDate(data.date);
    const timeLeft = useCountdown(wd.date);
    const { audioRef, isPlaying, toggle: toggleMusic } = useBgm();
    const gallery = useGallery(data.gallery.length, 0);
    const mainSlide = useGallery(data.mainImages.length, 4000); // 미니룸 폴라로이드 순환
    const accounts = splitAccounts(data.accounts);

    // 방문자 카운터는 클라이언트에서만 계산 (서버/클라 날짜 차이로 인한 hydration 불일치 방지)
    const counterKey = useSyncExternalStore(
        () => () => {},
        () => { const c = fakeCounter(data.url_id, Math.floor(Date.now() / 86400000)); return `${c.today}|${c.total}`; },
        () => "0|0",
    );
    const [todayStr, totalStr] = counterKey.split("|");
    const counter = { today: Number(todayStr), total: Number(totalStr) };

    const copyText = (text: string) => {
        navigator.clipboard.writeText(text);
        toast("복사되었습니다.");
    };
    const handleShare = () => {
        if (isSample) { toast("샘플 화면에서는 카카오톡 공유를 사용할 수 없습니다."); return; }
        shareKakao(data);
    };
    const refresh = () => router.refresh();
    return (
        <div className={`${gothic.variable} ${gaegu.variable} mh-root min-h-screen flex justify-center font-[family-name:var(--font-gothic)] text-[#444] text-[12px] leading-relaxed`}
             style={{
                 backgroundColor: "#CFE3F0",
                 backgroundImage: "radial-gradient(#ffffff 1.2px, transparent 1.2px), radial-gradient(#b7d3e6 1px, transparent 1px)",
                 backgroundSize: "18px 18px, 18px 18px",
                 backgroundPosition: "0 0, 9px 9px",
             }}>
            <KakaoSdk/>
            <audio ref={audioRef} loop src="/music/sample1.mp3"/>

            <div className="w-full max-w-[430px] px-3 py-5 flex flex-col gap-2">
                {/* 방문자 카운터 */}
                <div className="flex justify-end items-center gap-2 text-[10px] tracking-wider text-[#4a6b85] px-1">
                    <span>TODAY <b className="text-[#FF6B35]">{counter.today}</b></span>
                    <span className="opacity-40">|</span>
                    <span>TOTAL <b>{counter.total.toLocaleString()}</b></span>
                </div>

                {/* 웨딩홈피 창 */}
                <div className="flex items-stretch">
                    {/* 본문 */}
                    <div className="flex-1 min-w-0 bg-white border-[3px] border-[#7FA8C9] rounded-2xl rounded-tr-none shadow-[4px_4px_0_#9dbdd6] overflow-hidden">
                        {/* 타이틀 바 */}
                        <div className="bg-gradient-to-r from-[#8FBBDD] to-[#BFDDF0] px-4 py-2.5 flex items-center justify-between border-b-2 border-[#7FA8C9]">
                            <p className="font-[family-name:var(--font-gaegu)] text-[19px] leading-none text-[#1f3d55]">
                                {data.groom.name} <span className="text-[#FF6B35]">♥</span> {data.bride.name}의 웨딩홈피
                            </p>
                            <button onClick={toggleMusic} aria-label="배경음악"
                                    className="flex items-center gap-1 bg-white/70 rounded-md px-2 py-1 text-[10px] font-bold text-[#1f3d55] active:scale-95">
                                {isPlaying ? <Pause size={10}/> : <Play size={10}/>} BGM
                            </button>
                        </div>

                        <div className="p-4 min-h-[560px]">
                            {tab === "home" && <HomeTab data={data} wd={wd} timeLeft={timeLeft} isPlaying={isPlaying} mainIdx={mainSlide.current} onGo={setTab}/>}
                            {tab === "profile" && <ProfileTab data={data} isSample={isSample} toast={toast}/>}
                            {tab === "photo" && <PhotoTab data={data} gallery={gallery}/>}
                            {tab === "diary" && <DiaryTab data={data} wd={wd}/>}
                            {tab === "guest" && (
                                <GuestTab data={data} isSample={isSample}
                                          onWrite={() => setIsWriteOpen(true)} onEdit={setEditTarget} onDelete={setDeleteTarget}/>
                            )}
                            {tab === "gift" && <GiftTab groom={accounts.groom} bride={accounts.bride} onCopy={copyText}/>}
                            {tab === "map" && <MapTab data={data} wd={wd} isSample={isSample}/>}
                        </div>

                        {/* 하단 공유 */}
                        <div className="border-t-2 border-dashed border-[#cfe0ec] px-4 py-3 flex items-center justify-between bg-[#F7FBFD]">
                            <span className="text-[10px] text-[#7a98b0]">♬ {isPlaying ? "BGM 재생중" : "BGM 꺼짐"} · 파도타기 환영</span>
                            <button onClick={handleShare}
                                    className="flex items-center gap-1.5 bg-[#FEE500] text-[#191919] text-[11px] font-bold px-3 py-1.5 rounded-md border border-[#e5cf00] active:scale-95">
                                <Share size={12}/> 카톡으로 퍼가기
                            </button>
                        </div>
                    </div>

                    {/* 오른쪽 탭 */}
                    <div className="w-[46px] shrink-0 flex flex-col gap-1 pt-3 -ml-[3px]">
                        {TABS.map((t) => {
                            const active = tab === t.id;
                            return (
                                <button key={t.id} onClick={() => setTab(t.id)} aria-pressed={active}
                                        className={`${t.color} relative h-[52px] rounded-r-lg border-2 border-l-0 border-[#7FA8C9] text-[10px] font-extrabold leading-[1.1] text-[#2f4b62] tracking-tight transition-all
                                            ${active ? "translate-x-0 shadow-[3px_3px_0_#9dbdd6] z-10 brightness-100" : "-translate-x-[3px] opacity-80 brightness-95"}`}>
                                    <span className="block px-1 break-keep">{t.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                <p className="text-center text-[9px] text-[#7a98b0] tracking-[0.3em] mt-2">BINARY WEDDING · WEDDING HOMEPAGE</p>
            </div>

            {/* 모달 */}
            <GalleryLightbox images={data.gallery} index={gallery.lightboxIdx}
                             onClose={gallery.closeLightbox} onChange={gallery.changeLightbox}/>
            {isWriteOpen && (
                <GuestbookWriteModal toast={toast} url_id={data.url_id} isSample={isSample}
                                     onClose={() => setIsWriteOpen(false)}
                                     onSuccess={() => { setIsWriteOpen(false); refresh(); }}/>
            )}
            {editTarget && (
                <GuestbookEditModal toast={toast} entry={editTarget}
                                    onClose={() => setEditTarget(null)}
                                    onSuccess={() => { setEditTarget(null); refresh(); }}/>
            )}
            {deleteTarget && (
                <GuestbookDeleteModal toast={toast} entry={deleteTarget}
                                      onClose={() => setDeleteTarget(null)}
                                      onSuccess={() => { setDeleteTarget(null); refresh(); }}/>
            )}
        </div>
    );
}

/* ───────────── 공통 조각 ───────────── */

type WD = ReturnType<typeof useWeddingDate>;

function SectionTitle({ children, sub }: { children: React.ReactNode; sub?: string }) {
    return (
        <div className="flex items-baseline gap-2 border-b-2 border-[#7FA8C9] pb-1.5 mb-4">
            <h2 className="font-[family-name:var(--font-gaegu)] text-[22px] leading-none text-[#1f3d55]">{children}</h2>
            {sub && <span className="text-[10px] text-[#7a98b0] tracking-wider">{sub}</span>}
        </div>
    );
}

function Box({ title, children, className = "" }: { title?: string; children: React.ReactNode; className?: string }) {
    return (
        <div className={`border border-[#c9dbe8] rounded-lg bg-white ${className}`}>
            {title && (
                <div className="px-3 py-1.5 bg-[#EEF5FA] border-b border-[#c9dbe8] text-[11px] font-extrabold text-[#2f4b62] flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B35]"/>{title}
                </div>
            )}
            <div className="p-3">{children}</div>
        </div>
    );
}

/** 폴라로이드 느낌 사진 프레임 */
function Polaroid({ src, alt, caption, className = "", onClick }: { src: string; alt: string; caption?: string; className?: string; onClick?: () => void }) {
    const Inner = (
        <>
            <div className="bg-[#f4f4f4] overflow-hidden aspect-[4/5]">
                <img src={src} alt={alt} className="w-full h-full object-cover"/>
            </div>
            {caption && <p className="font-[family-name:var(--font-gaegu)] text-[15px] text-center text-[#555] mt-2 leading-none">{caption}</p>}
        </>
    );
    const cls = `bg-white p-2 pb-3 shadow-[2px_3px_6px_rgba(0,0,0,0.15)] border border-[#e6e6e6] ${className}`;
    return onClick
        ? <button type="button" onClick={onClick} className={`${cls} text-left w-full`}>{Inner}</button>
        : <div className={cls}>{Inner}</div>;
}

/* ───────────── 탭: 홈 ───────────── */

function HomeTab({ data, wd, timeLeft, isPlaying, mainIdx, onGo }: { data: TemplateProps["data"]; wd: WD; timeLeft: ReturnType<typeof useCountdown>; isPlaying: boolean; mainIdx: number; onGo: (t: TabId) => void }) {
    const main = data.mainImages[mainIdx] || data.mainImages[0] || data.middleImage;
    const dday = timeLeft.days;
    return (
        <div className="space-y-4">
            {/* 미니룸 */}
            <Box title="미니룸">
                <div className="relative rounded-md overflow-hidden bg-[#FFF6E9] border border-[#f1dfc3]"
                     style={{ backgroundImage: "linear-gradient(#f7e9d6 1px, transparent 1px), linear-gradient(90deg, #f7e9d6 1px, transparent 1px)", backgroundSize: "14px 14px" }}>
                    {main ? (
                        <div className="p-4 flex justify-center">
                            <Polaroid key={mainIdx} src={main} alt={`메인 사진 ${mainIdx + 1}`} caption={`${data.groom.name} ♥ ${data.bride.name}`}
                                      className={`w-[75%] animate-fade-in ${mainIdx % 2 === 0 ? "-rotate-2" : "rotate-1"}`}/>
                        </div>
                    ) : (
                        <div className="h-40 flex items-center justify-center text-[#b9a68c]">사진 없음</div>
                    )}
                    <span className="absolute left-2 bottom-2 text-[18px]">🤵</span>
                    <span className="absolute right-2 bottom-2 text-[18px]">👰</span>
                    {data.mainImages.length > 1 && (
                        <div className="absolute bottom-2 inset-x-0 flex justify-center gap-1">
                            {data.mainImages.map((_, i) => (
                                <span key={i} className={`w-1.5 h-1.5 rounded-full ${i === mainIdx ? "bg-[#FF6B35]" : "bg-[#d9c6ad]"}`}/>
                            ))}
                        </div>
                    )}
                </div>
                <p className="mt-3 text-[11px] text-[#666]">
                    <span className="font-extrabold text-[#2f4b62]">오늘의 기분</span> : 설렘 가득 💛&nbsp;&nbsp;
                    <span className="font-extrabold text-[#2f4b62]">BGM</span> : {isPlaying ? "재생중 ♪" : "타이틀바에서 켜기"}
                </p>
            </Box>

            {/* 새소식 */}
            <Box title="새소식">
                <ul className="space-y-1.5 text-[11.5px]">
                    <li className="flex gap-2"><span className="text-[#FF6B35] font-black">N</span>
                        <span><b>{data.groom.name}</b>님과 <b>{data.bride.name}</b>님이 결혼합니다!</span></li>
                    <li className="flex gap-2"><span className="text-[#FF6B35] font-black">N</span>
                        <span>{wd.year}년 {wd.month + 1}월 {wd.day}일 {wd.weekdayLongEn} {wd.timeEn} · {data.location}</span></li>
                    <li className="flex gap-2"><span className="text-[#FF6B35] font-black">N</span>
                        <span>일촌 여러분, <button onClick={() => onGo("guest")} className="underline text-[#2f6fa8]">일촌평</button> 한 줄 부탁드려요 🙏</span></li>
                </ul>
            </Box>

            {/* 디데이 */}
            <div className="grid grid-cols-2 gap-3">
                <Box>
                    <p className="text-[10px] text-[#7a98b0] tracking-wider">WEDDING DAY</p>
                    <p className="font-[family-name:var(--font-gaegu)] text-[26px] text-[#1f3d55] leading-tight">{dday > 0 ? `D-${dday}` : "D-DAY"}</p>
                    <p className="text-[10px] text-[#666]">{ymd(wd.date)} ({wd.weekdayShortEn})</p>
                </Box>
                <Box>
                    <p className="text-[10px] text-[#7a98b0] tracking-wider">COUNTDOWN</p>
                    <p className="font-[family-name:var(--font-gaegu)] text-[22px] text-[#FF6B35] leading-tight tabular-nums">
                        {pad2(timeLeft.hours)}:{pad2(timeLeft.minutes)}:{pad2(timeLeft.seconds)}
                    </p>
                    <p className="text-[10px] text-[#666]">{dday}일 남았어요</p>
                </Box>
            </div>

            {/* 바로가기 */}
            <div className="grid grid-cols-3 gap-2">
                {([["profile", "👫 소개"], ["photo", "📷 사진첩"], ["map", "📍 오시는길"]] as const).map(([t, label]) => (
                    <button key={t} onClick={() => onGo(t)}
                            className="border border-[#c9dbe8] rounded-md py-2 text-[11px] font-bold text-[#2f4b62] bg-[#F7FBFD] active:bg-[#EEF5FA]">{label}</button>
                ))}
            </div>
        </div>
    );
}

/* ───────────── 탭: 프로필 ───────────── */

function ProfileCard({ role, p, isSample, toast }: { role: string; p: Person; isSample: boolean; toast: (m: string) => Promise<void> }) {
    const contacts = [
        { label: role, name: p.name, phone: p.contact },
        { label: "아버지", name: p.father, phone: p.father_contact || "" },
        { label: "어머니", name: p.mother, phone: p.mother_contact || "" },
    ].filter((c) => c.name);

    const open = (scheme: "tel" | "sms", phone: string) => {
        if (isSample) {
            toast(scheme === "tel" ? "샘플 화면에서는 전화를 걸 수 없습니다." : "샘플 화면에서는 문자를 보낼 수 없습니다.");
            return;
        }
        window.location.assign(`${scheme}:${phone}`);
    };

    return (
        <Box title={`${role} ${p.name}`}>
            <div className="flex gap-3">
                <div className="w-[64px] h-[64px] shrink-0 border border-[#ddd] bg-[#FFF6E9] rounded-sm flex items-center justify-center text-3xl">
                    {role === "신랑" ? "🤵" : "👰"}
                </div>
                <div className="flex-1 min-w-0 text-[11px] space-y-1">
                    <p><span className="text-[#7a98b0]">이름</span> <b>{p.name}</b></p>
                    {(p.father || p.mother) && (
                        <p><span className="text-[#7a98b0]">부모님</span> {[p.father, p.mother].filter(Boolean).join(" · ")}{p.order ? ` 의 ${p.order}` : ""}</p>
                    )}
                </div>
            </div>
            <div className="mt-3 border-t border-dashed border-[#c9dbe8] pt-2 space-y-1.5">
                {contacts.map((c) => c.phone && (
                    <div key={c.label} className="flex items-center justify-between text-[11px]">
                        <span><span className="text-[#7a98b0] mr-1.5">{c.label}</span>{c.name}</span>
                        <div className="flex gap-1">
                            <button onClick={() => open("tel", c.phone)} className="w-7 h-7 rounded border border-[#c9dbe8] flex items-center justify-center text-[#2f6fa8] bg-[#F7FBFD]" aria-label="전화"><Phone size={12}/></button>
                            <button onClick={() => open("sms", c.phone)} className="w-7 h-7 rounded border border-[#c9dbe8] flex items-center justify-center text-[#2f6fa8] bg-[#F7FBFD]" aria-label="문자"><MessageSquare size={12}/></button>
                        </div>
                    </div>
                ))}
            </div>
        </Box>
    );
}

function ProfileTab({ data, isSample, toast }: { data: TemplateProps["data"]; isSample: boolean; toast: (m: string) => Promise<void> }) {
    return (
        <div className="space-y-4">
            <SectionTitle sub="PROFILE">우리 소개</SectionTitle>
            <ProfileCard role="신랑" p={data.groom} isSample={isSample} toast={toast}/>
            <ProfileCard role="신부" p={data.bride} isSample={isSample} toast={toast}/>
            {data.middleImage && (
                <div className="flex justify-center pt-2">
                    <Polaroid src={data.middleImage} alt="둘이서" caption="우리 둘 ♥" className="w-[70%] rotate-1"/>
                </div>
            )}
        </div>
    );
}

/* ───────────── 탭: 사진첩 ───────────── */

function PhotoTab({ data, gallery }: { data: TemplateProps["data"]; gallery: ReturnType<typeof useGallery> }) {
    const [folderOpen, setFolderOpen] = useState(true);
    return (
        <div className="space-y-4">
            <SectionTitle sub="PHOTO">사진첩</SectionTitle>
            <div className="border border-[#c9dbe8] rounded-lg overflow-hidden">
                <button onClick={() => setFolderOpen(!folderOpen)}
                        className="w-full flex items-center justify-between px-3 py-2 bg-[#EEF5FA] text-[11px] font-extrabold text-[#2f4b62]">
                    <span>📁 웨딩 촬영 <span className="text-[#7a98b0] font-bold">({data.gallery.length})</span></span>
                    <span className="text-[#7a98b0]">{folderOpen ? "▲" : "▼"}</span>
                </button>
                {folderOpen && (
                    data.gallery.length === 0 ? (
                        <p className="p-6 text-center text-[#999]">등록된 사진이 없습니다.</p>
                    ) : (
                        <div className="p-3 grid grid-cols-3 gap-2">
                            {data.gallery.map((src, i) => (
                                <button key={i} onClick={() => gallery.openLightbox(i)} aria-label={`사진 ${i + 1} 크게 보기`}
                                        className="relative aspect-square border border-[#ddd] bg-[#f4f4f4] overflow-hidden group">
                                    <img src={src} alt={`사진 ${i + 1}`} className="w-full h-full object-cover" loading="lazy"/>
                                    <span className="absolute right-1 bottom-1 w-5 h-5 rounded bg-black/40 text-white flex items-center justify-center opacity-70"><Maximize2 size={10}/></span>
                                </button>
                            ))}
                        </div>
                    )
                )}
            </div>
            <p className="text-[10px] text-[#7a98b0] text-center">사진을 누르면 크게 볼 수 있어요 · 두 손가락으로 확대</p>
        </div>
    );
}

/* ───────────── 탭: 다이어리 ───────────── */

function DiaryEntry({ date, title, children, weather = "☀" }: { date: string; title: string; children: React.ReactNode; weather?: string }) {
    return (
        <div className="border border-[#c9dbe8] rounded-lg overflow-hidden">
            <div className="px-3 py-1.5 bg-[#EEF5FA] border-b border-[#c9dbe8] flex items-center justify-between">
                <span className="text-[11px] font-extrabold text-[#2f4b62]">{title}</span>
                <span className="text-[10px] text-[#7a98b0]">{date} {weather}</span>
            </div>
            <div className="p-4 bg-[repeating-linear-gradient(transparent,transparent_23px,#eef3f7_23px,#eef3f7_24px)]">
                <p className="font-[family-name:var(--font-gaegu)] text-[17px] leading-[24px] text-[#444] whitespace-pre-line">{children}</p>
            </div>
        </div>
    );
}

function DiaryTab({ data, wd }: { data: TemplateProps["data"]; wd: WD }) {
    return (
        <div className="space-y-4">
            <SectionTitle sub="DIARY">다이어리</SectionTitle>
            <DiaryEntry date={ymd(wd.date)} title="💌 초대합니다" weather="💒">
                {data.message || "저희 두 사람의 새로운 시작을 함께 축복해 주세요."}
            </DiaryEntry>
            {data.interviews.map((iv, i) => (
                <DiaryEntry key={i} date="" title={`Q. ${iv.q}`} weather={["🌸", "🌙", "⭐"][i % 3]}>
                    {iv.a}
                </DiaryEntry>
            ))}
        </div>
    );
}

/* ───────────── 탭: 방명록(일촌평) ───────────── */

function GuestTab({ data, isSample, onWrite, onEdit, onDelete }: {
    data: TemplateProps["data"]; isSample: boolean;
    onWrite: () => void; onEdit: (g: GuestbookEntry) => void; onDelete: (g: GuestbookEntry) => void;
}) {
    const [showAll, setShowAll] = useState(false);
    const list = showAll ? data.guestbook : data.guestbook.slice(0, 5);
    const total = data.guestbook.length;

    return (
        <div className="space-y-3">
            <SectionTitle sub={`${total}개의 일촌평`}>일촌평</SectionTitle>

            <button onClick={onWrite}
                    className="w-full border-2 border-dashed border-[#7FA8C9] rounded-lg py-3 text-[12px] font-extrabold text-[#2f6fa8] bg-[#F7FBFD] active:bg-[#EEF5FA]">
                ✏️ 일촌평 남기기
            </button>

            {total === 0 ? (
                <p className="py-10 text-center text-[#999]">아직 일촌평이 없어요. 첫 번째 일촌이 되어주세요!</p>
            ) : (
                <ul className="divide-y divide-[#e3edf4] border-y border-[#e3edf4]">
                    {list.map((g, i) => (
                        <li key={g.id} className="py-3 flex gap-3">
                            <div className="w-9 h-9 shrink-0 border border-[#ddd] bg-[#FFF6E9] rounded-sm flex items-center justify-center text-base">
                                {["🐥", "🐰", "🐻", "🐱", "🐶", "🦊"][g.id % 6]}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2">
                                    <p className="text-[11px]">
                                        <span className="text-[#7a98b0] mr-1">No.{total - i}</span>
                                        <b className="text-[#2f4b62]">{g.author_name}</b>
                                    </p>
                                    <span className="text-[9px] text-[#a0b4c4] shrink-0">{formatGuestbookDate(g.created_at)}</span>
                                </div>
                                <p className="mt-1 text-[12px] text-[#444] whitespace-pre-line break-words">{g.message}</p>
                                {!isSample && (
                                    <div className="mt-1 text-[10px] text-[#a0b4c4] flex gap-2">
                                        <button onClick={() => onEdit(g)} className="hover:text-[#2f6fa8]">수정</button>
                                        <span>|</span>
                                        <button onClick={() => onDelete(g)} className="hover:text-[#2f6fa8]">삭제</button>
                                    </div>
                                )}
                            </div>
                        </li>
                    ))}
                </ul>
            )}
            {total > 5 && (
                <button onClick={() => setShowAll(!showAll)} className="w-full py-2 text-[11px] text-[#7a98b0] font-bold">
                    {showAll ? "접기 ▲" : `전체 보기 (${total}) ▼`}
                </button>
            )}
        </div>
    );
}

/* ───────────── 탭: 선물(도토리) ───────────── */

function GiftTab({ groom, bride, onCopy }: { groom: TemplateProps["data"]["accounts"]; bride: TemplateProps["data"]["accounts"]; onCopy: (t: string) => void }) {
    const groups = [["신랑측", groom], ["신부측", bride]] as const;
    const hasAny = groom.length + bride.length > 0;
    return (
        <div className="space-y-4">
            <SectionTitle sub="GIFT">도토리 선물하기</SectionTitle>
            <p className="text-[11.5px] text-[#666] leading-relaxed">
                🌰 참석이 어려우신 분들을 위해 계좌를 남겨요.<br/>
                따뜻한 마음만으로도 충분히 감사합니다.
            </p>
            {!hasAny && <p className="py-8 text-center text-[#999]">등록된 계좌가 없습니다.</p>}
            {groups.map(([title, list]) => list.length > 0 && (
                <Box key={title} title={`${title} 도토리함`}>
                    <ul className="divide-y divide-[#e3edf4]">
                        {list.map((a, i) => (
                            <li key={i} className="py-2 first:pt-0 last:pb-0 flex items-center justify-between gap-2">
                                <div className="min-w-0">
                                    <p className="text-[10px] text-[#FF6B35] font-extrabold">{accountLabel(a.side)}</p>
                                    <p className="text-[12px] font-bold text-[#2f4b62]">{a.name}</p>
                                    <p className="text-[11px] text-[#666] tracking-tight">{a.bank} {a.num}</p>
                                </div>
                                <button onClick={() => onCopy(a.num)}
                                        className="shrink-0 flex items-center gap-1 text-[10px] font-bold px-2.5 py-1.5 rounded border border-[#c9dbe8] bg-[#F7FBFD] text-[#2f6fa8] active:bg-[#EEF5FA]">
                                    <Copy size={10}/> 복사
                                </button>
                            </li>
                        ))}
                    </ul>
                </Box>
            ))}
        </div>
    );
}

/* ───────────── 탭: 지도 ───────────── */

function MapTab({ data, wd, isSample }: { data: TemplateProps["data"]; wd: WD; isSample: boolean }) {
    const navs = [
        { href: `https://map.naver.com/v5/search/${encodeURIComponent(data.address)}`, label: "네이버 지도", color: "#03C75A", ext: true },
        { href: `https://map.kakao.com/link/search/${encodeURIComponent(data.address)}`, label: "카카오 내비", color: "#FEE500", ext: true },
        { href: `tmap://search?name=${encodeURIComponent(data.address)}`, label: "T맵", color: "#ED1C24", ext: false },
    ];
    const transports = [["🚇 지하철", data.transport.subway], ["🚌 버스", data.transport.bus], ["🅿️ 주차", data.transport.parking]].filter(([, v]) => v);

    return (
        <div className="space-y-4">
            <SectionTitle sub="LOCATION">오시는 길</SectionTitle>
            <Box>
                <p className="font-[family-name:var(--font-gaegu)] text-[20px] text-[#1f3d55] leading-tight">
                    {wd.year}년 {wd.month + 1}월 {wd.day}일 {wd.weekdayLongEn}
                </p>
                <p className="text-[12px] font-bold text-[#FF6B35]">{wd.timeEn}</p>
                <p className="mt-2 text-[12px] font-bold text-[#2f4b62]">{data.location} {data.detail}</p>
                <p className="text-[11px] text-[#666]">{data.address}</p>
            </Box>
            <NaverMap lat={data.location_lat} lng={data.location_lng}
                      className="w-full h-[260px] border border-[#c9dbe8] rounded-lg bg-[#F7FBFD] overflow-hidden"/>
            <div className="grid grid-cols-3 gap-2">
                {navs.map((n) => (
                    <a key={n.label} href={n.href} {...(n.ext ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                       className="border border-[#c9dbe8] rounded-md py-2 text-[11px] font-bold text-[#2f4b62] bg-[#F7FBFD] flex items-center justify-center gap-1">
                        <span className="w-2 h-2 rounded-full" style={{ background: n.color }}/>{n.label}
                    </a>
                ))}
            </div>
            {transports.length > 0 && (
                <Box title="교통 안내">
                    <ul className="space-y-2 text-[11.5px]">
                        {transports.map(([label, text]) => (
                            <li key={label} className="flex gap-2">
                                <span className="shrink-0 font-extrabold text-[#2f4b62] w-16">{label}</span>
                                <span className="text-[#555] whitespace-pre-line break-words flex-1 min-w-0">{text}</span>
                            </li>
                        ))}
                    </ul>
                </Box>
            )}
            <div>
                <ReminderSection groomName={data.groom.name} brideName={data.bride.name} date={wd.date}
                                 location={data.location} address={data.address} detail={data.detail} isSample={isSample}/>
            </div>
        </div>
    );
}
