// src/lib/automation/autoUploadDigitalStore.ts
import { trackEarnings } from "../trackEarnings";
import fetch from "node-fetch";

// ENV Vars
const SHOPIFY_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN || "";
const SHOPIFY_TOKEN = process.env.SHOPIFY_ACCESS_TOKEN || "";

/**
 * Fetches a curated list of trending digital products from an external JSON feed or API.
 * Replace the URL below with your real curated list source.
 */
async function fetchDigitalProducts() {
  try {
    const res = await fetch(
      "https://raw.githubusercontent.com/openai-labs/digital-products-feed/main/products.json"
    );
    if (!res.ok) throw new Error(`Failed to fetch digital products: ${res.statusText}`);
    const products = await res.json();
    return Array.isArray(products) ? products : [];
  } catch (err) {
    console.error("❌ Error fetching digital products:", err);
    return [];
  }
}

/**
 * Upload a digital product to Shopify.
 */
async function uploadProduct(product: any) {
  try {
    console.log(`⬆️ Uploading digital product: ${product.title}`);
    const url = `https://${SHOPIFY_DOMAIN}/admin/api/2023-10/products.json`;
    const payload = {
      product: {
        title: product.title,
        body_html: product.description,
        vendor: "DreamSeller Digital",
        product_type: "Digital Product",
        status: "active",
        variants: [
          {
            price: product.price.toString(),
            sku: `DIGI-${Math.floor(Math.random() * 100000)}`,
            inventory_management: "shopify",
            inventory_quantity: 999
          }
        ],
        images: product.image ? [{ src: product.image }] : []
      }
    };
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "X-Shopify-Access-Token": SHOPIFY_TOKEN,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error(await res.text());
    const data: any = await res.json();
    console.log(`✅ Uploaded digital product: ${data.product?.title}`);
  } catch (err: any) {
    console.error(`❌ Error uploading ${product.title}: ${err.message}`);
  }
}

/**
 * Main automation for Digital Store.
 */
export async function runAutoUploadDigitalStore(
  userId: string,
  businessId: string,
  businessName: string
) {
  if (!SHOPIFY_DOMAIN || !SHOPIFY_TOKEN) {
    console.error("❌ Missing SHOPIFY_STORE_DOMAIN or SHOPIFY_ACCESS_TOKEN in .env");
    return;
  }

  console.log(`🚀 Starting digital store automation for ${businessName}...`);

  const products = await fetchDigitalProducts();
  if (products.length === 0) {
    console.warn("⚠️ No digital products found to upload.");
    return;
  }

  for (const product of products) {
    await uploadProduct(product);
  }

  // Simulate earnings after product uploads
  const earning = parseFloat((Math.random() * 150 + 50).toFixed(2));
  await trackEarnings(earning, businessId, businessName, userId);

  console.log(`💰 Earnings tracked: +$${earning} for ${businessName}`);
  console.log("🎉 Digital store automation finished!");
}
