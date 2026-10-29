// 클래식 메인 사진 위 글자색 (위: 이름 / 아래: 날짜·장소). 클라이언트·서버 공용

export type HeroTone = "white" | "dark";
export interface HeroText { top: HeroTone; bottom: HeroTone }

export const DEFAULT_HERO_TEXT: HeroText = { top: "white", bottom: "white" };

const tone = (v: unknown): HeroTone => (v === "dark" || v === "d" ? "dark" : "white");

/** DB 값 → 위·아래 글자색. null=둘 다 흰색, "dark"=둘 다 검정(이전 값), "d,w"=위 검정·아래 흰색 */
export function parseHeroText(v: string | null | undefined): HeroText {
    if (!v) return DEFAULT_HERO_TEXT;
    if (v === "dark") return { top: "dark", bottom: "dark" };
    const [t, b] = v.split(",");
    return { top: tone(t), bottom: tone(b) };
}

/** 폼 값 → DB 값 (둘 다 흰색이면 null) */
export function serializeHeroText(top: unknown, bottom: unknown): string | null {
    const t = tone(top);
    const b = tone(bottom);
    if (t === "white" && b === "white") return null;
    return `${t === "dark" ? "d" : "w"},${b === "dark" ? "d" : "w"}`;
}

/** 이 밝기(0~1)보다 밝으면 검은 글씨가 잘 보임 */
const BRIGHT = 0.62;

/**
 * 사진 위쪽·아래쪽 밝기를 보고 글자색 추천 (브라우저 전용).
 * 화면은 세로로 길게 잘려 보이므로 가운데 기준으로 위 30%·아래 30%를 봄
 */
export function suggestHeroText(src: string): Promise<HeroText | null> {
    return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
            try {
                const w = 24;
                const h = 52; // 휴대폰 화면 비율
                const canvas = document.createElement("canvas");
                canvas.width = w;
                canvas.height = h;
                const ctx = canvas.getContext("2d");
                if (!ctx) return resolve(null);
                // object-cover 처럼 가운데를 잘라 그림
                const scale = Math.max(w / img.width, h / img.height);
                const dw = img.width * scale;
                const dh = img.height * scale;
                ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);
                const { data } = ctx.getImageData(0, 0, w, h);
                const band = (from: number, to: number) => {
                    let sum = 0;
                    let n = 0;
                    for (let y = Math.floor(h * from); y < Math.floor(h * to); y++) {
                        for (let x = 0; x < w; x++) {
                            const i = (y * w + x) * 4;
                            sum += (0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2]) / 255;
                            n++;
                        }
                    }
                    return n ? sum / n : 0;
                };
                resolve({
                    top: band(0.08, 0.38) > BRIGHT ? "dark" : "white",
                    bottom: band(0.62, 0.92) > BRIGHT ? "dark" : "white",
                });
            } catch {
                resolve(null);
            }
        };
        img.onerror = () => resolve(null);
        img.src = src;
    });
}
