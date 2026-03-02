"use server";

import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "crypto";

const ADMIN_COOKIE_NAME = "admin_session";
const SESSION_MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24시간

function getAdminSecret(): string | null {
    const secret = process.env.ADMIN_SECRET;
    if (!secret || secret.length < 12) return null;
    return secret;
}

/** HMAC 서명된 세션 페이로드 생성 */
function createSignedPayload(): string {
    const secret = getAdminSecret();
    if (!secret) throw new Error("ADMIN_SECRET이 설정되지 않았습니다.");
    const payload = JSON.stringify({ admin: true, exp: Date.now() + SESSION_MAX_AGE_MS });
    const payloadB64 = Buffer.from(payload, "utf-8").toString("base64url");
    const sig = createHmac("sha256", secret).update(payload).digest("base64url");
    return `${payloadB64}.${sig}`;
}

/** 세션 쿠키 검증 (타이밍 공격 방지) */
function verifySignedPayload(value: string): boolean {
    const secret = getAdminSecret();
    if (!secret) return false;
    const dot = value.lastIndexOf(".");
    if (dot <= 0) return false;
    const payloadB64 = value.slice(0, dot);
    const sig = value.slice(dot + 1);
    try {
        const payload = Buffer.from(payloadB64, "base64url").toString("utf-8");
        const parsed = JSON.parse(payload) as { admin?: boolean; exp?: number };
        if (!parsed.admin || typeof parsed.exp !== "number") return false;
        if (Date.now() > parsed.exp) return false;
        const expected = createHmac("sha256", secret).update(payload).digest("base64url");
        if (sig.length !== expected.length) return false;
        return timingSafeEqual(Buffer.from(sig, "utf-8"), Buffer.from(expected, "utf-8"));
    } catch {
        return false;
    }
}

/** 로그인 비밀번호 검증 (타이밍 공격 방지) */
function verifyPassword(input: string): boolean {
    const secret = getAdminSecret();
    if (!secret || !input) return false;
    if (input.length !== secret.length) return false;
    return timingSafeEqual(Buffer.from(input, "utf-8"), Buffer.from(secret, "utf-8"));
}

/** 관리자 세션 존재 여부 확인 */
export async function isAdminSession(): Promise<boolean> {
    const secret = getAdminSecret();
    if (!secret) return false;
    const cookieStore = await cookies();
    const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
    if (!token) return false;
    return verifySignedPayload(token);
}

/** 로그인 처리: 비밀번호 검증 후 세션 쿠키 설정 */
export async function adminLogin(formData: FormData): Promise<{ success: boolean; message?: string }> {
    const raw = process.env.ADMIN_SECRET ?? "";
    const secret = getAdminSecret();
    if (!secret) {
        const hint = !raw
            ? ".env에 ADMIN_SECRET을 추가하고, 서버를 재시작하세요."
            : raw.length < 12
                ? `ADMIN_SECRET은 12자 이상이어야 합니다. (현재 ${raw.length}자)`
                : "서버를 완전히 종료 후 재시작하세요.";
        return { success: false, message: `관리자 설정 오류: ${hint}` };
    }
    const password = (formData.get("password") as string)?.trim() ?? "";
    if (!verifyPassword(password)) {
        return { success: false, message: "비밀번호가 올바르지 않습니다." };
    }
    const token = createSignedPayload();
    const cookieStore = await cookies();
    cookieStore.set(ADMIN_COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: SESSION_MAX_AGE_MS / 1000,
        path: "/admin",
    });
    return { success: true };
}

/** 로그아웃: 세션 쿠키 삭제 */
export async function adminLogout(): Promise<void> {
    const cookieStore = await cookies();
    cookieStore.delete({ name: ADMIN_COOKIE_NAME, path: "/admin" });
}

/** 관리자 전용: 세션 없으면 에러 throw */
export async function requireAdminSession(): Promise<void> {
    const ok = await isAdminSession();
    if (!ok) {
        throw new Error("UNAUTHORIZED");
    }
}
