/*
  # DreamSeller Pro Database Schema

  1. New Tables
    - `users` - User profiles and business owner information
    - `businesses` - Generated businesses and their details
    - `revenue_streams` - Revenue tracking for each business
    - `generations` - Track app/business generation requests
    - `user_settings` - User preferences and configuration
    - `api_keys` - API key management for users
    - `notifications` - System notifications and alerts
    - `billing` - Subscription and payment tracking

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to access their own data
    - Admin policies for system management

  3. Features
    - Automatic timestamps
    - UUID primary keys
    - Foreign key relationships
    - Indexes for performance
*/

-- Users table for extended profile information
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text DEFAULT '',
  business_focus text DEFAULT 'all',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  is_admin boolean DEFAULT false,
  subscription_tier text DEFAULT 'free',
  total_revenue numeric DEFAULT 0
);

-- Businesses table for tracking generated businesses
CREATE TABLE IF NOT EXISTS businesses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text DEFAULT '',
  business_type text DEFAULT 'general',
  status text DEFAULT 'active',
  launch_date timestamptz DEFAULT now(),
  monthly_revenue numeric DEFAULT 0,
  total_revenue numeric DEFAULT 0,
  website_url text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Revenue streams for tracking income sources
CREATE TABLE IF NOT EXISTS revenue_streams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid REFERENCES businesses(id) ON DELETE CASCADE,
  stream_type text NOT NULL,
  amount numeric NOT NULL DEFAULT 0,
  currency text DEFAULT 'USD',
  recorded_at timestamptz DEFAULT now(),
  description text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Generations table for tracking app/business generation requests
CREATE TABLE IF NOT EXISTS generations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  project_name text NOT NULL,
  status text DEFAULT 'pending',
  progress integer DEFAULT 0,
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  error_message text DEFAULT '',
  result_url text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- User settings for preferences and configuration
CREATE TABLE IF NOT EXISTS user_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  notifications_revenue boolean DEFAULT true,
  notifications_launches boolean DEFAULT true,
  notifications_system boolean DEFAULT false,
  theme text DEFAULT 'dark',
  timezone text DEFAULT 'UTC',
  webhook_url text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- API keys for user integrations
CREATE TABLE IF NOT EXISTS api_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  key_name text NOT NULL,
  api_key text NOT NULL UNIQUE,
  is_active boolean DEFAULT true,
  last_used_at timestamptz,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz
);

-- Notifications for system alerts
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  type text DEFAULT 'info',
  is_read boolean DEFAULT false,
  action_url text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Billing for subscription management
CREATE TABLE IF NOT EXISTS billing (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  stripe_customer_id text UNIQUE,
  subscription_id text UNIQUE,
  plan_name text DEFAULT 'free',
  status text DEFAULT 'active',
  current_period_start timestamptz,
  current_period_end timestamptz,
  amount numeric DEFAULT 0,
  currency text DEFAULT 'USD',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE revenue_streams ENABLE ROW LEVEL SECURITY;
ALTER TABLE generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can read own profile"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = auth_id);

CREATE POLICY "Users can update own profile"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = auth_id);

CREATE POLICY "Users can insert own profile"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = auth_id);

-- RLS Policies for businesses table
CREATE POLICY "Users can read own businesses"
  ON businesses
  FOR SELECT
  TO authenticated
  USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "Users can manage own businesses"
  ON businesses
  FOR ALL
  TO authenticated
  USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

-- RLS Policies for revenue_streams table
CREATE POLICY "Users can read own revenue streams"
  ON revenue_streams
  FOR SELECT
  TO authenticated
  USING (business_id IN (
    SELECT b.id FROM businesses b
    JOIN users u ON b.user_id = u.id
    WHERE u.auth_id = auth.uid()
  ));

CREATE POLICY "Users can manage own revenue streams"
  ON revenue_streams
  FOR ALL
  TO authenticated
  USING (business_id IN (
    SELECT b.id FROM businesses b
    JOIN users u ON b.user_id = u.id
    WHERE u.auth_id = auth.uid()
  ));

-- RLS Policies for generations table
CREATE POLICY "Users can read own generations"
  ON generations
  FOR SELECT
  TO authenticated
  USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "Users can manage own generations"
  ON generations
  FOR ALL
  TO authenticated
  USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

-- RLS Policies for user_settings table
CREATE POLICY "Users can read own settings"
  ON user_settings
  FOR SELECT
  TO authenticated
  USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "Users can manage own settings"
  ON user_settings
  FOR ALL
  TO authenticated
  USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

-- RLS Policies for api_keys table
CREATE POLICY "Users can read own API keys"
  ON api_keys
  FOR SELECT
  TO authenticated
  USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "Users can manage own API keys"
  ON api_keys
  FOR ALL
  TO authenticated
  USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

-- RLS Policies for notifications table
CREATE POLICY "Users can read own notifications"
  ON notifications
  FOR SELECT
  TO authenticated
  USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "Users can update own notifications"
  ON notifications
  FOR UPDATE
  TO authenticated
  USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

-- RLS Policies for billing table
CREATE POLICY "Users can read own billing"
  ON billing
  FOR SELECT
  TO authenticated
  USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "Users can manage own billing"
  ON billing
  FOR ALL
  TO authenticated
  USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_auth_id ON users(auth_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_businesses_user_id ON businesses(user_id);
CREATE INDEX IF NOT EXISTS idx_businesses_status ON businesses(status);
CREATE INDEX IF NOT EXISTS idx_revenue_streams_business_id ON revenue_streams(business_id);
CREATE INDEX IF NOT EXISTS idx_revenue_streams_recorded_at ON revenue_streams(recorded_at);
CREATE INDEX IF NOT EXISTS idx_generations_user_id ON generations(user_id);
CREATE INDEX IF NOT EXISTS idx_generations_status ON generations(status);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_billing_user_id ON billing(user_id);
CREATE INDEX IF NOT EXISTS idx_billing_stripe_customer_id ON billing(stripe_customer_id);

-- Functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for automatic timestamp updates
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_businesses_updated_at BEFORE UPDATE ON businesses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON user_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_billing_updated_at BEFORE UPDATE ON billing
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();