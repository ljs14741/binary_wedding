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
