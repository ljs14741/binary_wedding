/** 청첩장 템플릿이 공통으로 받는 데이터 타입 (DB → 컴포넌트 변환 결과) */

export interface GuestbookEntry {
    id: number;
    author_name: string;
    message: string;
    created_at: Date;
}

export interface Person {
    name: string;
    contact: string;
    order?: string;
    father: string;
    mother: string;
    father_contact?: string;
    mother_contact?: string;
    /** 고인 표시: "" / "故" / "flower" */
    father_mark?: string;
    mother_mark?: string;
    /** 웨딩홈피 프로필 사진 (없으면 미니미) */
    photo?: string;
}

export interface Account {
    /** groom | groom_f | groom_m | bride | bride_f | bride_m */
    side: string;
    bank: string;
    num: string;
    name: string;
}

export interface InvitationData {
    groom: Person;
    bride: Person;
    date: Date;
    location: string;
    detail: string;
    address: string;
    location_lat: number | null;
    location_lng: number | null;
    message: string;
    /** 안내사항 (줄마다 한 항목, 비면 표시 안 함) */
    notice?: string;
    mainImages: string[];
    middleImage: string;
    ogImage?: string;
    /** 배경음악 경로 (빈 문자열이면 음악 없음) */
    bgm: string;
    gallery: string[];
    transport: { subway: string; bus: string; parking: string };
    accounts: Account[];
    interviews: { q: string; a: string }[];
    guestbook: GuestbookEntry[];
    url_id: string;
}

/** 안내사항 → 줄 목록 (빈 줄 제외) */
export function noticeLines(notice?: string): string[] {
    return (notice ?? "").split("\n").map((l) => l.trim()).filter(Boolean);
}

export interface TemplateProps {
    data: InvitationData;
    /** 샘플 페이지 모드: 방명록 작성·전화·공유 등 실제 동작을 막고 안내 토스트를 띄운다 */
    isSample?: boolean;
    /** 만들기·수정 실시간 미리보기: 지금 입력 중인 항목 (seq 바뀔 때마다 다시 이동) */
    previewFocus?: { section: string; seq: number } | null;
}
