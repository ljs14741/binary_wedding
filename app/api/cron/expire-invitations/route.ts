import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { deleteInvitationUploads } from "@/lib/upload";

/** 결혼식 1개월 경과 시 청첩장 폐기 정책 */
const RETENTION_MONTHS = 1;

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(request: NextRequest) {
    // 외부 호출 방지: CRON_SECRET 필수, 미설정 시 모든 요청 거부
    const cronSecret = process.env.CRON_SECRET;
    if (!cronSecret) {
        return NextResponse.json({ error: "CRON_SECRET not configured" }, { status: 503 });
    }
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();
    const cutoff = new Date(now);
    cutoff.setMonth(cutoff.getMonth() - RETENTION_MONTHS);

    const expired = await prisma.invitations.findMany({
        where: { wedding_date: { lt: cutoff } },
        select: { id: true, url_id: true, groom_name: true, bride_name: true, wedding_date: true },
    });

    const deleted: { url_id: string; groom: string; bride: string }[] = [];

    for (const inv of expired) {
        await prisma.invitations.delete({ where: { id: inv.id } });
        await deleteInvitationUploads(inv.url_id);
        deleted.push({
            url_id: inv.url_id,
            groom: inv.groom_name,
            bride: inv.bride_name,
        });
    }

    return NextResponse.json({
        ok: true,
        message: `결혼식 ${RETENTION_MONTHS}개월 경과 청첩장 폐기 완료`,
        deleted: deleted.length,
        items: deleted,
    });
}
