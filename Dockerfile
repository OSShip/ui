FROM oven/bun:1-alpine AS builder

ARG NEXT_PUBLIC_JITSI_APP_ID
ENV NEXT_PUBLIC_JITSI_APP_ID=$NEXT_PUBLIC_JITSI_APP_ID

WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN bun run build

FROM oven/bun:1-alpine AS runner
RUN addgroup -g 1001 -S osship \
    && adduser -u 1001 -S osship -G osship
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=builder --chown=osship:osship /app/public ./public
COPY --from=builder --chown=osship:osship /app/.next/standalone ./
COPY --from=builder --chown=osship:osship /app/.next/static ./.next/static
USER 1001
EXPOSE 3000
ENV PORT=3000
ENV INTERNAL_API_URL=http://gateway:8080/api/v1
CMD ["bun", "server.js"]
