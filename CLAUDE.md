---
instructions: |
  - Use bun instead of npm/pnpm for package management
  - This is a Next.js + TypeScript project with Tailwind CSS
  - Main app: Next.js dashboard (app/ directory)
  - Mobile: Android/Kotlin client (client_app/ directory with Gradle)
  - Backend: Firebase/Firestore with realtime database
  - When installing dependencies, use: bun install
  - When running dev server, use: bun run dev
  - When building, use: bun run build
  - Follow existing component structure in components/ directory
  - Keep UI components in components/ui/ (shadcn/ui based)
  - Use hooks from hooks/ directory for state management
  - Firestore rules in firestore.rules, storage rules in storage.rules
  -For every changes made, update it properly and log it in the 'CHANGELOG.md' file in the docs folder. Also for every small change keep incrementing the system version. latest version is v1.7.2 start numbering from this.
---

## Project Overview

**Stack:**
- Frontend: Next.js 
- UI: Tailwind CSS + shadcn/ui components
- Backend: Firebase/Firestore + Realtime Database
- Mobile: Android/Kotlin (Gradle)
- Device Player: Android App Client for Android Devices, Python on Raspberry Pi
- Package Manager: bun
