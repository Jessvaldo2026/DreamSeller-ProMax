/*
  # Add Invitation System Tables

  1. New Tables
    - `invitations` - User invitation management
    - `email_logs` - Email delivery tracking

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users

  3. Features
    - Invitation token system
    - Email delivery tracking
    - Role-based invitations
*/

-- Invitations table for user invitation management
CREATE TABLE IF NOT EXISTS invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  role text NOT NULL DEFAULT 'user',
  status text NOT NULL DEFAULT 'pending',
  token text UNIQUE NOT NULL,
  invite_link text NOT NULL,
  expires_at timestamptz NOT NULL,
  accepted_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Email logs for tracking email delivery
CREATE TABLE IF NOT EXISTS email_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid,
  supplier_id uuid,
  recipient_email text NOT NULL,
  email_type text NOT NULL DEFAULT 'campaign',
  status text NOT NULL DEFAULT 'pending',
  error_message text,
  sent_at timestamptz DEFAULT now(),
  opened_at timestamptz,
  clicked_at timestamptz
);

-- Enable Row Level Security
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for invitations table
CREATE POLICY "Users can read own sent invitations"
  ON invitations
  FOR SELECT
  TO authenticated
  USING (sender_id = auth.uid());

CREATE POLICY "Users can create invitations"
  ON invitations
  FOR INSERT
  TO authenticated
  WITH CHECK (sender_id = auth.uid());

CREATE POLICY "Users can update own invitations"
  ON invitations
  FOR UPDATE
  TO authenticated
  USING (sender_id = auth.uid());

CREATE POLICY "Anyone can read pending invitations by token"
  ON invitations
  FOR SELECT
  TO anon
  USING (status = 'pending' AND expires_at > now());

-- RLS Policies for email_logs table
CREATE POLICY "Users can read own email logs"
  ON email_logs
  FOR SELECT
  TO authenticated
  USING (
    recipient_email IN (
      SELECT email FROM auth.users WHERE id = auth.uid()
    )
  );

CREATE POLICY "System can insert email logs"
  ON email_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_invitations_token ON invitations(token);
CREATE INDEX IF NOT EXISTS idx_invitations_email ON invitations(email);
CREATE INDEX IF NOT EXISTS idx_invitations_sender_id ON invitations(sender_id);
CREATE INDEX IF NOT EXISTS idx_invitations_status ON invitations(status);
CREATE INDEX IF NOT EXISTS idx_email_logs_recipient ON email_logs(recipient_email);
CREATE INDEX IF NOT EXISTS idx_email_logs_type ON email_logs(email_type);
CREATE INDEX IF NOT EXISTS idx_email_logs_status ON email_logs(status);

-- Function to clean up expired invitations
CREATE OR REPLACE FUNCTION cleanup_expired_invitations()
RETURNS void AS $$
BEGIN
  UPDATE invitations 
  SET status = 'expired' 
  WHERE status = 'pending' 
  AND expires_at < now();
END;
$$ LANGUAGE plpgsql;

-- Function to track invitation acceptance
CREATE OR REPLACE FUNCTION mark_invitation_accepted()
RETURNS TRIGGER AS $$
BEGIN
  -- Mark invitation as accepted when user signs up with invited email
  UPDATE invitations 
  SET status = 'accepted', accepted_at = now()
  WHERE email = NEW.email 
  AND status = 'pending';
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to mark invitations as accepted
CREATE OR REPLACE TRIGGER on_user_signup_mark_invitation
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION mark_invitation_accepted();