import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    if (req.method === 'POST') {
      const { priceId, customerId } = req.body;

      if (!priceId) {
        return res.status(400).json({ error: 'Price ID is required' });
      }

      // Create Stripe Checkout Session
      const session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        payment_method_types: ['card'],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        success_url: `${process.env.VERCEL_URL || 'https://localhost:3000'}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.VERCEL_URL || 'https://localhost:3000'}/subscription/cancel`,
        customer: customerId,
      });

      res.status(200).json({ sessionId: session.id });
    } else if (req.method === 'GET') {
      // Get subscription status
      const { sessionId } = req.query;

      if (!sessionId) {
        return res.status(400).json({ error: 'Session ID is required' });
      }

      const session = await stripe.checkout.sessions.retrieve(sessionId);
      res.status(200).json({ session });
    } else {
      res.setHeader('Allow', ['POST', 'GET']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Stripe API Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}