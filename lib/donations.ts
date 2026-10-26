// 후원자 공개 표시용 헬퍼 (클라이언트·서버 공용)

/** 이름 가운데 글자 가림: 김민수 → 김*수, 김수 → 김*, 남궁민수 → 남**수, 한 글자(L 등)는 그대로 */
export function maskDonorName(name: string): string {
    const chars = Array.from(name.trim());
    if (chars.length <= 1) return chars.join("");
    if (chars.length === 2) return `${chars[0]}*`;
    return chars[0] + "*".repeat(chars.length - 2) + chars[chars.length - 1];
}

export type PublicDonation = {
    id: number;
    /** 가린 이름 */
    name: string;
    amount: number;
    /** YYYY-MM-DD */
    date: string;
};
