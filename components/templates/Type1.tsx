"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Noto_Serif_KR } from "next/font/google";
import { motion, AnimatePresence } from "framer-motion";
import {
    Phone, Navigation, ChevronDown, ChevronUp,
    MessageSquare, Music, Share, Heart, ChevronLeft, ChevronRight, Plus, Maximize2
} from "lucide-react";
import { useToast } from "@/components/ui/ToastProvider";
import { FlowerPetals, KenBurnsImage } from "@/components/effects";
import ReminderSection from "@/components/ReminderSection";
import type { TemplateProps, GuestbookEntry } from "@/components/invitation/types";
import FadeIn from "@/components/invitation/FadeIn";
import NaverMap from "@/components/invitation/NaverMap";
import GalleryLightbox from "@/components/invitation/GalleryLightbox";
import ContactModal from "@/components/invitation/ContactModal";
import InterviewModal from "@/components/invitation/InterviewModal";
import { GuestbookWriteModal, GuestbookEditModal, GuestbookDeleteModal } from "@/components/invitation/GuestbookModals";
import { KakaoSdk, shareKakao } from "@/components/invitation/KakaoShare";
import { splitAccounts, accountLabel, formatGuestbookDate } from "@/components/invitation/accounts";
import { useWeddingDate, useCountdown, useBgm, useMainSlide, useGallery } from "@/components/invitation/hooks";

const serif = Noto_Serif_KR({
    subsets: ["latin"],
    weight: ["400", "700"],
    variable: "--font-serif"
});

/** 클래식 화이트 템플릿 */
export default function Type1({ data, isSample = false }: TemplateProps) {
    const router = useRouter();
    const { toast } = useToast();

    const [isContactOpen, setIsContactOpen] = useState(false);
    const [isInterviewOpen, setIsInterviewOpen] = useState(false);
    const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
    const [openAccount, setOpenAccount] = useState<string | null>(null);
    const [visibleCount, setVisibleCount] = useState(3);
    const [editTarget, setEditTarget] = useState<GuestbookEntry | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<GuestbookEntry | null>(null);

    const wd = useWeddingDate(data.date);
    const timeLeft = useCountdown(wd.date);
    const { audioRef, isPlaying, toggle: toggleMusic } = useBgm();
    const mainIdx = useMainSlide(data.mainImages.length);
    const gallery = useGallery(data.gallery.length);
    const accounts = splitAccounts(data.accounts);

    const copyText = (text: string) => {
        navigator.clipboard.writeText(text);
        toast("복사되었습니다.");
    };

    const handleShare = () => {
        if (isSample) {
            toast("샘플 화면에서는 카카오톡 공유를 사용할 수 없습니다.");
            return;
        }
        shareKakao(data);
    };

    const refresh = () => router.refresh();

    return (
        <div className={`${serif.variable} font-sans bg-[#FAF8F6] min-h-screen flex justify-center selection:bg-rose-50`}>
            <KakaoSdk/>

            <div className="w-full max-w-[430px] bg-white shadow-2xl relative flex flex-col overflow-hidden">
                <FlowerPetals/>
                <audio ref={audioRef} loop src="/music/sample1.mp3"/>

                {/* 음악 버튼: 샘플 페이지는 사이트 헤더 아래로 내림 */}
                <div className={`fixed ${isSample ? "top-36" : "top-8"} right-[calc(50%-185px)] z-[90] max-[430px]:right-8`}>
                    <button onClick={toggleMusic} className="transition-transform active:scale-95">
                        <div className={`relative flex items-center justify-center w-10 h-10 rounded-full backdrop-blur-md shadow-lg ${isPlaying ? "bg-white/40 ring-1 ring-rose-200" : "bg-black/10"}`}>
                            <Music size={18} className={isPlaying ? "text-rose-400 animate-pulse" : "text-white/80"}/>
                        </div>
                    </button>
                </div>

                {/* 1. 메인 섹션 */}
                <section className="relative h-[100vh] overflow-hidden">
                    <KenBurnsImage>
                        <AnimatePresence mode="wait">
                            {data.mainImages.length > 0 ? (
                                <motion.div
                                    key={mainIdx}
                                    initial={{opacity: 0}}
                                    animate={{opacity: 1}}
                                    exit={{opacity: 0}}
                                    transition={{duration: 1.2}}
                                    className="absolute inset-0"
                                >
                                    <img
                                        src={data.mainImages[mainIdx]}
                                        alt="메인 웨딩 사진"
                                        className="absolute inset-0 w-full h-full object-cover brightness-95"
                                        fetchPriority="high"
                                    />
                                </motion.div>
                            ) : (
                                <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">사진 없음</div>
                            )}
                        </AnimatePresence>
                    </KenBurnsImage>

                    <div className="absolute inset-0 flex flex-col items-center justify-between py-28 text-white text-center z-10">
                        <motion.div initial={{opacity: 0, y: 30}} animate={{opacity: 1, y: 0}} transition={{duration: 1.2}}>
                            <p className="text-[10px] tracking-[0.5em] font-medium opacity-90 uppercase bg-black/5 px-4 py-1.5 rounded-full backdrop-blur-[2px]">
                                The Day of Our Wedding
                            </p>
                            <h1 className="text-4xl font-serif mt-8 font-bold">
                                {data.groom.name} <span className="font-light mx-1 opacity-70">&</span> {data.bride.name}
                            </h1>
                        </motion.div>
                        <motion.div className="font-serif" initial={{opacity: 0}} animate={{opacity: 1}} transition={{duration: 1.5, delay: 0.5}}>
                            <p className="text-xl tracking-widest uppercase">{wd.year}. {wd.month + 1}. {wd.day}. {wd.weekdayShortEn}</p>
                            <p className="text-sm font-light opacity-80 mt-2">{data.location} {data.detail}</p>
                        </motion.div>
                    </div>
                </section>

                {/* 2. 초대글 */}
                <section className="py-28 px-10 text-center bg-white">
                    <FadeIn>
                        <Heart className="mx-auto text-rose-200 mb-10" size={26}/>
                        <h2 className="font-serif text-2xl mb-12 tracking-[0.15em] font-bold italic">초대합니다</h2>
                        <p className="font-serif text-[17px] leading-[2.3] text-gray-600 mb-16 whitespace-pre-wrap">
                            {data.message}
                        </p>
                    </FadeIn>

                    {data.middleImage && (
                        <FadeIn delay={0.2}>
                            <div className="relative aspect-[4/5] w-full rounded-[2.5rem] overflow-hidden mb-16 shadow-xl shadow-rose-50/50">
                                <img src={data.middleImage} alt="서브 사진" className="absolute inset-0 w-full h-full object-cover"/>
                            </div>
                        </FadeIn>
                    )}

                    <FadeIn delay={0.3}>
                        <div className="space-y-6 text-gray-800 font-serif mb-12 text-lg">
                            <div><span className="text-gray-400 font-sans text-sm mr-3">신랑</span>
                                <b>{data.groom.name}</b> <span className="text-gray-300 mx-2">|</span> {data.groom.father} · {data.groom.mother}{data.groom.order ? `의 ${data.groom.order}` : ""}
                            </div>
                            <div><span className="text-gray-400 font-sans text-sm mr-3">신부</span>
                                <b>{data.bride.name}</b> <span className="text-gray-300 mx-2">|</span> {data.bride.father} · {data.bride.mother}{data.bride.order ? `의 ${data.bride.order}` : ""}
                            </div>
                        </div>
                        <button onClick={() => setIsContactOpen(true)}
                                className="px-12 py-5 bg-[#FBF7F4] text-[#B19888] rounded-2xl font-bold text-sm flex items-center gap-3 mx-auto shadow-sm">
                            <Phone size={16}/> 연락처 보기
                        </button>
                    </FadeIn>
                </section>

                {/* 3. 달력 & 디데이 */}
                <section className="py-24 bg-[#FCFAF8] text-center border-y border-[#F3EFEA]">
                    <FadeIn>
                        <h3 className="font-serif text-2xl text-gray-800 italic font-bold">{wd.year}년 {wd.month + 1}월 {wd.day}일</h3>
                        <p className="font-serif text-rose-300 mt-2 font-bold tracking-widest text-sm uppercase">
                            {wd.weekdayLongEn} {wd.timeEn}
                        </p>
                    </FadeIn>
                    <FadeIn delay={0.2}>
                        <div className="max-w-[290px] mx-auto grid grid-cols-7 gap-y-5 text-sm my-12 px-2">
                            {['일', '월', '화', '수', '목', '금', '토'].map(d => (
                                <div key={d} className={`font-bold text-[11px] ${d === '일' ? 'text-rose-400' : 'text-gray-300'}`}>{d}</div>
                            ))}
                            {Array.from({length: wd.firstDayOfMonth}, (_, i) => (<div key={`empty-${i}`}/>))}
                            {Array.from({length: wd.daysInMonth}, (_, i) => {
                                const day = i + 1;
                                const isWeddingDay = day === wd.day;
                                return (
                                    <div key={day} className={`py-1.5 flex items-center justify-center ${isWeddingDay ? 'bg-rose-400 text-white rounded-full font-bold scale-110' : 'text-gray-600 font-light'}`}>{day}</div>
                                );
                            })}
                        </div>
                    </FadeIn>
                    <FadeIn delay={0.3}>
                        <div className="flex justify-center items-center gap-5 text-gray-800">
                            {([["days", "DAYS"], ["hours", "HOURS"], ["minutes", "MINS"], ["seconds", "SECS"]] as const).map(([key, label], i) => (
                                <React.Fragment key={key}>
                                    {i > 0 && <span className="text-2xl font-bold text-gray-400 mb-6 opacity-70">:</span>}
                                    <div className="flex flex-col items-center">
                                        <span className="text-3xl font-serif tabular-nums">{String(timeLeft[key]).padStart(2, '0')}</span>
                                        <span className="text-[9px] text-gray-400 mt-2 font-bold tracking-[0.2em] font-sans">{label}</span>
                                    </div>
                                </React.Fragment>
                            ))}
                        </div>
                        <p className="mt-10 text-center text-gray-500 font-serif text-[15px] animate-fade-in">
                            {data.groom.name}, {data.bride.name}의 결혼식이 <span className="text-rose-400 font-bold text-lg mx-1">{timeLeft.days}</span>일 남았습니다.
                        </p>
                    </FadeIn>
                </section>

                {/* 4. 오시는 길 */}
                <section className="pt-24 pb-12 px-8 bg-white">
                    <FadeIn>
                        <h3 className="text-center font-serif text-2xl mb-2 text-gray-800 tracking-tighter underline underline-offset-8 decoration-gray-100 italic font-bold">오시는 길</h3>
                        <p className="text-center text-gray-300 text-[10px] tracking-[0.3em] uppercase font-sans mb-12 italic font-bold">Location</p>
                        <p className="text-center text-gray-800 font-bold text-lg mb-1">{data.location} {data.detail}</p>
                        <p className="text-center text-gray-400 text-[13px] mb-12 font-serif">{data.address}</p>
                    </FadeIn>
                    <FadeIn delay={0.2}>
                        <NaverMap lat={data.location_lat} lng={data.location_lng}
                                  className="w-full h-[350px] rounded-3xl bg-[#F9F9F9] mb-12 shadow-inner border border-gray-100 overflow-hidden"/>
                        <div className="grid grid-cols-3 gap-3 mb-12">
                            {[
                                { href: `https://map.naver.com/v5/search/${encodeURIComponent(data.address)}`, color: "#03C75A", label: "네이버 지도", external: true },
                                { href: `https://map.kakao.com/link/search/${encodeURIComponent(data.address)}`, color: "#FEE500", label: "카카오 내비", external: true },
                                { href: `tmap://search?name=${encodeURIComponent(data.address)}`, color: "#ED1C24", label: "T맵", external: false },
                            ].map((m) => (
                                <a key={m.label} href={m.href}
                                   {...(m.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                                   className="flex flex-col items-center gap-2 py-4 bg-[#FBFBFB] rounded-2xl border border-gray-50 active:bg-gray-100 transition shadow-sm hover:bg-gray-50">
                                    <Navigation size={18} style={{ color: m.color }}/>
                                    <span className="text-[11px] text-gray-500 font-bold">{m.label}</span>
                                </a>
                            ))}
                        </div>
                        <div className="space-y-8 text-[14px] border-t border-gray-50 pt-10 text-left">
                            {[["지하철", data.transport.subway], ["버스", data.transport.bus], ["주차", data.transport.parking]].map(([label, text]) => text && (
                                <div key={label} className="flex gap-4 sm:gap-5 min-w-0">
                                    <span className="shrink-0 w-12 sm:w-14 h-7 bg-[#F3F4F6] text-[#4B5563] rounded-lg text-[10px] flex items-center justify-center font-bold whitespace-nowrap">{label}</span>
                                    <p className="text-gray-500 font-light flex-1 min-w-0 leading-relaxed text-sm whitespace-pre-line break-words">{text}</p>
                                </div>
                            ))}
                        </div>
                    </FadeIn>

                    <FadeIn delay={0.15}>
                        <ReminderSection
                            groomName={data.groom.name}
                            brideName={data.bride.name}
                            date={wd.date}
                            location={data.location}
                            address={data.address}
                            detail={data.detail}
                            isSample={isSample}
                        />
                    </FadeIn>
                </section>

                {/* 5. 인터뷰 */}
                {data.interviews.length > 0 && (
                    <section className="py-24 px-10 bg-[#FAF9F7] text-center border-y border-[#F3EFEA]">
                        <FadeIn>
                            <Heart className="mx-auto text-rose-50 mb-8" size={24}/>
                            <h3 className="font-serif text-2xl text-gray-800 mb-2 italic">우리의 이야기</h3>
                            <p className="text-center text-gray-300 text-[10px] tracking-[0.3em] uppercase font-sans mb-12 italic font-bold">The Story</p>
                            <button onClick={() => setIsInterviewOpen(true)}
                                    className="px-12 py-5 bg-white text-[#A68F7F] rounded-[2rem] text-[15px] font-bold shadow-sm hover:shadow-md transition-all border border-rose-50 active:scale-95">
                                인터뷰 보기
                            </button>
                        </FadeIn>
                    </section>
                )}

                {/* 6. 웨딩 갤러리 */}
                {data.gallery.length > 0 && (
                    <section className="py-24 bg-white">
                        <h3 className="text-center font-serif text-2xl mb-2 text-gray-800 tracking-tighter underline underline-offset-8 decoration-gray-100 italic font-bold">웨딩 갤러리</h3>
                        <p className="text-center text-gray-300 text-[10px] tracking-[0.3em] uppercase font-sans mb-12 italic font-bold">Gallery</p>

                        <div className="px-4 space-y-4">
                            {/* 메인 뷰어: 탭하면 전체화면 */}
                            <div className="relative aspect-[4/5] w-full rounded-3xl overflow-hidden shadow-lg bg-gray-100 group">
                                <button type="button" onClick={() => gallery.openLightbox(gallery.current)}
                                        aria-label="사진 크게 보기"
                                        className="absolute inset-0 w-full h-full cursor-zoom-in">
                                    <img
                                        src={data.gallery[gallery.current]}
                                        alt={`갤러리 사진 ${gallery.current + 1}`}
                                        className="absolute inset-0 w-full h-full object-cover"
                                    />
                                </button>
                                <span className="absolute right-3 top-3 w-8 h-8 rounded-full bg-black/25 backdrop-blur-sm flex items-center justify-center text-white pointer-events-none">
                                    <Maximize2 size={14}/>
                                </span>
                                <button onClick={(e) => { e.stopPropagation(); gallery.prev(); }}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/50 transition-colors">
                                    <ChevronLeft size={20}/>
                                </button>
                                <button onClick={(e) => { e.stopPropagation(); gallery.next(); }}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/50 transition-colors">
                                    <ChevronRight size={20}/>
                                </button>
                            </div>

                            {/* 썸네일 */}
                            <div className="grid grid-cols-4 gap-2">
                                {data.gallery.slice(0, gallery.expanded ? undefined : 4).map((img, idx) => (
                                    <button key={idx} onClick={() => gallery.select(idx)}
                                            className={`relative aspect-square rounded-xl overflow-hidden shadow-sm transition-all ${gallery.current === idx ? 'ring-2 ring-rose-300 opacity-100' : 'opacity-60 hover:opacity-100'}`}>
                                        <img src={img} alt={`썸네일 ${idx + 1}`} className="absolute inset-0 w-full h-full object-cover" loading="lazy"/>
                                    </button>
                                ))}
                            </div>

                            {data.gallery.length > 4 && (
                                <div className="pt-6 flex justify-center">
                                    <button onClick={() => gallery.setExpanded(!gallery.expanded)}
                                            className="text-gray-400 text-xs font-bold border-b border-gray-200 pb-1 flex items-center gap-1 hover:text-gray-600 transition-colors">
                                        {gallery.expanded ? "접기" : "사진 더보기"} {gallery.expanded ? <ChevronUp size={14}/> : <Plus size={14}/>}
                                    </button>
                                </div>
                            )}
                        </div>
                    </section>
                )}

                {/* 7. 마음 전하실 곳 */}
                <section className="py-24 px-8 bg-[#FBF9F7]">
                    <FadeIn>
                        <h3 className="text-center font-serif text-2xl mb-2 text-gray-800 tracking-tighter italic font-bold">마음 전하실 곳</h3>
                        <p className="text-center text-gray-300 text-[10px] tracking-[0.3em] uppercase font-sans mb-12 italic font-bold">Gift</p>
                    </FadeIn>
                    <div className="space-y-4">
                        {([["groom", "신랑측", accounts.groom], ["bride", "신부측", accounts.bride]] as const).map(([side, title, list]) => list.length > 0 && (
                            <div key={side} className="border border-rose-50 rounded-[2rem] overflow-hidden shadow-sm shadow-rose-50/20">
                                <button onClick={() => setOpenAccount(openAccount === side ? null : side)}
                                        className={`w-full flex justify-between items-center p-7 transition-colors ${openAccount === side ? 'bg-rose-50/30 text-rose-400' : 'bg-white text-gray-700'}`}>
                                    <span className="font-serif font-bold">{title} 계좌번호</span>
                                    {openAccount === side ? <ChevronUp size={20}/> : <ChevronDown size={20}/>}
                                </button>
                                {openAccount === side && (
                                    <div className="p-7 bg-white space-y-7 divide-y divide-gray-50 text-left animate-fade-in">
                                        {list.map((acc, i) => (
                                            <div key={i} className="pt-6 first:pt-0 flex justify-between items-center">
                                                <div className="space-y-1">
                                                    <span className="text-[10px] text-rose-300 font-bold uppercase font-sans tracking-widest block">{accountLabel(acc.side)}</span>
                                                    <p className="text-[15px] font-bold text-gray-700">{acc.name}</p>
                                                    <p className="text-[12px] text-gray-400 font-sans tracking-tight">{acc.bank} {acc.num}</p>
                                                </div>
                                                <button onClick={() => copyText(acc.num)}
                                                        className="text-[11px] text-gray-400 bg-gray-50 px-4 py-2 rounded-full font-bold shadow-sm active:bg-gray-100 transition">복사</button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </section>

                {/* 8. 방명록 */}
                <section className="py-24 px-8 bg-white border-t border-gray-50">
                    <FadeIn>
                        <h3 className="text-center font-serif text-2xl mb-2 text-gray-800 tracking-tighter italic font-bold">방명록</h3>
                        <p className="text-center text-gray-300 text-[10px] tracking-[0.3em] uppercase font-sans mb-12 italic font-bold">Guestbook</p>
                    </FadeIn>
                    <div className="space-y-5 mb-12">
                        {data.guestbook.length === 0 ? (
                            <div className="bg-[#FAF9F8] p-7 rounded-[2rem] shadow-sm text-center py-12 border border-gray-50">
                                <Heart size={24} className="mx-auto text-rose-200 fill-rose-100 mb-4"/>
                                <p className="text-gray-400 text-sm leading-relaxed">아직 작성된 메시지가 없습니다.</p>
                                <p className="text-gray-400 text-sm mt-1">첫 번째 축하 글을 남겨주세요! 💌</p>
                            </div>
                        ) : data.guestbook.slice(0, visibleCount).map((g, idx) => (
                            <FadeIn key={g.id} delay={idx * 0.05}>
                                <div className="bg-[#FAF9F8] p-7 rounded-[2rem] shadow-sm text-[15px] text-gray-600 leading-relaxed border border-gray-50 animate-fade-in text-left">
                                    <div className="flex justify-between items-center mb-3">
                                        <div className="flex items-center gap-2">
                                            <Heart size={10} className="text-rose-100 fill-rose-100 shrink-0"/>
                                            <span className="font-bold text-gray-400 text-[11px] font-sans uppercase tracking-tight">{g.author_name}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[9px] text-gray-300 font-sans tracking-wider">
                                                {formatGuestbookDate(g.created_at)}
                                            </span>
                                            {!isSample && (
                                                <div className="flex gap-1">
                                                    <button type="button" onClick={() => setEditTarget(g)} className="text-[10px] text-gray-400 hover:text-rose-500 font-bold">수정</button>
                                                    <span className="text-gray-200">|</span>
                                                    <button type="button" onClick={() => setDeleteTarget(g)} className="text-[10px] text-gray-400 hover:text-rose-500 font-bold">삭제</button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <p className="whitespace-pre-line">{g.message}</p>
                                </div>
                            </FadeIn>
                        ))}
                    </div>
                    <FadeIn>
                        <div className="flex flex-col gap-4">
                            {data.guestbook.length > 3 && (
                                <div className="flex justify-center gap-6">
                                    {visibleCount < data.guestbook.length ? (
                                        <button onClick={() => setVisibleCount(data.guestbook.length)}
                                                className="py-4 text-gray-300 text-[11px] font-bold flex items-center gap-2 hover:text-gray-500 transition-colors uppercase tracking-[0.2em]">
                                            전체 보기 <ChevronDown size={14}/>
                                        </button>
                                    ) : (
                                        <button onClick={() => setVisibleCount(3)}
                                                className="py-4 text-gray-300 text-[11px] font-bold flex items-center gap-2 hover:text-gray-500 transition-colors uppercase tracking-[0.2em]">
                                            접기 <ChevronUp size={14}/>
                                        </button>
                                    )}
                                </div>
                            )}
                            <button onClick={() => setIsWriteModalOpen(true)}
                                    className="w-full py-5 border-2 border-[#E8E1D9] text-[#A68F7F] rounded-[1.8rem] font-bold text-[15px] bg-white shadow-sm hover:bg-gray-50 transition-all flex items-center justify-center gap-3 active:scale-[0.98]">
                                <MessageSquare size={18}/> 축하 메시지 남기기
                            </button>
                        </div>
                    </FadeIn>
                </section>

                <section className="py-20 px-8 bg-[#FEE500]/5 text-center">
                    <button onClick={handleShare}
                            className="w-full py-5 bg-[#FEE500] text-[#191919] rounded-[1.8rem] font-bold text-[15px] shadow-md flex items-center justify-center gap-3">
                        <Share size={18}/> 카카오톡으로 공유하기
                    </button>
                </section>

                <footer className="py-20 bg-white text-center opacity-30 text-[9px] tracking-[0.6em] text-gray-400 font-light font-sans uppercase">
                    Binary Wedding Service
                </footer>

                {/* 모달 */}
                {isContactOpen && (
                    <ContactModal groom={data.groom} bride={data.bride} isSample={isSample} toast={toast}
                                  onClose={() => setIsContactOpen(false)}/>
                )}
                {isInterviewOpen && (
                    <InterviewModal interviews={data.interviews} onClose={() => setIsInterviewOpen(false)}/>
                )}
                <GalleryLightbox
                    images={data.gallery}
                    index={gallery.lightboxIdx}
                    onClose={gallery.closeLightbox}
                    onChange={gallery.changeLightbox}
                />
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
                {isWriteModalOpen && (
                    <GuestbookWriteModal toast={toast} url_id={data.url_id} isSample={isSample}
                                         onClose={() => setIsWriteModalOpen(false)}
                                         onSuccess={() => { setIsWriteModalOpen(false); refresh(); }}/>
                )}
            </div>
        </div>
    );
}
