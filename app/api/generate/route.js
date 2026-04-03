import { auth } from '@clerk/nextjs/server'
import { generatePortfolio } from '@/lib/ai'
import { savePortfolio, checkUsageLimit, incrementUsage } from '@/lib/supabase'

export async function POST(req) {
  // 1. Auth check
  const { userId } = auth()
  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // 2. Parse FormData (supports both text and file uploads)
  let name, title, cvText, theme, fileBase64, mimeType

  const contentType = req.headers.get('content-type') || ''

  if (contentType.includes('multipart/form-data')) {
    const formData = await req.formData()
    name    = formData.get('name')    || ''
    title   = formData.get('title')   || ''
    cvText  = formData.get('cvText')  || ''
    theme   = formData.get('theme')   || 'minimal'
    const file = formData.get('file')

    if (file && file.size > 0) {
      const buffer = await file.arrayBuffer()
      fileBase64 = Buffer.from(buffer).toString('base64')
      mimeType   = file.type
    }
  } else {
    const body = await req.json()
    name    = body.name    || ''
    title   = body.title   || ''
    cvText  = body.cvText  || ''
    theme   = body.theme   || 'minimal'
  }

  // 3. Require at least name + (cvText or file)
  if (!name || (!cvText && !fileBase64)) {
    return Response.json({ error: 'Please provide your name and CV details.' }, { status: 400 })
  }

  // 4. Check usage limit (Free: 3/day, Pro: 10/day)
  const usageCheck = await checkUsageLimit(userId)
  if (!usageCheck.allowed) {
    return Response.json({
      error: `Daily limit reached (${usageCheck.used}/${usageCheck.limit}). ${usageCheck.isPro ? 'Contact support.' : 'Upgrade to Pro for 10 generations/day.'}`,
      limitReached: true,
    }, { status: 429 })
  }

  try {
    // 5. Run the 3-model AI pipeline
    const portfolioData = await generatePortfolio({
      name,
      title: title || name,
      cvText: cvText || `Name: ${name}`,
      fileBase64,
      mimeType,
    })

    // 6. Save to Supabase
    const saved = await savePortfolio({ userId, portfolioData, theme })

    // 7. Track usage
    await incrementUsage(userId)

    // 8. Return slug for redirect
    return Response.json({ slug: saved.slug, portfolio: portfolioData })

  } catch (err) {
    console.error('Generation error:', err)
    return Response.json({ error: err.message || 'Generation failed. Please try again.' }, { status: 500 })
  }
}
