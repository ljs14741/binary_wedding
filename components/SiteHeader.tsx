"use client";

import { useState, useEffect } from "react";
import Link from 'next/link';
import Image from 'next/image';
import { motion } from "framer-motion";
import { Coffee, Search, MessageCircle, X, Heart } from 'lucide-react';

export default function SiteHeader() {
    const [isDonateOpen, setIsDonateOpen] = useState(false);
    const KAKAO_CHAT_URL = "http://pf.kakao.com/_xdVEhX/chat";

    // 메인 화면 '정말 무료인가요?' 모달에서 후원하기 클릭 시 열림
    useEffect(() => {
        const handler = () => setIsDonateOpen(true);
        window.addEventListener('openDonateModal', handler);
        return () => window.removeEventListener('openDonateModal', handler);
    }, []);

    return (
        <>
            {/* 1. 헤더 본문 */}
            <header className="fixed top-0 w-full z-[100] bg-white/90 backdrop-blur-md py-4 px-6 flex justify-between items-center border-b border-rose-50 shadow-sm transition-all">
                <Link href="/" className="flex flex-col group cursor-pointer">
                    <span className="text-xl font-serif font-black tracking-tighter text-slate-900 group-hover:text-rose-600 transition-colors">
                        Binary Wedding
                    </span>
                    <span className="text-[10px] text-rose-500 font-bold tracking-widest leading-none mt-1">로그인 · 광고 없는 무료 청첩장</span>
                </Link>
                <nav className="flex gap-4 md:gap-6 text-[13px] md:text-[14px] font-bold text-slate-700 items-center">

                    <a href={KAKAO_CHAT_URL} target="_blank" rel="noopener noreferrer" className="hover:text-rose-600 transition-colors hidden lg:flex items-center gap-1">
                        <MessageCircle size={16} /> 문의하기
                    </a>

                    <button onClick={() => setIsDonateOpen(true)} className="hover:text-rose-600 transition-colors hidden lg:flex items-center gap-1">
                        <Coffee size={16} /> 후원하기
                    </button>

                    <div className="w-px h-3 bg-slate-300 hidden lg:block mx-1"></div>

                    {/* 메인 페이지의 ID로 이동하려면 절대 경로(/)를 붙여줘야 다른 페이지에서도 작동함 */}
                    <Link href="/#samples" className="hover:text-rose-600 transition-colors cursor-pointer hidden md:block">
                        샘플 보기
                    </Link>

                    <Link href="/reviews" className="hover:text-rose-600 transition-colors cursor-pointer hidden md:block">
                        이용후기
                    </Link>

                    <Link href="/#faq" className="hover:text-rose-600 transition-colors cursor-pointer hidden md:block">
                        자주 묻는 질문
                    </Link>

                    <Link href="/check" className="hover:text-rose-600 transition-colors flex items-center gap-1">
                        <Search size={16} /> <span className="hidden md:inline">내 청첩장</span> 수정
                    </Link>

                    <Link href="/make" className="bg-slate-900 text-white px-5 py-2.5 rounded-full hover:bg-rose-600 transition-all shadow-md active:scale-95">
                        만들기
                    </Link>
                </nav>
            </header>

            {/* 2. 후원 모달 (헤더에 포함시킴) */}
            {isDonateOpen && (
                <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm animate-fade-in">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        className="bg-white rounded-[2.5rem] p-8 md:p-10 max-w-sm w-full text-center relative shadow-2xl"
                    >
                        <button
                            onClick={() => setIsDonateOpen(false)}
                            className="absolute top-6 right-6 text-slate-300 hover:text-slate-500 transition"
                        >
                            <X size={24} />
                        </button>

                        <div className="space-y-6">
                            <motion.div
                                initial={{ scale: 0.5, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.1 }}
                                className="w-16 h-16 bg-[#FEE500] rounded-full flex items-center justify-center mx-auto text-[#191919] shadow-md relative"
                            >
                                <Coffee size={32} className="relative z-10" />
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
                                    className="absolute -top-1 -right-1"
                                >
                                    <Heart size={20} className="text-rose-400 fill-rose-400" />
                                </motion.div>
                            </motion.div>
                            <div>
                                <h4 className="text-2xl font-serif font-bold text-slate-900 mb-2">개발자에게 커피 쏘기</h4>
                                <p className="text-slate-500 text-sm">
                                    카카오톡 카메라로 QR을 스캔해주세요.<br/>
                                    보내주신 후원은 서버비에 소중히 사용됩니다.<br/>
                                    <span className="font-bold text-rose-500">사실 치킨 먹고 싶어요!! 🍗</span>
                                </p>
                            </div>

                            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 mx-auto">
                                <div className="relative w-48 h-48 mx-auto">
                                    <Image
                                        src="/qrcode.jpg"
                                        alt="카카오페이 QR"
                                        fill
                                        className="object-contain rounded-xl"
                                    />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </>
    );
}