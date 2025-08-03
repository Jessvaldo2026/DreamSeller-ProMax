 // @ts-nocheck
// Supabase Edge Function — Global AI Business Runner (Legal Mode)

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Read environment variables in Deno
const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function runAllBusinesses() {
  const { data: businesses, error } = await supabase
    .from("businesses")
    .select("id, name, user_id, status")
    .eq("status", "active");

  if (error) {
    console.error("❌ Error fetching businesses:", error);
    return;
  }

  for (const b of businesses || []) {
    const amount = parseFloat((Math.random() * 50 + 10).toFixed(2));

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

await runAllBusinesses();
