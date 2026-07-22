ARG TASK_RUNTIME_IMAGE=node:22.19.0-bookworm-slim
ARG CONTROLLER_IMAGE=node:22.17.0-bookworm-slim

FROM ${TASK_RUNTIME_IMAGE} AS task-runtime
FROM ${CONTROLLER_IMAGE} AS benchmark

LABEL org.opencontainers.image.source="https://github.com/decantr-ai/decantr" \
      org.opencontainers.image.title="Decantr 3.10 benchmark runtime"

ARG CODEX_VERSION=0.145.0-alpha.27
ARG CLAUDE_CODE_VERSION=2.1.153
ARG TASK_RUNTIME_KIND=node
ARG TASK_RUNTIME_VERSION=22.19.0
ARG PACKAGE_MANAGER_NAME=pnpm
ARG PACKAGE_MANAGER_VERSION=10.33.0

RUN npm install --global --omit=dev \
      "@openai/codex@${CODEX_VERSION}" \
      "@anthropic-ai/claude-code@${CLAUDE_CODE_VERSION}" \
    && npm cache clean --force \
    && useradd --create-home --home-dir /home/benchmark --shell /usr/sbin/nologin --uid 10001 benchmark \
    && mkdir -p /home/benchmark-empty /work /evidence /opt/decantr-benchmark /opt/task-runtime /opt/task-package-manager \
    && chown -R benchmark:benchmark /home/benchmark-empty /work /evidence /opt/decantr-benchmark

COPY --from=task-runtime /usr/local/ /opt/task-runtime/

RUN if [ "${PACKAGE_MANAGER_NAME}" != "bun" ]; then \
      npm install --prefix /opt/task-package-manager --omit=dev --no-audit --no-fund \
        "${PACKAGE_MANAGER_NAME}@${PACKAGE_MANAGER_VERSION}"; \
    fi \
    && npm cache clean --force

COPY --chown=benchmark:benchmark scripts/benchmark-3-10/ /opt/decantr-benchmark/

ENV PLAYWRIGHT_BROWSERS_PATH=/opt/decantr-benchmark/evaluator-runtime/browsers

RUN cd /opt/decantr-benchmark/evaluator-runtime \
    && npm ci --ignore-scripts --no-audit --no-fund \
    && ./node_modules/.bin/playwright install --with-deps chromium \
    && npm cache clean --force

ENV HOME=/home/benchmark-empty \
    XDG_CACHE_HOME=/home/benchmark-empty/.cache \
    XDG_CONFIG_HOME=/home/benchmark-empty/.config \
    XDG_DATA_HOME=/home/benchmark-empty/.local/share \
    CI=1 \
    NO_COLOR=1 \
    TZ=UTC \
    DECANTR_TASK_RUNTIME_KIND=${TASK_RUNTIME_KIND} \
    DECANTR_TASK_RUNTIME_VERSION=${TASK_RUNTIME_VERSION} \
    DECANTR_TASK_PACKAGE_MANAGER=${PACKAGE_MANAGER_NAME} \
    DECANTR_TASK_PACKAGE_MANAGER_VERSION=${PACKAGE_MANAGER_VERSION} \
    PATH=/opt/task-package-manager/node_modules/.bin:/opt/task-runtime/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin

USER benchmark
WORKDIR /work

ENTRYPOINT ["/usr/local/bin/node", "/opt/decantr-benchmark/container/entrypoint.mjs"]
CMD ["--self-check"]
