// deno-lint-ignore-file no-explicit-any
// @ts-nocheck
// Supabase Edge Function — AI Business Runner (Legal Mode)
// This file runs in Deno — ignore Node.js TypeScript errors in VS Code

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

async function runBusinesses() {
  const { data: businesses, error } = await supabase
    .from("businesses")
    .select("id, name, user_id, status")
    .eq("status", "active");

  if (error) {
    console.error("❌ Fetch businesses error:", error);
    return;
  }

  for (const b of businesses || []) {
    // Earnings simulation (replace with real API calls for live businesses)
    const amount = parseFloat((Math.random() * 30 + 5).toFixed(2));

    const { error: earnErr } = await supabase.from("earnings").insert({
      amount,
      source: b.name,
      user_id: b.user_id,
      created_at: new Date().toISOString()
    });

    if (earnErr) {
      console.error(`❌ Failed to log earnings for ${b.name}:`, earnErr);
    } else {
      console.log(`💰 Recorded $${amount} for ${b.name}`);
    }
  }
}

await runBusinesses();
