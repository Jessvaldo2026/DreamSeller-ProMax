import React, { useState, useEffect } from 'react';
import { CreditCard, Landmark as Bank, Wallet, ArrowUpRight, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Transaction {
  id: string;
  type: 'withdrawal' | 'deposit' | 'refund';
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  method: string;
  date: Date;
  description: string;
}

export default function WithdrawalSystem() {
  const [withdrawalAmount, setWithdrawalAmount] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('bank');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const [availableBalance, setAvailableBalance] = useState(0);
  const [pendingWithdrawals, setPendingWithdrawals] = useState(0);

  useEffect(() => {
    loadTransactionData();
  }, []);

  const loadTransactionData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setTransactions(data || []);
      
      // Calculate real balances from data
      const balance = calculateAvailableBalance(data || []);
      const pending = calculatePendingWithdrawals(data || []);
      
      setAvailableBalance(balance);
      setPendingWithdrawals(pending);
    } catch (error) {
      console.error('Failed to load transaction data:', error);
    }
  };

  const calculateAvailableBalance = (transactions: Transaction[]): number => {
    return transactions
      .filter(t => t.status === 'completed' && t.type === 'deposit')
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const calculatePendingWithdrawals = (transactions: Transaction[]): number => {
    return transactions
      .filter(t => t.status === 'pending' && t.type === 'withdrawal')
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const handleWithdrawal = async () => {
    const amount = parseFloat(withdrawalAmount);
    if (!amount || amount <= 0 || amount > availableBalance) {
      alert('Invalid withdrawal amount');
      return;
    }

    setIsProcessing(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsProcessing(false);
      setWithdrawalAmount('');
      alert(`Withdrawal of $${amount} initiated successfully!`);
    }, 2000);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-400" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-400" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-400';
      case 'pending':
        return 'text-yellow-400';
      case 'failed':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Balance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-green-600/20 to-emerald-600/20 backdrop-blur-lg rounded-xl p-6 border border-green-400/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-200 mb-1">Available Balance</p>
              <p className="text-3xl font-bold text-white">${availableBalance.toLocaleString()}</p>
            </div>
            <Wallet className="w-8 h-8 text-green-400" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-yellow-600/20 to-orange-600/20 backdrop-blur-lg rounded-xl p-6 border border-yellow-400/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-200 mb-1">Pending Withdrawals</p>
              <p className="text-3xl font-bold text-white">${pendingWithdrawals.toLocaleString()}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-400" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 backdrop-blur-lg rounded-xl p-6 border border-blue-400/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-200 mb-1">Total Withdrawn</p>
              <p className="text-3xl font-bold text-white">$47,300</p>
            </div>
            <ArrowUpRight className="w-8 h-8 text-blue-400" />
          </div>
        </div>
      </div>

      {/* Withdrawal Form */}
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
        <h3 className="text-2xl font-bold text-white mb-6">Request Withdrawal</h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-blue-200 mb-2">Withdrawal Amount</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white">$</span>
                <input
                  type="number"
                  value={withdrawalAmount}
                  onChange={(e) => setWithdrawalAmount(e.target.value)}
                  placeholder="0.00"
                  max={availableBalance}
                  className="w-full pl-8 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none"
                />
              </div>
              <p className="text-sm text-blue-200 mt-1">
                Available: ${availableBalance.toLocaleString()}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-blue-200 mb-3">Withdrawal Method</label>
              <div className="space-y-3">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="method"
                    value="bank"
                    checked={selectedMethod === 'bank'}
                    onChange={(e) => setSelectedMethod(e.target.value)}
                    className="w-4 h-4 text-blue-600"
                  />
                  <Bank className="w-5 h-5 text-blue-400" />
                  <span className="text-white">Bank Transfer (1-3 business days)</span>
                </label>
                
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="method"
                    value="paypal"
                    checked={selectedMethod === 'paypal'}
                    onChange={(e) => setSelectedMethod(e.target.value)}
                    className="w-4 h-4 text-blue-600"
                  />
                  <Wallet className="w-5 h-5 text-blue-400" />
                  <span className="text-white">PayPal (Instant)</span>
                </label>
                
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="method"
                    value="stripe"
                    checked={selectedMethod === 'stripe'}
                    onChange={(e) => setSelectedMethod(e.target.value)}
                    className="w-4 h-4 text-blue-600"
                  />
                  <CreditCard className="w-5 h-5 text-blue-400" />
                  <span className="text-white">Stripe (Same day)</span>
                </label>
              </div>
            </div>

            <button
              onClick={handleWithdrawal}
              disabled={isProcessing || !withdrawalAmount || parseFloat(withdrawalAmount) <= 0}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 transition-all duration-200 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isProcessing ? 'Processing...' : 'Request Withdrawal'}
            </button>
          </div>

          <div className="bg-white/5 rounded-xl p-6 border border-white/10">
            <h4 className="text-lg font-semibold text-white mb-4">Withdrawal Information</h4>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-blue-200">Processing Fee:</span>
                <span className="text-white">Free</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-200">Minimum Amount:</span>
                <span className="text-white">$10</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-200">Maximum Amount:</span>
                <span className="text-white">$50,000/day</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-200">Processing Time:</span>
                <span className="text-white">1-3 business days</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
        <h3 className="text-2xl font-bold text-white mb-6">Transaction History</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/20">
                <th className="text-left py-3 px-4 text-blue-200 font-medium">Date</th>
                <th className="text-left py-3 px-4 text-blue-200 font-medium">Type</th>
                <th className="text-left py-3 px-4 text-blue-200 font-medium">Amount</th>
                <th className="text-left py-3 px-4 text-blue-200 font-medium">Method</th>
                <th className="text-left py-3 px-4 text-blue-200 font-medium">Status</th>
                <th className="text-left py-3 px-4 text-blue-200 font-medium">Description</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction) => (
                <tr key={transaction.id} className="border-b border-white/10 hover:bg-white/5">
                  <td className="py-3 px-4 text-white">
                    {transaction.date.toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`capitalize ${
                      transaction.type === 'deposit' ? 'text-green-400' : 
                      transaction.type === 'withdrawal' ? 'text-blue-400' : 'text-yellow-400'
                    }`}>
                      {transaction.type}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-white font-semibold">
                    {transaction.type === 'deposit' ? '+' : '-'}${transaction.amount.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-blue-200">{transaction.method}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(transaction.status)}
                      <span className={`capitalize ${getStatusColor(transaction.status)}`}>
                        {transaction.status}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-blue-200">{transaction.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}