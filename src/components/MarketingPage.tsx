import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Crown, Zap, TrendingUp, Shield, Star, Check, ArrowRight } from 'lucide-react';
import { STRIPE_CONFIG } from '../lib/env';

const stripePromise = STRIPE_CONFIG.publicKey 
  ? loadStripe(STRIPE_CONFIG.publicKey)
  : null;

interface PricingPlan {
  id: string;
  name: string;
  price: number;
  interval: string;
  features: string[];
  popular?: boolean;
  stripePriceId: string;
}

export default function MarketingPage() {
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const plans: PricingPlan[] = [
    {
      id: 'starter',
      name: 'Starter',
      price: 29,
      interval: 'month',
      stripePriceId: 'price_starter_monthly',
      features: [
        'Up to 3 automated businesses',
        'Basic AI optimization',
        'Email support',
        'Revenue tracking',
        'Mobile app access'
      ]
    },
    {
      id: 'pro',
      name: 'Professional',
      price: 99,
      interval: 'month',
      stripePriceId: 'price_pro_monthly',
      popular: true,
      features: [
        'Unlimited automated businesses',
        'Advanced AI optimization',
        'Priority support',
        'Advanced analytics',
        'API access',
        'Custom integrations',
        'Bulk supplier tools',
        'Smart product generator'
      ]
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 299,
      interval: 'month',
      stripePriceId: 'price_enterprise_monthly',
      features: [
        'Everything in Professional',
        'Dedicated account manager',
        'Custom AI training',
        'White-label solution',
        'Advanced security',
        'SLA guarantee',
        'Custom integrations',
        'Onboarding assistance'
      ]
    }
  ];

  const handleSubscribe = async (plan: PricingPlan) => {
    setIsLoading(plan.id);
    
    try {
      if (!stripePromise) {
        alert('Payment system is not configured. Please contact support.');
        setIsLoading(null);
        return;
      }
      
      const stripe = await stripePromise;
      if (!stripe) throw new Error('Stripe failed to load');

      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: plan.stripePriceId,
          planName: plan.name,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const session = await response.json();

      const result = await stripe.redirectToCheckout({
        sessionId: session.id,
      });

      if (result.error) {
        throw new Error(result.error.message);
      }
    } catch (error) {
      console.error('Error:', error);
      alert(`Payment failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <Crown className="w-20 h-20 text-yellow-400" />
            </div>
            <h1 className="text-6xl font-bold text-white mb-6">
              Build Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Automated</span> Business Empire
            </h1>
            <p className="text-xl text-blue-200 max-w-3xl mx-auto mb-8">
              Transform any project into a revenue-generating business with our AI-powered automation platform. 
              Launch, optimize, and scale your businesses while you sleep.
            </p>
            <div className="flex items-center justify-center space-x-8 mb-12">
              <div className="flex items-center space-x-2">
                <Star className="w-5 h-5 text-yellow-400" />
                <span className="text-white">4.9/5 Rating</span>
              </div>
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-green-400" />
                <span className="text-white">$2M+ Generated</span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-blue-400" />
                <span className="text-white">Enterprise Security</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">Everything You Need to Succeed</h2>
          <p className="text-xl text-blue-200">Powerful features designed to maximize your revenue potential</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
            <Zap className="w-12 h-12 text-yellow-400 mb-4" />
            <h3 className="text-xl font-bold text-white mb-3">AI-Powered Automation</h3>
            <p className="text-blue-200">
              Our advanced AI automatically fixes bugs, optimizes performance, and implements revenue streams in your projects.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
            <TrendingUp className="w-12 h-12 text-green-400 mb-4" />
            <h3 className="text-xl font-bold text-white mb-3">Revenue Optimization</h3>
            <p className="text-blue-200">
              Smart algorithms continuously optimize your businesses for maximum profitability and growth.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
            <Shield className="w-12 h-12 text-blue-400 mb-4" />
            <h3 className="text-xl font-bold text-white mb-3">Enterprise Security</h3>
            <p className="text-blue-200">
              Bank-level security ensures your businesses and revenue streams are protected 24/7.
            </p>
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">Choose Your Success Plan</h2>
          <p className="text-xl text-blue-200">Start building your automated business empire today</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative bg-white/10 backdrop-blur-lg rounded-2xl p-8 border ${
                plan.popular ? 'border-blue-400 ring-2 ring-blue-400/50' : 'border-white/20'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                <div className="flex items-center justify-center mb-4">
                  <span className="text-4xl font-bold text-white">${plan.price}</span>
                  <span className="text-blue-200 ml-2">/{plan.interval}</span>
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center space-x-3">
                    <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                    <span className="text-blue-200">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSubscribe(plan)}
                disabled={isLoading === plan.id}
                className={`w-full py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${
                  plan.popular
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700'
                    : 'bg-white/10 text-white border border-white/20 hover:bg-white/20'
                }`}
              >
                {isLoading === plan.id ? (
                  'Processing...'
                ) : (
                  <span className="flex items-center justify-center space-x-2">
                    <span>Get Started</span>
                    <ArrowRight className="w-4 h-4" />
                  </span>
                )}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-lg border-t border-white/20">
        <div className="max-w-7xl mx-auto px-6 py-16 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">Ready to Build Your Empire?</h2>
          <p className="text-xl text-blue-200 mb-8">
            Join thousands of entrepreneurs who are already generating passive income with DreamSeller Pro
          </p>
          <button
            onClick={() => handleSubscribe(plans[1])} // Default to Pro plan
            className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-4 rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 transition-all duration-200 transform hover:scale-105 shadow-lg text-lg"
          >
            Start Your Free Trial
          </button>
        </div>
      </div>
    </div>
  );
}