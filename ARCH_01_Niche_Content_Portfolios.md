# Architecture Sketch: Niche Content Portfolios (SEO 2.0)
**Last updated:** 2026-03-31

---

## The Big Idea

Build a single "content engine" that powers a portfolio of 40-50 hyper-niche websites. Each site is a distinct brand with its own domain, but they all run on the same codebase, the same database, and the same automated content pipeline. Adding a new site is a config file and a domain — not a new project.

The sites target long-tail, low-competition search queries in enthusiast niches where the audience is passionate, affluent, and willing to click affiliate links or tolerate premium display ads.

---

## Architecture: One Engine, Many Skins

### How Multi-Tenancy Works

A single Next.js app deployed once on Vercel serves all sites. Middleware reads the incoming hostname (`nanoreefguide.com` vs `tenkara-minimalist.com`), looks up the site config in Supabase, and renders the correct brand — logo, color palette, nav categories, footer, affiliate links. The page components (article, comparison table, directory listing, calculator/tool, homepage) are shared across all sites.

### Tech Stack
- **Framework:** Next.js 14+ (App Router, ISR for content freshness without redeploys) on Vercel
- **Database:** Supabase (single instance, multi-tenant via `site_id` + Row-Level Security)
- **CMS:** Supabase tables for articles, products, directory entries — managed via a simple admin UI or direct DB writes from the content pipeline
- **Content pipeline:** Python orchestrator (cron on VPS or Supabase Edge Functions) → Claude API for generation → writes to Supabase → ISR serves updated pages
- **Analytics:** Plausible (self-hosted or cloud, privacy-friendly, works across all sites)
- **Monetization:** Display ads (AdSense → Mediavine/Raptive at scale) + niche affiliate programs

### Supabase Schema (Core Tables)
```
sites           → id, slug, domain, name, description, theme_config, affiliate_config, status
articles        → id, site_id, slug, title, content_md, meta_description, cluster_id, status, published_at
clusters        → id, site_id, name, pillar_article_id (topical authority groupings)
products        → id, site_id, name, category, specs_json, affiliate_url, image_url
comparisons     → id, site_id, title, product_ids[], comparison_data_json
directory_entries → id, site_id, name, location, category, description, url, lat, lng
email_subscribers → id, site_id, email, subscribed_at
content_queue   → id, site_id, content_type, topic, prompt_params, status, scheduled_for
```

### Cost Structure (Full Portfolio)
| Item | Monthly Cost | Notes |
|------|-------------|-------|
| Vercel Pro | $20 | Single project, unlimited custom domains |
| Supabase Pro | $25 | Single instance for all sites |
| Claude API | $50-150 | Content generation pipeline |
| Plausible | $0-9 | Self-hosted or starter plan |
| Domains | ~$45 | ~$10/yr × 50 domains, amortized |
| VPS (pipeline runner) | $5-10 | If not using Supabase Edge Functions |
| **Total** | **~$150-260/mo** | **For the entire portfolio** |

---

## Content Strategy: How to Reach 50K Sessions/Month Per Site

### The Math
You don't need viral content. You need volume on long-tail keywords.
- Target: 300-500 indexed pages per site
- Average traffic per page: 100-200 sessions/month (achievable for low-competition long-tail)
- 300 pages × 150 avg sessions = **45K sessions/month**
- Mix of evergreen articles (200-300), programmatic pages (50-150), and tools/calculators (5-10)

### Content Types (Shared Templates)

**1. Evergreen Knowledge Articles** (~60% of content)
These are the backbone. Deep, authoritative answers to specific questions. Claude generates drafts from structured prompts; you do a quick review pass.
- "Can You Keep a Mandarin Dragonet in a Nano Reef?"
- "How to Tie a Woolly Bugger: Step-by-Step with Materials List"
- "PSA 9 vs PSA 10: Is the Price Premium Worth It?"

**2. Curated Comparison & Review Pages** (~20% of content)
Product-focused pages built from manually curated specs + Claude-written analysis. No live API needed — you maintain a products table in Supabase with specs, pros/cons, and affiliate links.
- "Best Protein Skimmers Under $300 (2026)"
- "5wt Fly Rod Comparison: Orvis vs Sage vs Redington"
- "Top 10 Heated Ski Gloves Ranked by Battery Life"

**3. Programmatic SEO Pages** (~15% of content)
Template-driven pages generated from structured data. Each page targets a hyper-specific long-tail query. The data is curated/compiled once, then pages are auto-generated.
- Fish compatibility: "Can [Fish A] live with [Fish B]?" (one page per pair)
- Card checklists: "2025 Panini Prizm Basketball Complete Checklist" (one page per set/year)
- Gear specs: "Orvis Helios 3F 9ft 5wt Specifications and Review"
- Location pages: "Best Boot Fitters in [City]" (one per city)

**4. Tools & Calculators** (~5% of content)
Small interactive tools built as React components. These earn backlinks (other sites link to useful tools) which boosts the whole site's authority.
- "Ski Pass Cost Calculator: Ikon vs Epic Based on Your Ski Days"
- "Reef Tank Dosing Calculator: Alkalinity, Calcium, Magnesium"
- "Card Grading ROI Calculator: Raw vs Graded Value"

### Content Pipeline Cadence
- **Daily:** Pipeline checks `content_queue` table, generates scheduled articles across all sites
- **Weekly target per site:** 5-8 new articles during build phase, 2-3/week maintenance phase
- **Batch approach:** Process all sites in one pipeline run. 50 sites × 5 articles = 250 articles/week = ~35/day. At ~$0.05-0.10 per article in API costs, that's $2-3/day.

### SEO Flywheel: How Traffic Compounds
1. **Topical authority clusters:** Each site organizes content into 3-5 topic clusters. A "pillar" article links to 10-15 supporting articles. Google rewards this structure.
2. **Internal linking engine:** The shared platform auto-links related articles within the same cluster. Every new article strengthens the cluster.
3. **Schema markup:** Every page has appropriate structured data (Article, Product, FAQ, HowTo). This earns rich snippets in search results.
4. **Cross-site linking within clusters:** The "Heated Ski Gear Reviews" site can naturally link to the "Ski Wax Tech Blog" — they're related but distinct brands. This builds authority for both.
5. **Compounding timeline:** Month 1-3 is a dead zone (Google sandbox). Month 4-6 traffic trickles in. Month 6-12 it compounds as Google indexes more pages and trusts the domain.

---

## Data Source Strategy: Minimize API Dependencies

### Design Principle
After getting rejected from eBay's developer program, the strategy is clear: **don't build businesses that depend on privileged API access.** The content engine should work with (a) public/free data, (b) Claude's training knowledge, and (c) manually curated data that we own.

### What We Actually Need

**Free public APIs (nice-to-have, not critical):**
- USGS Water Data API — river flows and temps for fishing sites (free, no approval needed)
- NOAA Weather API — snow and marine conditions (free, public)
- avalanche.org — backcountry reports (public RSS feeds)
- OpenF1 API — race results and lap data (free, open source)
- Google Places API — for directory/map sites (free tier: 28K requests/mo)

**Claude's knowledge (the real engine):**
Most of the content is knowledge-based, not data-based. Claude can write authoritative articles about reef chemistry, fly tying techniques, card grading, ski waxing, etc. without any external API. The prompt just needs to be specific and structured.

**Manually curated data (our moat):**
Product specs, comparison data, directory entries, and checklist data get entered into Supabase manually or semi-automatically. This is actually a competitive advantage — it's hard for competitors to replicate a hand-curated database, whereas anyone can scrape the same API.

### What We Don't Need
- eBay Browse API (rejected; card prices can be discussed editorially without live data)
- Airbnb/VRBO scraping (legally risky, technically fragile)
- Any API requiring business verification or partnership approval
- Real-time price feeds of any kind (pivot to editorial "price guide" content instead)

---

## The Site List: ~60 Sites Across 10 Clusters

Selection criteria for every site: (1) knowledge-heavy content Claude can write well, (2) passionate/affluent audience with good ad RPMs, (3) deep long-tail keyword opportunity (300+ answerable questions), (4) affiliate or product revenue potential, (5) no dependency on privileged APIs. Sites marked ★ have especially strong programmatic SEO potential (template-driven pages at scale).

---

### Cluster 1: Winter Sports (7 sites)
1. **Backcountry Safety Hub** — avalanche gear, beacon reviews, safety courses, route planning (public avalanche.org data)
2. **Ikon vs Epic Pass Calculator** ★ — interactive tool + editorial analysis of pass value by skier profile
3. **The Ski Wax Tech Blog** — technical reviews of waxes, base repair, edge tuning, race prep
4. **Heated Ski Gear Reviews** — battery-powered boots, gloves, socks, jackets (high affiliate $$$)
5. **Custom Boot Fitting Directory** ★ — curated database of fitters across US/Canada, by city
6. **Après-Ski Bay Area** — events, travel logistics, carpools for the Tahoe commuter crowd
7. **Kids Learn to Ski** — family gear guides, lesson program directories, resort reviews for families

### Cluster 2: Fly Fishing & Angling (7 sites)
8. **Green River Fly Fishing** — hatch charts (seasonal/static), wade and float guides, gear for the area
9. **The 5wt Rod Comparison** ★ — data-driven reviews/specs of the most popular fly rod weight class
10. **Fly Tying for Beginners** — step-by-step patterns, materials lists, starter kit affiliate links
11. **The Tenkara Minimalist** — Japanese-style simplified fly fishing gear, technique, philosophy
12. **High-Altitude Lake Fishing** — hiking + fishing guides for alpine lakes in the Rockies
13. **Wader & Gear Care Academy** — repair, maintenance, waterproofing how-tos (evergreen)
14. **Women's Fly Fishing** — underserved niche: gear, community, guides, destination reviews

### Cluster 3: Sports Cards & Collectibles (7 sites)
15. **The Grading Guide** ★ — PSA vs BGS vs SGC, how grading works, submission guides, turnaround tracking
16. **Basketball Card Invest-o-Pedia** — collecting education, market commentary, set analysis (editorial)
17. **Vintage Hoop Cards** — 80s and 90s cards, nostalgia collecting, condition guides
18. **Card Storage & Protection** — toploaders, one-touch cases, humidity control (strong affiliate)
19. **The Box Break Guide** — what box breaking is, which sets to buy, where to watch, break math
20. **Rookie Card Checklists** ★ — comprehensive checklists by year/sport/brand (programmatic SEO goldmine)
21. **Card Show Calendar & Directory** ★ — curated schedule of shows in major metro areas

### Cluster 4: Reef Keeping & Aquariums (7 sites)
22. **The Nano Reef Guide** — equipment, stocking, and care for tanks under 20 gallons
23. **Acropora Coral Care** — advanced SPS coral keeping (high-value, passionate audience)
24. **Reef Tank Chemistry 101** — alkalinity, calcium, magnesium dosing simplified + calculator tool
25. **Protein Skimmer Comparison** ★ — curated spec database, editorial reviews, sizing guide
26. **Fish Compatibility Database** ★ — "Can X live with Y?" pages per species pair (massive long-tail)
27. **DIY Aquarium Plumbing** — sump setups, return pumps, overflow boxes, leak prevention
28. **Reef Pest ID & Control** — Aiptasia, flatworms, bristleworms — visual ID + treatment guides

### Cluster 5: Motorsports & Racing (5 sites)
29. **F1 for New Fans** — explaining DRS, tire strategy, regulations, team histories in plain English
30. **Circuit Travel Guides** ★ — logistics for attending each race (COTA, Silverstone, Suzuka, etc.)
31. **F1 Livery History** — visual archive of car designs through the decades
32. **Sim Racing Setup Guide** — wheel, pedal, rig reviews for iRacing/F1 game enthusiasts (high affiliate)
33. **Karting Start Guide** — getting into recreational and competitive karting, gear, track directories

### Cluster 6: Coffee & Home Brewing (6 sites)
34. **The Espresso Equipment Lab** — machine reviews, grinder comparisons, accessories (very high affiliate — $500-2K machines)
35. **Pour-Over Perfection** — technique guides, dripper comparisons, water chemistry
36. **Home Coffee Roasting** — roaster reviews, green bean sourcing, roast profiles
37. **Latte Art Academy** — technique tutorials, milk pitcher reviews, practice drills
38. **Coffee Grinder Database** ★ — curated specs for every grinder: burr size, RPM, retention, price (programmatic)
39. **Cold Brew & Iced Coffee** — methods, ratios, equipment, concentrate recipes

### Cluster 7: Home Workshop & Tools (6 sites)
40. **The Pocket Knife Database** ★ — curated specs: steel type, blade length, weight, price per model (huge catalog)
41. **Beginner Woodworking** — project plans, tool guides, wood selection, joinery tutorials
42. **Sharpening Academy** — knife, chisel, plane sharpening: stones, systems, technique (strong affiliate)
43. **Garage Workshop Builds** — workbench plans, dust collection, lighting, layout optimization
44. **The Soldering & Electronics Bench** — soldering iron reviews, PCB basics, maker project guides
45. **3D Printing Material Guide** ★ — filament-by-filament specs, settings, comparison pages per material

### Cluster 8: Outdoor & Camping (6 sites)
46. **Ultralight Backpacking Gear** — gram-counting gear reviews, pack lists, weight calculators (passionate niche)
47. **Camp Cooking Academy** — stove reviews, recipes, meal planning, cookware guides
48. **Hammock Camping Guide** — setup guides, hammock/tarp reviews, site selection
49. **Trail Running Shoe Database** ★ — curated specs per model: drop, stack height, weight, terrain type
50. **Headlamp & Flashlight Reviews** ★ — lumens, beam patterns, battery life, runtime specs (flashlight nerds are real)
51. **National Park Trip Planner** ★ — park-by-park guides: best trails, when to go, permit info, campsite tips

### Cluster 9: Personal Finance Niches (5 sites)
52. **Credit Card Points Optimizer** — strategy guides for maximizing rewards (no live data needed — editorial)
53. **The FIRE Calculator** — financial independence tools, savings rate calculators, withdrawal strategy
54. **Travel Hacking for Beginners** — how airline miles and hotel points work, best cards for beginners
55. **Side Hustle Tax Guide** — tax obligations for freelancers, 1099 basics, deduction guides, quarterly estimate help
56. **The HSA Playbook** — health savings account strategy, investment options, triple tax advantage explained

### Cluster 10: Pet & Animal Care (5 sites)
57. **Raw Dog Food Guide** — recipes, nutritional balance, sourcing, transition guides (passionate niche)
58. **Cat Behavior Decoded** — why cats do what they do, training guides, enrichment ideas
59. **Reptile Lighting & Heating** ★ — UVB/basking setup guides per species (programmatic: one page per reptile)
60. **Aquarium Plant Guide** ★ — freshwater planted tank: plant-by-plant care pages, CO2, lighting, substrate
61. **Chicken Keeping 101** — coop plans, breed guides, egg production, predator protection (growing suburban hobby)

---

## Monetization Deep Dive

### Revenue Streams

**Display Advertising (primary revenue after month 6+)**
- Pre-50K sessions: Google AdSense, ~$5-10 RPM → $250-500/mo per site at 50K
- Post-50K sessions: Mediavine/Raptive, ~$15-30 RPM → $750-1,500/mo per site at 50K
- Hobbyist niches command premium RPMs (affluent, engaged audiences)
- One Mediavine account can manage ads across all sites in the portfolio

**Affiliate Commissions (steady secondary income)**
| Niche | Programs | Typical Commission |
|-------|----------|--------------------|
| Ski/Winter gear | REI, Backcountry.com, evo | 5-7% |
| Fly fishing gear | Orvis, Simms, TroutRoutes | 5-10% |
| Aquarium equipment | Marine Depot, BRS, Amazon | 5-10% |
| Sports cards | COMC, Amazon, specialty shops | 3-8% |
| Cameras/photography | B&H Photo, Amazon | 2-4% |
| General (fallback) | Amazon Associates | 1-4% |

**Email Newsletters (long-term value)**
- Each site captures emails (content upgrades, alerts, seasonal guides)
- Newsletters drive return visits (boosts sessions → more ad revenue)
- Can eventually monetize directly with sponsored content or paid tiers

### Realistic Revenue Projections (12-Month View)

**Conservative scenario:**
- 15 sites performing well (30-60K sessions/mo): ~$400-800/mo each → $6-12K/mo
- 15 sites moderate (10-30K sessions): ~$100-300/mo each → $1.5-4.5K/mo
- 15 sites still building (<10K sessions): ~$0-50/mo each → negligible
- **Portfolio total: $8-17K/month** after 12 months of operation

**Optimistic scenario (strong execution + some breakout sites):**
- 10 sites hit 100K+ sessions (a few breakouts): ~$1.5-3K/mo each → $15-30K/mo
- 20 sites at 30-60K sessions: ~$500-1K/mo each → $10-20K/mo
- 15 sites still building: negligible
- **Portfolio total: $25-50K/month** after 18 months

**Break-even:** With ~$200/month in costs, the portfolio breaks even when just 2-3 sites hit moderate traffic with AdSense. Everything after that is margin.

### The Google Risk (and Mitigation)

The biggest risk is Google penalizing AI-generated content at scale. Mitigation:
1. **Quality over volume:** Every article gets a human review pass before publishing. The pipeline generates drafts, not final content.
2. **Genuine editorial value:** Focus on content that's actually useful — comparison tools, calculators, curated directories — not just rewritten commodity articles.
3. **Unique data:** The curated product databases, directory entries, and comparison specs are original data. Google values this.
4. **Distinct brands:** Sites don't cross-link in ways that reveal shared ownership. Different WHOIS, different brand voices.
5. **Diversify away from Google over time:** Email lists and social accounts for each site reduce Google dependency.

---

## How to Kick Off

### Recommended Tooling

**Claude Code** is the right tool for the platform build. This is a full-stack engineering project — multi-tenant Next.js app, Supabase schema + migrations, Edge Functions for the content pipeline, admin UI. Claude Code can scaffold and build this in a dedicated project over multiple sessions.

**Cowork** is the right tool for ongoing content strategy and management work — refining site configs, generating content briefs, writing the editorial prompts that feed the pipeline, curating product/comparison data, and monitoring performance. Once the platform is built, Cowork becomes the "editorial desk."

**The split:**
- Claude Code project → builds and maintains the platform codebase
- Cowork sessions → content strategy, site launches, editorial management, data curation

### Phased Plan

**Phase 1: Build the Engine (Weeks 1-3) — Claude Code**
Build the multi-tenant Next.js platform, Supabase schema, content pipeline Edge Functions, and admin UI. Deploy to Vercel. Test with a dummy site.

**Phase 2: Seed the First Cluster (Weeks 3-6) — Cowork + Pipeline**
Pick one cluster (recommend: Coffee & Home Brewing or Reef Keeper). Define site configs, generate initial content batches, curate product comparison data. Launch 3-4 sites.

**Phase 3: Launch & Measure (Weeks 6-12)**
Monitor indexing in Google Search Console. Iterate on content quality, page templates, internal linking. Don't scale until the first cluster shows traffic traction (target: 5K sessions/mo per site by month 3).

**Phase 4: Scale the Portfolio (Months 3-6)**
Once the playbook is proven, spin up remaining clusters. Adding a new site = create config row in Supabase + buy domain + point DNS + seed content queue. The engine does the rest.

---

## Starting Prompt (for Claude Code — Platform Build)

Copy this entire prompt into a new Claude Code project to kick off the build. The ARCHITECTURE CONTEXT section gives Claude Code the full picture of what we're building and why, so it can make good decisions throughout the project.

```
# Niche Content Engine — Multi-Tenant Platform Build

## ARCHITECTURE CONTEXT

You are building a multi-tenant content platform that powers 50-60 niche
affiliate/content websites from a single codebase. Think of it as "WordPress
multisite but purpose-built for SEO content sites."

Key design principles:
- ONE codebase, ONE database, ONE deployment — many domains
- Adding a new site = a config row in the database + a domain pointed at Vercel
- Content is generated by an automated pipeline (Claude API) on a fixed schedule
  and stored in Supabase. The Next.js frontend renders it via ISR.
- No dependency on privileged/gated third-party APIs. Content is either
  AI-generated knowledge articles, manually curated product/comparison data,
  or programmatic pages generated from structured data we own.
- Hosting cost target: <$100/mo for infrastructure regardless of site count

The sites serve 5 content types: knowledge articles, product comparisons,
directory listings, programmatic SEO pages (template × data = many pages),
and interactive tools/calculators. All share the same page components —
only branding, content, and navigation differ per site.

## TECH STACK

- Framework: Next.js 14+ (App Router) on Vercel
- Database: Supabase (Postgres + Auth + Storage + Edge Functions + RLS)
- Styling: Tailwind CSS + shadcn/ui
- Content format: Markdown stored in Supabase (rendered with next-mdx-remote
  or similar)
- Analytics: Plausible script tag (configured per site)

## WHAT TO BUILD

### 1. Supabase Schema + Migrations

Create migration files for these tables:

sites
  - id (uuid, PK)
  - slug (text, unique) — used for internal references
  - domain (text, unique) — the hostname this site responds to
  - name (text)
  - tagline (text)
  - description (text) — for meta tags
  - theme_config (jsonb) — { primaryColor, accentColor, logoUrl, fontFamily, navItems[] }
  - affiliate_config (jsonb) — { amazonTag, defaultCta, customPrograms[] }
  - analytics_config (jsonb) — { plausibleDomain, searchConsoleId }
  - status (text) — active, draft, paused
  - created_at, updated_at

clusters (topical authority groupings within a site)
  - id, site_id (FK), name, slug, description, pillar_article_id (FK nullable)

articles
  - id, site_id (FK), cluster_id (FK nullable)
  - slug, title, content_md (text — the markdown body)
  - meta_description, meta_keywords
  - content_type (text) — article, comparison, guide, how-to, listicle
  - schema_type (text) — Article, HowTo, FAQPage, Product (for structured data)
  - featured_image_url
  - status (text) — draft, review, published, archived
  - published_at, created_at, updated_at

products
  - id, site_id (FK), name, slug, category
  - brand, model
  - specs_json (jsonb) — flexible key-value specs per product
  - pros (text[]), cons (text[])
  - affiliate_url, image_url
  - price_range (text) — editorial price bracket, not live data
  - rating (numeric) — editorial rating
  - created_at, updated_at

comparisons
  - id, site_id (FK), title, slug, description
  - product_ids (uuid[])
  - comparison_axes (jsonb) — which spec fields to compare
  - verdict_md (text)
  - status, published_at

directory_entries
  - id, site_id (FK), name, slug, category
  - city, state, country
  - description, url, phone
  - lat (numeric), lng (numeric)
  - tags (text[])
  - created_at, updated_at

programmatic_templates
  - id, site_id (FK), name, slug_pattern (text — e.g. "can-{fish_a}-live-with-{fish_b}")
  - title_pattern, meta_description_pattern
  - content_template_md (text — markdown with {{variable}} placeholders)
  - data_source (text) — which table/view feeds this template

programmatic_data
  - id, template_id (FK), site_id (FK)
  - variables_json (jsonb) — { fish_a: "Clownfish", fish_b: "Tang", compatible: true, ... }
  - slug_override (text, nullable)
  - status

email_subscribers
  - id, site_id (FK), email, source (text), subscribed_at

content_queue
  - id, site_id (FK)
  - content_type (text) — article, comparison, programmatic_batch
  - topic (text), prompt_params (jsonb)
  - status (text) — pending, processing, published, failed
  - error_message (text, nullable)
  - scheduled_for (timestamptz)
  - completed_at (timestamptz, nullable)
  - created_at

Enable Row-Level Security on all tables. Create policies so that
the frontend reads are filtered by the site_id matching the current request
context (passed via a Supabase service role in server components).

### 2. Multi-Tenant Next.js App

Middleware:
- Read the request hostname (including handling localhost + preview URLs for dev)
- Look up the site config from Supabase by domain
- Inject site context into headers or cookies so server components can access it
- Return 404 for unknown domains

Route structure:
  / → Homepage (featured articles, latest posts, top comparisons)
  /[slug] → Article page (content_md rendered as MDX/markdown)
  /compare/[slug] → Comparison page (interactive table from products + comparison data)
  /directory → Directory listing (filterable, with optional static map)
  /directory/[slug] → Individual directory entry
  /tools/[slug] → Calculator/tool page (renders a React component by slug)
  /[template-slug]/[entry-slug] → Programmatic pages (reads from template + data)
  /admin → Admin dashboard (behind Supabase Auth)

Page components:
- Article: rendered markdown with auto-generated table of contents, published date,
  cluster breadcrumb, "related articles" sidebar (same cluster), affiliate CTAs
  embedded via custom markdown components (e.g. :::product-card{id="xxx"})
- Comparison: sortable/filterable table with product specs side-by-side, affiliate
  buttons, verdict section
- Directory: card grid with filters for category/location, optional map embed
- Programmatic: template markdown with variables substituted from data row
- Tool: dynamic import of a React component from a /tools directory, with site
  config passed as props

Shared layout:
- Header with site name/logo, nav from theme_config.navItems
- Footer with about, email signup, affiliate disclosure, privacy policy
- Colors and fonts driven by theme_config
- Responsive, mobile-first

SEO (critical):
- Dynamic sitemap.xml per hostname — list all published articles, comparisons,
  directory entries, and programmatic pages
- robots.txt per hostname
- OpenGraph + Twitter Card meta tags on every page
- schema.org JSON-LD structured data: Article, Product, FAQPage, HowTo, LocalBusiness
  (choose based on article.schema_type or page type)
- Automatic internal linking: when rendering article content, scan for mentions of
  other article titles in the same site and wrap them in links
- Canonical URLs using the site's domain
- ISR with revalidation (revalidate = 3600 or on-demand via webhook)

### 3. Content Pipeline (Supabase Edge Function)

Build an Edge Function (or set of functions) that:
1. Reads pending items from content_queue where scheduled_for <= now()
2. For each item, constructs a prompt using the topic + prompt_params
3. Calls Claude API (Anthropic SDK) with the constructed prompt
4. Parses the response and writes to the articles table
5. Updates content_queue status to published or failed
6. Triggers ISR revalidation for the new article's URL

Include a base system prompt for content generation that:
- Takes the site name, description, and target audience as context
- Produces well-structured markdown with H2/H3 headings, practical advice,
  and natural integration points for affiliate product mentions
- Generates meta_description and suggested internal links
- Varies tone and structure across articles (not formulaic)

### 4. Admin Dashboard (/admin)

Simple, functional admin behind Supabase Auth:
- Site list with status toggles
- Content queue: pending/processing/published/failed counts, ability to
  manually queue articles
- Per-site article list with status, published date, word count
- Basic form to add/edit products and directory entries
- Button to trigger content pipeline manually
- No need to be fancy — utility over design

## DEVELOPMENT APPROACH

1. Start with the Supabase schema (all migration files)
2. Build the Next.js multi-tenant middleware + basic layout
3. Build one page type at a time: Article → Comparison → Directory → Programmatic
4. Build the content pipeline Edge Function
5. Build the admin dashboard
6. Test with 2 dummy site configs (different domains pointing to localhost)
7. Deploy to Vercel

Use environment variables for: SUPABASE_URL, SUPABASE_ANON_KEY,
SUPABASE_SERVICE_ROLE_KEY, ANTHROPIC_API_KEY

Include a seed script that creates 2 example sites with sample articles,
products, and directory entries so the platform works out of the box.
```

---

## Open Questions
- Which cluster to launch first? (Recommendation: Reef Keeper or Coffee — see Phase 2 notes)
- Domain naming convention? (Brandable vs keyword-rich vs hybrid)
- Review workflow — how much human review per article before publishing?
- Do we want to build the admin dashboard in-app or just manage via Supabase Studio initially?
