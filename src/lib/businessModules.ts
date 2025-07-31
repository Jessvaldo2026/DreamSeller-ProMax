export interface BusinessModule {
  id: string;
  name: string;
  description: string;
  category: string;
  status: 'active' | 'inactive' | 'setup';
  monthlyRevenue: number;
  setupProgress: number;
  icon: string;
}

export interface DropshippingProduct {
  id: string;
  name: string;
  price: number;
  cost: number;
  supplier: string;
  image: string;
  category: string;
  profitMargin: number;
}

export interface Supplier {
  id: string;
  name: string;
  email: string;
  website: string;
  category: string;
  responseRate: number;
  averageShipping: number;
  contacted: boolean;
}

export interface DigitalProduct {
  id: string;
  name: string;
  type: 'ebook' | 'music' | 'software' | 'template';
  price: number;
  downloadUrl: string;
  description: string;
  sales: number;
}

export interface BlogPost {
  id: string;
  title: string;
  content: string;
  affiliateLinks: string[];
  seoScore: number;
  views: number;
  earnings: number;
  publishedAt: Date;
}

export interface PrintProduct {
  id: string;
  name: string;
  type: 'tshirt' | 'mug' | 'poster' | 'sticker';
  design: string;
  price: number;
  orders: number;
}

export interface FreelanceService {
  id: string;
  name: string;
  description: string;
  price: number;
  deliveryTime: number;
  category: string;
  orders: number;
}

export interface SaasSubscription {
  id: string;
  name: string;
  description: string;
  monthlyPrice: number;
  features: string[];
  subscribers: number;
  churnRate: number;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  price: number;
  modules: number;
  students: number;
  rating: number;
}

export interface Investment {
  id: string;
  symbol: string;
  name: string;
  currentPrice: number;
  change: number;
  recommendation: 'buy' | 'sell' | 'hold';
  confidence: number;
}

export const businessModules: BusinessModule[] = [
  {
    id: 'dropshipping',
    name: 'Smart Dropshipping',
    description: 'Automated supplier sourcing and order fulfillment',
    category: 'E-commerce',
    status: 'setup',
    monthlyRevenue: 0,
    setupProgress: 0,
    icon: 'Package'
  },
  {
    id: 'digital-store',
    name: 'Digital Product Store',
    description: 'Sell ebooks, music, software, and templates',
    category: 'Digital',
    status: 'setup',
    monthlyRevenue: 0,
    setupProgress: 0,
    icon: 'Download'
  },
  {
    id: 'affiliate-blog',
    name: 'Affiliate Blog',
    description: 'SEO-optimized blog with affiliate monetization',
    category: 'Content',
    status: 'setup',
    monthlyRevenue: 0,
    setupProgress: 0,
    icon: 'FileText'
  },
  {
    id: 'print-on-demand',
    name: 'Print-on-Demand Store',
    description: 'Auto-generated products with print fulfillment',
    category: 'E-commerce',
    status: 'setup',
    monthlyRevenue: 0,
    setupProgress: 0,
    icon: 'Printer'
  },
  {
    id: 'freelance-hub',
    name: 'Freelance Service Hub',
    description: 'AI-powered creative services marketplace',
    category: 'Services',
    status: 'setup',
    monthlyRevenue: 0,
    setupProgress: 0,
    icon: 'Briefcase'
  },
  {
    id: 'saas-tool',
    name: 'SaaS Subscription Tool',
    description: 'Monthly subscription business tools',
    category: 'Software',
    status: 'setup',
    monthlyRevenue: 0,
    setupProgress: 0,
    icon: 'Zap'
  },
  {
    id: 'ad-revenue',
    name: 'Ad Revenue Site',
    description: 'Content platform with advertising monetization',
    category: 'Media',
    status: 'setup',
    monthlyRevenue: 0,
    setupProgress: 0,
    icon: 'Monitor'
  },
  {
    id: 'course-platform',
    name: 'Online Course Platform',
    description: 'AI-generated courses with certification',
    category: 'Education',
    status: 'setup',
    monthlyRevenue: 0,
    setupProgress: 0,
    icon: 'GraduationCap'
  },
  {
    id: 'investment-tracker',
    name: 'Smart Investment Tracker',
    description: 'AI-powered investment recommendations',
    category: 'Finance',
    status: 'setup',
    monthlyRevenue: 0,
    setupProgress: 0,
    icon: 'TrendingUp'
  },
  {
    id: 'app-generator',
    name: 'App Generator AI',
    description: 'Automated code fixing and app deployment',
    category: 'Development',
    status: 'setup',
    monthlyRevenue: 0,
    setupProgress: 0,
    icon: 'Code'
  }
];