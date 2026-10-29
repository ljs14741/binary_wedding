"use server";

import { prisma } from "@/lib/prisma";
import { requireAdminSession, isAdminSession } from "@/lib/admin-auth";
import { Prisma } from "@prisma/client";

const LIST_PAGE_SIZE = 20;

// 방명록이 이만큼 있으면 하객이 실제로 본 청첩장으로 봄
const USED_GUESTBOOK_MIN = 2;

// 날짜 구분은 항상 한국 시간 기준 (DB DATE()는 저장 시간대 때문에 9시간 밀림)
const KST_DAY = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul" });

/** Date → 한국 날짜 "YYYY-MM-DD" */
function kstKey(d: Date): string {
    return KST_DAY.format(d);
}

/** "YYYY-MM-DD" 에 n일 더함 */
function addDays(key: string, n: number): string {
    const [y, m, d] = key.split("-").map(Number);
    return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10);
}

/** 그 주 월요일 "YYYY-MM-DD" */
function mondayOf(key: string): string {
    const [y, m, d] = key.split("-").map(Number);
    const weekday = (new Date(Date.UTC(y, m - 1, d)).getUTCDay() + 6) % 7; // 월=0 … 일=6
    return addDays(key, -weekday);
}

/** 한국 날짜 0시 시각 */
function kstStart(key: string): Date {
    return new Date(`${key}T00:00:00+09:00`);
}

/** from 이후 생성 시각 목록 */
async function createdSince(from: Date): Promise<Date[]> {
    const rows = await prisma.invitations.findMany({
        where: { created_at: { gte: from } },
        select: { created_at: true },
    });
    return rows.flatMap((r) => (r.created_at ? [r.created_at] : []));
}

/** 관리자 기본 통계 */
export async function getAdminStats(): Promise<{
    total: number;
    today: number;
    thisWeek: number;
    thisMonth: number;
}> {
    await requireAdminSession();

    const today = kstKey(new Date());
    const startOfToday = kstStart(today);
    const startOfWeek = kstStart(mondayOf(today)); // 주별 추이와 같이 월요일 시작
    const startOfMonth = kstStart(`${today.slice(0, 7)}-01`);

    const [total, todayCount, thisWeek, thisMonth] = await Promise.all([
        prisma.invitations.count(),
        prisma.invitations.count({ where: { created_at: { gte: startOfToday } } }),
        prisma.invitations.count({ where: { created_at: { gte: startOfWeek } } }),
        prisma.invitations.count({ where: { created_at: { gte: startOfMonth } } }),
    ]);

    return { total, today: todayCount, thisWeek, thisMonth };
}

const TREND_DAYS = 30;
const TREND_WEEKS = 12;

/** 일별 생성 수 (오늘 포함 최근 30일, 없는 날은 0) */
export async function getAdminTrendDaily(): Promise<{ date: string; count: number }[]> {
    await requireAdminSession();

    const firstDay = addDays(kstKey(new Date()), -(TREND_DAYS - 1));
    const counts = new Map<string, number>();
    for (const at of await createdSince(kstStart(firstDay))) {
        const key = kstKey(at);
        counts.set(key, (counts.get(key) ?? 0) + 1);
    }

    return Array.from({ length: TREND_DAYS }, (_, i) => {
        const date = addDays(firstDay, i);
        return { date, count: counts.get(date) ?? 0 };
    });
}

/** 주별 생성 수 (이번 주 포함 최근 12주, 월요일 시작, 없는 주는 0) */
export async function getAdminTrendWeekly(): Promise<{ weekStart: string; count: number }[]> {
    await requireAdminSession();

    const firstWeek = addDays(mondayOf(kstKey(new Date())), -7 * (TREND_WEEKS - 1));
    const counts = new Map<string, number>();
    for (const at of await createdSince(kstStart(firstWeek))) {
        const key = mondayOf(kstKey(at));
        counts.set(key, (counts.get(key) ?? 0) + 1);
    }

    return Array.from({ length: TREND_WEEKS }, (_, i) => {
        const weekStart = addDays(firstWeek, i * 7);
        return { weekStart, count: counts.get(weekStart) ?? 0 };
    });
}

export type AdminInvitationItem = {
    id: number;
    url_id: string;
    groom_name: string;
    bride_name: string;
    wedding_date: Date;
    location_name: string;
    template_type: string;
    created_at: Date | null;
    updated_at: Date | null;
    guestbook_count: number;
};

/** 방명록이 USED_GUESTBOOK_MIN 개 이상인 청첩장 id */
async function usedInvitationIds(): Promise<number[]> {
    const rows = await prisma.invitation_guestbook.groupBy({
        by: ["invitation_id"],
        having: { invitation_id: { _count: { gte: USED_GUESTBOOK_MIN } } },
    });
    return rows.map((r) => r.invitation_id);
}

export type AdminListSort = "created" | "wedding";
export type AdminListStatus = "all" | "upcoming" | "past";

/**
 * 청첩장 목록 (페이지네이션)
 * sort created: 생성일 최신순 / wedding: 다가오는 예식 가까운 순 → 끝난 예식 최근 순
 * status upcoming: 오늘(한국 날짜) 포함 이후 예식 / past: 어제까지 끝난 예식
 */
export async function getAdminInvitationList(
    page: number = 1,
    search?: string,
    onlyUsed: boolean = false,
    sort: AdminListSort = "created",
    status: AdminListStatus = "all"
): Promise<{
    items: AdminInvitationItem[];
    total: number;
    totalPages: number;
    usedTotal: number;
    upcomingTotal: number;
    pastTotal: number;
}> {
    await requireAdminSession();

    const skip = (page - 1) * LIST_PAGE_SIZE;

    const where: Prisma.invitationsWhereInput = {};
    if (search?.trim()) {
        const q = `%${search.trim()}%`;
        where.OR = [
            { url_id: { contains: q } },
            { groom_name: { contains: q } },
            { bride_name: { contains: q } },
            { location_name: { contains: q } },
        ];
    }

    const usedIds = await usedInvitationIds();
    if (onlyUsed) where.id = { in: usedIds };

    // 오늘 0시(한국) 기준으로 예정/종료 나눔
    const todayStart = kstStart(kstKey(new Date()));
    const upcomingWhere: Prisma.invitationsWhereInput = { ...where, wedding_date: { gte: todayStart } };
    const pastWhere: Prisma.invitationsWhereInput = { ...where, wedding_date: { lt: todayStart } };
    if (status === "upcoming") where.wedding_date = { gte: todayStart };
    if (status === "past") where.wedding_date = { lt: todayStart };

    const select = {
        id: true,
        url_id: true,
        groom_name: true,
        bride_name: true,
        wedding_date: true,
        location_name: true,
        template_type: true,
        created_at: true,
        updated_at: true,
        _count: { select: { invitation_guestbook: true } },
    } satisfies Prisma.invitationsSelect;

    const [total, upcomingTotal, pastTotal] = await Promise.all([
        prisma.invitations.count({ where }),
        prisma.invitations.count({ where: { wedding_date: { gte: todayStart } } }),
        prisma.invitations.count({ where: { wedding_date: { lt: todayStart } } }),
    ]);

    let items;
    if (sort === "wedding" && status === "all") {
        // 예정 → 종료 순으로 이어 붙여 페이지를 자름
        const upcomingCount = await prisma.invitations.count({ where: upcomingWhere });
        const upcoming = skip < upcomingCount
            ? await prisma.invitations.findMany({ where: upcomingWhere, select, orderBy: { wedding_date: "asc" }, skip, take: LIST_PAGE_SIZE })
            : [];
        const rest = LIST_PAGE_SIZE - upcoming.length;
        const past = rest > 0
            ? await prisma.invitations.findMany({ where: pastWhere, select, orderBy: { wedding_date: "desc" }, skip: Math.max(0, skip - upcomingCount), take: rest })
            : [];
        items = [...upcoming, ...past];
    } else {
        const orderBy: Prisma.invitationsOrderByWithRelationInput =
            sort === "wedding" ? { wedding_date: status === "past" ? "desc" : "asc" } : { created_at: "desc" };
        items = await prisma.invitations.findMany({ where, select, orderBy, skip, take: LIST_PAGE_SIZE });
    }

    return {
        items: items.map(({ _count, ...rest }) => ({ ...rest, guestbook_count: _count.invitation_guestbook })),
        total,
        totalPages: Math.ceil(total / LIST_PAGE_SIZE),
        usedTotal: usedIds.length,
        upcomingTotal,
        pastTotal,
    };
}

/** 후기 화면에서 답변 칸을 보여줄지 (관리자 로그인 여부) */
export async function isReviewAdmin(): Promise<boolean> {
    return isAdminSession();
}

const REVIEW_REPLY_MAX = 1000;

/** 후기 개발자 답변 저장 (관리자만). 빈 내용이면 답변 삭제 */
export async function saveReviewReply(id: number, content: string): Promise<{ success: boolean; message?: string }> {
    // 운영에선 throw 메시지가 가려져서 원인을 결과로 돌려줌
    if (!(await isAdminSession())) {
        return { success: false, message: "관리자 로그인이 만료됐어요. /admin에서 다시 로그인해 주세요." };
    }
    const reply = content.trim().slice(0, REVIEW_REPLY_MAX);
    try {
        const exists = await prisma.reviews.findUnique({ where: { id }, select: { id: true } });
        if (!exists) return { success: false, message: "후기를 찾을 수 없습니다. 새로고침해 주세요." };
        await prisma.reviews.update({
            where: { id },
            data: reply ? { admin_reply: reply, admin_replied_at: new Date() } : { admin_reply: null, admin_replied_at: null },
        });
        return { success: true };
    } catch (e) {
        const code = e && typeof e === "object" && "code" in e ? String((e as { code: unknown }).code) : "";
        console.error("[후기 답변 저장 실패]", id, e);
        return { success: false, message: `답변 저장 중 오류가 났어요.${code ? ` (${code})` : ""}` };
    }
}
