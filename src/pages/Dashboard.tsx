// src/pages/Dashboard.tsx
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { Line } from "react-chartjs-2";
import "chart.js/auto";
import { X } from "lucide-react";

interface DashboardProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Dashboard({ isOpen = true, onClose = () => {} }: DashboardProps) {
  const [monthlyRevenue, setMonthlyRevenue] = useState(0);
  const [earningsHistory, setEarningsHistory] = useState<any[]>([]);
  const [activeBusinesses, setActiveBusinesses] = useState(0);
  const [recentEarnings, setRecentEarnings] = useState<any[]>([]);
  const [tickerAmount, setTickerAmount] = useState(0);
  const [selectedBusiness, setSelectedBusiness] = useState("all");
  const [businesses, setBusinesses] = useState<any[]>([]);

  useEffect(() => {
    fetchBusinesses();
    fetchEarnings();

    const sub = supabase
      .channel("earnings-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "earnings" },
        (payload) => {
          if (payload?.new?.amount) {
            const amount = Number(payload.new.amount) || 0;
            const businessName = payload.new.business_name || "Unknown";

            if (selectedBusiness === "all" || businessName === selectedBusiness) {
              setMonthlyRevenue((prev) => prev + amount);
              setTickerAmount(amount);
              setTimeout(() => setTickerAmount(0), 3000);
              fetchEarnings();
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(sub);
    };
  }, [selectedBusiness]);

  async function fetchBusinesses() {
    try {
      const { data, error } = await supabase
        .from("businesses")
        .select("*")
        .eq("status", "active")
        .order("created_at", { ascending: true });

      if (error) {
        console.error("❌ Businesses fetch error:", error);
        return;
      }
      setBusinesses(data || []);
    } catch (err) {
      console.error("❌ Unexpected error fetching businesses:", err);
    }
  }

  async function fetchEarnings() {
    const { data, error } = await supabase
      .from("earnings")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) {
      console.error("❌ Earnings fetch error:", error);
      return;
    }
    if (!data) return;

    setEarningsHistory(data);

    const thisMonth = new Date().getMonth();
    const filtered =
      selectedBusiness === "all"
        ? data
        : data.filter((e) => e.business_name === selectedBusiness);

    const sum = filtered
      .filter((e) => new Date(e.created_at).getMonth() === thisMonth)
      .reduce((acc, cur) => acc + Number(cur.amount || 0), 0);
    setMonthlyRevenue(sum);

    const active = [...new Set(data.map((e) => e.business_name))].length;
    setActiveBusinesses(active);

    setRecentEarnings(filtered.slice(-5).reverse());
  }

  const chartData = {
    labels: earningsHistory
      .filter((e) => selectedBusiness === "all" || e.business_name === selectedBusiness)
      .map((e) => new Date(e.created_at).toLocaleDateString()),
    datasets: [
      {
        label: "Daily Earnings ($)",
        data: earningsHistory
          .filter((e) => selectedBusiness === "all" || e.business_name === selectedBusiness)
          .map((e) => e.amount),
        borderColor: "#4CAF50",
        backgroundColor: "rgba(76,175,80,0.2)",
        fill: true,
        tension: 0.3,
      },
    ],
  };

  return (
    <div
      className={`fixed top-0 right-0 h-full w-[400px] bg-[#111] text-white shadow-lg transform transition-transform duration-300 z-50 overflow-y-auto ${
        isOpen ? "translate-x-0" : "translate-x-full"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        <h2 className="text-2xl font-bold">📊 Dashboard</h2>
        <button onClick={onClose}>
          <X size={28} />
        </button>
      </div>

      {/* My Businesses */}
      <div className="p-4">
        <h3 className="text-lg font-bold mb-2">My Businesses</h3>
        {businesses.length > 0 ? (
          <ul>
            {businesses.map((b) => (
              <li key={b.id} className="bg-gray-900 p-3 rounded-lg mb-2">
                <p className="font-bold">{b.name}</p>
                <p className="text-sm text-gray-400">{b.category}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-400 text-sm">No active businesses found...</p>
        )}
      </div>

      {/* Business Filter */}
      <div className="p-4">
        <label className="block mb-2 font-bold text-gray-300">Filter by Business</label>
        <select
          value={selectedBusiness}
          onChange={(e) => setSelectedBusiness(e.target.value)}
          className="bg-gray-900 text-white p-2 rounded w-full"
        >
          <option value="all">All Businesses</option>
          {[...new Set(earningsHistory.map((e) => e.business_name))].map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 p-4">
        <div className="bg-gray-900 p-3 rounded-lg">
          <h3 className="text-gray-400 text-sm">Active Businesses</h3>
          <p className="text-2xl font-bold">{activeBusinesses}</p>
        </div>
        <div className="bg-gray-900 p-3 rounded-lg relative">
          <h3 className="text-gray-400 text-sm">Monthly Revenue</h3>
          <p className="text-2xl font-bold">${monthlyRevenue.toLocaleString()}</p>
          {tickerAmount > 0 && (
            <span className="absolute top-2 right-2 bg-green-600 px-2 py-1 rounded text-sm animate-bounce">
              +${tickerAmount}
            </span>
          )}
        </div>
      </div>

      {/* Recent Earnings */}
      <div className="p-4">
        <h3 className="text-lg font-bold mb-2">Recent Earnings</h3>
        {recentEarnings.length === 0 ? (
          <p className="text-gray-400 text-sm">No earnings yet...</p>
        ) : (
          <ul className="space-y-2">
            {recentEarnings.map((e, idx) => (
              <li key={idx} className="bg-gray-900 p-2 rounded-lg">
                <span className="font-bold">${e.amount}</span> from {e.business_name} <br />
                <span className="text-gray-400 text-xs">
                  {new Date(e.created_at).toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Chart */}
      <div className="p-4">
        <h3 className="text-lg font-bold mb-2">Revenue Analysis</h3>
        {earningsHistory.length > 0 ? (
          <Line data={chartData} />
        ) : (
          <p className="text-gray-400 text-sm">No data available...</p>
        )}
      </div>
    </div>
  );
}


