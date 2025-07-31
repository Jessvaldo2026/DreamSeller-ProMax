/*
  # Sample Data for DreamSeller Pro

  1. Sample Users
    - Demo user with businesses and revenue
    - Admin user for system management

  2. Sample Businesses
    - Various business types with different revenue streams
    - Different statuses and launch dates

  3. Sample Revenue Data
    - Multiple revenue streams per business
    - Historical revenue data

  4. Sample Notifications
    - System notifications and alerts
*/

-- Insert sample users (these will be created when users sign up via Supabase Auth)
-- This is just for reference - actual users are created through the auth system

-- Sample businesses for demo purposes
INSERT INTO businesses (id, name, description, business_type, status, monthly_revenue, total_revenue, website_url) VALUES
  (gen_random_uuid(), 'TechStore Pro', 'Automated e-commerce platform selling tech gadgets', 'ecommerce', 'active', 12340, 148080, 'https://techstore-pro.com'),
  (gen_random_uuid(), 'SaaS Analytics Hub', 'Business intelligence platform for small businesses', 'saas', 'active', 8920, 89200, 'https://analytics-hub.com'),
  (gen_random_uuid(), 'Digital Marketing Suite', 'Automated marketing tools and services', 'digital', 'active', 3320, 33200, 'https://marketing-suite.com'),
  (gen_random_uuid(), 'AI Content Creator', 'Automated content generation platform', 'saas', 'launching', 0, 0, 'https://ai-content.com'),
  (gen_random_uuid(), 'Crypto Trading Bot', 'Automated cryptocurrency trading system', 'fintech', 'active', 5670, 56700, 'https://crypto-bot.com');

-- Sample revenue streams
INSERT INTO revenue_streams (business_id, stream_type, amount, description) 
SELECT 
  b.id,
  CASE 
    WHEN b.business_type = 'ecommerce' THEN 'product_sales'
    WHEN b.business_type = 'saas' THEN 'subscription'
    WHEN b.business_type = 'digital' THEN 'service_fees'
    WHEN b.business_type = 'fintech' THEN 'trading_fees'
    ELSE 'other'
  END,
  b.monthly_revenue,
  'Monthly revenue for ' || b.name
FROM businesses b
WHERE b.monthly_revenue > 0;

-- Additional revenue entries for historical data
INSERT INTO revenue_streams (business_id, stream_type, amount, recorded_at, description)
SELECT 
  b.id,
  'bonus_revenue',
  ROUND((RANDOM() * 1000 + 500)::numeric, 2),
  now() - interval '1 month',
  'Additional revenue stream'
FROM businesses b
WHERE b.status = 'active'
LIMIT 3;

-- Sample notifications (these would typically be created by the application)
-- Note: user_id would need to be set to actual user IDs when users exist
-- INSERT INTO notifications (user_id, title, message, type) VALUES
--   (user_uuid, 'Welcome to DreamSeller Pro!', 'Your account has been created successfully. Start generating your first business!', 'success'),
--   (user_uuid, 'New Business Launched', 'TechStore Pro has been successfully launched and is generating revenue!', 'success'),
--   (user_uuid, 'Revenue Milestone', 'Congratulations! You have reached $25,000 in monthly revenue.', 'achievement'),
--   (user_uuid, 'System Update', 'New AI optimization features have been added to improve your business performance.', 'info');

-- Create a function to initialize user data when they first sign up
CREATE OR REPLACE FUNCTION initialize_user_data()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert user profile
  INSERT INTO users (auth_id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  
  -- Insert default user settings
  INSERT INTO user_settings (user_id)
  VALUES ((SELECT id FROM users WHERE auth_id = NEW.id));
  
  -- Insert welcome notification
  INSERT INTO notifications (user_id, title, message, type)
  VALUES (
    (SELECT id FROM users WHERE auth_id = NEW.id),
    'Welcome to DreamSeller Pro!',
    'Your account has been created successfully. Start generating your first business from the dashboard!',
    'success'
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to initialize user data on signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION initialize_user_data();

-- Function to update user revenue totals
CREATE OR REPLACE FUNCTION update_user_revenue()
RETURNS TRIGGER AS $$
BEGIN
  -- Update business total revenue
  UPDATE businesses 
  SET total_revenue = (
    SELECT COALESCE(SUM(amount), 0) 
    FROM revenue_streams 
    WHERE business_id = NEW.business_id
  )
  WHERE id = NEW.business_id;
  
  -- Update user total revenue
  UPDATE users 
  SET total_revenue = (
    SELECT COALESCE(SUM(total_revenue), 0) 
    FROM businesses 
    WHERE user_id = users.id
  )
  WHERE id = (SELECT user_id FROM businesses WHERE id = NEW.business_id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update revenue totals when new revenue is added
CREATE TRIGGER update_revenue_totals
  AFTER INSERT ON revenue_streams
  FOR EACH ROW EXECUTE FUNCTION update_user_revenue();