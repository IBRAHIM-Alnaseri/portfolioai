import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

/**
 * generatePortfolio()
 * Takes raw CV input → returns structured portfolio JSON
 *
 * @param {string} name       - User's full name
 * @param {string} title      - Job title
 * @param {string} cvText     - Raw CV / background info
 * @returns {Object}          - Structured portfolio data
 */
export async function generatePortfolio({ name, title, cvText }) {
  const prompt = `You are a professional portfolio writer and career strategist.

Transform this person's CV into a polished, professional portfolio profile.

Name: ${name}
Job Title: ${title}
CV / Background:
${cvText}

Return ONLY valid JSON (no markdown, no explanation) in this exact structure:
{
  "name": "Full name",
  "title": "Professional job title",
  "headline": "One powerful sentence capturing their professional identity",
  "bio": "3-4 sentences in third person, confident and compelling. Highlight unique value. Never use clichés like 'passionate professional'.",
  "skills": ["skill1", "skill2", "skill3", "skill4", "skill5", "skill6", "skill7", "skill8"],
  "projects": [
    {
      "name": "Project name",
      "description": "2 sentences: what it is and why it matters.",
      "type": "Category (e.g. Residential, SaaS, Research)"
    }
  ],
  "experience": [
    {
      "role": "Job Title",
      "company": "Company Name",
      "year": "Year or period (e.g. 2021–2023)"
    }
  ]
}

Rules:
- If CV lacks project details, invent 2-3 plausible projects based on their field
- Skills must be specific (e.g. "Revit" not "Software", "React" not "Coding")
- Minimum 3 projects, minimum 2 experience entries
- Return ONLY the raw JSON object — no markdown fences, no extra text`

  const message = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }],
  })

  const raw = message.content[0].text.trim()

  // Strip markdown fences if present
  const clean = raw.replace(/```json|```/g, '').trim()

  try {
    return JSON.parse(clean)
  } catch {
    throw new Error('Failed to parse AI response. Please try again.')
  }
}
