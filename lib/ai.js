import Anthropic from '@anthropic-ai/sdk'
import OpenAI from 'openai'
import { GoogleGenerativeAI } from '@google/generative-ai'

const claude = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || 'dummy' })
const gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'dummy')

// STEP 1: GEMINI - Extract CV data from text or file
async function extractWithGemini({ cvText, fileBase64, mimeType }) {
  const model = gemini.getGenerativeModel({ model: 'gemini-1.5-pro' })

  const prompt = `You are a CV parser. Extract all information from this CV/resume.
Return ONLY valid JSON with these fields:
{
  "name": "full name",
  "title": "job title",
  "email": "email if present or null",
  "location": "city/country if present or null",
  "summary": "any existing summary or objective or null",
  "skills": ["skill1", "skill2"],
  "experience": [{"role":"", "company":"", "duration":"", "description":""}],
  "education": [{"degree":"", "institution":"", "year":""}],
  "projects": [{"name":"", "description":"", "tech":""}],
  "languages": ["language1"],
  "certifications": ["cert1"]
}
Extract everything you can find. If a field is missing, use an empty array or null.`

  let result
  if (fileBase64 && mimeType) {
    result = await model.generateContent([
      prompt,
      { inlineData: { data: fileBase64, mimeType } }
    ])
  } else {
    result = await model.generateContent(`${prompt}\n\nCV TEXT:\n${cvText}`)
  }

  const raw = result.response.text().replace(/```json|```/g, '').trim()
  return JSON.parse(raw)
}

// STEP 2: CLAUDE - Write the portfolio content
async function writeWithClaude(extractedData) {
  const message = await claude.messages.create({
    model: 'claude-sonnet-4-20250514',
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
- Project descriptions: 2 sentences each - what it is and the real-world impact
- Skills: Be specific (e.g. "AutoCAD" not "Design Software", "React.js" not "Coding")
- If projects are missing, invent 2-3 realistic ones based on their field
- Minimum 3 projects, minimum 2 experience entries
- Make everything sound like a top professional in their field

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

// STEP 3: GPT-4 - Polish and perfect the content
async function polishWithGPT4(portfolioContent) {
  const completion = await openai.chat.completions.create({
    model: 'gpt-4-turbo',
    messages: [{
      role: 'system',
      content: `You are a professional editor specializing in career branding and portfolio writing.
Your job: take good content and make it exceptional.
- Remove any generic or cliche phrases
- Make the bio more specific and memorable
- Ensure the headline is powerful and unique
- Make project descriptions more impactful, focus on results and value
- Ensure skills are specific and relevant
- Tone: confident but not arrogant
- Return the SAME JSON structure with improved content only`
    }, {
      role: 'user',
      content: `Polish and improve this portfolio content. Return ONLY the improved JSON, no explanation:\n\n${JSON.stringify(portfolioContent, null, 2)}`
    }],
    response_format: { type: 'json_object' }
  })

  return JSON.parse(completion.choices[0].message.content)
}

// MAIN FUNCTION - Runs all 3 steps with graceful fallbacks
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
      console.log('Step 1: No Gemini key - using raw CV text directly')
      extracted = { name, title, summary: cvText, skills: [], experience: [], projects: [] }
    }

    console.log('Step 2: Claude writing portfolio content...')
    const written = await writeWithClaude(extracted)

    let final = written
    if (hasOpenAI) {
      console.log('Step 3: GPT-4 polishing content...')
      try {
        final = await polishWithGPT4(written)
      } catch (err) {
        console.warn('GPT-4 polish failed, using Claude output:', err.message)
        final = written
      }
    } else {
      console.log('Step 3: No OpenAI key - skipping polish step')
    }

    return final

  } catch (err) {
    console.error('AI pipeline error:', err)
    console.log('Falling back to Claude only...')
    return await writeWithClaude({
      name: name || 'Professional',
      title: title || 'Expert',
      summary: cvText,
      skills: [],
      experience: [],
      projects: [],
    })
  }
}
