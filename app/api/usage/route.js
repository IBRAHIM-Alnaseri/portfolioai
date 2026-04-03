import { auth } from '@clerk/nextjs/server'
import { checkUsageLimit } from '@/lib/supabase'

export async function GET() {
  const { userId } = auth()
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const usage = await checkUsageLimit(userId)
    return Response.json(usage)
  } catch (err) {
    return Response.json({ used: 0, limit: 3, isPro: false, allowed: true })
  }
}
