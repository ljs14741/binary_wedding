"use server";

import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/admin-auth";
import { maskDonorName, type PublicDonation } from "@/lib/donations";

const PUBLIC_LIMIT = 50;

/** Date(@db.Date) → YYYY-MM-DD */
function toDateString(d: Date): string {
    return d.toISOString().slice(0, 10);
}

/** 공개 후원자 목록 - 실명이 브라우저로 안 가게 서버에서 가려서 보냄 */
export async function getPublicDonations(): Promise<{ count: number; items: PublicDonation[] }> {
    const [count, rows] = await Promise.all([
        prisma.donations.count(),
        prisma.donations.findMany({
            orderBy: [{ donated_at: "desc" }, { id: "desc" }],
            take: PUBLIC_LIMIT,
        }),
    ]);
    return {
        count,
        items: rows.map((r) => ({
            id: r.id,
            name: maskDonorName(r.donor_name),
            amount: r.amount,
            date: toDateString(r.donated_at),
        })),
    };
}

export type AdminDonation = { id: number; donor_name: string; amount: number; date: string };

/** 관리자: 전체 후원 내역 (실명) */
export async function getAdminDonations(): Promise<AdminDonation[]> {
    await requireAdminSession();
    const rows = await prisma.donations.findMany({ orderBy: [{ donated_at: "desc" }, { id: "desc" }] });
    return rows.map((r) => ({ id: r.id, donor_name: r.donor_name, amount: r.amount, date: toDateString(r.donated_at) }));
}

/** 관리자: 후원 내역 추가 */
export async function createDonation(input: { donor_name: string; amount: number; date: string }): Promise<{ success: boolean; message?: string }> {
    await requireAdminSession();
    const donor_name = input.donor_name.trim().slice(0, 20);
    const amount = Math.floor(Number(input.amount));
    if (!donor_name) return { success: false, message: "이름을 입력해 주세요." };
    if (!Number.isFinite(amount) || amount <= 0) return { success: false, message: "금액을 확인해 주세요." };
    if (!/^\d{4}-\d{2}-\d{2}$/.test(input.date)) return { success: false, message: "날짜를 확인해 주세요." };

    await prisma.donations.create({
        data: { donor_name, amount, donated_at: new Date(`${input.date}T00:00:00Z`) },
    });
    return { success: true };
}

/** 관리자: 후원 내역 삭제 */
export async function deleteDonation(id: number): Promise<void> {
    await requireAdminSession();
    await prisma.donations.delete({ where: { id } });
}
