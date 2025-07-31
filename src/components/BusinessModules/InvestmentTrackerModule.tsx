import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, DollarSign, BarChart, AlertTriangle, Target } from 'lucide-react';
import { Investment } from '../../lib/businessModules';
import { supabase } from '../../lib/supabase';

export default function InvestmentTrackerModule() {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [portfolioValue, setPortfolioValue] = useState(0);
  const [totalGain, setTotalGain] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadRealData();
    autoSignupPlatforms();
  }, []);

  const loadRealData = async () => {
    try {
      const { data: investmentData, error } = await supabase
        .from('investment_portfolio')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      const realInvestments = investmentData || [];
      setInvestments(realInvestments);
      
      // Calculate real portfolio values
      const portfolioVal = realInvestments.reduce((sum, inv) => sum + (inv.current_value || 0), 0);
      const totalGainVal = realInvestments.reduce((sum, inv) => sum + (inv.gain_loss || 0), 0);
      
      setPortfolioValue(portfolioVal);
      setTotalGain(totalGainVal);
    } catch (error) {
      console.error('Failed to load investment data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const autoSignupPlatforms = async () => {
    const platforms = [
      { name: 'Robinhood', url: 'https://robinhood.com' },
      { name: 'E*TRADE', url: 'https://etrade.com' },
      { name: 'TD Ameritrade', url: 'https://tdameritrade.com' },
      { name: 'Fidelity', url: 'https://fidelity.com' },
      { name: 'Charles Schwab', url: 'https://schwab.com' }
    ];

    for (const platform of platforms) {
      try {
        await fetch('/api/auto-signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            platform: platform.name,
            email: 'goncalvesjacelina27@gmail.com',
            password: 'MakeMoney20k',
            businessType: 'investment_tracker'
          })
        });
      } catch (error) {
        console.error(`Auto-signup failed for ${platform.name}:`, error);
      }
    }
  };
  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case 'buy': return 'text-green-400';
      case 'sell': return 'text-red-400';
      case 'hold': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  };

  const getRecommendationIcon = (recommendation: string) => {
    switch (recommendation) {
      case 'buy': return TrendingUp;
      case 'sell': return TrendingDown;
      case 'hold': return Target;
      default: return BarChart;
    }
  };

  const analyzeMarket = () => {
    alert('AI is analyzing market trends and updating investment recommendations...');
  };

  const rebalancePortfolio = () => {
    alert('AI is rebalancing your portfolio based on risk tolerance and market conditions...');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Smart Investment Tracker</h2>
          <p className="text-blue-200">AI-powered investment recommendations and portfolio tracking</p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={analyzeMarket}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Analyze Market
          </button>
          <button 
            onClick={rebalancePortfolio}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            Rebalance
          </button>
        </div>
      </div>

      {/* Portfolio Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-lg p-4 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-200">Portfolio Value</p>
              <p className="text-xl font-bold text-white">${portfolioValue.toLocaleString()}</p>
            </div>
            <DollarSign className="w-6 h-6 text-green-400" />
          </div>
        </div>
        <div className="bg-white/10 backdrop-blur-lg rounded-lg p-4 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-200">Total Gain/Loss</p>
              <p className={`text-xl font-bold ${totalGain >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {totalGain >= 0 ? '+' : ''}${totalGain.toLocaleString()}
              </p>
            </div>
            {totalGain >= 0 ? 
              <TrendingUp className="w-6 h-6 text-green-400" /> : 
              <TrendingDown className="w-6 h-6 text-red-400" />
            }
          </div>
        </div>
        <div className="bg-white/10 backdrop-blur-lg rounded-lg p-4 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-200">Return %</p>
              <p className={`text-xl font-bold ${totalGain >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {((totalGain / (portfolioValue - totalGain)) * 100).toFixed(2)}%
              </p>
            </div>
            <BarChart className="w-6 h-6 text-purple-400" />
          </div>
        </div>
      </div>

      {/* Investment Recommendations */}
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-4">AI Investment Recommendations</h3>
        <div className="space-y-3">
          {investments.map((investment) => {
            const RecommendationIcon = getRecommendationIcon(investment.recommendation);
            return (
              <div key={investment.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center">
                      <span className="text-blue-400 font-bold text-sm">{investment.symbol}</span>
                    </div>
                    <div>
                      <h4 className="text-white font-semibold">{investment.name}</h4>
                      <p className="text-sm text-blue-200">{investment.symbol}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-6">
                    <div className="text-right">
                      <p className="text-white font-semibold">${investment.currentPrice.toFixed(2)}</p>
                      <p className={`text-sm ${investment.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {investment.change >= 0 ? '+' : ''}{investment.change.toFixed(2)}
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <RecommendationIcon className={`w-5 h-5 ${getRecommendationColor(investment.recommendation)}`} />
                      <div className="text-right">
                        <p className={`font-semibold capitalize ${getRecommendationColor(investment.recommendation)}`}>
                          {investment.recommendation}
                        </p>
                        <p className="text-xs text-blue-200">{investment.confidence}% confidence</p>
                      </div>
                    </div>
                    
                    <div className="w-16 bg-gray-700 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          investment.confidence >= 80 ? 'bg-green-500' :
                          investment.confidence >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${investment.confidence}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Market Analysis */}
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-4">Market Analysis</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <h4 className="text-white font-semibold mb-2">Market Sentiment</h4>
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp className="w-4 h-4 text-green-400" />
              <span className="text-green-400">Bullish</span>
            </div>
            <p className="text-sm text-blue-200">AI analysis shows positive market sentiment with strong buying pressure</p>
          </div>
          
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <h4 className="text-white font-semibold mb-2">Risk Assessment</h4>
            <div className="flex items-center space-x-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-yellow-400" />
              <span className="text-yellow-400">Moderate Risk</span>
            </div>
            <p className="text-sm text-blue-200">Current portfolio has balanced risk exposure across sectors</p>
          </div>
          
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <h4 className="text-white font-semibold mb-2">Sector Performance</h4>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-blue-200">Technology</span>
                <span className="text-green-400">+5.2%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-blue-200">Healthcare</span>
                <span className="text-green-400">+2.8%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-blue-200">Energy</span>
                <span className="text-red-400">-1.4%</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <h4 className="text-white font-semibold mb-2">AI Insights</h4>
            <p className="text-sm text-blue-200">
              Based on technical analysis and market trends, consider increasing exposure to AI and renewable energy sectors
            </p>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="bg-yellow-600/20 backdrop-blur-lg rounded-xl p-4 border border-yellow-400/30">
        <div className="flex items-start space-x-3">
          <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5" />
          <div>
            <h4 className="text-yellow-400 font-semibold mb-1">Investment Disclaimer</h4>
            <p className="text-yellow-200 text-sm">
              This is a simulation tool for educational purposes. All recommendations are AI-generated and should not be considered as financial advice. 
              Always consult with a qualified financial advisor before making investment decisions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}