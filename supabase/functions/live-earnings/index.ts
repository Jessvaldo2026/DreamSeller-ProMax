// @ts-ignore - Ignore Deno type warnings in VS Code
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Read secrets from environment variables in Deno runtime
// @ts-ignore
const supabaseUrl = Deno.env.get("SUPABASE_URL");
// @ts-ignore
const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const supabase = createClient(supabaseUrl, serviceKey);

async function generateEarnings() {
  const { data: businesses, error } = await supabase
    .from("businesses")
    .select("name, user_id")
    .eq("status", "active");

  if (error) {
    console.error("❌ Error fetching businesses:", error);
    return;
  }

  for (const b of businesses || []) {
    const amount = parseFloat((Math.random() * 50 + 5).toFixed(2));

    const { error: earnErr } = await supabase.from("earnings").insert({
      amount,
      source: b.name,
      user_id: b.user_id,
      created_at: new Date().toISOString()
    });

    if (earnErr) {
      console.error(`❌ Failed to record earnings for ${b.name}:`, earnErr);
    } else {
      console.log(`💰 $${amount} earned by ${b.name}`);
    }
  }
}

await generateEarnings();

