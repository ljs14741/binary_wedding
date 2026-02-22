# ===== Stage 1: 의존성 설치 및 빌드 =====
FROM node:20-slim AS builder

WORKDIR /app

# 패키지 파일 + Prisma 스키마 (prisma generate용)
COPY package.json package-lock.json* ./
COPY prisma ./prisma/
RUN npm ci && npx prisma generate

# 소스 복사 후 빌드
COPY . .
RUN npm run build

# ===== Stage 2: 실행 =====
FROM node:20-slim AS runner

RUN apt-get update -y && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*

WORKDIR /app

ENV NODE_ENV=production
ENV TZ=Asia/Seoul

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/node_modules/prisma ./node_modules/prisma
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package.json ./

EXPOSE 3000

CMD ["sh", "-c", "npx prisma migrate deploy && node server.js"]
