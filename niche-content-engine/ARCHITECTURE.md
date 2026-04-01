# Multi-Tenant Next.js 14+ Content Engine

## Overview
A production-ready multi-tenant content platform built with Next.js 14+, TypeScript, Tailwind CSS, and Supabase.

## Directory Structure

### `/src/types/`
- **database.ts** - Comprehensive TypeScript types for all Supabase tables including Sites, Articles, Products, Comparisons, Directory Entries, Programmatic Templates, Email Subscribers, etc.

### `/src/lib/`
- **supabase/client.ts** - Browser-side Supabase client (respects RLS policies)
- **supabase/server.ts** - Server-side Supabase client with service role (bypasses RLS)
- **site-context.ts** - Multi-tenant site resolution with request-scoped caching
- **markdown.ts** - Advanced markdown utilities: TOC extraction, heading ID generation, auto-linking, JSON-LD generation

### `/src/components/`

#### `/layout/`
- **SiteHeader.tsx** - Dynamic header with site branding, theme colors, and navigation
- **SiteFooter.tsx** - Footer with site info, links, and affiliate disclosure

#### `/content/`
- **ArticleRenderer.tsx** - Markdown-to-React with smart heading IDs, lazy loading, external link handling
- **TableOfContents.tsx** - Sticky TOC with intersection observer for active heading tracking
- **EmailCapture.tsx** - Client-side email subscription form with error handling
- **ComparisonTable.tsx** - Responsive product comparison table with ratings, specs, pros/cons
- **DirectoryCard.tsx** - Reusable directory entry preview card

### `/src/app/`

#### Root Routes
- **layout.tsx** - Root layout with multi-tenant site resolution, theme injection, analytics
- **page.tsx** - Homepage with featured articles, comparisons, recent posts, email signup
- **robots.ts** - Dynamic robots.txt per hostname
- **sitemap.ts** - Dynamic XML sitemap with proper change frequencies

#### Dynamic Routes
- **[slug]/page.tsx** - Article pages with TOC, breadcrumbs, related articles, JSON-LD schema
- **compare/[slug]/page.tsx** - Comparison pages with product tables and verdicts
- **directory/page.tsx** - Directory listing with category grouping
- **directory/[slug]/page.tsx** - Individual business/location profiles with LocalBusiness schema

### Root Config Files
- **middleware.ts** - Multi-tenant hostname routing with dev/prod fallbacks
- **next.config.ts** - Image optimization, headers configuration
- **.env.local** - Environment variable template

## Key Features

### Multi-Tenancy
- Middleware resolves requests by hostname or dev query param
- Injects `x-site-id`, `x-site-slug`, `x-hostname` into request headers
- Site context cached per request for efficiency
- Complete data isolation by site_id

### Content Types Supported
- Articles (with clusters/topics)
- Comparisons (multi-product analysis)
- Directory Entries (businesses, locations)
- Programmatic Pages (template-based generation)

### SEO & Schema
- Dynamic metadata per page
- JSON-LD structured data (Article, HowTo, FAQPage, Product, LocalBusiness)
- Canonical URLs
- Dynamic sitemaps with change frequency
- Meta keywords and descriptions

### Performance
- ISR (Incremental Static Regeneration) at 3600s for all content pages
- Image lazy loading
- Sticky table of contents with IntersectionObserver
- Request-level caching for site lookups
- Markdown auto-linking to related articles

### Customization
- Theme configuration per site (colors, fonts, logo)
- Navigation items per site
- Affiliate program configuration
- Analytics integration (Plausible)

### Forms & Subscriptions
- Email capture with duplicate handling
- Client-side submission with proper error states

## Data Flow

```
Browser Request
    ↓
Middleware (hostname → site_id resolution)
    ↓
Root Layout (site context + theme injection)
    ↓
Page Components (server-side data fetching)
    ↓
UI Components (rendering with theme colors)
```

## Environment Variables Required

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key
ANTHROPIC_API_KEY=optional_for_generation
```

## Deployment Notes

- Middleware runs on all requests (except static assets)
- Requires Node.js 18.17+ for Headers API
- Image optimization domain pattern set to allow all HTTPS
- All pages implement proper error boundaries with notFound()
- Dynamic routes fully static-generatable with ISR

## Database Schema Requirements

The app expects these Supabase tables:
- `sites` (with JSONB theme_config, affiliate_config, analytics_config)
- `articles`, `clusters`
- `products`, `comparisons`
- `directory_entries`
- `programmatic_templates`, `programmatic_data`
- `email_subscribers`
- (optional) `content_queue`, `pipeline_runs`, `site_metrics`, `alerts`

All tables should have `site_id` for multi-tenancy.
