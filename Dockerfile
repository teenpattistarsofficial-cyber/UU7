# syntax=docker/dockerfile:1

# Single base across every stage — sharp (Module 9's image pipeline)
# compiles/fetches native bindings for whatever libc it sees at `pnpm
# install` time. Alpine uses musl; mixing an alpine runner with a
# glibc-based builder is the classic way to end up with a sharp binary
# that fails at runtime with "invalid ELF header".
FROM node:24-alpine AS base
RUN corepack enable
WORKDIR /app

# ---- deps: installed once, cached by Docker as long as the lockfile
# doesn't change, independent of source-code edits ----
# `--ignore-scripts` used to be set here, blocking every package's install
# scripts — including sharp's, whose prebuilt native binary (for whichever
# platform is running) needs its own install step to link its bundled
# libvips shared library. Without it, sharp's binary exists but fails to
# load at runtime with "Could not load the sharp module... ERR_DLOPEN_FAILED"
# the moment a real image upload runs it — a working `next build` never
# exercises this path, so the break was invisible until then. Removed in
# favor of pnpm-workspace.yaml's `onlyBuiltDependencies` allowlist (already
# used for esbuild), which restricts install scripts to specifically-approved
# packages instead of blocking everyone or trusting everyone.
FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile --trust-lockfile

# ---- builder: compile the Next.js app ----
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# No DATABASE_URL is provided here on purpose. Every DB-backed public route
# with no dynamic route params (/, /authors, /sitemap.xml) is explicitly
# `export const dynamic = "force-dynamic"` so `next build` never attempts a
# live database connection — see the comments on those files. If this build
# ever fails demanding a live DB, that means a new route regressed that
# invariant, not that this Dockerfile is missing a secret.
RUN npx next build

# ---- migrate: one-off container for `drizzle-kit migrate` against the
# production DB. Not started by `docker compose up` — run explicitly
# (docker compose --profile tools run --rm migrate) before first boot and
# after any deploy that adds a migration. Reuses `builder` as-is since it
# already has the full source tree and devDependencies (drizzle-kit isn't
# in the pruned `standalone` output the runner stage uses). ----
FROM builder AS migrate
CMD ["npx", "drizzle-kit", "migrate"]

# ---- runner: minimal runtime image ----
FROM base AS runner
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs

# Order matters: `standalone` ships its own partial copy of `public` (only
# whatever files its build trace happened to touch), so the full source
# `public` directory must be copied AFTER it to fully overwrite that partial
# copy rather than being overwritten by it.
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Mounted over by a named volume in docker-compose so uploaded media
# survives container recreation — this just ensures the directory (and its
# ownership) exists before that volume is mounted on top of it.
RUN mkdir -p ./public/uploads && chown nextjs:nodejs ./public/uploads

USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
