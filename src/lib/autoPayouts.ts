// Automatic money transfer to Stripe/bank accounts
import { supabase } from './supabase';

export interface PayoutSchedule {
  id: string;
  user_id: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  minimum_amount: number;
  destination: 'stripe' | 'bank';
  account_details: Record<string, any>;
  enabled: boolean;
  last_payout: Date | null;
  next_payout: Date;
}

export class AutoPayoutManager {
  async setupAutoPayout(schedule: Omit<PayoutSchedule, 'id' | 'last_payout' | 'next_payout'>): Promise<PayoutSchedule> {
    const nextPayout = this.calculateNextPayout(schedule.frequency);
    
    const payoutSchedule: PayoutSchedule = {
      ...schedule,
      id: crypto.randomUUID(),
      last_payout: null,
      next_payout: nextPayout
    };
    
    const { error } = await supabase
      .from('payout_schedules')
      .insert(payoutSchedule);
    
    if (error) throw error;
    
    return payoutSchedule;
  }

  async processScheduledPayouts(): Promise<void> {
    const { data: schedules, error } = await supabase
      .from('payout_schedules')
      .select('*')
      .eq('enabled', true)
      .lte('next_payout', new Date().toISOString());
    
    if (error) throw error;
    
    for (const schedule of schedules || []) {
      await this.processPayout(schedule);
    }
  }

  private async processPayout(schedule: PayoutSchedule): Promise<void> {
    // Get user's available balance
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('total_revenue')
      .eq('id', schedule.user_id)
      .single();
    
    if (userError) throw userError;
    
    const availableBalance = user.total_revenue || 0;
    
    if (availableBalance < schedule.minimum_amount) {
      console.log(`Insufficient balance for payout: ${availableBalance} < ${schedule.minimum_amount}`);
      return;
    }
    
    try {
      if (schedule.destination === 'stripe') {
        await this.processStripePayout(schedule, availableBalance);
      } else {
        await this.processBankPayout(schedule, availableBalance);
      }
      
      // Update schedule
      const nextPayout = this.calculateNextPayout(schedule.frequency);
      await supabase
        .from('payout_schedules')
        .update({
          last_payout: new Date().toISOString(),
          next_payout: nextPayout.toISOString()
        })
        .eq('id', schedule.id);
      
      // Record transaction
      await supabase
        .from('transactions')
        .insert({
          id: crypto.randomUUID(),
          user_id: schedule.user_id,
          type: 'payout',
          amount: availableBalance,
          status: 'completed',
          method: schedule.destination,
          description: `Automatic ${schedule.frequency} payout`,
          created_at: new Date().toISOString()
        });
      
    } catch (error) {
      console.error('Payout failed:', error);
      
      // Record failed transaction
      await supabase
        .from('transactions')
        .insert({
          id: crypto.randomUUID(),
          user_id: schedule.user_id,
          type: 'payout',
          amount: availableBalance,
          status: 'failed',
          method: schedule.destination,
          description: `Failed automatic payout: ${error}`,
          created_at: new Date().toISOString()
        });
    }
  }

  private async processStripePayout(schedule: PayoutSchedule, amount: number): Promise<void> {
    const response = await fetch('/api/stripe/payout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: Math.round(amount * 100), // Convert to cents
        destination: schedule.account_details.stripe_account_id
      })
    });
    
    if (!response.ok) {
      throw new Error('Stripe payout failed');
    }
  }

  private async processBankPayout(schedule: PayoutSchedule, amount: number): Promise<void> {
    const response = await fetch('/api/bank/transfer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount,
        account_number: schedule.account_details.account_number,
        routing_number: schedule.account_details.routing_number
      })
    });
    
    if (!response.ok) {
      throw new Error('Bank transfer failed');
    }
  }

  private calculateNextPayout(frequency: PayoutSchedule['frequency']): Date {
    const now = new Date();
    
    switch (frequency) {
      case 'daily':
        return new Date(now.getTime() + 24 * 60 * 60 * 1000);
      case 'weekly':
        return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      case 'monthly':
        const nextMonth = new Date(now);
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        return nextMonth;
      default:
        return new Date(now.getTime() + 24 * 60 * 60 * 1000);
    }
  }

  async getUserPayoutSchedule(userId: string): Promise<PayoutSchedule | null> {
    const { data, error } = await supabase
      .from('payout_schedules')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }
}

export const autoPayoutManager = new AutoPayoutManager();