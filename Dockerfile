FROM node:24-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev --no-audit --no-fund

COPY server.js about.md config.json ./
COPY lib ./lib
COPY static ./static

FROM alpine:3.24 AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN apk upgrade --no-cache
RUN apk add --no-cache nodejs-current
RUN addgroup -S app && adduser -S -G app app

COPY --from=build /app /app
RUN chown -R app:app /app
USER app

HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
  CMD ["node", "-e", "const http=require('http');const req=http.get('http://127.0.0.1:7777',res=>process.exit(res.statusCode<500?0:1));req.on('error',()=>process.exit(1));req.setTimeout(5000,()=>{req.destroy();process.exit(1);});"]

EXPOSE 7777
CMD ["node", "server.js"]
