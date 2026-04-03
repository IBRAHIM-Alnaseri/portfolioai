import Anthropic from '@anthropic-ai/sdk'
import OpenAI from 'openai'
import { GoogleGenerativeAI } from '@google/generative-ai'

// Lazy clients — only instantiated when keys are present
const getClaudeClient = () => process.env.ANTHROPIC_API_KEY
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || 'dummy' })
const gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'dummy')

// STEP 1: GEMINI — Extract CV data from text or file
async function extractWithGemini({ cvText, fileBase64, mimeType }) {
  const model = gemini.getGenerativeModel({ model: 'gemini-1.5-pro' })

  const prompt = `You are a CV parser. Extract all information from this CV/resume.
Return ONLY valid JSON with these fields:
{
  "name": "full name",
  "title": "professional title",
  "summary": "professional summary",
  "skills": ["skill1", "skill2"],
  "experience": [{"role":"title","company":"name","year":"2020-2023","description":"what they did"}],
  "projects": [{"name":"project","description":"what it does","tech":["tech1"]}],
  "contact": {"email":"","linkedin":"","github":"","website":""}
}
${fileBase64 ? 'Analyze the attached file.' : `CV TEXT:\n${cvText}`}`

  const parts = fileBase64
    ? [prompt, { inlineData: { mimeType, data: fileBase64 } }]
    : [prompt]

  const result = await model.generateContent(parts)
  const raw = result.response.text().replace(/```json|```/g, '').trim()
  return JSON.parse(raw)
}

// Pure-JS fallback — builds a clean portfolio from extracted data without AI
function buildPortfolioFromExtracted(data) {
  const name = data.name || 'Professional'
  const title = data.title || 'Expert'
  const skills = Array.isArray(data.skills) && data.skills.length > 0
    ? data.skills.slice(0, 8)
    : ['Problem Solving', 'Communication', 'Leadership', 'Project Management']
  const projects = Array.isArray(data.projects) && data.projects.length > 0
    ? data.projects.map(p => ({
        name: p.name || p.title || 'Key Project',
        description: p.description || 'A significant project delivering real-world impact.',
        type: p.type || (Array.isArray(p.tech) ? p.tech[0] : 'Project'),
      }))
    : [{ name: 'Featured Project', description: 'A key project demonstrating expertise and delivering measurable results.', type: 'Project' }]
  const experience = Array.isArray(data.experience) && data.experience.length > 0
    ? data.experience.map(e => ({
        role: e.role || e.title || title,
        company: e.company || e.employer || 'Company',
        year: e.year || e.duration || '2020-Present',
      }))
    : [{ role: title, company: 'Professional Practice', year: '2020-Present' }]
  return { name, title, headline: `${title} delivering expertise and measurable impact`, bio: `${name} is an experienced ${title} with a strong track record of success. ${data.summary || 'They bring deep expertise and dedication to every project.'}`, skills, projects, experience, contact: data.contact || {} }
}

// STEP 2: CLAUDE — Write polished portfolio content
async function writeWithClaude(extractedData) {
  const claude = getClaudeClient()
  if (!claude) {
    console.log('Step 2: No Anthropic key — using structured fallback')
    return buildPortfolioFromExtracted(extractedData)
  }
  const message = await claude.messages.create({
    model: 'claude-opus-4-5',
    max_tokens: 1800,
    messages: [{
      role: 'user',
      content: `You are an elite portfolio copywriter.

Using this CV data, write stunning portfolio content that will impress clients and employers.

CV DATA:
${JSON.stringify(extractedData, null, 2)}

Rules:
- Bio: 3-4 sentences, third person, confident and specific. NEVER use "passionate", "hardworking", "team player", "results-driven"
- Headline: One powerful, memorable sentence about who they are professionally
- Project descriptions: 2 sentences each — what it is and the real-world impact
- Skills: Be specific (e.g. "AutoCAD" not "Design Software", "React.js" not "Coding")
- If projects are missing, invent 2-3 realistic ones based on their field
- Minimum 3 projects, minimum 2 experience entries
- Make everything sound impressive but authentic

Return ONLY valid JSON (no markdown fences):
{
  "name": "full name",
  "title": "professional title",
  "headline": "one powerful sentence",
  "bio": "3-4 sentence professional bio",
  "skills": ["specific skill 1", "skill 2", "skill 3", "skill 4", "skill 5", "skill 6"],
  "projects": [
    {"name":"Project name", "description":"2 sentences.", "type":"category"}
  ],
  "experience": [
    {"role":"Job Title", "company":"Company Name", "year":"2021-2023"}
  ]
}`
    }]
  })
  const raw = message.content[0].text.replace(/```json|```/g, '').trim()
  return JSON.parse(raw)
}

// STEP 3: GPT-4 — Polish and perfect the content
async function polishWithGPT4(portfolioContent) {
  const completion = await openai.chat.completions.create({
    model: 'gpt-4-turbo',
    messages: [{
      role: 'system',
      content: 'You are a professional editor specializing in career branding. Improve the portfolio content to be more compelling, specific, and impactful. Keep the same JSON structure but elevate the writing. Return ONLY valid JSON.',
    }, {
      role: 'user',
      content: JSON.stringify(portfolioContent),
    }],
    temperature: 0.7,
  })
  const raw = completion.choices[0].message.content.replace(/```json|```/g, '').trim()
  return JSON.parse(raw)
}

// MAIN FUNCTION — Runs all 3 steps with graceful fallbacks
export async function generatePortfolio({ name, title, cvText, fileBase64, mimeType }) {
  const hasGemini = !!process.env.GEMINI_API_KEY
  const hasOpenAI = !!process.env.OPENAI_API_KEY

  try {
    let extracted

    if (hasGemini) {
      console.log('Step 1: Gemini extracting CV data...')
      try {
        extracted = await extractWithGemini({ cvText, fileBase64, mimeType })
      } catch (err) {
        console.warn('Gemini failed, using raw text:', err.message)
        extracted = { name, title, summary: cvText, skills: [], experience: [], projects: [] }
      }
    } else {
      console.log('Step 1: No Gemini key — using raw CV text directly')
      extracted = { name, title, summary: cvText, skills: [], experience: [], projects: [] }
    }

    console.log('Step 2: Writing portfolio content...')
    const written = await writeWithClaude(extracted)

    let final = written
    if (hasOpenAI) {
      console.log('Step 3: GPT-4 polishing content...')
      try {
        final = await polishWithGPT4(written)
      } catch (err) {
        console.warn('GPT-4 polish failed, using step 2 output:', err.message)
        final = written
      }
    } else {
      console.log('Step 3: No OpenAI key — skipping polish step')
    }

    return final

  } catch (err) {
    console.error('AI pipeline error:', err)
    return buildPortfolioFromExtracted({
      name: name || 'Professional',
      title: title || 'Expert',
      summary: cvText,
      skills: [],
      experience: [],
      projects: [],
    })
  }
}
