# ToolNest — Everyday Tools. One Simple Place.

> **Commercial Source Code License & Developer Documentation**  
> Complete, production-grade, 100% client-side utility tools web application with 80 fully prerendered SEO pages, zero server operating costs, and verified 0-vulnerability security compliance.

---

## Table of Contents

1. [Project Overview & Value Proposition](#1-project-overview--value-proposition)
2. [Technology Stack](#2-technology-stack)
3. [System Requirements](#3-system-requirements)
4. [Installation & Local Development](#4-installation--local-development)
5. [Production Build & Prerendering](#5-production-build--prerendering)
6. [Deployment Guide](#6-deployment-guide)
   - [Deploying to Vercel (Recommended)](#deploying-to-vercel-recommended)
   - [Deploying to Docker / VPS / Static Nginx / Cloudflare Pages](#deploying-to-docker--vps--static-nginx--cloudflare-pages)
   - [Deploying with Node.js Express Server](#deploying-with-nodejs-express-server)
7. [Environment Variables](#7-environment-variables)
8. [Technical Architecture & Privacy Model](#8-technical-architecture--privacy-model)
   - [100% In-Browser Execution](#100-in-browser-execution)
   - [Safe Mathematical Expression Evaluator](#safe-mathematical-expression-evaluator)
   - [File & Image Processing Pipeline](#file--image-processing-pipeline)
   - [CSV / Spreadsheet Formula Injection Sanitization](#csv--spreadsheet-formula-injection-sanitization)
9. [White-Label & Brand Customization Guide](#9-white-label--brand-customization-guide)
   - [Site Configuration](#step-1-site-configuration)
   - [Logo & Visual Identity](#step-2-logo--visual-identity)
   - [Favicon & App Icons](#step-3-favicon--app-icons)
   - [Theme & Styling](#step-4-theme--styling)
   - [HTML Meta & Metadata.json](#step-5-html-meta--metadatajson)
10. [SEO & Sitemap Architecture](#10-seo--sitemap-architecture)
11. [Third-Party Integrations](#11-third-party-integrations)
12. [Security Audit & Compliance](#12-security-audit--compliance)
13. [Testing & Verification Suites](#13-testing--verification-suites)
14. [Commercial Licensing & Support](#14-commercial-licensing--support)

---

## 1. Project Overview & Value Proposition

**ToolNest** is an enterprise-ready, all-in-one suite of 80 fast, privacy-first web utilities designed for high organic search traffic, zero server overhead, and immediate monetization:

- **Zero Server Costs**: All image editing, PDF creation/merging, QR code generation, unit conversions, text analysis, and calculators execute 100% inside the user's browser using HTML5 Canvas, Web Cryptography, and WebAssembly. No backend compute, cloud storage buckets, or server uploads are required for tool functionality.
- **Enterprise SEO & Prerendering**: Includes an automated static pre-rendering pipeline (`scripts/postbuild.ts`) that converts all 80 dynamic routes into crawlable static HTML files containing tailored `<title>`, `<meta description>`, OpenGraph/Twitter social cards, and Schema.org structured data (WebApplication, FAQPage, BreadcrumbList).
- **Turnkey Commercial Product**: Ready to deploy immediately to any static hosting provider (Vercel, Cloudflare Pages, Netlify, AWS S3/CloudFront) or embed into an existing SaaS platform.
- **Verified 0-Vulnerability Codebase**: All direct and transitive dependencies are fully audited with 0 known CVEs, sandboxed safe math parsers, and zero dangerous JavaScript execution sinks (`eval`, `new Function`, `dangerouslySetInnerHTML`).

---

## 2. Technology Stack

| Layer | Technology | Version | Purpose |
|---|---|---|---|
| **Core Framework** | React | `^19.0.1` | Modern concurrent React UI components |
| **Language** | TypeScript | `^7.0.2` | Strict end-to-end type safety |
| **Build Tooling** | Vite | `^8.3.6` | High-speed ESM bundler & dev server (patched against GHSA-587h-7wmj-h5pm) |
| **CSS Framework** | Tailwind CSS | `^4.3.3` | Utility-first responsive design with `@tailwindcss/vite` |
| **Icons** | Lucide React | `^0.546.0` | Crisp, scalable SVG UI icons |
| **Animations** | Motion | `^12.23.24` | Smooth interactive animations and micro-interactions |
| **PDF Processing** | pdf-lib | `^1.17.1` | Client-side PDF generation, page merging, and splitting |
| **Image Compression** | upng-js | `^2.1.0` | High-efficiency lossless and lossy PNG compression |
| **QR Code Engine** | qrcode | `^1.5.4` | In-memory QR code canvas and SVG rendering |
| **Static Prerenderer**| React DOM Server | `^19.0.1` | Headless SSR post-build route generator (`postbuild.ts`) |

---

## 3. System Requirements

- **Node.js**: `v18.x`, `v20.x`, or `v22.x` (LTS recommended)
- **Package Manager**: `npm` `v9.x` or `v10.x` (compatible with `pnpm` or `yarn` v1.22+)
- **Operating System**: Linux, macOS, or Windows (WSL recommended for Windows environments)
- **Browser Compatibility**: Any modern browser supporting ECMAScript 2020+ (Chrome, Firefox, Safari, Edge)

---

## 4. Installation & Local Development

### 1. Clone or Extract the Repository
```bash
git clone <your-repository-url> toolnest
cd toolnest
```

### 2. Install Dependencies
```bash
npm install
```
> **Note on Dependency Overrides**: The `package.json` includes npm overrides for `body-parser` (`^1.20.9`) and `qs` (`^6.16.2`) to protect transitive dependencies from GHSA-27r3-jxmh-p828 and GHSA-6pq8-jhm2-2vcw. Always run `npm install` directly to respect these security overrides.

### 3. Launch Development Server
```bash
npm run dev
```
The application will be live at `http://localhost:3000`.

---

## 5. Production Build & Prerendering

The production build runs Vite's optimized production bundler followed by the automated prerendering script:

```bash
npm run build
```

### Build Pipeline Execution:
1. **`vite build`**: Compiles TypeScript modules, extracts Tailwind CSS v4 stylesheets, and creates minified JavaScript chunks in `dist/`.
2. **`tsx scripts/postbuild.ts`**:
   - Loops through all 80 canonical application routes (homepage, categories, tool workspaces, educational guides, and legal pages).
   - Prerenders component DOM structures into static HTML files (`dist/tools/*.html`, `dist/category/*.html`, etc.).
   - Injects canonical links, OpenGraph metadata, meta descriptions, and Schema.org JSON-LD structured data directly into the `<head>` of each HTML file.
   - Generates production-ready `dist/sitemap.xml` and `public/sitemap.xml` with zero-trailing-slash canonical format.
   - Generates compliant `dist/robots.txt` referencing the production sitemap.
   - Generates `dist/404.html` with explicit `noindex, nofollow` meta tags.

---

## 6. Deployment Guide

### Deploying to Vercel (Recommended)

ToolNest is pre-configured for instant zero-configuration deployment on Vercel via the included `vercel.json`:

1. Push your code to GitHub, GitLab, or Bitbucket.
2. Import the project into the [Vercel Dashboard](https://vercel.com/new).
3. Set the project settings:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
4. Deploy!

#### Pre-configured Vercel Features:
- **Clean URLs**: `cleanUrls: true` and `trailingSlash: false` guarantee consistent canonical indexing.
- **Enterprise Security Headers**: Strict-Transport-Security (HSTS), X-Frame-Options: DENY, X-Content-Type-Options: nosniff, Referrer-Policy, Permissions-Policy, and Content-Security-Policy (CSP).
- **Legacy Route Redirection**: Automated permanent redirects (`/tool/:slug` $\to$ `/tools/:slug`).

### Deploying to Docker / VPS / Static Nginx / Cloudflare Pages

Because `npm run build` generates self-contained static HTML, CSS, and JS in `dist/`, it can be served with any static web server.

#### Sample Nginx Configuration:
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    root /var/www/toolnest/dist;
    index index.html;

    # Enable gzip / brotli compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # Clean URLs with prerendered HTML support
    location / {
        try_files $uri $uri.html $uri/ /index.html;
    }

    # Static asset caching
    location ~* \.(?:ico|css|js|gif|jpe?g|png|svg|woff2?)$ {
        expires 6M;
        access_log off;
        add_header Cache-Control "public, max-age=15552000, immutable";
    }

    # Security headers
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
}
```

### Deploying with Node.js Express Server

If you wish to host using a Node.js process:
```bash
npm run build
npx serve dist -s -l 3000
```

---

## 7. Environment Variables

Create a `.env` file in the project root if you are using server-side Gemini AI features or custom hosting ports:

```env
# Optional: GEMINI_API_KEY for server-side AI integrations (if enabled)
GEMINI_API_KEY=""

# Optional: Custom domain or app URL for absolute canonical resolution
APP_URL="https://yourdomain.com"
```

A template `.env.example` is included in the root directory.

---

## 8. Technical Architecture & Privacy Model

### 100% In-Browser Execution
ToolNest guarantees complete user data privacy:
- **Images**: Rendered and manipulated via the browser's hardware-accelerated `HTML5 Canvas` element. Files are held exclusively in volatile browser memory (`Blob` / `ArrayBuffer`) and never transmitted across the network.
- **PDF Documents**: Handled by `pdf-lib` directly in WebAssembly/JavaScript memory. Page merges, splits, and conversions happen locally.
- **Text & Code**: Formatted, minified, or converted entirely in-thread with zero network calls.

### Safe Mathematical Expression Evaluator
Calculators (e.g., Scientific Calculator, Fraction Calculator, Grade Calculator, GPA Calculator) do **not** use JavaScript's dangerous `eval()` or `Function()` constructor:
- A custom lexer tokenizes arithmetic expressions into discrete operators, constants ($\pi$, $e$), functions (`sin`, `cos`, `tan`, `sqrt`, `ln`, `log`), and operands.
- A recursive descent parser enforces strict mathematical operator precedence (BODMAS / PEMDAS).
- Protects completely against Remote Code Execution (RCE) and Cross-Site Scripting (XSS).

### File & Image Processing Pipeline
- File uploads are validated prior to reading using `src/utils/fileValidation.ts`.
- Validations enforce strict MIME-type matching, 0-byte detection, and reasonable maximum size boundaries (50MB for images, 100MB for PDFs) to prevent browser memory exhaustion.

### CSV / Spreadsheet Formula Injection Sanitization
All CSV and tabular export utilities pass data through formula sanitization (`sanitizeCsvCell`) to neutralize formula injection payloads (`=`, `+`, `-`, `@`, `\t`, `%`, `|`). When opened in Microsoft Excel or Google Sheets, exported files cannot trigger malicious macro or DDE execution.

---

## 9. White-Label & Brand Customization Guide

Buyers can easily rebrand ToolNest in less than 15 minutes by updating the following files:

### Step 1: Site Configuration
Open `src/config/site.ts`:
```typescript
export const SITE_URL = 'https://yourdomain.com';      // Your live production domain
export const SITE_NAME = 'YourBrand';                 // Your brand name
export const SITE_TAGLINE = 'Fast Online Utilities';  // Your tagline
export const SITE_DESCRIPTION = 'Free private online tools for images, math, and everyday tasks.';
```

### Step 2: Logo & Visual Identity
Open `src/components/common/Logo.tsx`:
- Customize the SVG icon symbol or brand typography.
- Change the brand accent colors (e.g., replace the default violet/emerald color scheme with your corporate palette).

### Step 3: Favicon & App Icons
Replace the icon files in `/public`:
- `public/favicon.svg`: Modern vector SVG favicon.
- `public/favicon.ico`: Legacy 32x32 fallback icon.
- `public/og-image.png`: Default 1200x630 OpenGraph social share card.

### Step 4: Theme & Styling
Global CSS is configured in `src/index.css` via Tailwind CSS v4:
```css
@import "tailwindcss";
```
You can customize theme colors, border radii, and font families using standard Tailwind CSS v4 variables or utility classes.

### Step 5: HTML Meta & Metadata.json
- Update `index.html`: Change the default `<title>` and `<meta name="description">` to match your new brand name.
- Update `metadata.json`: Update the application name and summary.
- Run `npm run build` to re-generate all static pages and sitemaps with your updated branding!

---

## 10. SEO & Sitemap Architecture

ToolNest is engineered to achieve top search engine rankings:

1. **80 Pre-rendered Static Pages**: Every single tool and category page has fully hydrated static HTML generated at build time. Search engine crawlers (Googlebot, Bingbot) receive rich, complete content on the first HTTP request.
2. **Canonical Consistency**: All subpages strictly omit trailing slashes, while the homepage root preserves `/`. This prevents duplicate content penalties.
3. **Structured Data (Schema.org)**:
   - `WebApplication` / `SoftwareApplication`: Defines application category, operating system, and browser requirements.
   - `BreadcrumbList`: Structured site hierarchy for enhanced SERP rich snippets.
   - `FAQPage`: FAQ accordions with Schema.org JSON-LD markup for question/answer rich snippets.
4. **Dynamic Sitemap Generation**: `scripts/postbuild.ts` automatically maintains `dist/sitemap.xml` and `public/sitemap.xml` on every build with validated routes and priority weights.

---

## 11. Third-Party Integrations

### Contact & Feedback Form (Google Sheets Webhook)
The contact and feedback forms (`src/pages/StaticPages.tsx`) support an optional Google Apps Script webhook to capture user inquiries directly into a free Google Sheet without requiring a database.
- To configure: Paste your Google Apps Script web app URL into `GOOGLE_SHEET_WEBHOOK_URL` in `src/pages/StaticPages.tsx`.
- If no webhook URL is supplied, the form operates with a clean client-side feedback confirmation.

### Web Fonts
Google Fonts (`Inter`) is referenced in `index.html` and pre-connected for optimal Core Web Vitals and First Contentful Paint (FCP).

---

## 12. Security Audit & Compliance

The codebase has undergone a comprehensive security audit:

### Vulnerability Remediation Record:
- **GHSA-587h-7wmj-h5pm (Vite < 8.3.6)**: Upgraded `vite` to `8.3.6` (resolves Vite dev server path traversal and launch-editor vulnerability vectors).
- **GHSA-27r3-jxmh-p828 (body-parser < 1.20.9)**: Resolved via npm override to `^1.20.9` (prevents URL-encoded body parsing DoS).
- **GHSA-6pq8-jhm2-2vcw (qs < 6.16.2)**: Resolved via npm override to `^6.16.2` (prevents prototype pollution in query string parsing).

### Current Audit Status:
```text
$ npm audit
found 0 vulnerabilities
```

### Static Analysis & Sinks:
- **Zero `eval()`** in application source code.
- **Zero `new Function()`** constructors in application source code.
- **Zero `dangerouslySetInnerHTML`** usage in production components.
- **Zero hardcoded credentials or API keys** in repository tracking.

---

## 13. Testing & Verification Suites

ToolNest includes automated regression and security test suites:

### Run Regression Test Suite:
```bash
npm test
```
*Validates build output, 80 prerendered HTML routes, canonical URLs, sitemap integrity, robots.txt directives, title/description uniqueness, Schema.org JSON-LD validity, internal link mapping, and tool calculations.*

### Run Security Test Suite:
```bash
npx tsx scripts/test-security.ts
```
*Validates the safe math parser, file size/type sanitizers, CSV injection neutralization, and scans `src/` for forbidden dangerous execution sinks.*

### Run TypeScript Type Check:
```bash
npm run lint
```
*Validates full codebase TypeScript compilation with zero errors (`tsc --noEmit`).*

---

## 14. Commercial Licensing & Support

This source code is licensed under the terms of your commercial software purchase agreement.

- **Grant of Rights**: Licensees receive a non-exclusive, perpetual right to deploy, modify, rebrand, and commercially monetize the application for public or private end-users.
- **Redistribution**: Redistribution of raw source code to unauthorized third parties without permission is prohibited.
- **Warranty & Support**: For customization inquiries or commercial licensing assistance, contact your licensed vendor or account representative.

---
*ToolNest — Everyday Tools. One Simple Place.*
