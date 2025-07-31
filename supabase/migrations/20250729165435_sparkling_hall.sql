/*
  # DreamSeller Pro Complete Database Schema

  1. New Tables
    - `generated_apps` - Track generated applications and their deployment status
    - `client_projects` - AI app generation service for clients
    - `templates` - Template store for websites, resumes, content
    - `template_sales` - Track template purchases and revenue
    - `logo_designs` - Custom logo and brand generation
    - `logo_sales` - Logo design sales tracking
    - `ad_plans` - Ad setup service for clients
    - `ad_plan_sales` - Ad plan sales tracking
    - `automation_rules` - AI automation engine rules
    - `marketing_campaigns` - Social media and marketing automation
    - `email_campaigns` - Bulk email campaign tracking
    - `platform_signups` - Auto-signup tracking for various platforms
    - `dropshipping_products` - Dropshipping product catalog
    - `suppliers` - Supplier network management
    - `digital_products` - Digital product store items
    - `blog_posts` - Affiliate blog content
    - `print_products` - Print-on-demand products
    - `freelance_services` - Freelance service offerings
    - `saas_tools` - SaaS subscription tools
    - `ad_revenue_data` - Ad revenue platform data
    - `online_courses` - Course platform content
    - `investment_portfolio` - Investment tracking data
    - `app_analytics` - App usage and performance analytics
    - `transactions` - Financial transactions and withdrawals
    - `tax_records` - Tax record management
    - `legal_documents` - Business legal document storage
    - `domains` - Domain management system
    - `business_entities` - LLC/Corporation registration
    - `payout_schedules` - Automatic payout configuration
    - `ad_campaigns` - Multi-platform advertising campaigns

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to access their own data
    - Admin policies for system management

  3. Features
    - Automatic timestamps
    - UUID primary keys
    - Foreign key relationships
    - Indexes for performance
    - Triggers for automation
*/

-- Generated Apps table for tracking app deployments
CREATE TABLE IF NOT EXISTS generated_apps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  business_id uuid REFERENCES businesses(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text DEFAULT '',
  status text DEFAULT 'generating',
  platforms text[] DEFAULT '{}',
  visibility text DEFAULT 'private',
  target_audience text DEFAULT '',
  preview_url text DEFAULT '',
  download_links jsonb DEFAULT '{}',
  revenue numeric DEFAULT 0,
  views integer DEFAULT 0,
  active_users integer DEFAULT 0,
  project_type text DEFAULT 'unknown',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Client Projects for AI app generation service
CREATE TABLE IF NOT EXISTS client_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  client_email text NOT NULL,
  project_name text NOT NULL,
  requirements text NOT NULL,
  price numeric NOT NULL DEFAULT 0,
  status text DEFAULT 'pending',
  progress integer DEFAULT 0,
  delivery_date timestamptz,
  app_url text DEFAULT '',
  download_links jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Templates for template store
CREATE TABLE IF NOT EXISTS templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text DEFAULT '',
  category text NOT NULL,
  price numeric NOT NULL DEFAULT 0,
  preview_url text DEFAULT '',
  download_url text DEFAULT '',
  downloads integer DEFAULT 0,
  rating numeric DEFAULT 5.0,
  tags text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Template Sales tracking
CREATE TABLE IF NOT EXISTS template_sales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  template_id uuid REFERENCES templates(id) ON DELETE CASCADE,
  amount numeric NOT NULL,
  status text DEFAULT 'pending',
  stripe_payment_id text,
  purchased_at timestamptz DEFAULT now()
);

-- Logo Designs for brand generation
CREATE TABLE IF NOT EXISTS logo_designs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  business_name text NOT NULL,
  industry text NOT NULL,
  style text NOT NULL,
  colors text[] DEFAULT '{}',
  logo_url text DEFAULT '',
  brand_kit_url text DEFAULT '',
  price numeric DEFAULT 29.99,
  status text DEFAULT 'completed',
  created_at timestamptz DEFAULT now()
);

-- Logo Sales tracking
CREATE TABLE IF NOT EXISTS logo_sales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  design_id uuid REFERENCES logo_designs(id) ON DELETE CASCADE,
  amount numeric NOT NULL,
  status text DEFAULT 'pending',
  stripe_payment_id text,
  purchased_at timestamptz DEFAULT now()
);

-- Ad Plans for client ad setup service
CREATE TABLE IF NOT EXISTS ad_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  client_email text NOT NULL,
  business_name text NOT NULL,
  budget numeric NOT NULL DEFAULT 0,
  platforms text[] DEFAULT '{}',
  target_audience text DEFAULT '',
  goals text DEFAULT '',
  plan_type text DEFAULT 'basic',
  price numeric NOT NULL DEFAULT 0,
  status text DEFAULT 'pending',
  performance jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Ad Plan Sales tracking
CREATE TABLE IF NOT EXISTS ad_plan_sales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  plan_id uuid REFERENCES ad_plans(id) ON DELETE CASCADE,
  amount numeric NOT NULL,
  status text DEFAULT 'pending',
  stripe_payment_id text,
  purchased_at timestamptz DEFAULT now()
);

-- Automation Rules for AI automation engine
CREATE TABLE IF NOT EXISTS automation_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  name text NOT NULL,
  type text NOT NULL,
  trigger text NOT NULL,
  action text NOT NULL,
  status text DEFAULT 'active',
  executions integer DEFAULT 0,
  last_run timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Marketing Campaigns for social media automation
CREATE TABLE IF NOT EXISTS marketing_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  name text NOT NULL,
  type text NOT NULL,
  platforms text[] DEFAULT '{}',
  content text NOT NULL,
  status text DEFAULT 'draft',
  scheduled_at timestamptz,
  performance jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Email Campaigns for bulk emailer
CREATE TABLE IF NOT EXISTS email_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  subject text NOT NULL,
  content text NOT NULL,
  sender_name text DEFAULT '',
  supplier_ids text[] DEFAULT '{}',
  status text DEFAULT 'pending',
  sent_count integer DEFAULT 0,
  failed_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Platform Signups for auto-signup tracking
CREATE TABLE IF NOT EXISTS platform_signups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  platform text NOT NULL,
  email text NOT NULL,
  password text NOT NULL,
  business_type text NOT NULL,
  status text DEFAULT 'pending',
  account_id text DEFAULT '',
  api_key text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Dropshipping Products
CREATE TABLE IF NOT EXISTS dropshipping_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  name text NOT NULL,
  price numeric NOT NULL DEFAULT 0,
  cost numeric NOT NULL DEFAULT 0,
  supplier text DEFAULT '',
  image text DEFAULT '',
  category text DEFAULT '',
  profit_margin numeric DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Suppliers for dropshipping
CREATE TABLE IF NOT EXISTS suppliers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text NOT NULL,
  website text DEFAULT '',
  category text DEFAULT '',
  response_rate numeric DEFAULT 0,
  average_shipping integer DEFAULT 0,
  contacted boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Digital Products for digital store
CREATE TABLE IF NOT EXISTS digital_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  name text NOT NULL,
  type text NOT NULL,
  price numeric NOT NULL DEFAULT 0,
  download_url text DEFAULT '',
  description text DEFAULT '',
  sales integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Blog Posts for affiliate blog
CREATE TABLE IF NOT EXISTS blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text DEFAULT '',
  affiliate_links text[] DEFAULT '{}',
  seo_score integer DEFAULT 0,
  views integer DEFAULT 0,
  earnings numeric DEFAULT 0,
  published_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Print Products for print-on-demand
CREATE TABLE IF NOT EXISTS print_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  name text NOT NULL,
  type text NOT NULL,
  design text DEFAULT '',
  price numeric NOT NULL DEFAULT 0,
  orders integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Freelance Services
CREATE TABLE IF NOT EXISTS freelance_services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text DEFAULT '',
  price numeric NOT NULL DEFAULT 0,
  delivery_time integer DEFAULT 0,
  category text DEFAULT '',
  orders integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- SaaS Tools for subscription business
CREATE TABLE IF NOT EXISTS saas_tools (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text DEFAULT '',
  monthly_price numeric NOT NULL DEFAULT 0,
  features text[] DEFAULT '{}',
  subscribers integer DEFAULT 0,
  churn_rate numeric DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Ad Revenue Data for content monetization
CREATE TABLE IF NOT EXISTS ad_revenue_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  platform text NOT NULL,
  views integer DEFAULT 0,
  revenue numeric DEFAULT 0,
  cpm numeric DEFAULT 0,
  status text DEFAULT 'active',
  created_at timestamptz DEFAULT now()
);

-- Online Courses for course platform
CREATE TABLE IF NOT EXISTS online_courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text DEFAULT '',
  price numeric NOT NULL DEFAULT 0,
  modules integer DEFAULT 0,
  students integer DEFAULT 0,
  rating numeric DEFAULT 5.0,
  created_at timestamptz DEFAULT now()
);

-- Investment Portfolio for investment tracking
CREATE TABLE IF NOT EXISTS investment_portfolio (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  symbol text NOT NULL,
  name text NOT NULL,
  current_value numeric DEFAULT 0,
  gain_loss numeric DEFAULT 0,
  recommendation text DEFAULT 'hold',
  confidence integer DEFAULT 50,
  created_at timestamptz DEFAULT now()
);

-- App Analytics for tracking app performance
CREATE TABLE IF NOT EXISTS app_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id uuid REFERENCES generated_apps(id) ON DELETE CASCADE,
  views integer DEFAULT 0,
  active_users integer DEFAULT 0,
  last_updated timestamptz DEFAULT now()
);

-- Transactions for financial tracking
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  type text NOT NULL,
  amount numeric NOT NULL DEFAULT 0,
  status text DEFAULT 'pending',
  method text DEFAULT '',
  description text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Tax Records for compliance
CREATE TABLE IF NOT EXISTS tax_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  year integer NOT NULL,
  quarter integer NOT NULL,
  total_revenue numeric DEFAULT 0,
  total_expenses numeric DEFAULT 0,
  net_income numeric DEFAULT 0,
  tax_owed numeric DEFAULT 0,
  documents text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Legal Documents storage
CREATE TABLE IF NOT EXISTS legal_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  type text NOT NULL,
  title text NOT NULL,
  file_url text NOT NULL,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Domain Management
CREATE TABLE IF NOT EXISTS domains (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  domain_name text NOT NULL UNIQUE,
  business_id uuid REFERENCES businesses(id) ON DELETE CASCADE,
  status text DEFAULT 'pending',
  registrar text DEFAULT '',
  expires_at timestamptz,
  auto_renew boolean DEFAULT true,
  ssl_enabled boolean DEFAULT false,
  dns_records jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Business Entity Registration
CREATE TABLE IF NOT EXISTS business_entities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  entity_type text NOT NULL,
  business_name text NOT NULL,
  state text NOT NULL,
  ein text,
  registration_date timestamptz DEFAULT now(),
  status text DEFAULT 'pending',
  documents text[] DEFAULT '{}',
  registered_agent jsonb DEFAULT '{}',
  business_address jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Payout Schedules for automatic withdrawals
CREATE TABLE IF NOT EXISTS payout_schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  frequency text NOT NULL,
  minimum_amount numeric DEFAULT 0,
  destination text NOT NULL,
  account_details jsonb DEFAULT '{}',
  enabled boolean DEFAULT true,
  last_payout timestamptz,
  next_payout timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Multi-platform Ad Campaigns
CREATE TABLE IF NOT EXISTS ad_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  business_id uuid REFERENCES businesses(id) ON DELETE CASCADE,
  name text NOT NULL,
  platforms text[] DEFAULT '{}',
  budget numeric DEFAULT 0,
  target_audience jsonb DEFAULT '{}',
  ad_creative jsonb DEFAULT '{}',
  status text DEFAULT 'draft',
  performance jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Generated Products for product generator
CREATE TABLE IF NOT EXISTS generated_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text DEFAULT '',
  price numeric NOT NULL DEFAULT 0,
  category text DEFAULT '',
  tags text[] DEFAULT '{}',
  image_url text DEFAULT '',
  profit_margin numeric DEFAULT 0,
  demand_score integer DEFAULT 0,
  market_analysis jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security on all tables
ALTER TABLE generated_apps ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE logo_designs ENABLE ROW LEVEL SECURITY;
ALTER TABLE logo_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_plan_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketing_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_signups ENABLE ROW LEVEL SECURITY;
ALTER TABLE dropshipping_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE digital_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE print_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE freelance_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE saas_tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_revenue_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE online_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE investment_portfolio ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tax_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE legal_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE payout_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_products ENABLE ROW LEVEL SECURITY;

-- RLS Policies for generated_apps
CREATE POLICY "Users can manage own generated apps"
  ON generated_apps
  FOR ALL
  TO authenticated
  USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

-- RLS Policies for client_projects
CREATE POLICY "Users can manage own client projects"
  ON client_projects
  FOR ALL
  TO authenticated
  USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

-- RLS Policies for templates
CREATE POLICY "Users can manage own templates"
  ON templates
  FOR ALL
  TO authenticated
  USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "Anyone can read templates"
  ON templates
  FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for template_sales
CREATE POLICY "Users can manage own template sales"
  ON template_sales
  FOR ALL
  TO authenticated
  USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

-- RLS Policies for logo_designs
CREATE POLICY "Users can manage own logo designs"
  ON logo_designs
  FOR ALL
  TO authenticated
  USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

-- RLS Policies for logo_sales
CREATE POLICY "Users can manage own logo sales"
  ON logo_sales
  FOR ALL
  TO authenticated
  USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

-- RLS Policies for ad_plans
CREATE POLICY "Users can manage own ad plans"
  ON ad_plans
  FOR ALL
  TO authenticated
  USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

-- RLS Policies for ad_plan_sales
CREATE POLICY "Users can manage own ad plan sales"
  ON ad_plan_sales
  FOR ALL
  TO authenticated
  USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

-- RLS Policies for automation_rules
CREATE POLICY "Users can manage own automation rules"
  ON automation_rules
  FOR ALL
  TO authenticated
  USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

-- RLS Policies for marketing_campaigns
CREATE POLICY "Users can manage own marketing campaigns"
  ON marketing_campaigns
  FOR ALL
  TO authenticated
  USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

-- RLS Policies for email_campaigns
CREATE POLICY "Users can manage own email campaigns"
  ON email_campaigns
  FOR ALL
  TO authenticated
  USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

-- RLS Policies for platform_signups
CREATE POLICY "Users can manage own platform signups"
  ON platform_signups
  FOR ALL
  TO authenticated
  USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

-- RLS Policies for dropshipping_products
CREATE POLICY "Users can manage own dropshipping products"
  ON dropshipping_products
  FOR ALL
  TO authenticated
  USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

-- RLS Policies for suppliers
CREATE POLICY "Users can manage own suppliers"
  ON suppliers
  FOR ALL
  TO authenticated
  USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

-- RLS Policies for digital_products
CREATE POLICY "Users can manage own digital products"
  ON digital_products
  FOR ALL
  TO authenticated
  USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

-- RLS Policies for blog_posts
CREATE POLICY "Users can manage own blog posts"
  ON blog_posts
  FOR ALL
  TO authenticated
  USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

-- RLS Policies for print_products
CREATE POLICY "Users can manage own print products"
  ON print_products
  FOR ALL
  TO authenticated
  USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

-- RLS Policies for freelance_services
CREATE POLICY "Users can manage own freelance services"
  ON freelance_services
  FOR ALL
  TO authenticated
  USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

-- RLS Policies for saas_tools
CREATE POLICY "Users can manage own saas tools"
  ON saas_tools
  FOR ALL
  TO authenticated
  USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

-- RLS Policies for ad_revenue_data
CREATE POLICY "Users can manage own ad revenue data"
  ON ad_revenue_data
  FOR ALL
  TO authenticated
  USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

-- RLS Policies for online_courses
CREATE POLICY "Users can manage own online courses"
  ON online_courses
  FOR ALL
  TO authenticated
  USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

-- RLS Policies for investment_portfolio
CREATE POLICY "Users can manage own investment portfolio"
  ON investment_portfolio
  FOR ALL
  TO authenticated
  USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

-- RLS Policies for app_analytics
CREATE POLICY "Users can read analytics for own apps"
  ON app_analytics
  FOR SELECT
  TO authenticated
  USING (app_id IN (
    SELECT id FROM generated_apps 
    WHERE user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
  ));

-- RLS Policies for transactions
CREATE POLICY "Users can manage own transactions"
  ON transactions
  FOR ALL
  TO authenticated
  USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

-- RLS Policies for tax_records
CREATE POLICY "Users can manage own tax records"
  ON tax_records
  FOR ALL
  TO authenticated
  USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

-- RLS Policies for legal_documents
CREATE POLICY "Users can manage own legal documents"
  ON legal_documents
  FOR ALL
  TO authenticated
  USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

-- RLS Policies for domains
CREATE POLICY "Users can manage own domains"
  ON domains
  FOR ALL
  TO authenticated
  USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

-- RLS Policies for business_entities
CREATE POLICY "Users can manage own business entities"
  ON business_entities
  FOR ALL
  TO authenticated
  USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

-- RLS Policies for payout_schedules
CREATE POLICY "Users can manage own payout schedules"
  ON payout_schedules
  FOR ALL
  TO authenticated
  USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

-- RLS Policies for ad_campaigns
CREATE POLICY "Users can manage own ad campaigns"
  ON ad_campaigns
  FOR ALL
  TO authenticated
  USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

-- RLS Policies for generated_products
CREATE POLICY "Users can manage own generated products"
  ON generated_products
  FOR ALL
  TO authenticated
  USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_generated_apps_user_id ON generated_apps(user_id);
CREATE INDEX IF NOT EXISTS idx_generated_apps_business_id ON generated_apps(business_id);
CREATE INDEX IF NOT EXISTS idx_generated_apps_status ON generated_apps(status);
CREATE INDEX IF NOT EXISTS idx_generated_apps_visibility ON generated_apps(visibility);

CREATE INDEX IF NOT EXISTS idx_client_projects_user_id ON client_projects(user_id);
CREATE INDEX IF NOT EXISTS idx_client_projects_status ON client_projects(status);

CREATE INDEX IF NOT EXISTS idx_templates_category ON templates(category);
CREATE INDEX IF NOT EXISTS idx_templates_price ON templates(price);

CREATE INDEX IF NOT EXISTS idx_logo_designs_user_id ON logo_designs(user_id);
CREATE INDEX IF NOT EXISTS idx_logo_designs_industry ON logo_designs(industry);

CREATE INDEX IF NOT EXISTS idx_ad_plans_user_id ON ad_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_ad_plans_status ON ad_plans(status);

CREATE INDEX IF NOT EXISTS idx_automation_rules_user_id ON automation_rules(user_id);
CREATE INDEX IF NOT EXISTS idx_automation_rules_status ON automation_rules(status);

CREATE INDEX IF NOT EXISTS idx_marketing_campaigns_user_id ON marketing_campaigns(user_id);
CREATE INDEX IF NOT EXISTS idx_marketing_campaigns_status ON marketing_campaigns(status);

CREATE INDEX IF NOT EXISTS idx_email_campaigns_user_id ON email_campaigns(user_id);
CREATE INDEX IF NOT EXISTS idx_email_campaigns_status ON email_campaigns(status);

CREATE INDEX IF NOT EXISTS idx_platform_signups_user_id ON platform_signups(user_id);
CREATE INDEX IF NOT EXISTS idx_platform_signups_platform ON platform_signups(platform);

CREATE INDEX IF NOT EXISTS idx_suppliers_user_id ON suppliers(user_id);
CREATE INDEX IF NOT EXISTS idx_suppliers_category ON suppliers(category);

CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);

CREATE INDEX IF NOT EXISTS idx_domains_user_id ON domains(user_id);
CREATE INDEX IF NOT EXISTS idx_domains_business_id ON domains(business_id);

CREATE INDEX IF NOT EXISTS idx_business_entities_user_id ON business_entities(user_id);
CREATE INDEX IF NOT EXISTS idx_business_entities_status ON business_entities(status);

CREATE INDEX IF NOT EXISTS idx_ad_campaigns_user_id ON ad_campaigns(user_id);
CREATE INDEX IF NOT EXISTS idx_ad_campaigns_business_id ON ad_campaigns(business_id);

CREATE INDEX IF NOT EXISTS idx_generated_products_user_id ON generated_products(user_id);
CREATE INDEX IF NOT EXISTS idx_generated_products_category ON generated_products(category);

-- Functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_generated_apps_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for automatic timestamp updates
CREATE TRIGGER update_generated_apps_updated_at 
  BEFORE UPDATE ON generated_apps
  FOR EACH ROW EXECUTE FUNCTION update_generated_apps_updated_at();

-- Function to track app analytics
CREATE OR REPLACE FUNCTION track_app_view()
RETURNS TRIGGER AS $$
BEGIN
  -- Update app analytics when visibility changes to public
  IF NEW.visibility = 'public' AND OLD.visibility = 'private' THEN
    INSERT INTO app_analytics (app_id, views, active_users)
    VALUES (NEW.id, 0, 0)
    ON CONFLICT (app_id) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for app analytics tracking
CREATE TRIGGER track_app_visibility_change
  AFTER UPDATE ON generated_apps
  FOR EACH ROW EXECUTE FUNCTION track_app_view();

-- Function to calculate user revenue totals
CREATE OR REPLACE FUNCTION update_user_total_revenue()
RETURNS TRIGGER AS $$
BEGIN
  -- Update user total revenue when transactions are added
  UPDATE users 
  SET total_revenue = (
    SELECT COALESCE(SUM(amount), 0) 
    FROM transactions 
    WHERE user_id = NEW.user_id 
    AND type = 'deposit' 
    AND status = 'completed'
  )
  WHERE id = NEW.user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update user revenue totals
CREATE TRIGGER update_user_revenue_on_transaction
  AFTER INSERT OR UPDATE ON transactions
  FOR EACH ROW EXECUTE FUNCTION update_user_total_revenue();

-- Function to auto-expire invitations
CREATE OR REPLACE FUNCTION auto_expire_invitations()
RETURNS void AS $$
BEGIN
  UPDATE invitations 
  SET status = 'expired' 
  WHERE status = 'pending' 
  AND expires_at < now();
END;
$$ LANGUAGE plpgsql;

-- Function to clean up old data
CREATE OR REPLACE FUNCTION cleanup_old_data()
RETURNS void AS $$
BEGIN
  -- Delete old email logs (older than 90 days)
  DELETE FROM email_logs 
  WHERE sent_at < now() - interval '90 days';
  
  -- Delete old app analytics (older than 1 year)
  DELETE FROM app_analytics 
  WHERE last_updated < now() - interval '1 year';
  
  -- Archive old transactions (older than 2 years)
  -- This would typically move to an archive table
  
END;
$$ LANGUAGE plpgsql;

-- Sample data for demonstration (optional)
INSERT INTO templates (id, name, description, category, price, preview_url, downloads, rating, tags) VALUES
  (gen_random_uuid(), 'Modern Business Website', 'Professional business website template with contact forms', 'website', 49.99, 'https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg', 1250, 4.8, ARRAY['business', 'modern', 'responsive']),
  (gen_random_uuid(), 'Creative Resume Template', 'Eye-catching resume template for creative professionals', 'resume', 19.99, 'https://images.pexels.com/photos/590016/pexels-photo-590016.jpg', 890, 4.9, ARRAY['resume', 'creative', 'professional']),
  (gen_random_uuid(), 'Email Marketing Pack', 'Complete email marketing templates for campaigns', 'email', 29.99, 'https://images.pexels.com/photos/1591062/pexels-photo-1591062.jpg', 650, 4.7, ARRAY['email', 'marketing', 'templates']);

-- Insert sample automation rules
INSERT INTO automation_rules (id, name, type, trigger, action, status, executions) VALUES
  (gen_random_uuid(), 'Welcome Email Automation', 'email', 'new_lead', 'send_welcome_email', 'active', 45),
  (gen_random_uuid(), 'Weekly Blog Content', 'content', 'weekly_schedule', 'generate_blog_post', 'active', 12),
  (gen_random_uuid(), 'Price Optimization', 'pricing', 'sales_velocity', 'adjust_pricing', 'active', 28);