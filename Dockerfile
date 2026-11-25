FROM node:26-alpine AS base

WORKDIR /usr/local/src/image-actions

COPY package.json package-lock.json ./

FROM base AS test

RUN npm ci

COPY entrypoint.ts tsconfig.json vitest.setup.ts vitest.config.ts ./
COPY markdown-templates/ markdown-templates/
COPY src/ src/
COPY __tests__/ __tests__/

FROM base

RUN npm ci --omit=dev

COPY LICENSE README.md entrypoint.ts ./
COPY markdown-templates/ markdown-templates/
COPY src/ src/

ENTRYPOINT ["node", "/usr/local/src/image-actions/entrypoint.ts"]
