/*
  # App Deployment Tables

  1. New Tables
    - `app_deployments` - Track deployment history and status
    - `app_downloads` - Track download events for analytics
    - `build_logs` - Store detailed build logs for debugging

  2. Security
    - Enable RLS on all tables
    - Add policies for users to access their own data

  3. Features
    - Automatic timestamps
    - UUID primary keys
    - Foreign key relationships
*/

-- App deployments table
CREATE TABLE IF NOT EXISTS app_deployments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  project_name text NOT NULL,
  platforms text[] DEFAULT '{}',
  status text DEFAULT 'pending',
  file_count integer DEFAULT 0,
  project_type text DEFAULT 'unknown',
  build_duration integer DEFAULT 0,
  download_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

-- App downloads table
CREATE TABLE IF NOT EXISTS app_downloads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  deployment_id uuid REFERENCES app_deployments(id) ON DELETE CASCADE,
  project_name text NOT NULL,
  platform text NOT NULL,
  downloaded_at timestamptz DEFAULT now(),
  ip_address text,
  user_agent text
);

-- Build logs table
CREATE TABLE IF NOT EXISTS build_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deployment_id uuid REFERENCES app_deployments(id) ON DELETE CASCADE,
  stage text NOT NULL,
  message text NOT NULL,
  level text DEFAULT 'info',
  timestamp timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE app_deployments ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_downloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE build_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for app_deployments
CREATE POLICY "Users can read own deployments"
  ON app_deployments
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can manage own deployments"
  ON app_deployments
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- RLS Policies for app_downloads
CREATE POLICY "Users can read own downloads"
  ON app_downloads
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can manage own downloads"
  ON app_downloads
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- RLS Policies for build_logs
CREATE POLICY "Users can read own build logs"
  ON build_logs
  FOR SELECT
  TO authenticated
  USING (deployment_id IN (
    SELECT id FROM app_deployments WHERE user_id = auth.uid()
  ));

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_app_deployments_user_id ON app_deployments(user_id);
CREATE INDEX IF NOT EXISTS idx_app_deployments_status ON app_deployments(status);
CREATE INDEX IF NOT EXISTS idx_app_downloads_user_id ON app_downloads(user_id);
CREATE INDEX IF NOT EXISTS idx_app_downloads_platform ON app_downloads(platform);
CREATE INDEX IF NOT EXISTS idx_build_logs_deployment_id ON build_logs(deployment_id);