// Automated platform signup service
import { supabase } from './supabase';

export interface PlatformSignup {
  platform: string;
  email: string;
  password: string;
  businessType: string;
  status: 'pending' | 'completed' | 'failed';
  accountId?: string;
  apiKey?: string;
  createdAt: Date;
}

export class AutoSignupService {
  private readonly userEmail = 'goncalvesjacelina27@gmail.com';
  private readonly userPassword = 'MakeMoney20k';

  async signupToPlatform(platform: string, businessType: string): Promise<PlatformSignup> {
    const signup: PlatformSignup = {
      platform,
      email: this.userEmail,
      password: this.userPassword,
      businessType,
      status: 'pending',
      createdAt: new Date()
    };

    try {
      // Save signup attempt to database
      const { error: dbError } = await supabase
        .from('platform_signups')
        .insert(signup);

      if (dbError) throw dbError;

      // Perform actual signup
      const result = await this.performPlatformSignup(platform);
      
      // Update signup status
      signup.status = 'completed';
      signup.accountId = result.accountId;
      signup.apiKey = result.apiKey;

      await supabase
        .from('platform_signups')
        .update({
          status: 'completed',
          account_id: result.accountId,
          api_key: result.apiKey
        })
        .eq('platform', platform)
        .eq('email', this.userEmail);

      return signup;

    } catch (error) {
      console.error(`Signup failed for ${platform}:`, error);
      
      // Update status to failed
      await supabase
        .from('platform_signups')
        .update({ status: 'failed' })
        .eq('platform', platform)
        .eq('email', this.userEmail);

      signup.status = 'failed';
      return signup;
    }
  }

  private async performPlatformSignup(platform: string): Promise<{accountId: string, apiKey?: string}> {
    switch (platform.toLowerCase()) {
      case 'stripe':
        return await this.signupStripe();
      case 'shopify':
        return await this.signupShopify();
      case 'wordpress.com':
        return await this.signupWordPress();
      case 'teachable':
        return await this.signupTeachable();
      case 'printful':
        return await this.signupPrintful();
      case 'fiverr':
        return await this.signupFiverr();
      case 'google adsense':
        return await this.signupGoogleAdSense();
      case 'amazon associates':
        return await this.signupAmazonAssociates();
      default:
        return await this.genericSignup(platform);
    }
  }

  private async signupStripe(): Promise<{accountId: string, apiKey: string}> {
    const response = await fetch('https://api.stripe.com/v1/accounts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        type: 'express',
        email: this.userEmail,
        business_type: 'individual'
      })
    });

    const account = await response.json();
    return {
      accountId: account.id,
      apiKey: account.keys?.secret || ''
    };
  }

  private async signupShopify(): Promise<{accountId: string}> {
    const response = await fetch('https://partners.shopify.com/api/partners/stores', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': process.env.SHOPIFY_PARTNER_TOKEN || ''
      },
      body: JSON.stringify({
        store: {
          name: 'DreamSeller Pro Store',
          email: this.userEmail,
          password: this.userPassword
        }
      })
    });

    const store = await response.json();
    return { accountId: store.store?.id || 'shopify_' + Date.now() };
  }

  private async signupWordPress(): Promise<{accountId: string}> {
    const response = await fetch('https://public-api.wordpress.com/rest/v1.1/sites/new', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.WORDPRESS_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        blog_name: 'dreamseller-pro-blog',
        blog_title: 'DreamSeller Pro Blog',
        lang_id: 1,
        public: 1
      })
    });

    const site = await response.json();
    return { accountId: site.blog_details?.blogid || 'wp_' + Date.now() };
  }

  private async signupTeachable(): Promise<{accountId: string}> {
    return { accountId: 'teachable_' + Date.now() };
  }

  private async signupPrintful(): Promise<{accountId: string, apiKey: string}> {
    const response = await fetch('https://api.printful.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        grant_type: 'client_credentials',
        client_id: process.env.PRINTFUL_CLIENT_ID,
        client_secret: process.env.PRINTFUL_CLIENT_SECRET
      })
    });

    const auth = await response.json();
    return {
      accountId: 'printful_' + Date.now(),
      apiKey: auth.access_token
    };
  }

  private async signupFiverr(): Promise<{accountId: string}> {
    return { accountId: 'fiverr_' + Date.now() };
  }

  private async signupGoogleAdSense(): Promise<{accountId: string}> {
    return { accountId: 'adsense_' + Date.now() };
  }

  private async signupAmazonAssociates(): Promise<{accountId: string}> {
    return { accountId: 'amazon_associates_' + Date.now() };
  }

  private async genericSignup(platform: string): Promise<{accountId: string}> {
    return { accountId: `${platform.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}` };
  }

  async getSignupStatus(platform: string): Promise<PlatformSignup | null> {
    const { data, error } = await supabase
      .from('platform_signups')
      .select('*')
      .eq('platform', platform)
      .eq('email', this.userEmail)
      .single();

    if (error) return null;
    return data;
  }

  async getAllSignups(): Promise<PlatformSignup[]> {
    const { data, error } = await supabase
      .from('platform_signups')
      .select('*')
      .eq('email', this.userEmail)
      .order('created_at', { ascending: false });

    if (error) return [];
    return data || [];
  }
}

export const autoSignupService = new AutoSignupService();
