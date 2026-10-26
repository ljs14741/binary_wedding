"use server";

import { prisma } from "@/lib/prisma";
import { requireAdminSession, isAdminSession } from "@/lib/admin-auth";
import { Prisma } from "@prisma/client";

const LIST_PAGE_SIZE = 20;

/** 관리자 기본 통계 */
export async function getAdminStats(): Promise<{
    total: number;
    today: number;
    thisWeek: number;
    thisMonth: number;
}> {
    await requireAdminSession();

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [total, today, thisWeek, thisMonth] = await Promise.all([
        prisma.invitations.count(),
        prisma.invitations.count({ where: { created_at: { gte: startOfToday } } }),
        prisma.invitations.count({ where: { created_at: { gte: startOfWeek } } }),
        prisma.invitations.count({ where: { created_at: { gte: startOfMonth } } }),
    ]);

    return { total, today, thisWeek, thisMonth };
}

/** 일별 생성 수 (최근 30일) */
export async function getAdminTrendDaily(): Promise<{ date: string; count: number }[]> {
    await requireAdminSession();

    const rows = await prisma.$queryRaw<{ d: Date; cnt: bigint }[]>`
        SELECT DATE(created_at) AS d, COUNT(*) AS cnt
        FROM invitations
        WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
        GROUP BY DATE(created_at)
        ORDER BY d ASC
    `;

    return rows.map((r) => ({
        date: r.d instanceof Date ? r.d.toISOString().slice(0, 10) : String(r.d).slice(0, 10),
        count: Number(r.cnt),
    }));
}

/** 주별 생성 수 (최근 12주) */
export async function getAdminTrendWeekly(): Promise<{ weekStart: string; count: number }[]> {
    await requireAdminSession();

    const rows = await prisma.$queryRaw<{ w: Date; cnt: bigint }[]>`
        SELECT DATE_SUB(DATE(created_at), INTERVAL WEEKDAY(created_at) DAY) AS w, COUNT(*) AS cnt
        FROM invitations
        WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 12 WEEK)
        GROUP BY w
        ORDER BY w ASC
    `;

    return rows.map((r) => ({
        weekStart: r.w instanceof Date ? r.w.toISOString().slice(0, 10) : String(r.w).slice(0, 10),
        count: Number(r.cnt),
    }));
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
};

/** 청첩장 목록 (페이지네이션, 생성일순 내림차순) */
export async function getAdminInvitationList(
    page: number = 1,
    search?: string
): Promise<{
    items: AdminInvitationItem[];
    total: number;
    totalPages: number;
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

    const [items, total] = await Promise.all([
        prisma.invitations.findMany({
            where,
            select: {
                id: true,
                url_id: true,
                groom_name: true,
                bride_name: true,
                wedding_date: true,
                location_name: true,
                template_type: true,
                created_at: true,
                updated_at: true,
            },
            orderBy: { created_at: "desc" },
            skip,
            take: LIST_PAGE_SIZE,
        }),
        prisma.invitations.count({ where }),
    ]);

    return {
        items: items as AdminInvitationItem[],
        total,
        totalPages: Math.ceil(total / LIST_PAGE_SIZE),
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
