import { createShopifyStore } from './createShopifyStore';

interface ShopifyResponse {
  success: boolean;
  url: string;
  adminDashboard: string;
}

export async function launchSmartDropshipping(): Promise<void> {
  const email = 'goncalvesjacelina27@gmail.com';
  const password = 'MoneyMaker2025';
  const storeName = 'BeMYGuest';
  const country = 'United States';

  console.log('🛒 Launching Smart Dropshipping automation...');

  // Make sure we explicitly type the return as ShopifyResponse
  const response: ShopifyResponse = await createShopifyStore(
    email,
    password,
    storeName,
    country
  ) as ShopifyResponse;

  if (response && response.success) {
    console.log('✅ Shopify store created successfully!');
    console.log('🌐 Store URL:', response.url);
    console.log('🔑 Admin Dashboard:', response.adminDashboard);
  } else {
    console.error('❌ Failed to create Shopify store.');
  }
}

