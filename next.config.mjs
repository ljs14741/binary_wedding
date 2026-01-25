/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        serverActions: {
            bodySizeLimit: '50mb', // 서버 액션 전송 용량 제한 해제 (중요!)
        },
    },
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**', // 모든 도메인 이미지 허용
            },
        ],
    },
};

export default nextConfig;