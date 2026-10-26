// 청첩장 완성 안 하고 떠난 사용자의 temp 업로드 파일 정리 (디스크 절약)
import { readdir, stat, rm } from "fs/promises";
import { join } from "path";

/** 이보다 오래된 temp 파일 삭제. 만들기 화면을 며칠 열어두는 경우까지 고려해 넉넉히 */
export const TEMP_MAX_AGE_MS = 3 * 24 * 60 * 60 * 1000;

const TEMP_DIR = join(process.cwd(), "public", "uploads", "temp");

export async function cleanupTempUploads(): Promise<{ deleted: number; freedBytes: number }> {
    let deleted = 0;
    let freedBytes = 0;
    let names: string[];
    try {
        names = await readdir(TEMP_DIR);
    } catch {
        return { deleted, freedBytes }; // 폴더 없으면 할 일 없음
    }
    const cutoff = Date.now() - TEMP_MAX_AGE_MS;
    for (const name of names) {
        const path = join(TEMP_DIR, name);
        try {
            const s = await stat(path);
            if (!s.isFile() || s.mtimeMs > cutoff) continue;
            await rm(path, { force: true });
            deleted++;
            freedBytes += s.size;
        } catch {
            // 그 사이 이동·삭제된 파일 등 — 무시
        }
    }
    return { deleted, freedBytes };
}
