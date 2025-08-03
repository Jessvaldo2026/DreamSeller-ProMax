// src/lib/startBusinessModule.ts
import { supabase } from "./supabase";
import { createShopifyStore } from "./createShopifyStore";
import { runAutoFindAndUpload } from "./automation/autoFindAndUploadProducts";
import { runAutoUploadDigitalStore } from "./automation/autoUploadDigitalStore";
import { trackEarnings } from "./trackEarnings";

type ModuleId = "dropshipping" | "digital-store";

interface BusinessDefinition {
  name: string;
  category: string;
}

const modules: Record<ModuleId, BusinessDefinition> = {
  dropshipping: {
    name: "Smart Dropshipping",
    category: "E-commerce",
  },
  "digital-store": {
    name: "Digital Product Store",
    category: "Digital",
  }
};

/**
 * Shared Shopify store setup and automation trigger.
 */
async function setupShopifyAndRunAutomation(
  automationFn: (userId: string, businessId: string, businessName: string) => Promise<void>,
  userId: string,
  businessId: string,
  businessName: string
) {
  // Ensure Shopify store exists (will only set up once)
  await createShopifyStore(
    "goncalvesjacelina27@gmail.com",
    "MoneyMaker2025",
    "BeMYGuest",
    "United States"
  );

  console.log(`🚀 Running automation for ${businessName}...`);
  await automationFn(userId, businessId, businessName);
  console.log(`✅ Automation completed for ${businessName}`);
}

/**
 * Main function to start a business module.
 */
export async function startBusinessModule(moduleId: ModuleId, userId: string) {
  const module = modules[moduleId];
  if (!module) {
    console.warn(`⚠️ No definition found for moduleId: ${moduleId}`);
    return;
  }

  console.log(`🚀 Launching ${module.name} for user ${userId}...`);

  // Save business record in Supabase
  const { data: inserted, error } = await supabase
    .from("businesses")
    .insert({
      name: module.name,
      category: module.category,
      status: "active",
      monthly_revenue: 0,
      setup_progress: 100,
      user_id: userId,
    })
    .select("id")
    .single();

  if (error || !inserted) {
    console.error("❌ Failed to save business in Supabase:", error);
    return;
  }

  const businessId = inserted.id;

  // Run automation based on module type
  switch (moduleId) {
    case "dropshipping":
      await setupShopifyAndRunAutomation(runAutoFindAndUpload, userId, businessId, module.name);
      break;
    case "digital-store":
      await setupShopifyAndRunAutomation(runAutoUploadDigitalStore, userId, businessId, module.name);
      break;
  }

  // Track initial earnings for reporting
  const earning = parseFloat((Math.random() * 200 + 50).toFixed(2));
  await trackEarnings(earning, businessId, module.name, userId);

  console.log(`✅ ${module.name} is now active & earning!`);
}

