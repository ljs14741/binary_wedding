import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Type1 from "@/components/Type1";

// [중요] Next.js 15+ 에서는 params가 Promise 타입입니다.
interface PageProps {
    params: Promise<{ cardId: string }>;
}

export default async function CardPage({ params }: PageProps) {
    // [수정] params를 await 하여 cardId를 추출해야 합니다.
    const { cardId } = await params;

    // 1. DB 조회
    const rawData = await prisma.invitations.findUnique({
        where: { url_id: cardId },
        include: {
            invitation_accounts: true,
            invitation_photos: { orderBy: { sort_order: 'asc' } },
            invitation_interviews: true,
            invitation_guestbook: { orderBy: { created_at: 'desc' } },
        }
    });

    if (!rawData) return notFound();

    // 2. 메인 사진 JSON 파싱 (문자열 -> 배열)
    let mainImages: string[] = [];
    try {
        if (rawData.main_photo_url) {
            mainImages = JSON.parse(rawData.main_photo_url);
        }
    } catch (e) {
        // 예외 처리: 만약 배열 형식이 아니라면 단일 문자열로 처리
        if (rawData.main_photo_url) mainImages = [rawData.main_photo_url];
    }

    // 3. 데이터 변환 (DB -> 컴포넌트 Props)
    const formattedData = {
        groom: {
            name: rawData.groom_name,
            contact: rawData.groom_contact || "",
            father: rawData.groom_father || "",
            mother: rawData.groom_mother || "",
            father_contact: rawData.groom_father_contact || "",
            mother_contact: rawData.groom_mother_contact || "",
        },
        bride: {
            name: rawData.bride_name,
            contact: rawData.bride_contact || "",
            father: rawData.bride_father || "",
            mother: rawData.bride_mother || "",
            father_contact: rawData.bride_father_contact || "",
            mother_contact: rawData.bride_mother_contact || "",
        },
        date: rawData.wedding_date,
        location: rawData.location_name,
        detail: rawData.location_detail || "",
        address: rawData.location_address,
        location_lat: rawData.location_lat ? Number(rawData.location_lat) : null,
        location_lng: rawData.location_lng ? Number(rawData.location_lng) : null,
        message: rawData.welcome_msg || "",

        // [중요] 배열로 넘겨줍니다.
        mainImages: mainImages,
        middleImage: rawData.middle_photo_url || "",
        gallery: rawData.invitation_photos.map(p => p.photo_url),

        transport: {
            subway: rawData.transport_subway || "",
            bus: rawData.transport_bus || "",
            parking: rawData.transport_parking || "",
        },

        accounts: rawData.invitation_accounts.map(acc => ({
            side: acc.side,
            bank: acc.bank_name,
            num: acc.account_number,
            name: acc.owner_name
        })),

        interviews: rawData.invitation_interviews.map(iv => ({
            q: iv.question,
            a: iv.answer
        })),

        guestbook: rawData.invitation_guestbook.map(g => ({
            id: g.id,
            author_name: g.author_name,
            message: g.message,
            created_at: g.created_at,
        })),
        url_id: cardId,
    };

    return <Type1 data={formattedData} />;
}