import type { InvitationData } from "@/components/invitation/types";

/** 샘플 예식일: 올해(또는 내년) 12월 마지막 일요일 12:30 */
function getLastSundayOfDecember() {
    const now = new Date();
    const build = (year: number) => {
        const dec31 = new Date(year, 11, 31);
        const d = new Date(year, 11, 31 - dec31.getDay());
        d.setHours(12, 30, 0, 0);
        return d;
    };
    const thisYear = build(now.getFullYear());
    return thisYear < now ? build(now.getFullYear() + 1) : thisYear;
}

/** 샘플 페이지 공통 데이터. 템플릿마다 같은 데이터를 다른 디자인으로 보여준다 */
export function getSampleData(): InvitationData {
    const date = getLastSundayOfDecember();
    const daysAgo = (n: number) => new Date(Date.now() - n * 86400000);

    return {
        groom: {
            name: "이진호", contact: "010-1234-5678", order: "장남",
            father: "이정훈", father_contact: "010-1111-2222",
            mother: "김현숙", mother_contact: "010-3333-4444",
        },
        bride: {
            name: "박나은", contact: "010-9876-5432", order: "차녀",
            father: "박서준", father_contact: "010-5555-6666",
            mother: "최영희", mother_contact: "010-7777-8888",
        },
        date,
        location: "더채플앳청담 커티지홀",
        detail: "3층",
        address: "서울 강남구 선릉로 757",
        location_lat: 37.5225,
        location_lng: 127.0392,
        message: "서로가 마주 보며 다진 약속을\n이제 여러분 앞에서 소중히 맺으려 합니다.",
        mainImages: ["/images/main1.png", "/images/main2.png", "/images/main3.png"],
        middleImage: "/images/middle1.png",
        ogImage: "/images/middle1.png",
        gallery: ["/images/gallary1.png", "/images/gallary2.png", "/images/gallary3.png", "/images/gallary4.png"],
        transport: {
            subway: "7호선, 수인분당선 강남구청역 3-1번 출구에서 500m (도보 8분)",
            bus: "강남구청, 강남세무서 정류장 하차\n간선: 301, 342, 472 / 지선: 3011, 4412",
            parking: "웨딩홀 내 200대 주차 가능 (2시간 무료)",
        },
        accounts: [
            { side: "groom", bank: "국민", num: "123-456-7890", name: "이진호" },
            { side: "groom_f", bank: "국민", num: "110-123-4567", name: "이정훈" },
            { side: "groom_m", bank: "신한", num: "110-987-6543", name: "김현숙" },
            { side: "bride", bank: "우리", num: "1002-333-4444", name: "박나은" },
            { side: "bride_f", bank: "우리", num: "1002-111-2222", name: "박서준" },
            { side: "bride_m", bank: "하나", num: "123-456-789", name: "최영희" },
        ],
        interviews: [
            { q: "우리의 첫 만남은?", a: "벚꽃이 흩날리던 어느 봄날이었습니다. 수줍게 웃던 나은이의 모습에 이끌려 오늘까지 오게 되었네요.\n－ 진호" },
            { q: "서로에게 바라는 점?", a: "지금처럼 서로를 아끼고 웃음 가득한 예쁜 가정을 함께 만들어가고 싶어요.\n－ 나은" },
        ],
        guestbook: [
            { id: 1, author_name: "친구 김지수", message: "나은아 결혼 너무 축하해! ❤️ 우리 꽃길만 걷자!", created_at: daysAgo(2) },
            { id: 2, author_name: "동료 박성진", message: "두 분 모습이 너무 아름답네요. 축복합니다! 👋", created_at: daysAgo(3) },
            { id: 3, author_name: "사촌 동생", message: "형부! 우리 언니 잘 부탁드려요! 💖", created_at: daysAgo(5) },
            { id: 4, author_name: "대학 선배", message: "멋진 신랑 진호야, 행복하게 잘 살아라! ✨", created_at: daysAgo(7) },
            { id: 5, author_name: "이웃집 이모", message: "어머 두 사람 정말 잘 어울린다! 행복해!", created_at: daysAgo(8) },
        ],
        url_id: "sample",
    };
}
