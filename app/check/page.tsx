"use client";

import { getMyInvitations, deleteInvitation } from "@/app/actions";
import { useState } from "react";
import Link from "next/link";
import { Search, Lock, User, Phone, ExternalLink, Edit, Trash2, Heart, Calendar, MapPin } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

// DB에서 받아올 데이터 타입 정의
interface Invitation {
    id: number;
    url_id: string;
    groom_name: string;
    bride_name: string;
    groom_contact: string | null;
    bride_contact: string | null;
    wedding_date: Date;
    location_name: string;
}

export default function CheckPage() {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<Invitation[] | null>(null);
    const [error, setError] = useState("");

    // 조회 핸들러
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setResult(null);

        const formData = new FormData(e.currentTarget);
        const response = await getMyInvitations(formData);

        if (response.success && response.data) {
            setResult(response.data as Invitation[]);
        } else {
            setError(typeof response.message === 'string' ? response.message : "조회에 실패했습니다.");
        }
        setLoading(false);
    };

    // 삭제 핸들러
    const handleDelete = async (id: number) => {
        if (confirm("정말로 이 청첩장을 삭제하시겠습니까?\n삭제된 데이터는 복구할 수 없습니다.")) {
            try {
                const res = await deleteInvitation(id);
                if (res.success) {
                    alert("성공적으로 삭제되었습니다.");
                    // 삭제된 항목 화면에서 제거
                    setResult((prev) => prev ? prev.filter(item => item.id !== id) : null);
                }
            } catch (e) {
                alert("삭제 중 오류가 발생했습니다.");
            }
        }
    };

    return (
        <div className="min-h-screen bg-[#FDFCFB] font-sans selection:bg-rose-100 flex flex-col">
            {/* 1. 헤더 추가 */}
            <SiteHeader />

            {/* 2. 본문 (헤더 높이만큼 pt-24 여백 추가) */}
            <div className="flex-1 pt-32 pb-20 px-4">
                <div className="max-w-md mx-auto space-y-10">

                    {/* 헤더 */}
                    <div className="text-center space-y-3">
                        <Link href="/" className="text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-widest">
                            ← 메인으로 돌아가기
                        </Link>
                        <h1 className="text-3xl font-serif font-bold text-slate-900">내 청첩장 관리</h1>
                        <p className="text-slate-500 text-sm leading-relaxed">
                            신청 시 입력한 <b>이름, 휴대폰 번호, 비밀번호</b>가<br/> 모두 일치해야 조회 및 관리가 가능합니다.
                        </p>
                    </div>

                    {/* 조회 폼 */}
                    <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-white ring-1 ring-slate-100">
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500 ml-3">이름 (신랑 또는 신부)</label>
                                <div className="relative group">
                                    <User className="absolute left-5 top-4 text-slate-400 group-focus-within:text-slate-800 transition-colors" size={18} />
                                    <input
                                        name="name"
                                        placeholder="예: 이진호"
                                        required
                                        className="w-full pl-12 pr-6 py-3.5 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-slate-800 focus:ring-1 focus:ring-slate-800 transition-all outline-none text-slate-800 font-medium"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500 ml-3">휴대폰 번호</label>
                                <div className="relative group">
                                    <Phone className="absolute left-5 top-4 text-slate-400 group-focus-within:text-slate-800 transition-colors" size={18} />
                                    <input
                                        name="phone"
                                        type="tel"
                                        placeholder="예: 010-1234-5678"
                                        required
                                        className="w-full pl-12 pr-6 py-3.5 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-slate-800 focus:ring-1 focus:ring-slate-800 transition-all outline-none text-slate-800 font-medium"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500 ml-3">비밀번호</label>
                                <div className="relative group">
                                    <Lock className="absolute left-5 top-4 text-slate-400 group-focus-within:text-slate-800 transition-colors" size={18} />
                                    <input
                                        name="password"
                                        type="password"
                                        placeholder="숫자 4~6자리"
                                        required
                                        className="w-full pl-12 pr-6 py-3.5 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-slate-800 focus:ring-1 focus:ring-slate-800 transition-all outline-none text-slate-800 font-medium tracking-widest"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold text-base shadow-lg hover:bg-slate-800 hover:scale-[1.02] active:scale-[0.98] transition-all flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
                            >
                                {loading ? "조회 중..." : <><Search size={18} /> 청첩장 조회하기</>}
                            </button>
                        </form>

                        {error && (
                            <div className="mt-6 p-4 bg-rose-50 text-rose-500 text-sm font-bold rounded-xl text-center animate-pulse border border-rose-100">
                                🚨 {error}
                            </div>
                        )}
                    </div>

                    {/* 조회 결과 리스트 */}
                    {result && (
                        <div className="space-y-6 animate-fade-in-up pb-10">
                            <h3 className="font-bold text-slate-800 text-lg ml-2 flex items-center gap-2">
                                <Search size={20} className="text-slate-400"/>
                                조회 결과 <span className="text-rose-500">{result.length}</span>건
                            </h3>

                            {result.map((item) => (
                                <div key={item.id} className="bg-white p-7 rounded-[2.5rem] shadow-xl border border-white ring-1 ring-slate-100 space-y-5 transition-transform hover:scale-[1.01]">
                                    {/* 상단 정보 */}
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h4 className="text-2xl font-serif font-bold text-slate-900 flex items-center gap-2">
                                                {item.groom_name} <Heart size={16} className="text-rose-400 fill-rose-400"/> {item.bride_name}
                                            </h4>
                                            <div className="flex items-center gap-1 text-sm text-slate-400 mt-2 font-medium">
                                                <Calendar size={14} />
                                                {new Date(item.wedding_date).toLocaleString()}
                                            </div>
                                        </div>
                                        <span className="bg-green-50 text-green-600 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wide border border-green-100">
                            Active
                        </span>
                                    </div>

                                    {/* 상세 정보 */}
                                    <div className="bg-slate-50 p-5 rounded-2xl text-sm text-slate-600 space-y-2 border border-slate-100">
                                        <p className="flex items-center gap-2">
                                            <MapPin size={14} className="text-slate-400"/>
                                            <span className="font-bold text-slate-500">장소</span> {item.location_name}
                                        </p>
                                        <p className="flex items-center gap-2">
                                            <Phone size={14} className="text-slate-400"/>
                                            <span className="font-bold text-slate-500">연락처</span> {item.groom_contact || item.bride_contact}
                                        </p>
                                    </div>

                                    {/* 액션 버튼들 */}
                                    <div className="grid grid-cols-3 gap-3 pt-2">
                                        <a href={`/${item.url_id}`} target="_blank" className="flex items-center justify-center gap-1.5 py-3.5 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition shadow-md active:scale-95">
                                            <ExternalLink size={16} /> 보기
                                        </a>

                                        {/* 수정 버튼: /edit/[url_id] 로 이동 */}
                                        <Link href={`/edit/${item.url_id}`} className="flex items-center justify-center gap-1.5 py-3.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-50 hover:border-slate-300 transition shadow-sm active:scale-95">
                                            <Edit size={16} /> 수정
                                        </Link>

                                        {/* 삭제 버튼 */}
                                        <button onClick={() => handleDelete(item.id)} className="flex items-center justify-center gap-1.5 py-3.5 bg-white border border-rose-100 text-rose-500 rounded-xl text-sm font-bold hover:bg-rose-50 hover:border-rose-200 transition shadow-sm active:scale-95">
                                            <Trash2 size={16} /> 삭제
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* 3. 푸터 추가 */}
            <SiteFooter />
        </div>
    );
}