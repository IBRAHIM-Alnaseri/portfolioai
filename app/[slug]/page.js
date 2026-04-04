import { getPortfolioBySlug } from '@/lib/supabase'
import { notFound } from 'next/navigation'

// Generate SEO metadata dynamically per portfolio
export async function generateMetadata({ params }) {
  const portfolio = await getPortfolioBySlug(params.slug)
  if (!portfolio) return {}

  const { name, title, headline } = portfolio.portfolio_data
  return {
    title: `${name} — ${title} | PortfolioAI`,
    description: headline,
  }
}

export default async function PortfolioPage({ params }) {
  // Fetch the portfolio from Supabase
  const portfolio = await getPortfolioBySlug(params.slug)

  if (!portfolio) notFound()

  const { portfolio_data: p, is_pro, theme } = portfolio

  return (
    <div style={{ minHeight: '100vh', background: '#080810', color: '#e8e8f0' }}>

      {/* Toolbar */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(8,8,16,0.9)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid #1e1e30',
        padding: '14px 32px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ fontFamily: 'var(--font-fraunces)', fontSize: 16, fontWeight: 900, fontStyle: 'italic' }}>
          Portfolio<span style={{ color: '#7c6dfa' }}>AI</span>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {!is_pro && (
            <a href="/pricing" style={{
              padding: '8px 18px',
              background: '#7c6dfa',
              borderRadius: 8,
              color: 'white',
              fontSize: 13,
              fontWeight: 500,
              textDecoration: 'none',
            }}>
              ↑ Upgrade to Pro
            </a>
          )}
        </div>
      </nav>

      {/* Portfolio Content */}
      <div style={{ maxWidth: 780, margin: '0 auto', padding: '72px 32px 80px' }}>

        {/* Name + Title */}
        <h1 style={{
          fontFamily: 'var(--font-fraunces)',
          fontSize: 'clamp(40px,7vw,72px)',
          fontWeight: 900,
          letterSpacing: '-0.03em',
          lineHeight: 1.0,
          marginBottom: 8,
        }}>
          {p.name}
        </h1>

        <div style={{ fontFamily: 'monospace', fontSize: 15, color: '#7c6dfa', marginBottom: 8 }}>
          {p.title}
        </div>

        <p style={{ fontSize: 16, color: '#888899', fontStyle: 'italic', marginBottom: 32, maxWidth: 560 }}>
          {p.headline}
        </p>

        <div style={{ width: 48, height: 2, background: '#7c6dfa', marginBottom: 32 }} />

        {/* Bio */}
        <p style={{ fontSize: 17, lineHeight: 1.8, color: '#aaabb8', maxWidth: 580, marginBottom: 52 }}>
          {p.bio}
        </p>

        {/* Skills */}
        {p.skills?.length > 0 && (
          <Section label="Skills & Expertise">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {p.skills.map((skill, i) => (
                <span key={i} style={{
                  padding: '6px 14px',
                  border: '1px solid #2a2a40',
                  borderRadius: 6,
                  fontSize: 13,
                  color: '#aaaabe',
                }}>
                  {skill}
                </span>
              ))}
            </div>
          </Section>
        )}

        {/* Projects */}
        {p.projects?.length > 0 && (
          <Section label="Selected Projects">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px,1fr))', gap: 16 }}>
              {p.projects.map((proj, i) => (
                <div key={i} style={{
                  padding: 22,
                  border: '1px solid #2a2a40',
                  borderRadius: 12,
                  background: '#13131f',
                }}>
                  <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>{proj.name}</div>
                  <div style={{ fontSize: 13, color: '#666680', lineHeight: 1.6 }}>{proj.description}</div>
                  <div style={{ marginTop: 10, fontFamily: 'monospace', fontSize: 10, color: '#fa6d9a', letterSpacing: '0.1em' }}>
                    {proj.type}
                  </div>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Experience */}
        {p.experience?.length > 0 && (
          <Section label="Experience">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {p.experience.map((exp, i) => (
                <div key={i} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  padding: '16px 20px',
                  border: '1px solid #1e1e30',
                  borderRadius: 10,
                  background: '#13131f',
                  gap: 16,
                }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 3 }}>{exp.role}</div>
                    <div style={{ fontFamily: 'monospace', fontSize: 12, color: '#7c6dfa' }}>{exp.company}</div>
                  </div>
                  <div style={{ fontFamily: 'monospace', fontSize: 11, color: '#505070', whiteSpace: 'nowrap' }}>
                    {exp.year}
                  </div>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Contact */}
        <Section label="Get In Touch">
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {['✉ Email Me', '💼 LinkedIn', '📁 Download CV'].map((label, i) => (
              <button key={i} style={{
                padding: '10px 20px',
                border: '1px solid #2a2a40',
                borderRadius: 8,
                fontSize: 13,
                color: '#e8e8f0',
                background: 'transparent',
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}>
                {label}
              </button>
            ))}
          </div>
        </Section>
      </div>

      {/* Watermark for free users */}
      {!is_pro && (
        <div style={{
          textAlign: 'center',
          padding: '20px',
          borderTop: '1px solid #1e1e30',
          fontSize: 12,
          color: '#404060',
          fontFamily: 'monospace',
        }}>
          Made with <a href="/" style={{ color: '#7c6dfa', textDecoration: 'none' }}>PortfolioAI</a>
          {' · '}
          <a href="/pricing" style={{ color: '#7c6dfa', textDecoration: 'none' }}>Remove watermark →</a>
        </div>
      )}
    </div>
  )
}

// Reusable section wrapper
function Section({ label, children }) {
  return (
    <div style={{ marginBottom: 48 }}>
      <div style={{
        fontFamily: 'monospace',
        fontSize: 10,
        letterSpacing: '0.25em',
        textTransform: 'uppercase',
        color: '#7c6dfa',
        marginBottom: 16,
        paddingBottom: 10,
        borderBottom: '1px solid #1e1e30',
      }}>
        {label}
      </div>
      {children}
    </div>
  )
}
