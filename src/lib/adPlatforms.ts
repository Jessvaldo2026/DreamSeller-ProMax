// Multi-platform advertising automation
import { supabase } from './supabase';

export interface AdCampaign {
  id: string;
  user_id: string;
  business_id: string;
  name: string;
  platforms: ('google' | 'facebook' | 'instagram' | 'tiktok' | 'twitter')[];
  budget: number;
  target_audience: {
    age_range: [number, number];
    interests: string[];
    locations: string[];
    demographics: {
      gender: string[];
      income_level: string[];
      education: string[];
      occupation: string[];
    };
  };
  ad_creative: {
    headline: string;
    description: string;
    image_url: string;
    call_to_action: string;
  };
  status: 'draft' | 'active' | 'paused' | 'completed';
  performance: {
    impressions: number;
    clicks: number;
    conversions: number;
    cost: number;
    revenue: number;
  };
  created_at: Date;
}

export class AdPlatformManager {
  async createCampaign(campaign: Omit<AdCampaign, 'id' | 'performance' | 'created_at'>): Promise<AdCampaign> {
    const newCampaign: AdCampaign = {
      ...campaign,
      id: crypto.randomUUID(),
      performance: {
        impressions: 0,
        clicks: 0,
        conversions: 0,
        cost: 0,
        revenue: 0
      },
      created_at: new Date()
    };
    
    // Save to database
    const { error } = await supabase
      .from('ad_campaigns')
      .insert(newCampaign);
    
    if (error) throw error;
    
    // Launch on selected platforms
    for (const platform of campaign.platforms) {
      await this.launchOnPlatform(newCampaign, platform);
    }
    
    return newCampaign;
  }

  private async launchOnPlatform(campaign: AdCampaign, platform: string): Promise<void> {
    try {
      const response = await fetch(`/api/ads/${platform}/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: campaign.name,
          budget: campaign.budget / campaign.platforms.length, // Split budget
          targeting: campaign.target_audience,
          creative: campaign.ad_creative
        })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to launch on ${platform}`);
      }
      
      const result = await response.json();
      console.log(`Campaign launched on ${platform}:`, result);
      
    } catch (error) {
      console.error(`Failed to launch campaign on ${platform}:`, error);
    }
  }

  async generateAdCreative(businessType: string, targetAudience: string): Promise<AdCampaign['ad_creative']> {
    const response = await fetch('/api/ai/generate-ad-creative', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        businessType,
        targetAudience
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to generate ad creative');
    }
    
    return await response.json();
  }

  async optimizeCampaign(campaignId: string): Promise<void> {
    const { data: campaign, error } = await supabase
      .from('ad_campaigns')
      .select('*')
      .eq('id', campaignId)
      .single();
    
    if (error) throw error;
    
    // Analyze performance and adjust
    const ctr = campaign.performance.clicks / campaign.performance.impressions;
    const roas = campaign.performance.revenue / campaign.performance.cost;
    
    let optimizations = [];
    
    if (ctr < 0.02) { // Low click-through rate
      optimizations.push('improve_creative');
    }
    
    if (roas < 2.0) { // Low return on ad spend
      optimizations.push('adjust_targeting');
    }
    
    // Apply optimizations
    for (const optimization of optimizations) {
      await this.applyOptimization(campaignId, optimization);
    }
  }

  private async applyOptimization(campaignId: string, type: string): Promise<void> {
    const response = await fetch('/api/ads/optimize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        campaignId,
        optimizationType: type
      })
    });
    
    if (!response.ok) {
      console.error(`Failed to apply optimization ${type}`);
    }
  }

  async getCampaignPerformance(campaignId: string): Promise<AdCampaign['performance']> {
    // Fetch real-time performance data from ad platforms
    const response = await fetch(`/api/ads/performance/${campaignId}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch campaign performance');
    }
    
    const performance = await response.json();
    
    // Update database
    await supabase
      .from('ad_campaigns')
      .update({ performance })
      .eq('id', campaignId);
    
    return performance;
  }

  async getUserCampaigns(userId: string): Promise<AdCampaign[]> {
    const { data, error } = await supabase
      .from('ad_campaigns')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  async pauseCampaign(campaignId: string): Promise<void> {
    await supabase
      .from('ad_campaigns')
      .update({ status: 'paused' })
      .eq('id', campaignId);
    
    // Pause on all platforms
    const response = await fetch(`/api/ads/pause/${campaignId}`, {
      method: 'POST'
    });
    
    if (!response.ok) {
      throw new Error('Failed to pause campaign');
    }
  }
}

export const adPlatformManager = new AdPlatformManager();