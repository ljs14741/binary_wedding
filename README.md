# 💒 Wedding - 무료 청첩장 제작 서비스

**가장 아름다운 약속, 번거로움 없이** — 회원가입 없이 바로 제작할 수 있는 무료 온라인 청첩장 서비스입니다.

- 🌐 [wedding.binaryworld.kr](https://wedding.binaryworld.kr)

---

## 📋 목차

- [주요 기능](#-주요-기능)
- [기술 스택](#-기술-스택)
- [시작하기](#-시작하기)
- [프로젝트 구조](#-프로젝트-구조)
- [환경 변수](#-환경-변수)
- [배포](#-배포)

---

## ✨ 주요 기능

| 기능 | 설명 |
|------|------|
| **무료 제작** | 결제·가입 없이 모든 기능 사용 |
| **청첩장 생성** | 메인 슬라이드(3장), 갤러리, 초대장 대표 사진 등 업로드 |
| **수정·삭제** | 비밀번호 + 이름/전화번호로 본인 확인 후 수정·삭제 |
| **방명록** | 하객이 방명록 작성 가능 |
| **인터뷰** | 신랑·신부 Q&A 추가 |
| **계좌 정보** | 축의금 계좌 등록 |
| **이용 후기** | 별점과 함께 후기 작성 |
| **테마 샘플** | 클래식 화이트 등 다양한 디자인 미리보기 |
| **자동 삭제** | 예식일로부터 1개월 후 데이터 자동 삭제 |

---

## 🛠 기술 스택

- **프레임워크**: Next.js 16 (App Router)
- **UI**: React 19, Tailwind CSS 4, Framer Motion
- **DB**: MySQL (Prisma ORM)
- **인증/보안**: bcryptjs (비밀번호 해시)
- **이미지**: 클라이언트 사이드 최적화 후 업로드

---

## 🚀 시작하기

### 1. 저장소 클론 및 의존성 설치

```bash
git clone <repository-url>
cd wedding
npm install
```

### 2. 환경 변수 설정

`.env` 파일을 프로젝트 루트에 생성하고 다음 값을 설정합니다.

```env
# 데이터베이스 (필수)
DATABASE_URL="mysql://USER:PASSWORD@HOST:PORT/DATABASE"

# 사이트 URL (선택, 미설정 시 기본값 사용)
NEXT_PUBLIC_SITE_URL="https://wedding.binaryworld.kr"
```

### 3. 데이터베이스 마이그레이션

```bash
npx prisma generate
npx prisma db push   # 또는 npx prisma migrate deploy
```

### 4. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 접속

### 5. 빌드 및 프로덕션 실행

```bash
npm run build
npm start
```

---

## 📁 프로젝트 구조

```
wedding/
├── app/
│   ├── page.tsx          # 메인 (랜딩)
│   ├── make/             # 청첩장 제작
│   ├── check/            # 내 청첩장 수정/삭제
│   ├── edit/[id]/        # 청첩장 수정 폼
│   ├── [cardId]/         # 청첩장 상세 (공개 페이지)
│   ├── sample/1/         # 샘플 미리보기
│   ├── reviews/          # 이용 후기
│   ├── terms/            # 이용약관
│   ├── privacy/          # 개인정보처리방침
│   ├── api/
│   │   └── cron/         # 만료 청첩장 자동 삭제 등
│   └── actions.ts        # Server Actions
├── components/
│   ├── SiteHeader.tsx
│   ├── SiteFooter.tsx
│   ├── EditForm.tsx      # 제작/수정 폼 공통
│   ├── EditFormGuard.tsx # 수정 권한 확인
│   ├── effects/          # KenBurns, FlowerPetals 등
│   └── ui/
├── lib/
│   ├── prisma.ts
│   ├── upload.ts         # 이미지 업로드
│   ├── image.ts          # 이미지 최적화
│   └── site.ts           # 사이트 URL 등
├── prisma/
│   └── schema.prisma     # DB 스키마
└── public/
    ├── images/           # 정적 이미지
    └── uploads/          # 업로드된 사진
```

---

## 🔧 환경 변수

| 변수 | 필수 | 설명 |
|------|------|------|
| `DATABASE_URL` | ✅ | MySQL 연결 문자열 |
| `NEXT_PUBLIC_SITE_URL` | ❌ | 사이트 기본 URL (SEO, OG, canonical용) |
| `NEXT_PUBLIC_DONATE_URL` | ❌ | 후원 링크 (QR과 동일 URL). 설정 시 모바일에서 "바로 후원하기" 버튼 노출 |
| `VERCEL_URL` | ❌ | Vercel 배포 시 자동 설정 (URL 우선 사용) |

---

## 📦 배포

- `output: "standalone"` 설정으로 독립 실행 빌드
- Vercel 권장 (MySQL DB는 외부 호스팅 필요)
- Cron API로 예식 후 만료 청첩장 정리 (`/api/cron/expire-invitations`)

---

## 📄 라이선스

이 프로젝트는 개인 개발자가 제작한 무료 서비스입니다.  
미래의 제 결혼식에 사용하려고 만든 프로젝트이며, 문의는 카카오톡 채널로 연락 주세요.
