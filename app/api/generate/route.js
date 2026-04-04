import { auth } from '@clerk/nextjs/server'
import { generatePortfolio } from '@/lib/ai'
import { savePortfolio } from '@/lib/supabase'

export async function POST(req) {
  // 1. Check user is logged in (Clerk)
  const { userId } = auth()
  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // 2. Parse request body
  const { name, title, cvText, theme } = await req.json()

  if (!name || !title || !cvText) {
    return Response.json({ error: 'Missing required fields' }, { status: 400 })
  }

  try {
    // 3. Call Claude to generate the portfolio JSON
    const portfolioData = await generatePortfolio({ name, title, cvText })

    // 4. Save to Supabase (linked to this user's ID)
    const saved = await savePortfolio({ userId, portfolioData, theme })

    // 5. Return the public slug so the frontend can redirect
    return Response.json({
      slug: saved.slug,
      portfolio: portfolioData,
    })

  } catch (err) {
    console.error('Generation error:', err)
    return Response.json({ error: err.message }, { status: 500 })
  }
}
