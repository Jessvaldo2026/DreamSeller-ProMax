// @ts-nocheck
import Stripe from 'stripe';
import type { NextApiRequest, NextApiResponse } from 'next';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2022-11-15', // ✅ Use the valid Stripe version
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const { user_id, amount, destination_account } = req.body;

  if (!user_id || !amount || !destination_account) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }

  try {
    const transfer = await stripe.transfers.create({
      amount: Math.floor(Number(amount) * 100), // dollars → cents
      currency: 'usd',
      destination: destination_account,
      metadata: { user_id },
    });

    return res.status(200).json({ success: true, transfer });
  } catch (error) {
    console.error('Stripe payout error:', error);
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

