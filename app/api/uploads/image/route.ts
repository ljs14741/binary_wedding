import { NextResponse } from "next/server";
import { uploadFile } from "@/lib/upload";

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const file = formData.get("file");
        if (!(file instanceof File) || file.size === 0) {
            return NextResponse.json({ success: false, message: "업로드할 파일이 없습니다." }, { status: 400 });
        }

        // url_id 생성 전 단계 업로드이므로 temp 경로 사용
        const url = await uploadFile(file);
        if (!url) {
            return NextResponse.json({ success: false, message: "이미지 업로드에 실패했습니다." }, { status: 400 });
        }

        return NextResponse.json({ success: true, url });
    } catch (error) {
        const message = error instanceof Error ? error.message : "이미지 업로드 중 오류가 발생했습니다.";
        return NextResponse.json({ success: false, message }, { status: 400 });
    }
}
