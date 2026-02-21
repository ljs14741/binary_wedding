/**
 * 사이트 기본 URL (SEO, OG, canonical 등에 사용)
 * Vercel: VERCEL_URL 자동 설정
 * 로컬/기타: NEXT_PUBLIC_SITE_URL 환경변수로 지정
 */
export function getBaseUrl(): string {
    if (typeof process.env.NEXT_PUBLIC_SITE_URL === "string" && process.env.NEXT_PUBLIC_SITE_URL) {
        return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
    }
    if (typeof process.env.VERCEL_URL === "string" && process.env.VERCEL_URL) {
        return `https://${process.env.VERCEL_URL}`;
    }
    return "https://wedding.binaryworld.kr";
}
