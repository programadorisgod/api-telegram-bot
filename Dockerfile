ARG DIR=/project

FROM node:22-bookworm-slim AS build
ARG DIR
WORKDIR ${DIR}

RUN npm install -g pnpm@latest

COPY . .

RUN pnpm install --ignore-scripts

RUN pnpm run build

FROM node:22-bookworm-slim AS release
ARG DIR=/project
WORKDIR ${DIR}

ENV NODE_ENV=production
ENV PIPX_BIN_DIR=/usr/local/bin
ENV PIPX_HOME=/opt/pipx
ENV DENO_INSTALL=/usr/local

RUN apt-get update && apt-get install -y --no-install-recommends \
    dumb-init \
    ffmpeg \
    curl \
    unzip \
    pipx \
    python3-pip \
    && curl -fsSL https://deno.land/install.sh | sh \
    && pipx ensurepath \
    && pipx install --force "yt-dlp[default]" \
    && pipx install instaloader \
    && apt-get purge -y curl unzip \
    && apt-get autoremove -y \
    && rm -rf /var/lib/apt/lists/* /root/.cache

USER node

ENV DB_URI=

COPY --from=build --chown=node:node /project/node_modules ./node_modules
COPY --from=build --chown=node:node /project/build ./build

EXPOSE 3000

CMD ["dumb-init", "node", "build/index.js"]
