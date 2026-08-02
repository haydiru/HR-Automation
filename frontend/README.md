# HR Automation System — Frontend Web Application

Aplikasi frontend dan backend API berbasis **Next.js 16 (App Router)** untuk HR Automation System.

Dokumentasi lengkap, arsitektur sistem, skema database, diagram alur, dan panduan penggunaan secara detail dapat dilihat di:
👉 **[README Utama Project (Root README.md)](../README.md)**

---

## 🚀 Quick Start (Development)

```bash
# 1. Install dependencies
npm install

# 2. Jalankan dev server
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser Anda.

---

## 🛠️ Environment Variables Required (`.env.local`)

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
DATABASE_URL=postgresql://postgres.your-project:password@aws-0-region.pooler.supabase.com:6543/postgres
GEMINI_API_KEY=your-gemini-api-key
WEBHOOK_SECRET=hookn8ngmail
```
