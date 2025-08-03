// src/lib/businessModules.ts

export interface BusinessModule {
  id: string;
  name: string;
  description: string;
  category: string;
  status: string;
  monthlyRevenue: number;
  setupProgress: number;
  icon: string;
}

export const businessModules: BusinessModule[] = [
  {
    id: "dropshipping",
    name: "Smart Dropshipping",
    description: "Automated product sourcing, uploading, and order fulfillment using Shopify & AI.",
    category: "E-commerce",
    status: "inactive",
    monthlyRevenue: 0,
    setupProgress: 0,
    icon: "shopping-cart"
  },
  {
    id: "digital-store",
    name: "Digital Product Store",
    description: "Automated sourcing and selling of profitable digital products using Shopify & AI.",
    category: "Digital",
    status: "inactive",
    monthlyRevenue: 0,
    setupProgress: 0,
    icon: "file-text"
  }
];
