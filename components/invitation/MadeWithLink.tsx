"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

/** 청첩장 맨 끝 Binary Wedding 링크. 하객 유입을 utm 과 GA 이벤트로 구분함 */
export default function MadeWithLink({
    template,
    className = "",
    children,
}: {
    /** utm_content / GA 이벤트에 들어갈 템플릿 이름 */
    template: "classic" | "minihompy";
    className?: string;
    children: ReactNode;
}) {
    const pathname = usePathname();

    // 만들기 화면 미리보기(iframe)에서는 눌러도 이동 안 함
    if (pathname?.startsWith("/preview")) {
        return <span className={className}>{children}</span>;
    }

    const href = `/?utm_source=card&utm_medium=footer&utm_content=${template}`;
    const track = () => {
        const w = window as unknown as { gtag?: (...args: unknown[]) => void };
        w.gtag?.("event", "card_footer_click", { template });
    };

    return (
        <a href={href} target="_blank" rel="noopener" onClick={track} className={className}>
            {children}
        </a>
    );
}
