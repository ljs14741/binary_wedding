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
    mainImages: string[];
    middleImage: string;
    ogImage?: string;
    gallery: string[];
    transport: { subway: string; bus: string; parking: string };
    accounts: Account[];
    interviews: { q: string; a: string }[];
    guestbook: GuestbookEntry[];
    url_id: string;
}

export interface TemplateProps {
    data: InvitationData;
    /** 샘플 페이지 모드: 방명록 작성·전화·공유 등 실제 동작을 막고 안내 토스트를 띄운다 */
    isSample?: boolean;
}
