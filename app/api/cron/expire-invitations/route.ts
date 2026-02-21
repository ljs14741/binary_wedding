import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { deleteInvitationUploads } from "@/lib/upload";

/** 결혼식 1개월 경과 시 청첩장 폐기 정책 */
const RETENTION_MONTHS = 1;

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(request: NextRequest) {
    // 외부 호출 방지: CRON_SECRET이 설정되어 있으면 일치해야 함
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
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
