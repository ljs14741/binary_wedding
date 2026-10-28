export function formatWeddingDateKo(input: Date | string | null | undefined): string {
    if (!input) return "";
    const d = new Date(input);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "long",
        day: "numeric",
        weekday: "long",
    });
}

export function buildShareTitle(groomName: string, brideName: string): string {
    return `${groomName} ♥ ${brideName} 결혼합니다`;
}

// 카톡 카드에서 잘림을 줄이기 위해 짧은 포맷 유지
export function buildShareDescription(weddingDate: Date | string | null | undefined, locationName: string): string {
    const dateText = formatWeddingDateKo(weddingDate);
    if (dateText && locationName) return `${dateText} · ${locationName}`;
    return dateText || locationName || "모바일 청첩장";
}

// 사이트 홍보 공유 문구 (친구한테 추천하는 말투)
export const SITE_SHARE = {
    title: "모바일 청첩장, 돈 주고 만들지 마세요 💌",
    description: "회원가입·광고·결제 없이 10분이면 완성. 지도·방명록·계좌 안내까지 전부 무료예요.",
    buttonTitle: "무료로 만들어보기",
    copyText: "결혼 준비 중이면 여기 써봐! 모바일 청첩장 회원가입 없이 무료로 10분이면 만들어져 💌",
};
