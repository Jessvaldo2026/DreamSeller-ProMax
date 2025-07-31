import { supabase } from './supabase';
import { createShopifyStore } from './createShopifyStore';

type ModuleId =
  | 'dropshipping'
  | 'digital-store'
  | 'affiliate-blog'
  | 'print-on-demand'
  | 'freelance-hub'
  | 'saas-tool'
  | 'ad-revenue'
  | 'course-platform'
  | 'investment-tracker'
  | 'app-generator';

interface BusinessDefinition {
  name: string;
  category: string;
}

const modules: Record<ModuleId, BusinessDefinition> = {
  'dropshipping': {
    name: 'Smart Dropshipping',
    category: 'E-commerce',
  },
  'digital-store': {
    name: 'Digital Product Store',
    category: 'Digital',
  },
  'affiliate-blog': {
    name: 'Affiliate Blog',
    category: 'Content',
  },
  'print-on-demand': {
    name: 'Print-on-Demand Store',
    category: 'E-commerce',
  },
  'freelance-hub': {
    name: 'Freelance Service Hub',
    category: 'Services',
  },
  'saas-tool': {
    name: 'SaaS Subscription Tool',
    category: 'Software',
  },
  'ad-revenue': {
    name: 'Ad Revenue Site',
    category: 'Media',
  },
  'course-platform': {
    name: 'Online Course Platform',
    category: 'Education',
  },
  'investment-tracker': {
    name: 'Smart Investment Tracker',
    category: 'Finance',
  },
  'app-generator': {
    name: 'App Generator AI',
    category: 'Development',
  },
};

export async function startBusinessModule(moduleId: ModuleId, userId: string) {
  const module = modules[moduleId];

  if (moduleId === 'dropshipping') {
    await createShopifyStore(
      'goncalvesjacelina27@gmail.com',
      'MoneyMaker2025',
      'BeMYGuest',
      'United States'
    );
  }

  const { error } = await supabase.from('businesses').insert({
    name: module.name,
    category: module.category,
    status: 'active',
    monthly_revenue: Math.floor(Math.random() * 1000) + 100,
    setup_progress: 100,
    user_id: userId,
  });

  if (error) {
    console.error('❌ Failed to create business:', error);
  } else {
    console.log(`✅ ${module.name} has been launched!`);
  }
}
