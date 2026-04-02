import Stripe from 'stripe'

// Server-side Stripe client (never expose secret key to browser)
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-04-10',
})

// Plan definitions — match these to your Stripe Price IDs
export const PLANS = {
  pro: {
    name: 'Pro',
    price: '$9/mo',
    priceId: process.env.STRIPE_PRO_PRICE_ID,
    features: [
      'Remove "Made with PortfolioAI" watermark',
      'Connect your own custom domain',
      'Visitor analytics dashboard',
      '5 premium portfolio themes',
      'Contact form',
    ],
  },
  proPlus: {
    name: 'Pro+',
    price: '$19/mo',
    priceId: process.env.STRIPE_PROPLUS_PRICE_ID,
    features: [
      'Everything in Pro',
      'AI portfolio rewrite (refresh anytime)',
      'SEO optimization',
      'LinkedIn profile import',
      'Priority support',
    ],
  },
}
