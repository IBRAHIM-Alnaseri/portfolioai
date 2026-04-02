import { verifyWebhook } from '@/lib/lemonsqueezy'
import { unlockPro } from '@/lib/supabase'

export async function POST(req) {
  const body = await req.text()
  const signature = req.headers.get('x-signature')

  // 1. Verify the webhook is actually from LemonSqueezy
  if (!verifyWebhook(body, signature)) {
    console.error('Webhook signature failed')
    return Response.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const event = JSON.parse(body)
  const eventName = event.meta?.event_name

  // 2. Handle the event
  switch (eventName) {

    // User completed purchase → payment successful
    case 'order_created': {
      const userId = event.meta?.custom_data?.user_id

      if (userId) {
        // Flip is_pro = true in Supabase → Pro features unlock immediately
        await unlockPro(userId)
        console.log(`✓ Pro unlocked for user ${userId}`)
      }
      break
    }

    // Subscription cancelled → could revoke Pro here
    case 'subscription_cancelled': {
      console.log('⚠ Subscription cancelled')
      // Add logic here to flip is_pro back to false if needed
      break
    }

    default:
      break
  }

  return Response.json({ received: true })
}
