ARG ALPINE_VERSION=3.18

FROM node:20-alpine${ALPINE_VERSION} as base
ARG DIR=/project
WORKDIR ${DIR}

COPY package*.json .
RUN npm ci --omit=dev

FROM base as build
# Quita corepack y usa npm para instalar pnpm
RUN npm install -g pnpm@latest

WORKDIR ${DIR}
COPY . .

RUN pnpm install
RUN pnpm run build

FROM alpine:${ALPINE_VERSION} as release
WORKDIR ${DIR}
RUN apk add --no-cache libstdc++ dumb-init \
    && addgroup -g 1000 node && adduser -u 1000 -G node -s /bin/sh -D node \
    && chown node:node ./

COPY --from=base /usr/local/bin/node /usr/local/bin/node

USER node

ENV DB_URI=

COPY --from=build /project/node_modules ./node_modules
COPY --from=build /project/build ./build

EXPOSE $PORT

CMD ["dumb-init", "node", "build/index.js"]