import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            // 1. 폰트 설정 (아까 layout.tsx에서 정의한 변수 연결)
            fontFamily: {
                serif: ["var(--font-noto)", "serif"],     // 한글 명조
                playfair: ["var(--font-playfair)", "serif"], // 영어 제목
                script: ["var(--font-pinyon)", "cursive"],   // 영어 필기체
            },
            // 2. 애니메이션 정의
            keyframes: {
                fadeInUp: {
                    '0%': { opacity: '0', transform: 'translateY(20px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                }
            },
            // 3. 애니메이션 별명 짓기
            animation: {
                'fade-in-up': 'fadeInUp 1s ease-out forwards',
                'fade-in-slow': 'fadeIn 2s ease-out forwards',
            },
        },
    },
    plugins: [],
};
export default config;