import { prisma } from '@/lib/prisma';

export default async function CardPage({
                                           params
                                       }: {
    params: Promise<{ cardId: string }>
}) {
    const { cardId } = await params;

    const invitation = await prisma.invitations.findUnique({
        where: { url_id: cardId },
    });

    if (!invitation) return <div>Data Not Found</div>;

    // 날짜 포맷팅 (2025. 10. 25)
    const dateObj = new Date(invitation.wedding_date);
    const dateString = `${dateObj.getFullYear()}. ${String(dateObj.getMonth() + 1).padStart(2, '0')}. ${String(dateObj.getDate()).padStart(2, '0')}`;
    const timeString = dateObj.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });

    // 요일 구하기 (SAT)
    const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    const dayString = days[dateObj.getDay()];

    return (
        <div className="w-full min-h-screen bg-[#FDFBF9] flex justify-center overflow-hidden">

            {/* 모바일 화면 제한 (최대 430px) */}
            <div className="w-full max-w-[430px] bg-white shadow-2xl relative">

                {/* [섹션 1: 메인 커버] */}
                <section className="relative w-full h-screen max-h-[900px]">

                    {/* 1. 배경 사진 (풀스크린) */}
                    <div className="absolute inset-0 z-0">
                        {/* 실제로는 invitation.main_photo_url 을 써야 함. 지금은 샘플용 고정 이미지 */}
                        <img
                            src="https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=2070&auto=format&fit=crop"
                            alt="Main Wedding"
                            className="w-full h-full object-cover opacity-90 animate-fade-in-slow"
                        />
                        {/* 사진 위에 살짝 어두운 필터 (글씨 잘 보이게) */}
                        <div className="absolute inset-0 bg-black/20" />
                    </div>

                    {/* 2. 텍스트 오버레이 */}
                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-between py-20 text-white">

                        {/* 상단: 날짜 */}
                        <div className="text-center animate-fade-in-up">
                            <p className="font-playfair text-lg tracking-[0.2em] mb-2">WEDDING DAY</p>
                            <div className="w-[1px] h-10 bg-white/70 mx-auto mb-2"></div>
                            <p className="font-serif text-sm opacity-90">{dateString}</p>
                            <p className="font-serif text-sm opacity-90">{dayString} {timeString}</p>
                        </div>

                        {/* 하단: 이름 */}
                        <div className="text-center w-full px-10 pb-10 animate-fade-in-up [animation-delay:500ms] opacity-0 fill-mode-forwards">
                            <div className="mb-4">
                                <p className="font-script text-6xl mb-2 drop-shadow-md">
                                    {invitation.groom_eng || "Groom"}
                                    <span className="text-4xl mx-2">&</span>
                                    {invitation.bride_eng || "Bride"}
                                </p>
                            </div>

                            <div className="flex justify-center items-center gap-3 text-sm font-serif tracking-widest opacity-90">
                                <span>{invitation.groom_name}</span>
                                <span className="w-1 h-1 bg-white rounded-full"></span>
                                <span>{invitation.bride_name}</span>
                            </div>

                            <p className="mt-6 text-xs font-light tracking-wider opacity-80 uppercase">
                                {invitation.location_name}
                            </p>
                        </div>

                    </div>
                </section>

                {/* [섹션 2: 초대 문구 (맛보기)] */}
                <section className="py-20 px-8 text-center bg-[#FDFBF9]">
                    <p className="font-script text-3xl text-stone-400 mb-6">Invitation</p>
                    <div className="font-serif text-stone-600 leading-loose text-sm whitespace-pre-wrap">
                        {invitation.welcome_msg || "서로의 이름을 부르는 것만으로도\n사랑의 깊이를 알 수 있는 두 사람이\n꽃과 나무처럼 어우러져\n아름다운 날을 맞이하게 되었습니다."}
                    </div>
                </section>

            </div>
        </div>
    );
}