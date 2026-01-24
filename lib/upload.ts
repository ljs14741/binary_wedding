// lib/upload.ts
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

export async function uploadFile(file: File | null): Promise<string> {
    // 1. 파일이 없으면 빈 문자열 반환
    if (!file || file.size === 0) return "";

    // 2. 바이트 변환
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 3. 저장할 경로 설정 (public/uploads 폴더)
    // process.cwd()는 프로젝트 루트 경로를 가져옵니다.
    const uploadDir = join(process.cwd(), "public", "uploads");

    try {
        // 폴더가 없으면 생성 (recursive: true는 상위 폴더까지 같이 생성)
        await mkdir(uploadDir, { recursive: true });
    } catch (error) {
        // 폴더가 이미 있으면 에러 무시
    }

    // 4. 유니크한 파일명 생성
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    // 파일 이름에서 확장자만 추출 (예: jpg, png) 또는 기본값 jpg
    const ext = file.name ? file.name.split(".").pop() : "jpg";
    const filename = `${uniqueSuffix}.${ext}`;

    const filepath = join(uploadDir, filename);

    // 5. 파일 쓰기
    await writeFile(filepath, buffer);

    // 6. 웹에서 접근 가능한 URL 반환
    return `/uploads/${filename}`;
}