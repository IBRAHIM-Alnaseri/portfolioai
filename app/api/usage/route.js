import { auth } from '@clerk/nextjs/server'
import { checkUsage, isProUser } from '@/lib/supabase'

export async function GET() {
  const { userId } = auth()
  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const [used, isPro] = await Promise.all([
      checkUsage(userId),
      isProUser(userId),
    ])

    const limit = isPro ? 10 : 3

    return Response.json({ used, limit, isPro, remaining: Math.max(0, limit - used) })
  } catch {
    return Response.json({ used: 0, limit: 3, isPro: false, remaining: 3 })
  }
}
