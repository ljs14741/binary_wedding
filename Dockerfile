# ===== Stage 1: 의존성 설치 및 빌드 =====
FROM node:20-slim AS builder

RUN apt-get update -y && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# NEXT_PUBLIC_* 는 빌드 시점에 번들에 포함되므로 여기서 설정
# Jenkins에서 --build-arg 로 덮어쓸 수 있음
ARG NEXT_PUBLIC_NAVER_MAP_CLIENT_ID=xmxkex3spn
ARG NEXT_PUBLIC_SITE_URL=https://wedding.binaryworld.kr
ENV NEXT_PUBLIC_NAVER_MAP_CLIENT_ID=$NEXT_PUBLIC_NAVER_MAP_CLIENT_ID
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL

COPY package.json package-lock.json* ./
COPY prisma ./prisma/
RUN npm ci && npx prisma generate

COPY . .
RUN npm run build

# ===== Stage 2: 실행 (standalone 미사용, next start 방식) =====
FROM node:20-slim AS runner

RUN apt-get update -y && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*

WORKDIR /app

ENV NODE_ENV=production
ENV TZ=Asia/Seoul
ENV HOSTNAME=0.0.0.0

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/prisma ./prisma

EXPOSE 3000

CMD ["sh", "-c", "npx prisma migrate deploy && npm run start"]
