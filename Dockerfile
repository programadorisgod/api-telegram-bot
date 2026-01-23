ARG ALPINE_VERSION=3.18
ARG DIR=/project

FROM mcr.microsoft.com/playwright:v1.58.0-noble AS build
# Quita corepack y usa npm para instalar pnpm
RUN npm install -g pnpm@latest
ARG DIR
WORKDIR ${DIR}

COPY . .

RUN pnpm install \
    && pnpm run build

FROM mcr.microsoft.com/playwright:v1.58.0-noble as release
ARG DIR
WORKDIR ${DIR}

RUN apt-get update \
    && apt-get install -y dumb-init \
    && rm -rf /var/lib/apt/lists/*



USER pwuser

ENV DB_URI=

COPY --from=build /project/node_modules ./node_modules
COPY --from=build /project/build ./build

EXPOSE $PORT

CMD ["dumb-init", "node", "build/index.js"]
