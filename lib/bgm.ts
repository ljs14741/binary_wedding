// 배경음악 설정값 (클라이언트·서버 공용)

/** 기본 배경음악 */
export const DEFAULT_BGM_SRC = "/music/sample1.mp3";
/** bgm_url이 이 값이면 배경음악 끔 */
export const BGM_NONE = "none";
/** 업로드 용량 제한 */
export const MAX_BGM_SIZE = 10 * 1024 * 1024;
export const MAX_BGM_SIZE_LABEL = "10MB";

export type BgmMode = "default" | "custom" | "none";

/** DB 값 → 선택 모드 */
export function bgmModeOf(bgmUrl: string | null | undefined): BgmMode {
    if (!bgmUrl) return "default";
    if (bgmUrl === BGM_NONE) return "none";
    return "custom";
}

/** DB 값 → 실제 재생 경로 (빈 문자열이면 음악 없음) */
export function resolveBgmSrc(bgmUrl: string | null | undefined): string {
    if (!bgmUrl) return DEFAULT_BGM_SRC;
    if (bgmUrl === BGM_NONE) return "";
    return bgmUrl;
}

/** 폼 제출 전 배경음악 검사 (클라이언트·서버 공용). 문제 없으면 null */
export function bgmFormError(formData: FormData): string | null {
    if (formData.get("bgm_mode") !== "custom") return null;
    if (formData.get("bgm_uploading")) return "배경음악 업로드가 진행 중입니다. 잠시만 기다려주세요.";
    if (!String(formData.get("bgm_url") ?? "").trim()) return "배경음악 파일을 올려 주세요. (또는 기본 음악·음악 없음 선택)";
    return null;
}
