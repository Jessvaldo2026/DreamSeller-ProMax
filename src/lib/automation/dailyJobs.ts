import { runAutoFindAndUpload } from "./autoFindAndUploadProducts";
import { runAutoUploadDigitalStore } from "./autoUploadDigitalStore";
import { runMarketingAutomation } from "./marketingAutomation";

const USER_ID = process.env.SUPABASE_USER_ID || "your-supabase-user-id";
const DROPSHIPPING_BUSINESS_ID = process.env.DROPSHIPPING_BUSINESS_ID || "dropshipping-business-id";
const DIGITAL_STORE_BUSINESS_ID = process.env.DIGITAL_STORE_BUSINESS_ID || "digital-store-business-id";

async function runDailyJobs() {
  console.log("🚀 Starting daily jobs...");

  console.log("📦 Running Smart Dropshipping automation...");
  await runAutoFindAndUpload(USER_ID, DROPSHIPPING_BUSINESS_ID, "Smart Dropshipping");

  console.log("💾 Running Digital Store automation...");
  await runAutoUploadDigitalStore(USER_ID, DIGITAL_STORE_BUSINESS_ID, "Digital Product Store");

  console.log("📢 Running Marketing Automation for both...");
  await runMarketingAutomation(USER_ID, DROPSHIPPING_BUSINESS_ID, "Smart Dropshipping");
  await runMarketingAutomation(USER_ID, DIGITAL_STORE_BUSINESS_ID, "Digital Product Store");

  console.log("✅ All daily jobs completed successfully!");
}

runDailyJobs().catch((err) => {
  console.error("❌ Daily jobs failed:", err);
  process.exit(1);
});
