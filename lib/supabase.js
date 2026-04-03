import { createClient } from '@supabase/supabase-js'

// Public client
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

// Server client (service role for usage tracking)
const getServerClient = () => {
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )
  }
  return supabase
}

// Save a new portfolio to the database
export async function savePortfolio({ userId, portfolioData, theme }) {
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
    }, { onConflict: 'user_id' })
    .select()
    .single()

  if (error) throw error
  return data
}

// Get a portfolio by public slug
export async function getPortfolioBySlug(slug) {
  const { data } = await supabase
    .from('portfolios')
    .select('*')
    .eq('slug', slug)
    .single()
  return data || null
}

// Get the current user's portfolio
export async function getMyPortfolio(userId) {
  const { data } = await supabase
    .from('portfolios')
    .select('*')
    .eq('user_id', userId)
    .single()
  return data || null
}

// Increment view count
export async function incrementViews(slug) {
  await supabase.rpc('increment_views', { portfolio_slug: slug })
}

// Unlock Pro after payment
export async function unlockPro(userId) {
  const { error } = await supabase
    .from('portfolios')
    .update({ is_pro: true })
    .eq('user_id', userId)
  if (error) throw error
}

// Check daily usage limit (Free: 3/day, Pro: 10/day)
export async function checkUsageLimit(userId) {
  const db = getServerClient()
  const today = new Date().toISOString().slice(0, 10)

  const { data: usage } = await db
    .from('usage')
    .select('count')
    .eq('user_id', userId)
    .eq('date', today)
    .single()

  const { data: portfolio } = await supabase
    .from('portfolios')
    .select('is_pro')
    .eq('user_id', userId)
    .single()

  const isPro  = portfolio?.is_pro || false
  const limit  = isPro ? 10 : 3
  const used   = usage?.count || 0

  return { allowed: used < limit, used, limit, isPro }
}

// Increment usage count
export async function incrementUsage(userId) {
  const db = getServerClient()
  const today = new Date().toISOString().slice(0, 10)
  await db.rpc('increment_usage', { p_user_id: userId, p_date: today })
}
