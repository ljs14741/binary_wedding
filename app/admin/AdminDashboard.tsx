"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
    getAdminStats,
    getAdminInvitationList,
    getAdminTrendDaily,
    getAdminTrendWeekly,
    type AdminInvitationItem,
} from "@/app/actions-admin";
import { adminLogout } from "@/lib/admin-auth";
import AdminDonations from "./AdminDonations";
import { getTemplateMeta } from "@/components/templates/meta";
import {
    BarChart3,
    Calendar,
    ChevronLeft,
    ChevronRight,
    ExternalLink,
    Heart,
    LogOut,
    Search,
    Shield,
    TrendingUp,
    Users,
} from "lucide-react";

export default function AdminDashboard() {
    const [stats, setStats] = useState<{ total: number; today: number; thisWeek: number; thisMonth: number } | null>(null);
    const [trendDaily, setTrendDaily] = useState<{ date: string; count: number }[]>([]);
    const [trendWeekly, setTrendWeekly] = useState<{ weekStart: string; count: number }[]>([]);
    const [list, setList] = useState<{ items: AdminInvitationItem[]; total: number; totalPages: number } | null>(null);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [searchInput, setSearchInput] = useState("");
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState<"daily" | "weekly">("daily");

    const loadStats = useCallback(async () => {
        try {
            const s = await getAdminStats();
            setStats(s);
        } catch {
            setStats(null);
        }
    }, []);

    const loadTrends = useCallback(async () => {
        try {
            const [daily, weekly] = await Promise.all([getAdminTrendDaily(), getAdminTrendWeekly()]);
            setTrendDaily(daily);
            setTrendWeekly(weekly);
        } catch {
            setTrendDaily([]);
            setTrendWeekly([]);
        }
    }, []);

    const loadList = useCallback(async () => {
        setLoading(true);
        try {
            const res = await getAdminInvitationList(page, search || undefined);
            setList(res);
        } catch {
            setList(null);
        } finally {
            setLoading(false);
        }
    }, [page, search]);

    useEffect(() => {
        loadStats();
        loadTrends();
    }, [loadStats, loadTrends]);

    useEffect(() => {
        loadList();
    }, [loadList]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setSearch(searchInput);
        setPage(1);
    };

    const handleLogout = async () => {
        await adminLogout();
        window.location.reload();
    };

    return (
        <div className="min-h-screen pb-20">
            {/* 헤더 */}
            <header className="sticky top-0 z-10 bg-white/95 backdrop-blur border-b border-slate-200">
                <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Shield className="text-slate-600" size={24} />
                        <h1 className="font-bold text-slate-900 text-lg">관리자 대시보드</h1>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
                    >
                        <LogOut size={16} />
                        로그아웃
                    </button>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
                {/* 통계 카드 */}
                <section>
                    <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <BarChart3 size={16} />
                        기본 통계
                    </h2>
                    {stats ? (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            <StatCard label="전체" value={stats.total} icon={<Users size={20} />} />
                            <StatCard label="오늘" value={stats.today} icon={<Calendar size={20} />} accent />
                            <StatCard label="이번 주" value={stats.thisWeek} icon={<TrendingUp size={20} />} />
                            <StatCard label="이번 달" value={stats.thisMonth} icon={<Calendar size={20} />} />
                        </div>
                    ) : (
                        <div className="h-24 bg-slate-100 rounded-xl animate-pulse" />
                    )}
                </section>

                {/* 생성 추이 차트 */}
                <section>
                    <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <TrendingUp size={16} />
                        생성 추이
                    </h2>
                    <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6">
                        <div className="flex gap-2 mb-4">
                            <button
                                onClick={() => setTab("daily")}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                                    tab === "daily"
                                        ? "bg-slate-900 text-white"
                                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                }`}
                            >
                                일별 (30일)
                            </button>
                            <button
                                onClick={() => setTab("weekly")}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                                    tab === "weekly"
                                        ? "bg-slate-900 text-white"
                                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                }`}
                            >
                                주별 (12주)
                            </button>
                        </div>
                        {tab === "daily" ? (
                            <TrendBars
                                bars={trendDaily.map((d, i) => ({
                                    key: d.date,
                                    count: d.count,
                                    tip: `${d.date}: ${d.count}건`,
                                    // 30칸이라 5일마다 + 오늘만 날짜 표시
                                    label: i % 5 === 0 || i === trendDaily.length - 1 ? d.date.slice(5) : "",
                                }))}
                                totalLabel="최근 30일"
                            />
                        ) : (
                            <TrendBars
                                bars={trendWeekly.map((w) => ({
                                    key: w.weekStart,
                                    count: w.count,
                                    tip: `${w.weekStart} 주: ${w.count}건`,
                                    label: w.weekStart.slice(5),
                                }))}
                                totalLabel="최근 12주"
                            />
                        )}
                    </div>
                </section>

                {/* 후원 내역 */}
                <AdminDonations />

                {/* 청첩장 목록 */}
                <section>
                    <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <Users size={16} />
                        청첩장 목록
                    </h2>
                    <form onSubmit={handleSearch} className="mb-4 flex gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-3.5 text-slate-400" size={18} />
                            <input
                                type="text"
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                placeholder="url_id, 신랑/신부, 장소 검색"
                                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white focus:border-slate-400 focus:ring-1 focus:ring-slate-400 outline-none text-sm"
                            />
                        </div>
                        <button
                            type="submit"
                            className="px-5 py-3 bg-slate-900 text-white rounded-xl font-medium text-sm hover:bg-slate-800 transition"
                        >
                            검색
                        </button>
                    </form>

                    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                        {loading ? (
                            <div className="p-12 text-center text-slate-400">로딩 중...</div>
                        ) : list && list.items.length > 0 ? (
                            <>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="bg-slate-50 border-b border-slate-200">
                                                <th className="text-left py-3 px-4 font-semibold text-slate-600">신랑/신부</th>
                                                <th className="text-left py-3 px-4 font-semibold text-slate-600">테마</th>
                                                <th className="text-left py-3 px-4 font-semibold text-slate-600">예식일</th>
                                                <th className="text-left py-3 px-4 font-semibold text-slate-600 hidden sm:table-cell">장소</th>
                                                <th className="text-left py-3 px-4 font-semibold text-slate-600">생성일</th>
                                                <th className="text-left py-3 px-4 font-semibold text-slate-600 hidden sm:table-cell">수정일</th>
                                                <th className="w-12 py-3 px-2" />
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {list.items.map((item) => (
                                                <tr
                                                    key={item.id}
                                                    className="border-b border-slate-100 hover:bg-slate-50/50 transition"
                                                >
                                                    <td className="py-3 px-4">
                                                        <div className="flex items-center gap-1.5">
                                                            <span className="font-medium text-slate-900">
                                                                {item.groom_name} <Heart size={12} className="inline text-rose-400 fill-rose-400" /> {item.bride_name}
                                                            </span>
                                                            <span className="text-slate-400 text-xs">({item.url_id})</span>
                                                        </div>
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <span className={`inline-block whitespace-nowrap text-[11px] font-bold px-2 py-0.5 rounded-full ${item.template_type === "minihompy" ? "bg-sky-50 text-sky-600" : "bg-rose-50 text-rose-500"}`}>
                                                            {getTemplateMeta(item.template_type).name}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-4 text-slate-600">
                                                        {new Date(item.wedding_date).toLocaleDateString("ko-KR")}
                                                    </td>
                                                    <td className="py-3 px-4 text-slate-500 hidden sm:table-cell max-w-[120px] truncate">
                                                        {item.location_name}
                                                    </td>
                                                    <td className="py-3 px-4 text-slate-400 text-xs">
                                                        {item.created_at
                                                            ? new Date(item.created_at).toLocaleDateString("ko-KR")
                                                            : "-"}
                                                    </td>
                                                    <td className="py-3 px-4 text-slate-400 text-xs hidden sm:table-cell">
                                                        {item.updated_at
                                                            ? new Date(item.updated_at).toLocaleDateString("ko-KR")
                                                            : "-"}
                                                    </td>
                                                    <td className="py-3 px-2">
                                                        <a
                                                            href={`/${item.url_id}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
                                                            title="보기"
                                                        >
                                                            <ExternalLink size={16} />
                                                        </a>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                {list.totalPages > 1 && (
                                    <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 bg-slate-50/50">
                                        <span className="text-sm text-slate-500">
                                            총 {list.total}건
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                                disabled={page <= 1}
                                                className="p-2 rounded-lg hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition"
                                            >
                                                <ChevronLeft size={18} />
                                            </button>
                                            <span className="text-sm font-medium text-slate-700">
                                                {page} / {list.totalPages}
                                            </span>
                                            <button
                                                onClick={() => setPage((p) => Math.min(list.totalPages, p + 1))}
                                                disabled={page >= list.totalPages}
                                                className="p-2 rounded-lg hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition"
                                            >
                                                <ChevronRight size={18} />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="p-12 text-center text-slate-400">청첩장이 없습니다</div>
                        )}
                    </div>
                </section>

                <p className="text-center text-xs text-slate-400">
                    <Link href="/" className="hover:text-slate-600 underline">
                        메인으로 돌아가기
                    </Link>
                </p>
            </main>
        </div>
    );
}

/** 생성 추이 막대 그래프. 막대 높이는 기간 내 최댓값 기준 */
function TrendBars({
    bars,
    totalLabel,
}: {
    bars: { key: string; count: number; tip: string; label: string }[];
    totalLabel: string;
}) {
    if (bars.length === 0) {
        return <div className="h-40 flex items-center justify-center text-slate-400 text-sm">불러오는 중...</div>;
    }
    const max = Math.max(...bars.map((b) => b.count), 1);
    const total = bars.reduce((sum, b) => sum + b.count, 0);

    return (
        <div>
            <p className="text-xs text-slate-500 mb-3">
                {totalLabel} 합계 <b className="text-slate-900">{total}건</b>
            </p>
            <div className="flex items-stretch gap-[3px] h-40">
                {bars.map((b) => (
                    <div key={b.key} className="flex-1 min-w-0 flex flex-col" title={b.tip}>
                        {/* 막대 영역: 남은 높이를 다 쓰고 아래부터 채움 */}
                        <div className="flex-1 flex flex-col justify-end items-center">
                            {b.count > 0 && (
                                <span className="text-[10px] font-bold text-slate-600 leading-none mb-1">{b.count}</span>
                            )}
                            <div
                                className={`w-full rounded-t transition-colors ${b.count > 0 ? "bg-rose-300 hover:bg-rose-500" : "bg-slate-100"}`}
                                style={{ height: b.count > 0 ? `${(b.count / max) * 80}%` : "3px" }}
                            />
                        </div>
                        <span className="h-4 mt-1 text-[10px] text-slate-400 text-center whitespace-nowrap overflow-visible">
                            {b.label}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}

function StatCard({
    label,
    value,
    icon,
    accent,
}: {
    label: string;
    value: number;
    icon: React.ReactNode;
    accent?: boolean;
}) {
    return (
        <div
            className={` rounded-xl border p-4 ${
                accent
                    ? "bg-rose-50 border-rose-100 text-rose-700"
                    : "bg-white border-slate-200"
            }`}
        >
            <div className="flex items-center gap-2 text-slate-500 mb-1">
                {icon}
                <span className="text-xs font-bold uppercase tracking-wider">{label}</span>
            </div>
            <p className={`text-2xl font-bold ${accent ? "text-rose-700" : "text-slate-900"}`}>{value}</p>
        </div>
    );
}
