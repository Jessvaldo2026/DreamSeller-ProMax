// src/lib/trackEarnings.ts
import { supabase } from "./supabase";

/**
 * Records earnings in Supabase for a specific business.
 * @param amount The amount earned in USD
 * @param businessId The business ID from Supabase
 * @param businessName The human-readable name of the business
 * @param userId The Supabase auth user ID
 */
export async function trackEarnings(
  amount: number,
  businessId: string,
  businessName: string,
  userId: string
): Promise<void> {
  if (!amount || amount <= 0) {
    console.warn(`⚠️ Ignoring invalid earning amount: ${amount}`);
    return;
  }

  try {
    const { error } = await supabase.from("earnings").insert({
      amount,
      business_id: businessId,
      business_name: businessName, // stored for easy filtering in dashboard
      user_id: userId,
      created_at: new Date().toISOString(),
    });

    if (error) {
      console.error(`❌ Failed to track earnings for ${businessName}:`, error);
    } else {
      console.log(`💰 Recorded $${amount.toFixed(2)} for ${businessName}`);
    }
  } catch (err: any) {
    console.error(`❌ Unexpected error tracking earnings for ${businessName}:`, err);
  }
}


