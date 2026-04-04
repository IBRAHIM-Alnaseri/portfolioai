import { createClient } from '@supabase/supabase-js'

// ── Public client (use in browser / React components) ──
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

// ── Save a new portfolio to the database ──
export async function savePortfolio({ userId, portfolioData, theme }) {
  // Create a URL-safe slug from the person's name
  // e.g. "Ibrahim Al-Naseri" → "ibrahim-al-naseri"
  const slug = portfolioData.name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .slice(0, 40)

  const { data, error } = await supabase
    .from('portfolios')
    .upsert({
      user_id: userId,
      slug,
      portfolio_data: portfolioData,
      theme: theme || 'minimal',
      is_pro: false,
    }, {
      onConflict: 'user_id', // one portfolio per user (update if exists)
    })
    .select()
    .single()

  if (error) throw error
  return data // { id, slug, ... }
}

// ── Get a portfolio by its public slug ──
export async function getPortfolioBySlug(slug) {
  const { data, error } = await supabase
    .from('portfolios')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error) return null
  return data
}

// ── Get the current user's portfolio ──
export async function getMyPortfolio(userId) {
  const { data, error } = await supabase
    .from('portfolios')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error) return null
  return data
}

// ── Increment view count (called when someone views a portfolio) ──
export async function incrementViews(slug) {
  await supabase.rpc('increment_views', { portfolio_slug: slug })
}

// ── Unlock Pro features after Stripe payment ──
export async function unlockPro(userId) {
  const { error } = await supabase
    .from('portfolios')
    .update({ is_pro: true })
    .eq('user_id', userId)

  if (error) throw error
}
