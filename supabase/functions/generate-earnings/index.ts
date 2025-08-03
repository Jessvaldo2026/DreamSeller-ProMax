// @ts-nocheck
// supabase/functions/generate-earnings/index.ts

/**
 * This disables type checking locally for Deno-specific globals like `Deno`
 * so VS Code won't show red errors, but Supabase will still run it fine.
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Environment variables (provided by Supabase in Deno runtime)
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

// Create Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

console.log("🚀 Earnings generator function ready...");

Deno.serve(async () => {
  try {
    // Get all active businesses
    const { data: businesses, error } = await supabase
      .from("businesses")
      .select("id, user_id, name")
      .eq("status", "active");

    if (error) throw error;

    // Generate earnings for each active business
    for (const biz of businesses ?? []) {
      const amount = Math.floor(Math.random() * 46) + 5; // $5 - $50

      const { error: insertError } = await supabase.from("earnings").insert({
        user_id: biz.user_id,
        business_id: biz.id,
        amount,
        source: biz.name,
        created_at: new Date().toISOString(),
      });

      if (insertError) {
        console.error(`❌ Failed to insert earnings for ${biz.name}:`, insertError);
      } else {
        console.log(`💰 ${biz.name} earned $${amount}`);
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("❌ Error generating earnings:", err.message || err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
