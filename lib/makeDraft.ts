// 만들기 폼 임시저장 (이 브라우저 localStorage에만 저장, 서버 전송 없음)

const DRAFT_KEY = "wedding_make_draft";
/** 이보다 오래된 임시저장은 무시 */
const DRAFT_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

/** 저장 안 하는 필드: 비밀번호, 사진 경로(복원 불가), 업로드 중 표시 등 */
const EXCLUDE_KEYS = new Set([
    "password", "_clientId",
    "mainImageUrls", "middleImageUrl", "ogImageUrl", "galleryImageUrls",
    "bgm_uploading", "profile_uploading", "profile_photos",
]);
/** 이 중 하나라도 입력돼야 저장 (기본값만 있는 빈 폼은 저장 안 함) */
const MEANINGFUL_KEYS = ["groom_name", "bride_name", "groom_contact", "bride_contact", "location_name", "location_address", "welcome_msg"];

export type MakeDraft = { savedAt: number; data: Record<string, string> };

let lastDataJson = "";

export function loadMakeDraft(): MakeDraft | null {
    try {
        const raw = localStorage.getItem(DRAFT_KEY);
        if (!raw) return null;
        const draft = JSON.parse(raw) as MakeDraft;
        if (!draft?.data || Date.now() - draft.savedAt > DRAFT_MAX_AGE_MS) return null;
        return draft;
    } catch {
        return null;
    }
}

/** 폼 현재 값 저장. 내용이 그대로면 안 씀 */
export function saveMakeDraft(form: HTMLFormElement) {
    const data: Record<string, string> = {};
    new FormData(form).forEach((v, k) => {
        if (typeof v === "string" && !EXCLUDE_KEYS.has(k)) data[k] = v;
    });
    if (!MEANINGFUL_KEYS.some((k) => data[k]?.trim())) return;
    const dataJson = JSON.stringify(data);
    if (dataJson === lastDataJson) return;
    lastDataJson = dataJson;
    try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify({ savedAt: Date.now(), data }));
    } catch {
        // 시크릿 모드 등 저장 불가 — 무시
    }
}

export function clearMakeDraft() {
    lastDataJson = "";
    try {
        localStorage.removeItem(DRAFT_KEY);
    } catch {
        // 무시
    }
}
