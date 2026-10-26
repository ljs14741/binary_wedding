// 서버 시작 시 1번 실행됨 (Next.js instrumentation)

/** temp 업로드 정리 주기 */
const CLEANUP_INTERVAL_MS = 6 * 60 * 60 * 1000;

export async function register() {
    // Node 서버에서만 (edge 런타임·빌드 단계 제외)
    if (process.env.NEXT_RUNTIME !== "nodejs") return;

    const { cleanupTempUploads } = await import("@/lib/cleanupTemp");
    const run = async () => {
        const { deleted, freedBytes } = await cleanupTempUploads();
        if (deleted > 0) {
            console.log(`[temp 정리] ${deleted}개 삭제, ${(freedBytes / 1024 / 1024).toFixed(1)}MB 확보`);
        }
    };
    run();
    setInterval(run, CLEANUP_INTERVAL_MS).unref();
}
