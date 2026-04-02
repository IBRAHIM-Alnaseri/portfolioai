// ── LemonSqueezy — payment processor (Stripe alternative, works great in Turkey)
// Docs: https://docs.lemonsqueezy.com/api

// Plan definitions — match these to your LemonSqueezy variant IDs
export const PLANS = {
  pro: {
    name: 'Pro',
    price: '$9/mo',
    // You'll get this ID from LemonSqueezy after creating your product
    variantId: process.env.LEMONSQUEEZY_PRO_VARIANT_ID,
    checkoutUrl: process.env.LEMONSQUEEZY_PRO_CHECKOUT_URL,
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
    variantId: process.env.LEMONSQUEEZY_PROPLUS_VARIANT_ID,
    checkoutUrl: process.env.LEMONSQUEEZY_PROPLUS_CHECKOUT_URL,
    features: [
      'Everything in Pro',
      'AI portfolio rewrite (refresh anytime)',
      'SEO optimization',
      'LinkedIn profile import',
      'Priority support',
    ],
  },
}

// ── Create a checkout URL for a user ──
// LemonSqueezy is much simpler than Stripe — you just redirect to a checkout URL
// and add the user's email as a parameter
export function getCheckoutUrl(plan, userEmail, userId) {
  const baseUrl = PLANS[plan]?.checkoutUrl
  if (!baseUrl) throw new Error('Invalid plan')

  // Add email and user ID to the checkout URL
  // LemonSqueezy will pre-fill the email and pass userId back in the webhook
  const url = new URL(baseUrl)
  url.searchParams.set('checkout[email]', userEmail)
  url.searchParams.set('checkout[custom][user_id]', userId)

  return url.toString()
}

// ── Verify a webhook signature from LemonSqueezy ──
export function verifyWebhook(rawBody, signature) {
  const crypto = require('crypto')
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET

  const hmac = crypto
    .createHmac('sha256', secret)
    .update(rawBody)
    .digest('hex')

  return hmac === signature
}
