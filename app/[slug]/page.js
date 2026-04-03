import { getPortfolioBySlug } from '@/lib/supabase'
import { notFound } from 'next/navigation'

export async function generateMetadata({ params }) {
  const portfolio = await getPortfolioBySlug(params.slug)
  if (!portfolio) return {}
  const d = portfolio.portfolio_data || {}
  return {
    title: `${d.name || 'Portfolio'} — ${d.title || 'Professional'} | PortfolioAI`,
    description: `${d.name}'s professional portfolio, built with PortfolioAI`,
  }
}

export default async function PortfolioPage({ params }) {
  const portfolio = await getPortfolioBySlug(params.slug)
  if (!portfolio) return notFound()
  const data = portfolio.portfolio_data || {}
  const theme = portfolio.theme || data.theme || 'minimal'
  return <PortfolioRenderer data={data} theme={theme} slug={params.slug} />
}

function Section({ title, t, children }) {
  return (
    <section style={{ marginBottom: 48 }}>
      <h2 style={{ fontSize: 18, fontWeight: 700, color: t.accent, marginBottom: 20, textTransform: 'uppercase', letterSpacing: '0.1em', borderBottom: '1px solid ' + t.border, paddingBottom: 10 }}>
        {title}
      </h2>
      {children}
    </section>
  )
}

function PortfolioRenderer({ data, theme, slug }) {
  const themes = {
    minimal: { bg: '#ffffff', surface: '#f8fafc', text: '#1a1a1a', accent: '#2563eb', border: '#e2e8f0', muted: '#64748b', cardBg: '#ffffff', font: 'Georgia, "Times New Roman", serif', headFont: 'Georgia, serif', pillBg: '#eff6ff', pillText: '#1d4ed8', heroGrad: 'linear-gradient(135deg, #eff6ff 0%, #f0fdf4 100%)' },
    dark: { bg: '#0f172a', surface: '#1e293b', text: '#e2e8f0', accent: '#818cf8', border: '#334155', muted: '#94a3b8', cardBg: '#1e293b', font: 'system-ui, -apple-system, sans-serif', headFont: 'system-ui, sans-serif', pillBg: '#312e81', pillText: '#c7d2fe', heroGrad: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)' },
    glass: { bg: '#06060f', surface: 'rgba(255,255,255,0.04)', text: '#e8e8f0', accent: '#7c6dfa', border: 'rgba(255,255,255,0.08)', muted: '#8080a0', cardBg: 'rgba(255,255,255,0.04)', font: 'system-ui, -apple-system, sans-serif', headFont: 'system-ui, sans-serif', pillBg: 'rgba(124,109,250,0.15)', pillText: '#a08cfc', heroGrad: 'linear-gradient(135deg, #06060f 0%, #0d0a1f 100%)' },
    bold: { bg: '#fafafa', surface: '#f4f4f5', text: '#09090b', accent: '#dc2626', border: '#e4e4e7', muted: '#71717a', cardBg: '#ffffff', font: '"Inter", system-ui, sans-serif', headFont: '"Inter", system-ui, sans-serif', pillBg: '#fee2e2', pillText: '#991b1b', heroGrad: 'linear-gradient(135deg, #fef2f2 0%, #fff7ed 100%)' },
    neon: { bg: '#020208', surface: '#080818', text: '#e0e0ff', accent: '#00ff88', border: '#1a1a3e', muted: '#6060a0', cardBg: '#080818', font: '"Courier New", "Courier", monospace', headFont: '"Courier New", monospace', pillBg: 'rgba(0,255,136,0.1)', pillText: '#00ff88', heroGrad: 'linear-gradient(135deg, #020208 0%, #040818 100%)' },
  }

  const t = themes[theme] || themes.minimal
  const d = data
  const name = d.name || 'Portfolio'
  const title = d.title || ''
  const headline = d.headline || d.about || ''
  const about = d.about || d.bio || ''
  const skills = Array.isArray(d.skills) ? d.skills : []
  const experience = Array.isArray(d.experience) ? d.experience : []
  const projects = Array.isArray(d.projects) ? d.projects : []
  const contact = d.contact || {}

  const isGlass = theme === 'glass'
  const isNeon = theme === 'neon'

  return (
    <div style={{ minHeight: '100vh', background: t.bg, color: t.text, fontFamily: t.font }}>
      {/* Hero */}
      <div style={{ background: t.heroGrad, borderBottom: '1px solid ' + t.border, padding: '64px 24px 48px', position: 'relative', overflow: 'hidden' }}>
        {isGlass && (
          <>
            <div style={{ position: 'absolute', top: -60, right: -60, width: 300, height: 300, borderRadius: '50%', background: 'rgba(124,109,250,0.08)', filter: 'blur(60px)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: -40, left: -40, width: 200, height: 200, borderRadius: '50%', background: 'rgba(250,109,154,0.06)', filter: 'blur(50px)', pointerEvents: 'none' }} />
          </>
        )}
        {isNeon && (
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 40px, rgba(0,255,136,0.02) 40px, rgba(0,255,136,0.02) 41px)', pointerEvents: 'none' }} />
        )}
        <div style={{ maxWidth: 800, margin: '0 auto', position: 'relative' }}>
          {/* Avatar initials */}
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: isNeon ? 'rgba(0,255,136,0.15)' : 'linear-gradient(135deg, ' + t.accent + '33, ' + t.accent + '66)', border: '2px solid ' + t.accent + '55', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, fontWeight: 700, color: t.accent, marginBottom: 20, fontFamily: t.headFont, boxShadow: isNeon ? '0 0 20px rgba(0,255,136,0.2)' : 'none' }}>
            {name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
          </div>
          <h1 style={{ fontSize: 'clamp(32px, 5vw, 52px)', fontWeight: 900, lineHeight: 1.1, margin: '0 0 10px', fontFamily: t.headFont, letterSpacing: theme === 'bold' ? '-0.02em' : 'normal', color: isNeon ? t.accent : t.text, textShadow: isNeon ? '0 0 30px rgba(0,255,136,0.4)' : 'none' }}>
            {name}
          </h1>
          {title && (
            <div style={{ fontSize: 18, color: t.accent, fontWeight: 600, marginBottom: 16, fontFamily: t.headFont }}>
              {title}
            </div>
          )}
          {headline && (
            <p style={{ fontSize: 16, color: t.muted, maxWidth: 560, lineHeight: 1.7, margin: '0 0 24px' }}>
              {headline.length > 200 ? headline.substring(0, 200) + '…' : headline}
            </p>
          )}
          {/* Contact links */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {contact.email && (
              <a href={'mailto:' + contact.email} style={{ padding: '8px 16px', borderRadius: 8, background: t.pillBg, color: t.pillText, textDecoration: 'none', fontSize: 13, fontWeight: 500, border: '1px solid ' + t.border }}>
                ✉️ {contact.email}
              </a>
            )}
            {contact.linkedin && (
              <a href={contact.linkedin.startsWith('http') ? contact.linkedin : 'https://linkedin.com/in/' + contact.linkedin} target="_blank" rel="noopener noreferrer" style={{ padding: '8px 16px', borderRadius: 8, background: t.pillBg, color: t.pillText, textDecoration: 'none', fontSize: 13, fontWeight: 500, border: '1px solid ' + t.border }}>
                LinkedIn ↗
              </a>
            )}
            {contact.github && (
              <a href={contact.github.startsWith('http') ? contact.github : 'https://github.com/' + contact.github} target="_blank" rel="noopener noreferrer" style={{ padding: '8px 16px', borderRadius: 8, background: t.pillBg, color: t.pillText, textDecoration: 'none', fontSize: 13, fontWeight: 500, border: '1px solid ' + t.border }}>
                GitHub ↗
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '48px 24px' }}>

        {/* About */}
        {about && about !== headline && (
          <Section title="About" t={t}>
            <p style={{ color: t.muted, lineHeight: 1.8, fontSize: 15 }}>{about}</p>
          </Section>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <Section title="Skills" t={t}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {skills.map((skill, i) => (
                <span key={i} style={{ padding: '6px 14px', borderRadius: 20, background: t.pillBg, color: t.pillText, fontSize: 13, fontWeight: 500, border: '1px solid ' + t.border, boxShadow: isNeon ? '0 0 8px rgba(0,255,136,0.1)' : 'none' }}>
                  {typeof skill === 'string' ? skill : skill.name || JSON.stringify(skill)}
                </span>
              ))}
            </div>
          </Section>
        )}

        {/* Experience */}
        {experience.length > 0 && (
          <Section title="Experience" t={t}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {experience.map((exp, i) => (
                <div key={i} style={{ background: t.cardBg, border: '1px solid ' + t.border, borderRadius: 12, padding: '20px 24px', backdropFilter: isGlass ? 'blur(8px)' : 'none', boxShadow: isNeon ? '0 0 12px rgba(0,255,136,0.05)' : 'none' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 16, color: t.text }}>{exp.role || exp.title || ''}</div>
                      <div style={{ color: t.accent, fontSize: 14, fontWeight: 500 }}>{exp.company || ''}</div>
                    </div>
                    {exp.period && <div style={{ fontSize: 13, color: t.muted, whiteSpace: 'nowrap' }}>{exp.period}</div>}
                  </div>
                  {(exp.description || exp.bullets) && (
                    <div style={{ color: t.muted, fontSize: 14, lineHeight: 1.7 }}>
                      {Array.isArray(exp.bullets) ? (
                        <ul style={{ margin: 0, paddingLeft: 18 }}>
                          {exp.bullets.map((b, j) => <li key={j} style={{ marginBottom: 4 }}>{b}</li>)}
                        </ul>
                      ) : (
                        exp.description || ''
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Projects */}
        {projects.length > 0 && (
          <Section title="Projects" t={t}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
              {projects.map((proj, i) => (
                <div key={i} style={{ background: t.cardBg, border: '1px solid ' + t.border, borderRadius: 12, padding: '20px 24px', backdropFilter: isGlass ? 'blur(8px)' : 'none', boxShadow: isNeon ? '0 0 12px rgba(0,255,136,0.05)' : 'none' }}>
                  <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 8, color: t.text }}>
                    {proj.url ? (
                      <a href={proj.url} target="_blank" rel="noopener noreferrer" style={{ color: t.accent, textDecoration: 'none' }}>
                        {proj.name || 'Project'} ↗
                      </a>
                    ) : proj.name || 'Project'}
                  </div>
                  {proj.description && <p style={{ color: t.muted, fontSize: 13, lineHeight: 1.6, margin: '0 0 10px' }}>{proj.description}</p>}
                  {proj.tech && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {(Array.isArray(proj.tech) ? proj.tech : proj.tech.split(/[,;]/)).map((tech, j) => (
                        <span key={j} style={{ padding: '3px 10px', borderRadius: 12, background: t.pillBg, color: t.pillText, fontSize: 11, fontWeight: 500 }}>
                          {tech.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Section>
        )}
      </div>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid ' + t.border, padding: '24px', textAlign: 'center', color: t.muted, fontSize: 13 }}>
        Built with <a href="/" style={{ color: t.accent, textDecoration: 'none' }}>PortfolioAI</a>
      </footer>
    </div>
  )
}
