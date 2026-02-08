// lib/image.ts
export const processImage = async (file: File): Promise<File> => {
    // 1. GIF는 리사이징/변환 없이 원본 그대로 유지 (움직임 보존)
    if (file.type === "image/gif") {
        return file;
    }

    // 2. 그 외 모든 이미지(PNG, WebP, JPG 등)는 JPEG로 변환 및 리사이징
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (e) => {
            const img = new Image();
            img.src = e.target?.result as string;
            img.onload = () => {
                const canvas = document.createElement("canvas");
                const MAX_WIDTH = 1200; // 배포용 권장 사이즈
                let width = img.width;
                let height = img.height;

                if (width > MAX_WIDTH) {
                    height = (height * MAX_WIDTH) / width;
                    width = MAX_WIDTH;
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext("2d");
                ctx?.drawImage(img, 0, 0, width, height);

                canvas.toBlob((blob) => {
                    if (blob) {
                        // 확장자를 .jpg로 통일하여 새로운 파일 객체 생성
                        const newName = file.name.replace(/\.[^/.]+$/, "") + ".jpg";
                        resolve(new File([blob], newName, { type: "image/jpeg" }));
                    }
                }, "image/jpeg", 0.8); // 80% 화질로 압축 (용량 최적화 핵심)
            };
        };
    });
};