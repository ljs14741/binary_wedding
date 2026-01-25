import { getInvitationById } from "@/app/actions";
import { notFound } from "next/navigation";
import EditForm from "@/components/EditForm"; // 2단계에서 만들 컴포넌트
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function EditPage({ params }: PageProps) {
    const { id } = await params;
    const data = await getInvitationById(id);

    if (!data) return notFound();

    // 1. 날짜 포맷팅 (YYYY-MM-DDThh:mm) - input type="datetime-local"용
    const formatDate = (date: Date) => {
        return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    };

    // 2. 데이터 직렬화 (Server -> Client 넘겨주기 좋게 변환)
    const initialData = {
        url_id: data.url_id,
        password: data.password, // 검증용 (보안상 주의 필요하지만 로직상 전달)

        groom_name: data.groom_name,
        groom_contact: data.groom_contact || "",
        groom_father: data.groom_father || "",
        groom_father_contact: data.groom_father_contact || "",
        groom_mother: data.groom_mother || "",
        groom_mother_contact: data.groom_mother_contact || "",

        bride_name: data.bride_name,
        bride_contact: data.bride_contact || "",
        bride_father: data.bride_father || "",
        bride_father_contact: data.bride_father_contact || "",
        bride_mother: data.bride_mother || "",
        bride_mother_contact: data.bride_mother_contact || "",

        wedding_date: formatDate(data.wedding_date),
        location_name: data.location_name,
        location_detail: data.location_detail || "",
        location_address: data.location_address,
        welcome_msg: data.welcome_msg || "",

        transport_subway: data.transport_subway || "",
        transport_bus: data.transport_bus || "",
        transport_parking: data.transport_parking || "",

        // 사진 데이터 (Client에서 보여주기 위함)
        main_photo_url: data.main_photo_url || "[]",
        middle_photo_url: data.middle_photo_url || "",
        gallery: data.invitation_photos.map(p => p.photo_url),

        // 계좌 정보 (배열 -> 객체 매핑 필요하지만, 여기선 단순화를 위해 생략하거나 별도 처리)
        // *참고: 계좌 정보 수정은 복잡도가 높아 이번 코드에서는 텍스트/사진 위주로 구현합니다.
        // 필요하다면 만들기 페이지와 동일한 state 로직으로 매핑해야 합니다.
        accounts: data.invitation_accounts,
        interviews: data.invitation_interviews,
    };

    return (
        <div className="min-h-screen bg-[#FDFCFB] font-sans selection:bg-rose-100 flex flex-col">
            <SiteHeader />
            <div className="flex-1 pt-28 pb-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-16 space-y-4">
                        <span className="text-blue-600 font-bold tracking-widest text-xs uppercase bg-blue-50 px-3 py-1 rounded-full">Edit Mode</span>
                        <h1 className="text-4xl md:text-5xl font-serif font-bold text-slate-900 tracking-tight">청첩장 수정하기</h1>
                    </div>
                    {/* 클라이언트 컴포넌트에 데이터 전달 */}
                    <EditForm initialData={initialData} />
                </div>
            </div>
            <SiteFooter />
        </div>
    );
}