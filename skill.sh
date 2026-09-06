#!/usr/bin/env bash

# KerjaNTB - Dependencies & Skills Installer Script

echo "==> 1. Menginstal Dependencies Proyek (Bun)..."
bun add @prisma/client @clerk/nextjs @aws-sdk/client-s3 @aws-sdk/s3-request-presigner zod lucide-react clsx tailwind-merge class-variance-authority date-fns slugify sonner svix
bun add -d prisma prettier @trivago/prettier-plugin-sort-imports prettier-plugin-tailwindcss

echo "==> 2. Menginstal AI Agent Skills (.agents & .claude)..."
npx skills add vercel-labs/agent-skills -s vercel-react-best-practices -s web-design-guidelines -a antigravity claude --copy -y
npx skills add vercel-labs/skills -s find-skills -a antigravity claude --copy -y
npx skills add anthropics/skills -s frontend-design -a antigravity claude --copy -y
npx skills add https://uizze.com -s anti-ui-slop -a antigravity claude --copy -y
npx skills add mattpocock/skills -s domain-modeling -s improve-codebase-architecture -s grill-me -s tdd -a antigravity claude --copy -y
npx skills add google-labs-code/stitch-skills -a antigravity claude --copy -y

echo "==> 3. Menjalankan Prettier Formatter..."
bun run format

echo "==> Setup Selesai!"
