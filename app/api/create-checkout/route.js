import { auth, currentUser } from '@clerk/nextjs/server'
import { getCheckoutUrl } from '@/lib/lemonsqueezy'

export async function POST(req) {
  // 1. Check user is logged in
  const { userId } = auth()
  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // 2. Get their email from Clerk
  const user = await currentUser()
  const email = user.emailAddresses[0]?.emailAddress

  // 3. Get which plan they want
  const { plan = 'pro' } = await req.json()

  try {
    // 4. Build the LemonSqueezy checkout URL
    // Much simpler than Stripe — just a URL redirect!
    const checkoutUrl = getCheckoutUrl(plan, email, userId)

    // 5. Return the URL — frontend redirects user there
    return Response.json({ url: checkoutUrl })

  } catch (err) {
    console.error('LemonSqueezy error:', err)
    return Response.json({ error: err.message }, { status: 500 })
  }
}
