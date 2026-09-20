import type { Account } from "./types";

/** 계좌를 신랑측/신부측으로 나눈다 (side: groom, groom_f, groom_m / bride, bride_f, bride_m) */
export function splitAccounts(accounts: Account[]) {
    return {
        groom: accounts.filter((a) => a.side === "groom" || a.side.startsWith("groom_")),
        bride: accounts.filter((a) => a.side === "bride" || a.side.startsWith("bride_")),
    };
}

/** 계좌 side 값 → 표시 라벨 */
export function accountLabel(side: string) {
    if (side === "groom") return "신랑";
    if (side === "bride") return "신부";
    if (side.endsWith("_f")) return "혼주(부)";
    return "혼주(모)";
}

/** 방명록 작성일. 서버/브라우저 로케일 차이로 hydration 경고가 나지 않도록 직접 조립 */
export function formatGuestbookDate(input: Date | string) {
    const d = new Date(input);
    const h = d.getHours();
    const ampm = h < 12 ? "오전" : "오후";
    const hh = String(h % 12 === 0 ? 12 : h % 12).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일 ${ampm} ${hh}:${mm}`;
}
