import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { Home, Plus, Search } from "lucide-react";

export default function NotFound() {
    return (
        <div className="min-h-screen bg-[#FAFAFA] font-sans flex flex-col">
            <SiteHeader />
            <main className="flex-1 pt-28 pb-24 px-4 sm:px-6 flex items-center justify-center">
                <div className="max-w-lg w-full text-center">
                    {/* 404 숫자 - 요즘 트렌드: 크고 미니멀 */}
                    <p className="text-[140px] sm:text-[180px] font-black text-slate-100 leading-none select-none tracking-tighter">
                        404
                    </p>
                    <div className="-mt-8 sm:-mt-12 space-y-4">
                        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                            페이지를 찾을 수 없어요
                        </h1>
                        <p className="text-slate-500 text-[15px] leading-relaxed max-w-sm mx-auto">
                            주소가 잘못되었거나<br className="sm:hidden" />
                            삭제된 청첩장일 수 있어요.
                        </p>
                    </div>

                    {/* CTA 버튼들 */}
                    <div className="mt-12 flex flex-col sm:flex-row gap-3 justify-center">
                        <Link
                            href="/"
                            className="flex items-center justify-center gap-2 px-6 py-4 bg-slate-900 text-white rounded-xl font-semibold text-sm hover:bg-slate-800 transition shadow-sm"
                        >
                            <Home size={18} /> 메인으로
                        </Link>
                        <Link
                            href="/make"
                            className="flex items-center justify-center gap-2 px-6 py-4 bg-white border border-slate-200 text-slate-700 rounded-xl font-semibold text-sm hover:bg-slate-50 hover:border-slate-300 transition"
                        >
                            <Plus size={18} /> 청첩장 만들기
                        </Link>
                        <Link
                            href="/check"
                            className="flex items-center justify-center gap-2 px-6 py-4 bg-white border border-slate-200 text-slate-700 rounded-xl font-semibold text-sm hover:bg-slate-50 hover:border-slate-300 transition"
                        >
                            <Search size={18} /> 내 청첩장 수정
                        </Link>
                    </div>
                </div>
            </main>
            <SiteFooter />
        </div>
    );
}
