/**
 * 싸이월드 미니미 느낌 도트 캐릭터 (신랑/신부). 16x20 픽셀 맵을 SVG rect로 그림
 * 맵 한 글자 = 한 픽셀, "."은 투명
 */

const PALETTE: Record<string, string> = {
    K: "#3a2c2c", // 외곽선
    H: "#2b2b33", // 신랑 머리
    N: "#6b4433", // 신부 머리
    S: "#FFE2C6", // 피부
    E: "#2b2b33", // 눈
    B: "#FFB0B0", // 볼터치
    M: "#E8687A", // 입
    T: "#34405a", // 턱시도
    W: "#FFFFFF", // 셔츠·드레스
    G: "#DCE3EC", // 드레스 그림자
    R: "#E8546B", // 나비넥타이·꽃
    P: "#FFB7CB", // 분홍 꽃
    L: "#7CC08A", // 잎
    V: "#E2EAF4", // 베일
    Y: "#FFD45C", // 티아라
};

const GROOM = [
    "....KKKKKKKK....",
    "...KHHHHHHHHK...",
    "..KHHHHHHHHHHK..",
    "..KHHHHHHHHHHK..",
    ".KHHHSSSSSSHHHK.",
    ".KHSSSSSSSSSSHK.",
    ".KSSSESSSSESSSK.",
    ".KSSSESSSSESSSK.",
    ".KSBBSSSSSSBBSK.",
    ".KSSSSSMMSSSSSK.",
    "..KSSSSSSSSSSK..",
    "...KKKKKKKKKK...",
    "...KTTWWWWTTK...",
    "..KTTRRKKRRTTK..",
    "..KSTTTWWTTTSK..",
    "..KKTTTWWTTTKK..",
    "...KTTTWWTTTK...",
    "...KTTTKKTTTK...",
    "...KTTK..KTTK...",
    "...KKKK..KKKK...",
];

const BRIDE = [
    "....KKKKKKKK....",
    "...KNNYYYYNNK...",
    "..KNNNNNNNNNNK..",
    ".VKNNNNNNNNNNKV.",
    "VVKNNSSSSSSNNKVV",
    "VKNNSSSSSSSSNNKV",
    "VKNSSESSSSESSNKV",
    "VKNSSESSSSESSNKV",
    "VKNBBSSSSSSBBNKV",
    "VKNSSSSMMSSSSNKV",
    "VVKNSSSSSSSSNKVV",
    "VV.KKKKKKKKKK.VV",
    "VV.KWWWWWWWWK.VV",
    "VV.KWWWPPWWWK.VV",
    "V.KSWWPRRPWWSK.V",
    "V.KWWWWLLWWWWK.V",
    "..KWWWWWWWWWWK..",
    ".KWWWWWWWWWWWWK.",
    "KGWWWWWWWWWWWWGK",
    "KKKKKKKKKKKKKKKK",
];

/** 같은 색이 이어지는 가로 구간을 rect 하나로 합침 */
function toRects(map: string[]) {
    const rects: { x: number; y: number; w: number; fill: string }[] = [];
    map.forEach((row, y) => {
        let x = 0;
        while (x < row.length) {
            const ch = row[x];
            let w = 1;
            while (row[x + w] === ch) w++;
            if (PALETTE[ch]) rects.push({ x, y, w, fill: PALETTE[ch] });
            x += w;
        }
    });
    return rects;
}

const RECTS = { groom: toRects(GROOM), bride: toRects(BRIDE) };

export default function Minimi({ kind, className = "" }: { kind: "groom" | "bride"; className?: string }) {
    return (
        <svg viewBox="0 0 16 20" className={className} shapeRendering="crispEdges" role="img"
             aria-label={kind === "groom" ? "신랑 미니미" : "신부 미니미"}>
            {RECTS[kind].map((r, i) => (
                <rect key={i} x={r.x} y={r.y} width={r.w} height={1} fill={r.fill}/>
            ))}
        </svg>
    );
}
