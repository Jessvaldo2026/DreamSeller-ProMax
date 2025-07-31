// Real-time income tracking system
import { supabase } from './supabase';

export interface IncomeEvent {
  id: string;
  business_id: string;
  amount: number;
  source: string;
  timestamp: Date;
  type: 'sale' | 'subscription' | 'commission' | 'refund';
}

interface SupabasePayload {
  new: {
    id: string;
    business_id: string;
    amount: number;
    description?: string;
    created_at: string;
    stream_type: string;
  };
}

interface RevenueRecord {
  amount: number;
  recorded_at: string;
}

export class RealTimeIncomeTracker {
  private listeners: ((event: IncomeEvent) => void)[] = [];
  private subscription: any = null;

  async startTracking(): Promise<void> {
    try {
      // Subscribe to real-time revenue changes
      this.subscription = supabase
        .channel('revenue_updates')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'revenue_streams' },
          (payload: SupabasePayload) => {
            const incomeEvent: IncomeEvent = {
              id: payload.new.id,
              business_id: payload.new.business_id,
              amount: payload.new.amount,
              source: payload.new.description || 'Unknown',
              timestamp: new Date(payload.new.created_at),
              type: this.determineType(payload.new.stream_type),
            };

            this.notifyListeners(incomeEvent);
          }
        )
        .subscribe();
    } catch (error) {
      console.warn('Real-time income tracking not available:', error);
    }
  }

  stopTracking(): void {
    if (this.subscription) {
      supabase.removeChannel(this.subscription);
      this.subscription = null;
    }
  }

  addListener(callback: (event: IncomeEvent) => void): void {
    this.listeners.push(callback);
  }

  removeListener(callback: (event: IncomeEvent) => void): void {
    this.listeners = this.listeners.filter((listener) => listener !== callback);
  }

  private notifyListeners(event: IncomeEvent): void {
    this.listeners.forEach((listener) => listener(event));
  }

  private determineType(streamType: string): 'sale' | 'subscription' | 'commission' | 'refund' {
    switch (streamType) {
      case 'subscription':
        return 'subscription';
      case 'affiliate':
        return 'commission';
      case 'refund':
        return 'refund';
      default:
        return 'sale';
    }
  }

  async getTodaysIncome(): Promise<number> {
    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('revenue_streams')
      .select('amount')
      .gte('recorded_at', `${today}T00:00:00.000Z`)
      .lt('recorded_at', `${today}T23:59:59.999Z`);

    if (error) throw error;

    return data?.reduce((sum: number, record: RevenueRecord) => sum + record.amount, 0) || 0;
  }

  async getWeeklyIncome(): Promise<number[]> {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const { data, error } = await supabase
      .from('revenue_streams')
      .select('amount, recorded_at')
      .gte('recorded_at', weekAgo.toISOString());

    if (error) throw error;

    // Group by day
    const dailyIncome = new Array(7).fill(0);
    data?.forEach((record: RevenueRecord) => {
      const dayIndex = Math.floor(
        (new Date().getTime() - new Date(record.recorded_at).getTime()) /
          (1000 * 60 * 60 * 24)
      );
      if (dayIndex >= 0 && dayIndex < 7) {
        dailyIncome[6 - dayIndex] += record.amount;
      }
    });

    return dailyIncome;
  }
}

export const incomeTracker = new RealTimeIncomeTracker();
