FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

# Build the application (this is where the actual build happens for deployment)
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Accept build arguments for environment variables needed at build time
ARG GITHUB_PROFILE_URL
ARG LINKEDIN_PROFILE_URL
ARG INSTAGRAM_PROFILE_URL
ARG CONTACT_EMAIL_ADDRESS
ARG CV_URL

# Set as environment variables for the build process
ENV GITHUB_PROFILE_URL=$GITHUB_PROFILE_URL
ENV LINKEDIN_PROFILE_URL=$LINKEDIN_PROFILE_URL
ENV INSTAGRAM_PROFILE_URL=$INSTAGRAM_PROFILE_URL
ENV CONTACT_EMAIL_ADDRESS=$CONTACT_EMAIL_ADDRESS
ENV CV_URL=$CV_URL

RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder --chown=nextjs:nodejs /app/public ./public

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

# Runtime environment variables - these can be overridden by fly.io
ENV GITHUB_PROFILE_URL=""
ENV LINKEDIN_PROFILE_URL=""
ENV INSTAGRAM_PROFILE_URL=""
ENV CONTACT_EMAIL_ADDRESS=""
ENV CV_URL=""

CMD ["node", "server.js"]