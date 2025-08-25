FROM node:22-alpine

RUN mkdir -p /usr/local/src/image-actions
WORKDIR /usr/local/src/image-actions

COPY package.json package-lock.json /usr/local/src/image-actions/
RUN npm ci

# copy in src
COPY LICENSE README.md entrypoint.ts tsconfig.json vitest.setup.ts vitest.config.ts /usr/local/src/image-actions/
COPY markdown-templates/ /usr/local/src/image-actions/markdown-templates/
COPY src/ /usr/local/src/image-actions/src/
COPY __tests__/ /usr/local/src/image-actions/__tests__/

ENTRYPOINT ["node", "--experimental-strip-types", "/usr/local/src/image-actions/entrypoint.ts"]
