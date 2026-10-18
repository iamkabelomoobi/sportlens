FROM node:22-bookworm-slim

WORKDIR /app

COPY package.json package-lock.json turbo.json tsconfig.json ./
COPY apps ./apps
COPY packages ./packages

RUN npm ci

ARG APP=api
ENV APP=$APP
ENV NODE_ENV=development

EXPOSE 3000 3001

CMD ["sh", "-c", "npm run dev --workspace @sportlens/${APP}"]
