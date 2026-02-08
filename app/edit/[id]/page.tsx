// app/edit/[id]/page.tsx
import { getInvitationById } from "@/app/actions";
import { notFound } from "next/navigation";
import EditFormGuard from "@/components/EditFormGuard";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function EditPage({ params }: PageProps) {
    const { id } = await params;
    const data = await getInvitationById(id);

    if (!data) return notFound();

    // 날짜 포맷팅 (input type="datetime-local" 호환용)
    const formatDate = (date: Date) => {
        return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
            .toISOString()
            .slice(0, 16);
    };

    // 클라이언트로 보낼 데이터 정리
    const initialData = {
        url_id: data.url_id,
        // DB에 저장된 암호화된 비밀번호 (Guard에서 비교용으로 사용)
        hashedPassword: data.password,

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

        main_photo_url: data.main_photo_url || "[]",
        middle_photo_url: data.middle_photo_url || "",
        gallery: data.invitation_photos.map(p => p.photo_url),

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
                        <p className="text-slate-500 text-sm">정보 수정을 위해 본인 인증이 필요합니다.</p>
                    </div>

                    {/* [핵심] 바로 EditForm을 보여주지 않고 Guard로 감쌉니다. */}
                    <EditFormGuard initialData={initialData} />
                </div>
            </div>
            <SiteFooter />
        </div>
    );
}