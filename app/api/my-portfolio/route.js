import { auth } from '@clerk/nextjs/server'
import { getMyPortfolio } from '@/lib/supabase'

export async function GET() {
  const { userId } = auth()
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const portfolio = await getMyPortfolio(userId)
  return Response.json({ portfolio })
}
