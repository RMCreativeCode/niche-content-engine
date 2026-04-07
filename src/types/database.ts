export interface Site {
  id: string;
  slug: string;
  domain: string;
  name: string;
  tagline: string;
  description: string;
  theme_config: ThemeConfig;
  affiliate_config: AffiliateConfig;
  analytics_config: AnalyticsConfig;
  author_persona: string | null;
  status: 'active' | 'draft' | 'paused';
  created_at: string;
  updated_at: string;
}

export interface ThemeConfig {
  primaryColor: string;
  accentColor: string;
  logoUrl?: string;
  fontFamily: string;
  navItems: NavItem[];
}

export interface NavItem {
  label: string;
  href: string;
}

export interface AffiliateConfig {
  amazonTag?: string;
  defaultCta: string;
  customPrograms: AffiliateProgram[];
}

export interface AffiliateProgram {
  name: string;
  baseUrl: string;
  tag: string;
}

export interface AnalyticsConfig {
  plausibleDomain?: string;
  searchConsoleId?: string;
}

export interface Cluster {
  id: string;
  site_id: string;
  name: string;
  slug: string;
  description: string;
  pillar_article_id: string | null;
  created_at: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface RelatedProduct {
  name: string;
  asin: string;
  affiliate_url: string;
}

export interface Article {
  id: string;
  site_id: string;
  cluster_id: string | null;
  slug: string;
  title: string;
  content_md: string;
  faq_items: FaqItem[];
  related_products: RelatedProduct[];
  meta_description: string;
  meta_keywords: string[];
  content_type: 'article' | 'comparison' | 'guide' | 'how-to' | 'listicle';
  schema_type: 'Article' | 'HowTo' | 'FAQPage' | 'Product';
  featured_image_url: string | null;
  status: 'draft' | 'review' | 'published' | 'archived';
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  site_id: string;
  name: string;
  slug: string;
  category: string;
  brand: string;
  model: string;
  specs_json: Record<string, string | number | boolean>;
  pros: string[];
  cons: string[];
  affiliate_url: string;
  asin: string | null;
  asin_verified: boolean;
  image_url: string | null;
  price_range: string;
  rating: number;
  created_at: string;
  updated_at: string;
}

export interface Comparison {
  id: string;
  site_id: string;
  title: string;
  slug: string;
  description: string;
  product_ids: string[];
  comparison_axes: ComparisonAxis[];
  verdict_md: string;
  status: 'draft' | 'review' | 'published' | 'archived';
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ComparisonAxis {
  label: string;
  spec_key: string;
  higher_is_better: boolean;
}

export interface DirectoryEntry {
  id: string;
  site_id: string;
  name: string;
  slug: string;
  category: string;
  city: string;
  state: string;
  country: string;
  description: string;
  url: string | null;
  phone: string | null;
  lat: number | null;
  lng: number | null;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface ProgrammaticTemplate {
  id: string;
  site_id: string;
  name: string;
  slug_pattern: string;
  title_pattern: string;
  meta_description_pattern: string;
  content_template_md: string;
  data_source: string;
  created_at: string;
}

export interface ProgrammaticData {
  id: string;
  template_id: string;
  site_id: string;
  variables_json: Record<string, string | number | boolean>;
  slug_override: string | null;
  status: 'active' | 'draft';
  created_at: string;
}

export interface EmailSubscriber {
  id: string;
  site_id: string;
  email: string;
  source: string;
  subscribed_at: string;
}

export interface ContentQueueItem {
  id: string;
  site_id: string;
  content_type: 'article' | 'comparison' | 'programmatic_batch';
  topic: string;
  prompt_params: Record<string, unknown>;
  status: 'pending' | 'processing' | 'published' | 'failed';
  error_message: string | null;
  scheduled_for: string;
  completed_at: string | null;
  created_at: string;
}

export interface PipelineRun {
  id: string;
  started_at: string;
  completed_at: string | null;
  articles_attempted: number;
  articles_succeeded: number;
  articles_failed: number;
  total_api_cost_cents: number;
  duration_seconds: number | null;
  status: 'running' | 'completed' | 'failed';
  error_message: string | null;
}

export interface SiteMetric {
  id: string;
  site_id: string;
  date: string;
  sessions: number;
  pageviews: number;
  indexed_pages: number | null;
  top_queries: string[];
  created_at: string;
}

export interface Alert {
  id: string;
  site_id: string;
  alert_type: 'stale_content' | 'indexing_drop' | 'pipeline_failure' | 'seo_opportunity' | 'traffic_spike' | 'traffic_drop';
  message: string;
  severity: 'info' | 'warning' | 'critical';
  resolved_at: string | null;
  created_at: string;
}
