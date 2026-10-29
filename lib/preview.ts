import type { InvitationData } from "@/components/invitation/types";
import { DEFAULT_TEMPLATE_ID } from "@/components/templates/meta";
import { normalizeParentMark } from "@/lib/parentMark";
import { getSampleData } from "@/lib/sampleData";

/**
 * 만들기·수정 실시간 미리보기 공용 (폼 → 청첩장 데이터, 입력 칸 → 청첩장 위치)
 * 폼 값 해석은 서버 저장(createInvitation/updateInvitation)과 같게 맞춤
 */

/** 미리보기 위치 키. 클래식은 같은 키를 가진 섹션으로 스크롤, 웨딩홈피는 탭 전환 */
export type PreviewSection =
    | "main" | "people" | "message" | "calendar" | "location" | "notice" | "interview" | "gallery" | "gift";

/** 입력 칸 name → 미리보기 위치 */
export function previewSectionOf(name: string): PreviewSection | null {
    if (!name) return null;
    if (name === "groom_name" || name === "bride_name" || name === "template_type" || name.startsWith("bgm_")) return "main";
    if (name.startsWith("account_")) return "gift";
    if (/^(groom|bride)_(contact|order|father|mother|photo)/.test(name)) return "people";
    if (name === "wedding_date") return "calendar";
    if (name.startsWith("location_") || name.startsWith("transport_")) return "location";
    if (name === "notice") return "notice";
    if (name === "welcome_msg") return "message";
    if (name.startsWith("interview_")) return "interview";
    return null;
}

/** 웨딩홈피: 미리보기 위치 → 탭 */
export const MINIHOMPY_TAB_OF: Record<PreviewSection, string> = {
    main: "home",
    people: "profile",
    message: "diary",
    calendar: "home",
    location: "map",
    notice: "home",
    interview: "diary",
    gallery: "photo",
    gift: "gift",
};

/** 폼 바깥 상태로 들고 있는 사진 (blob 미리보기 또는 기존 저장 경로) */
export interface PreviewImages {
    main: string[];
    middle: string;
    gallery: string[];
}

export interface PreviewPayload {
    templateType: string;
    data: InvitationData;
    /** 아직 안 올려서 예시 사진으로 채운 항목이 있는지 */
    usesSamplePhotos: boolean;
}

/** 폼 현재 값 → 템플릿에 넣을 데이터. 비어 있는 필수 항목은 예시로 채워 화면이 깨지지 않게 함 */
export function buildPreviewPayload(
    form: HTMLFormElement,
    images: PreviewImages,
    coords: { lat: number; lng: number } | null,
): PreviewPayload {
    const fd = new FormData(form);
    const get = (key: string) => String(fd.get(key) ?? "");
    const text = (key: string) => get(key).trim();
    const sample = getSampleData();

    const groomName = text("groom_name") || "신랑";
    const brideName = text("bride_name") || "신부";
    const groomFather = text("groom_father");
    const groomMother = text("groom_mother");
    const brideFather = text("bride_father");
    const brideMother = text("bride_mother");

    const dateStr = text("wedding_date");
    const parsed = dateStr ? new Date(dateStr) : null;
    const date = parsed && !Number.isNaN(parsed.getTime()) ? parsed : sample.date;

    // 계좌: 은행명 있을 때만 (서버와 같음)
    const accounts: InvitationData["accounts"] = [];
    const pushAccount = (side: string, key: string, name: string) => {
        const bank = text(`account_${key}_bank`);
        if (bank) accounts.push({ side, bank, num: text(`account_${key}_num`), name });
    };
    pushAccount("groom", "groom", groomName);
    pushAccount("groom_f", "groom_f", groomFather);
    pushAccount("groom_m", "groom_m", groomMother);
    pushAccount("bride", "bride", brideName);
    pushAccount("bride_f", "bride_f", brideFather);
    pushAccount("bride_m", "bride_m", brideMother);

    // 인터뷰: 질문·답 둘 다 있을 때만 (서버와 같음). 꺼두면 입력칸이 없어서 자연히 빠짐
    const interviews = [1, 2]
        .map((n) => ({ q: text(`interview_q${n}`), a: text(`interview_a${n}`) }))
        .filter((iv) => iv.q && iv.a);

    const usesSamplePhotos = images.main.length === 0 || !images.middle || images.gallery.length === 0;

    const data: InvitationData = {
        groom: {
            name: groomName,
            contact: text("groom_contact"),
            order: text("groom_order"),
            father: groomFather,
            mother: groomMother,
            father_contact: text("groom_father_contact"),
            mother_contact: text("groom_mother_contact"),
            father_mark: normalizeParentMark(get("groom_father_mark")),
            mother_mark: normalizeParentMark(get("groom_mother_mark")),
            photo: text("groom_photo_url"),
        },
        bride: {
            name: brideName,
            contact: text("bride_contact"),
            order: text("bride_order"),
            father: brideFather,
            mother: brideMother,
            father_contact: text("bride_father_contact"),
            mother_contact: text("bride_mother_contact"),
            father_mark: normalizeParentMark(get("bride_father_mark")),
            mother_mark: normalizeParentMark(get("bride_mother_mark")),
            photo: text("bride_photo_url"),
        },
        date,
        location: text("location_name") || "예식장",
        detail: text("location_detail"),
        address: text("location_address"),
        location_lat: coords?.lat ?? null,
        location_lng: coords?.lng ?? null,
        message: get("welcome_msg"),
        notice: get("notice"),
        mainImages: images.main.length > 0 ? images.main : sample.mainImages,
        middleImage: images.middle || sample.middleImage,
        // 미리보기에선 음악 끔 (작성 중 클릭에 음악이 켜지면 놀람)
        bgm: "",
        gallery: images.gallery.length > 0 ? images.gallery : sample.gallery,
        transport: { subway: get("transport_subway"), bus: get("transport_bus"), parking: get("transport_parking") },
        accounts,
        interviews,
        guestbook: [],
        url_id: "preview",
    };

    return { templateType: text("template_type") || DEFAULT_TEMPLATE_ID, data, usesSamplePhotos };
}

/** postMessage 메시지 */
export type PreviewMessage =
    | { type: "preview-hello" }
    | { type: "preview-ready" }
    | { type: "preview-data"; payload: PreviewPayload }
    | { type: "preview-focus"; section: PreviewSection; seq: number };
