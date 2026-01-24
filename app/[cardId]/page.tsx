import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Type1 from "@/components/Type1";

interface PageProps {
    params: Promise<{ cardId: string }>;
}

export default async function CardPage({ params }: PageProps) {
    const { cardId } = await params;

    // 1. DB 조회
    const rawData = await prisma.invitations.findUnique({
        where: { url_id: cardId },
        include: {
            invitation_accounts: true,
            invitation_photos: { orderBy: { sort_order: 'asc' } },
            invitation_interviews: true,
        }
    });

    if (!rawData) return notFound();

    // 2. 데이터 변환 (DB 형태 -> 컴포넌트 형태)
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
        message: rawData.welcome_msg || "",

        // 사진이 없으면 기본 이미지(placeholder) 사용
        mainImage: rawData.main_photo_url || "",
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
        }))
    };

    // 3. 디자인 컴포넌트 렌더링
    return <Type1 data={formattedData} />;
}