# AI-Powered E-Mandi (Frontend)

> A modern, mobile-first agricultural commerce platform connecting Indian tomato farmers directly with wholesale buyers using automated YOLO-based computer vision grading and tamper-proof digital certificates.

---

## Tech Stack & Architecture

- **Core:** React 19 + TypeScript (strict) + Vite (ESM only)
- **Styling:** Tailwind CSS v4 via `@tailwindcss/vite` (pure CSS-first tokens in `@theme`, no `tailwind.config.js`)
- **Routing:** React Router v7 with Data Router and route-level code splitting (`React.lazy` + `Suspense`)
- **Server State:** TanStack Query v5 with query-key factories and automatic invalidation
- **Client State:** Zustand with `persist` middleware for auth session (JWT + user profile)
- **Forms & Validation:** `react-hook-form` + `@hookform/resolvers/zod`
- **PWA & Offline:** `vite-plugin-pwa` with Service Worker precaching and offline detection banner
- **Localization:** `i18next` supporting **English**, **Hindi (हिंदी)**, and **Marathi (मराठी)**
- **Testing:** Vitest + React Testing Library + Mock Service Worker (MSW)

---

## Directory Structure

```
frontend/
  src/
    app/
      layouts/          # PublicLayout, FarmerLayout, BuyerLayout
      router.tsx        # React Router v7 route definitions with code-splitting
      providers.tsx     # TanStack Query, Toaster, OfflineBanner, i18n
      RequireRole.tsx   # Strict role guards with redirect preservation
      ErrorBoundary.tsx # Global route error boundaries
    components/
      ui/               # Accessible primitives (GradePill, StatusBadge, StatCard, EmptyState, etc.)
      LanguageSwitcher  # English, Hindi, Marathi selector
      ThemeToggle       # Light/Dark mode toggle (class-based `@custom-variant dark`)
      OfflineBanner     # Real-time online/offline connectivity notification
    features/
      auth/             # Login, Register, Role Toggle, schemas & hooks
      grading/          # AI camera scan, canvas compressor, DetectionOverlay, report history
      certificates/     # Certificate cards, QR previews, authenticated PDF download, public verify
      products/         # Marketplace, filter chips, lot details, inventory management, create/edit
      orders/           # State machine, OrderTimeline, OrderCard, OrderDetailDrawer, farmer/buyer lists
      dashboard/        # AnimatedCounter, OrderStatusDonut (inline SVG), RecentOrdersTable
      landing/          # Hero banner, 3-step "How It Works", trust section, dual CTAs
    i18n/               # en.json, hi.json, mr.json locale dictionaries
    lib/
      api.ts            # Type-safe fetch client, uploadUrl(), downloadCertificatePdf()
      queryClient.ts    # Configured TanStack Query client
      format.ts         # INR currency, weights (kg), dates
      image-compress.ts # Client-side image compression (<2MB)
    stores/             # Zustand auth store with session restoration via GET /api/auth/me
    tests/              # State machine tests, Zod schemas, MSW integration tests
```

---

## Getting Started

### Prerequisites
- Node.js 18+ or 20+
- npm or pnpm

### 1. Environment Configuration
Copy the example environment file:
```bash
cd frontend
cp .env.example .env
```
Ensure `VITE_API_URL` points to your backend:
```env
VITE_API_URL=http://localhost:5000
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) (or Vite assigned port) in your browser.

### 4. Run Test Suite
```bash
npm test
# Or run once:
npx vitest run
```

### 5. Production Build
```bash
npm run build
```
Generates an optimized static build in `dist/` with all initial JavaScript assets under **150 KB gzipped**.

---

## Production Deployment & Hosting Note

### 1. Static Hosting (Vercel / Netlify / Cloudflare Pages / AWS S3 + CloudFront)
The frontend is a pure Single Page Application (SPA). For any static host, ensure that all routes fallback to `index.html`.

#### For Vercel (`vercel.json`):
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

#### For Netlify (`_redirects` in `public/`):
```text
/*    /index.html   200
```

#### For Nginx:
```nginx
location / {
  root /var/www/e-mandi/dist;
  index index.html;
  try_files $uri $uri/ /index.html;
}
```

### 2. Backend CORS Configuration
Ensure the Express backend allows requests from the frontend origin:
```javascript
app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:5173", "https://your-production-domain.com"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
```

