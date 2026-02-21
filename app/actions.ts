"use server";

import { prisma } from "@/lib/prisma";
import { uploadFile } from "@/lib/upload";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";

// 랜덤 ID 생성 헬퍼
function generateRandomId() {
    return Math.random().toString(36).substring(2, 10);
}

// url_id 중복 없이 생성 (최대 5회 재시도)
async function generateUniqueUrlId(): Promise<string> {
    for (let i = 0; i < 5; i++) {
        const url_id = generateRandomId();
        const existing = await prisma.invitations.findUnique({ where: { url_id } });
        if (!existing) return url_id;
    }
    throw new Error("청첩장 ID 생성에 실패했습니다. 잠시 후 다시 시도해 주세요.");
}

// 필수 텍스트 필드 검증
function validateRequiredFields(data: {
    groom_name?: string; bride_name?: string;
    wedding_date_str?: string; location_name?: string; location_address?: string;
}) {
    const errors: string[] = [];
    if (!data.groom_name?.trim()) errors.push("신랑 성함");
    if (!data.bride_name?.trim()) errors.push("신부 성함");
    if (!data.wedding_date_str?.trim()) errors.push("예식 일시");
    if (!data.location_name?.trim()) errors.push("예식장 이름");
    if (!data.location_address?.trim()) errors.push("주소");
    if (errors.length > 0) throw new Error(`필수 입력 항목을 확인해 주세요: ${errors.join(", ")}`);
}

// ----------------------------------------------------------------------
// 1. 내 청첩장 조회 (로그인/관리 페이지용)
// ----------------------------------------------------------------------
export async function getMyInvitations(formData: FormData) {
    const name = formData.get("name") as string;
    const phone = formData.get("phone") as string;
    const inputPassword = formData.get("password") as string;

    if (!name || !phone || !inputPassword) {
        return { success: false, message: "모든 정보를 입력해주세요." };
    }

    const candidates = await prisma.invitations.findMany({
        where: {
            OR: [
                { groom_name: name, groom_contact: phone },
                { bride_name: name, bride_contact: phone },
            ],
        },
        orderBy: { created_at: "desc" },
    });

    if (candidates.length === 0) {
        return { success: false, message: "일치하는 정보가 없습니다." };
    }

    const matchedInvitations = [];
    for (const invitation of candidates) {
        const isMatch = await bcrypt.compare(inputPassword, invitation.password);
        if (isMatch) {
            matchedInvitations.push({
                ...invitation,
                location_lat: invitation.location_lat ? Number(invitation.location_lat) : 0,
                location_lng: invitation.location_lng ? Number(invitation.location_lng) : 0,
            });
        }
    }

    if (matchedInvitations.length === 0) {
        return { success: false, message: "비밀번호가 일치하지 않습니다." };
    }

    return { success: true, data: matchedInvitations };
}

// ----------------------------------------------------------------------
// 2. 청첩장 생성 (Create) - [수정됨: Redirect 위치 변경]
// ----------------------------------------------------------------------
export async function createInvitation(formData: FormData) {
    // 1. 이미지 파일 처리
    const mainFiles = formData.getAll("mainImages") as File[];
    const mainPhotoUrls = await Promise.all(mainFiles.map((file) => uploadFile(file)));
    const validMainUrls = mainPhotoUrls.filter((url) => url !== "");

    const middleFile = formData.get("middleImage") as File | null;
    const middlePhotoUrl = await uploadFile(middleFile);

    const galleryFiles = formData.getAll("galleryImages") as File[];
    const galleryUrls = await Promise.all(galleryFiles.map((file) => uploadFile(file)));
    const validGalleryUrls = galleryUrls.filter((url) => url !== "");

    // 서버 검증: 사진
    if (validMainUrls.length < 3) throw new Error("메인 슬라이드 사진 3장이 필요합니다.");
    if (!middlePhotoUrl) throw new Error("초대장 대표 사진 1장이 필요합니다.");
    if (validGalleryUrls.length < 1) throw new Error("갤러리 사진 최소 1장이 필요합니다.");

    // 2. 비밀번호 암호화
    const rawPassword = formData.get("password") as string;
    if (!rawPassword || rawPassword.length < 4 || rawPassword.length > 6) {
        throw new Error("비밀번호는 4~6자리로 입력해 주세요.");
    }
    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    // 3. 텍스트 데이터 추출 및 검증
    const groom_name = formData.get("groom_name") as string;
    const groom_contact = formData.get("groom_contact") as string;
    const groom_father = formData.get("groom_father") as string;
    const groom_father_contact = formData.get("groom_father_contact") as string;
    const groom_mother = formData.get("groom_mother") as string;
    const groom_mother_contact = formData.get("groom_mother_contact") as string;

    const bride_name = formData.get("bride_name") as string;
    const bride_contact = formData.get("bride_contact") as string;
    const bride_father = formData.get("bride_father") as string;
    const bride_father_contact = formData.get("bride_father_contact") as string;
    const bride_mother = formData.get("bride_mother") as string;
    const bride_mother_contact = formData.get("bride_mother_contact") as string;

    const wedding_date_str = formData.get("wedding_date") as string;
    const location_name = formData.get("location_name") as string;
    const location_detail = formData.get("location_detail") as string;
    const location_address = formData.get("location_address") as string;
    const coords = await getCoords(location_address);
    const welcome_msg = formData.get("welcome_msg") as string;

    const transport_subway = formData.get("transport_subway") as string;
    const transport_bus = formData.get("transport_bus") as string;
    const transport_parking = formData.get("transport_parking") as string;

    const accounts = [];
    if (formData.get("account_groom_bank")) accounts.push({ side: "groom", name: groom_name, bank: formData.get("account_groom_bank") as string, num: formData.get("account_groom_num") as string });
    if (formData.get("account_groom_f_bank")) accounts.push({ side: "groom_f", name: groom_father, bank: formData.get("account_groom_f_bank") as string, num: formData.get("account_groom_f_num") as string });
    if (formData.get("account_groom_m_bank")) accounts.push({ side: "groom_m", name: groom_mother, bank: formData.get("account_groom_m_bank") as string, num: formData.get("account_groom_m_num") as string });
    if (formData.get("account_bride_bank")) accounts.push({ side: "bride", name: bride_name, bank: formData.get("account_bride_bank") as string, num: formData.get("account_bride_num") as string });
    if (formData.get("account_bride_f_bank")) accounts.push({ side: "bride_f", name: bride_father, bank: formData.get("account_bride_f_bank") as string, num: formData.get("account_bride_f_num") as string });
    if (formData.get("account_bride_m_bank")) accounts.push({ side: "bride_m", name: bride_mother, bank: formData.get("account_bride_m_bank") as string, num: formData.get("account_bride_m_num") as string });

    const interviews = [
        { q: formData.get("interview_q1") as string, a: formData.get("interview_a1") as string },
        { q: formData.get("interview_q2") as string, a: formData.get("interview_a2") as string },
    ].filter(i => i.q && i.a);

    validateRequiredFields({ groom_name, bride_name, wedding_date_str, location_name, location_address });

    const url_id = await generateUniqueUrlId();
    let successId = ""; // [중요] 성공 시 ID를 담을 변수

    try {
        await prisma.invitations.create({
            data: {
                url_id,
                password: hashedPassword,
                template_type: "type1",

                groom_name, groom_contact, groom_father, groom_father_contact, groom_mother, groom_mother_contact,
                bride_name, bride_contact, bride_father, bride_father_contact, bride_mother, bride_mother_contact,

                wedding_date: new Date(wedding_date_str),
                location_name, location_detail, location_address,
                location_lat: coords?.lat ?? null,
                location_lng: coords?.lng ?? null,

                transport_subway, transport_bus, transport_parking,
                welcome_msg,

                main_photo_url: JSON.stringify(validMainUrls),
                middle_photo_url: middlePhotoUrl,

                invitation_photos: {
                    create: validGalleryUrls.map((url, i) => ({ photo_url: url, sort_order: i }))
                },
                invitation_accounts: {
                    create: accounts.map(acc => ({
                        side: acc.side,
                        bank_name: acc.bank,
                        account_number: acc.num,
                        owner_name: acc.name
                    }))
                },
                invitation_interviews: {
                    create: interviews.map(iv => ({
                        question: iv.q,
                        answer: iv.a
                    }))
                }
            },
        });

        successId = url_id; // [중요] DB 저장 성공 시 ID 할당

    } catch (error) {
        console.error("Create Invitation Error:", error);
        throw new Error("청첩장 생성에 실패했습니다.");
    }

    // [중요] try-catch 문 밖에서 redirect 실행
    if (successId) {
        redirect(`/${successId}`);
    }
}

// ----------------------------------------------------------------------
// 3. ID로 상세 조회 (Detail / Update용)
// ----------------------------------------------------------------------
export async function getInvitationById(id: string) {
    const invitation = await prisma.invitations.findUnique({
        where: { url_id: id },
        include: {
            invitation_photos: { orderBy: { sort_order: 'asc' } },
            invitation_accounts: true,
            invitation_interviews: true,
        }
    });
    return invitation;
}

// ----------------------------------------------------------------------
// 4. 청첩장 삭제 (Delete)
// ----------------------------------------------------------------------
export async function deleteInvitation(id: number) {
    await prisma.invitations.delete({ where: { id: id } });
    return { success: true };
}

// ----------------------------------------------------------------------
// 5. 청첩장 수정 (Update) - [수정됨: Redirect 위치 변경]
// ----------------------------------------------------------------------
export async function updateInvitation(formData: FormData) {
    const url_id = formData.get("url_id") as string;

    // 1. 기존 데이터 확인
    const existing = await prisma.invitations.findUnique({ where: { url_id } });
    if (!existing) throw new Error("청첩장을 찾을 수 없습니다.");

    // 2. 메인 사진 업데이트
    const mainFiles = formData.getAll("mainImages") as File[];
    let mainPhotoUrl = existing.main_photo_url;

    if (mainFiles.length > 0 && mainFiles[0].size > 0) {
        const newMainUrls = await Promise.all(mainFiles.map(f => uploadFile(f)));
        const validNewUrls = newMainUrls.filter(url => url !== "");
        mainPhotoUrl = JSON.stringify(validNewUrls);
    }

    // 3. 중간 사진 업데이트
    const middleFile = formData.get("middleImage") as File | null;
    let middlePhotoUrl = existing.middle_photo_url;

    if (middleFile && middleFile.size > 0) {
        middlePhotoUrl = await uploadFile(middleFile);
    }

    // 4. 갤러리 업데이트
    const galleryFiles = formData.getAll("galleryImages") as File[];
    const hasNewGallery = galleryFiles.length > 0 && galleryFiles[0].size > 0;

    // 5. 텍스트 데이터
    const groom_name = formData.get("groom_name") as string;
    const groom_contact = formData.get("groom_contact") as string;
    const groom_father = formData.get("groom_father") as string;
    const groom_father_contact = formData.get("groom_father_contact") as string;
    const groom_mother = formData.get("groom_mother") as string;
    const groom_mother_contact = formData.get("groom_mother_contact") as string;

    const bride_name = formData.get("bride_name") as string;
    const bride_contact = formData.get("bride_contact") as string;
    const bride_father = formData.get("bride_father") as string;
    const bride_father_contact = formData.get("bride_father_contact") as string;
    const bride_mother = formData.get("bride_mother") as string;
    const bride_mother_contact = formData.get("bride_mother_contact") as string;

    const wedding_date_str = formData.get("wedding_date") as string;
    const location_name = formData.get("location_name") as string;
    const location_detail = formData.get("location_detail") as string;
    const location_address = formData.get("location_address") as string;

    const transport_subway = formData.get("transport_subway") as string;
    const transport_bus = formData.get("transport_bus") as string;
    const transport_parking = formData.get("transport_parking") as string;

    const welcome_msg = formData.get("welcome_msg") as string;

    validateRequiredFields({ groom_name, bride_name, wedding_date_str, location_name, location_address });

    // 6. 주소 변경 시 좌표 갱신 (지도 표시용)
    const coords = location_address ? await getCoords(location_address) : null;

    // 7. 계좌 정보 수집 (EditForm과 동일한 필드명)
    const accounts = [];
    if (formData.get("account_groom_bank")) accounts.push({ side: "groom", name: groom_name, bank: formData.get("account_groom_bank") as string, num: formData.get("account_groom_num") as string });
    if (formData.get("account_groom_f_bank")) accounts.push({ side: "groom_f", name: groom_father, bank: formData.get("account_groom_f_bank") as string, num: formData.get("account_groom_f_num") as string });
    if (formData.get("account_groom_m_bank")) accounts.push({ side: "groom_m", name: groom_mother, bank: formData.get("account_groom_m_bank") as string, num: formData.get("account_groom_m_num") as string });
    if (formData.get("account_bride_bank")) accounts.push({ side: "bride", name: bride_name, bank: formData.get("account_bride_bank") as string, num: formData.get("account_bride_num") as string });
    if (formData.get("account_bride_f_bank")) accounts.push({ side: "bride_f", name: bride_father, bank: formData.get("account_bride_f_bank") as string, num: formData.get("account_bride_f_num") as string });
    if (formData.get("account_bride_m_bank")) accounts.push({ side: "bride_m", name: bride_mother, bank: formData.get("account_bride_m_bank") as string, num: formData.get("account_bride_m_num") as string });

    // 8. 인터뷰 정보 수집
    const interviews = [
        { q: formData.get("interview_q1") as string, a: formData.get("interview_a1") as string },
        { q: formData.get("interview_q2") as string, a: formData.get("interview_a2") as string },
    ].filter(i => i.q && i.a);

    await prisma.invitations.update({
        where: { url_id },
        data: {
            groom_name, groom_contact, groom_father, groom_father_contact, groom_mother, groom_mother_contact,
            bride_name, bride_contact, bride_father, bride_father_contact, bride_mother, bride_mother_contact,

            wedding_date: new Date(wedding_date_str),
            location_name, location_detail, location_address,
            location_lat: coords?.lat ?? existing.location_lat,
            location_lng: coords?.lng ?? existing.location_lng,

            transport_subway, transport_bus, transport_parking,
            welcome_msg,

            main_photo_url: mainPhotoUrl,
            middle_photo_url: middlePhotoUrl,

            ...(hasNewGallery && {
                invitation_photos: {
                    deleteMany: {},
                    create: (await Promise.all(galleryFiles.map(f => uploadFile(f))))
                        .filter(url => url !== "")
                        .map((url, i) => ({ photo_url: url, sort_order: i }))
                }
            }),

            // 계좌·인터뷰 항상 전체 교체 (수정 반영)
            invitation_accounts: {
                deleteMany: {},
                create: accounts.map(acc => ({
                    side: acc.side,
                    bank_name: acc.bank,
                    account_number: acc.num,
                    owner_name: acc.name
                }))
            },
            invitation_interviews: {
                deleteMany: {},
                create: interviews.map(iv => ({
                    question: iv.q,
                    answer: iv.a
                }))
            }
        }
    });

    // [중요] 여기도 마찬가지로 try-catch가 없다면 바로 써도 되지만,
    // 안전하게 하단에 배치하는 습관이 좋습니다.
    redirect(`/${url_id}`);
}

async function getCoords(address: string) {
    try {
        const res = await fetch(`https://maps.apigw.ntruss.com/map-geocode/v2/geocode?query=${encodeURIComponent(address)}`, {
            headers: {
                "X-NCP-APIGW-API-KEY-ID": process.env.NAVER_CLIENT_ID!,
                "X-NCP-APIGW-API-KEY": process.env.NAVER_CLIENT_SECRET!,
                "Accept": "application/json" // 명시적으로 추가 권장
            },
        });

        const data = await res.json();

        if (data.addresses && data.addresses.length > 0) {
            return {
                lat: parseFloat(data.addresses[0].y),
                lng: parseFloat(data.addresses[0].x),
            };
        }
        // 주소를 못 찾으면 null 반환
        return null;
    } catch (error) {
        console.error("Geocoding API Error:", error);
        return null;
    }
}