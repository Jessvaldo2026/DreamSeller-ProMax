import { createShopifyStore } from './createShopifyStore';

export async function automateDropshipping() {
  const email = 'goncalvesjacelina27@gmail.com';
  const password = 'MoneyMaker2025';
  const storeName = 'NovaMerchXpress ';
  const country = 'United States';

  console.log('🛒 Automating Dropshipping Setup...');
  const response = await createShopifyStore(email, password, storeName, country);

  if (response.success) {
    console.log('✅ Shopify store created!');
    console.log('🌐 Store URL:', response.url);
    console.log('🔑 Admin Dashboard:', response.adminDashboard);
  } else {
    console.error('❌ Store creation failed');
  }
}

automateDropshipping(); // ← make sure this is at the bottom!
