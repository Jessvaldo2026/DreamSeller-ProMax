// src/lib/realTimeIncome.ts
import { supabase } from "./supabase";

export interface RevenueRecord {
  amount: number;
  source: string;
  recorded_at: string;
}

async function fetchRevenueHistory(): Promise<RevenueRecord[]> {
  const { data, error } = await supabase
    .from("earnings")
    .select("amount, source, created_at")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("❌ Error fetching revenue history:", error);
    return [];
  }

  return (data || []).map((row: any) => ({
    amount: Number(row.amount || 0),
    source: row.source || "Unknown",
    recorded_at: row.created_at,
  }));
}

function calculateTotalRevenue(records: RevenueRecord[]): number {
  return records.reduce(
    (sum: number, record: RevenueRecord) => sum + Number(record.amount || 0),
    0
  );
}

async function subscribeToLiveRevenueUpdates(
  onNewRevenue: (record: RevenueRecord) => void
) {
  return supabase
    .channel("live-revenue")
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "earnings" },
      (payload) => {
        if (payload?.new) {
          const record: RevenueRecord = {
            amount: Number(payload.new.amount || 0),
            source: payload.new.source || "Unknown",
            recorded_at: payload.new.created_at,
          };
          console.log(`💰 Live revenue update: +$${record.amount} from ${record.source}`);
          onNewRevenue(record);
        }
      }
    )
    .subscribe();
}

export const incomeTracker = {
  startTracking: async () => {
    console.log("📡 Starting real-time income tracking...");

    await subscribeToLiveRevenueUpdates((record) => {
      console.log("💵 Real-time earning received:", record);
    });
  },
  fetchRevenueHistory,
  calculateTotalRevenue,
};
