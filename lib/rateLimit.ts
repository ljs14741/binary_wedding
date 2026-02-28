/**
 * 인메모리 Rate Limiter (IP 기반)
 * Serverless 환경에서는 인스턴스별로 별도 카운트가 유지되지만,
 * 기본적인 DoS/스팸/브루트포스 방어에 효과적입니다.
 * 대규모 트래픽 시 Redis(Upstash 등) 사용을 권장합니다.
 */
import { headers } from "next/headers";

type LimitConfig = { max: number; windowMs: number };

const store = new Map<string, { count: number; resetAt: number }>();

/** 클라이언트 IP 추출 (Vercel/프록시 환경) */
export async function getClientIp(): Promise<string> {
    const h = await headers();
    const forwarded = h.get("x-forwarded-for");
    const realIp = h.get("x-real-ip");
    if (forwarded) {
        return forwarded.split(",")[0]?.trim() ?? "unknown";
    }
    if (realIp) return realIp;
    return "unknown";
}

/** Rate limit 체크 - 제한 초과 시 true 반환 */
export async function checkRateLimit(
    action: "createInvitation" | "getMyInvitations" | "createGuestbook" | "createReview",
    ip: string
): Promise<{ limited: boolean; message?: string }> {
    const configs: Record<string, LimitConfig> = {
        createInvitation: { max: 5, windowMs: 60_000 },   // 5회/분
        getMyInvitations: { max: 10, windowMs: 60_000 },  // 10회/분 (브루트포스 방지)
        createGuestbook: { max: 20, windowMs: 60_000 },   // 20회/분
        createReview: { max: 10, windowMs: 60_000 },      // 10회/분
    };
    const { max, windowMs } = configs[action] ?? { max: 10, windowMs: 60_000 };
    const key = `${action}:${ip}`;
    const now = Date.now();
    let entry = store.get(key);

    if (!entry || now >= entry.resetAt) {
        entry = { count: 1, resetAt: now + windowMs };
        store.set(key, entry);
        return { limited: false };
    }

    entry.count++;
    if (entry.count > max) {
        return {
            limited: true,
            message: `요청이 너무 많습니다. 잠시 후 다시 시도해 주세요. (${Math.ceil((entry.resetAt - now) / 1000)}초 후 가능)`,
        };
    }
    return { limited: false };
}
