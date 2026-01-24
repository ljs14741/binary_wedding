"use server";

import { prisma } from "@/lib/prisma";
import { uploadFile } from "@/lib/upload";
import { redirect } from "next/navigation";

function generateRandomId() {
    return Math.random().toString(36).substring(2, 10);
}

export async function createInvitation(formData: FormData) {
    // 1. 이미지 파일 처리
    const mainFile = formData.get("mainImage") as File;
    const galleryFiles = formData.getAll("galleryImages") as File[];

    const mainPhotoUrl = await uploadFile(mainFile);
    const galleryUrls = await Promise.all(galleryFiles.map((file) => uploadFile(file)));
    const validGalleryUrls = galleryUrls.filter((url) => url !== "");

    // 2. 기본 정보 추출
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
    const location_detail = formData.get("location_detail") as string; // 추가
    const location_address = formData.get("location_address") as string;
    const welcome_msg = formData.get("welcome_msg") as string;

    // 3. 교통 정보
    const transport_subway = formData.get("transport_subway") as string;
    const transport_bus = formData.get("transport_bus") as string;
    const transport_parking = formData.get("transport_parking") as string;

    // 4. 계좌 정보 (배열 생성)
    const accounts = [];
    // 신랑측
    if (formData.get("account_groom_bank")) accounts.push({ side: "groom", name: groom_name, bank: formData.get("account_groom_bank") as string, num: formData.get("account_groom_num") as string });
    if (formData.get("account_groom_f_bank")) accounts.push({ side: "groom", name: groom_father, bank: formData.get("account_groom_f_bank") as string, num: formData.get("account_groom_f_num") as string });
    if (formData.get("account_groom_m_bank")) accounts.push({ side: "groom", name: groom_mother, bank: formData.get("account_groom_m_bank") as string, num: formData.get("account_groom_m_num") as string });
    // 신부측
    if (formData.get("account_bride_bank")) accounts.push({ side: "bride", name: bride_name, bank: formData.get("account_bride_bank") as string, num: formData.get("account_bride_num") as string });
    if (formData.get("account_bride_f_bank")) accounts.push({ side: "bride", name: bride_father, bank: formData.get("account_bride_f_bank") as string, num: formData.get("account_bride_f_num") as string });
    if (formData.get("account_bride_m_bank")) accounts.push({ side: "bride", name: bride_mother, bank: formData.get("account_bride_m_bank") as string, num: formData.get("account_bride_m_num") as string });

    // 5. 인터뷰 정보 (2개 고정으로 받음)
    const interviews = [
        { q: formData.get("interview_q1") as string, a: formData.get("interview_a1") as string },
        { q: formData.get("interview_q2") as string, a: formData.get("interview_a2") as string },
    ].filter(i => i.q && i.a); // 내용 있는 것만

    const url_id = generateRandomId();

    // 6. DB 저장
    const newInvitation = await prisma.invitations.create({
        data: {
            url_id,
            template_type: "type1",
            groom_name, groom_contact, groom_father, groom_father_contact, groom_mother, groom_mother_contact,
            bride_name, bride_contact, bride_father, bride_father_contact, bride_mother, bride_mother_contact,
            wedding_date: new Date(wedding_date_str),
            location_name, location_detail, location_address,
            location_lat: 0, location_lng: 0,
            transport_subway, transport_bus, transport_parking,
            welcome_msg,
            main_photo_url: mainPhotoUrl,

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

    redirect(`/${newInvitation.url_id}`);
}