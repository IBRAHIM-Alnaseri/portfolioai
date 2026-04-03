'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useUser, SignInButton } from '@clerk/nextjs'

export default function HomePage() {
  const { isSignedIn } = useUser()
  const router = useRouter()

  const [name, setName] = useState('')
  const [title, setTitle] = useState('')
  const [cvText, setCvText] = useState('')
  const [theme, setTheme] = useState('minimal')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [uploadMode, setUploadMode] = useState('text')
  const [selectedFile, setSelectedFile] = useState(null)
  const fileRef = useRef(null)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!isSignedIn) return
    setLoading(true)
    setError('')

    try {
      let res
      if (uploadMode === 'file' && selectedFile) {
        const fd = new FormData()
        fd.append('name', name)
        fd.append('title', title)
        fd.append('theme', theme)
        fd.append('file', selectedFile)
        res = await fetch('/api/generate', { method: 'POST', body: fd })
      } else {
        res = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, title, cvText, theme }),
        })
      }

      const data = await res.json()
      if (!res.ok) {
        if (data.limitReached) {
          setError(data.error + ' Upgrade to Pro for more generations.')
        } else {
          setError(data.error || 'Something went wrong.')
        }
        return
      }
      router.push('/' + data.slug)
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const themes = ['minimal', 'dark', 'glass', 'bold', 'neon']

  return (
    <div style={{ minHeight: '100vh', background: '#080810', color: '#e8e8f0', fontFamily: 'system-ui, sans-serif' }}>
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 40px', borderBottom: '1px solid #1a1a2e' }}>
        <div style={{ fontFamily: 'serif', fontSize: 22, fontWeight: 900, fontStyle: 'italic' }}>
          Portfolio<span style={{ color: '#7c6dfa' }}>AI</span>
        </div>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          {isSignedIn ? (
            <a href="/dashboard" style={{ color: '#7c6dfa', textDecoration: 'none', fontSize: 14 }}>Dashboard →</a>
          ) : (
            <SignInButton mode="modal">
              <button style={{ background: 'transparent', border: '1px solid #2a2a40', borderRadius: 8, color: '#e8e8f0', padding: '8px 18px', cursor: 'pointer', fontSize: 14 }}>Sign In</button>
            </SignInButton>
          )}
        </div>
      </nav>

      <div style={{ textAlign: 'center', padding: '80px 20px 60px' }}>
        <div style={{ display: 'inline-block', background: 'rgba(124,109,250,0.15)', border: '1px solid rgba(124,109,250,0.3)', borderRadius: 20, padding: '6px 16px', fontSize: 12, color: '#7c6dfa', marginBottom: 24, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          Powered by Gemini · Claude · GPT-4
        </div>
        <h1 style={{ fontSize: 'clamp(36px, 6vw, 72px)', fontWeight: 900, lineHeight: 1.1, margin: '0 0 20px', fontFamily: 'serif' }}>
          Your Portfolio,<br />
          <span style={{ background: 'linear-gradient(135deg, #7c6dfa, #fa6d9a)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Built by AI in 60s
          </span>
        </h1>
        <p style={{ fontSize: 18, color: '#606080', maxWidth: 480, margin: '0 auto 48px', lineHeight: 1.6 }}>
          Paste your CV. Get a stunning, live portfolio website. No design skills needed.
        </p>

        {!isSignedIn ? (
          <div style={{ background: '#13131f', border: '1px solid #2a2a40', borderRadius: 20, padding: 40, maxWidth: 480, margin: '0 auto' }}>
            <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>Create Your Portfolio</div>
            <p style={{ color: '#606080', marginBottom: 24, fontSize: 14 }}>Sign in to get started — it's free.</p>
            <SignInButton mode="modal">
              <button style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg, #7c6dfa, #fa6d9a)', border: 'none', borderRadius: 12, color: 'white', fontWeight: 700, fontSize: 16, cursor: 'pointer' }}>
                Get Started Free →
              </button>
            </SignInButton>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ background: '#13131f', border: '1px solid #2a2a40', borderRadius: 20, padding: 40, maxWidth: 560, margin: '0 auto', textAlign: 'left' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div>
                <label style={{ fontSize: 12, color: '#7070a0', letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Full Name *</label>
                <input value={name} onChange={e => setName(e.target.value)} required placeholder="Alex Johnson" style={{ width: '100%', background: '#0f0f1a', border: '1px solid #2a2a40', borderRadius: 8, padding: '10px 14px', color: '#e8e8f0', fontSize: 14, boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize: 12, color: '#7070a0', letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Job Title</label>
                <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Full Stack Developer" style={{ width: '100%', background: '#0f0f1a', border: '1px solid #2a2a40', borderRadius: 8, padding: '10px 14px', color: '#e8e8f0', fontSize: 14, boxSizing: 'border-box' }} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              {['text', 'file'].map(mode => (
                <button key={mode} type="button" onClick={() => setUploadMode(mode)}
                  style={{ padding: '7px 16px', borderRadius: 8, border: '1px solid', borderColor: uploadMode === mode ? '#7c6dfa' : '#2a2a40', background: uploadMode === mode ? 'rgba(124,109,250,0.15)' : 'transparent', color: uploadMode === mode ? '#7c6dfa' : '#606080', fontSize: 13, cursor: 'pointer' }}>
                  {mode === 'text' ? '✍ Paste CV Text' : '📎 Upload PDF / Image'}
                </button>
              ))}
            </div>

            {uploadMode === 'text' ? (
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 12, color: '#7070a0', letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>CV / Resume Text *</label>
                <textarea value={cvText} onChange={e => setCvText(e.target.value)} rows={7} placeholder="Paste your CV text here — experience, skills, education, projects..." style={{ width: '100%', background: '#0f0f1a', border: '1px solid #2a2a40', borderRadius: 8, padding: '10px 14px', color: '#e8e8f0', fontSize: 13, resize: 'vertical', boxSizing: 'border-box', lineHeight: 1.6 }} />
              </div>
            ) : (
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 12, color: '#7070a0', letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Upload CV File *</label>
                <div onClick={() => fileRef.current?.click()} style={{ background: '#0f0f1a', border: '2px dashed #2a2a40', borderRadius: 8, padding: '24px', textAlign: 'center', cursor: 'pointer', color: selectedFile ? '#7c6dfa' : '#606080', fontSize: 14 }}>
                  {selectedFile ? '✓ ' + selectedFile.name : 'Click to upload PDF, JPG, or PNG'}
                </div>
                <input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png" style={{ display: 'none' }} onChange={e => setSelectedFile(e.target.files[0] || null)} />
              </div>
            )}

            <div style={{ marginBottom: 24 }}>
              <label style={{ fontSize: 12, color: '#7070a0', letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>Theme</label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {themes.map(t => (
                  <button key={t} type="button" onClick={() => setTheme(t)}
                    style={{ padding: '6px 14px', borderRadius: 8, border: '1px solid', borderColor: theme === t ? '#7c6dfa' : '#2a2a40', background: theme === t ? 'rgba(124,109,250,0.15)' : 'transparent', color: theme === t ? '#7c6dfa' : '#606080', fontSize: 13, cursor: 'pointer', textTransform: 'capitalize' }}>
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {error && <div style={{ background: 'rgba(250,100,100,0.1)', border: '1px solid rgba(250,100,100,0.3)', borderRadius: 8, padding: '10px 14px', color: '#fa6464', marginBottom: 16, fontSize: 13 }}>{error}</div>}

            <button type="submit" disabled={loading} style={{ width: '100%', padding: '14px', background: loading ? '#3a3a50' : 'linear-gradient(135deg, #7c6dfa, #fa6d9a)', border: 'none', borderRadius: 12, color: 'white', fontWeight: 700, fontSize: 16, cursor: loading ? 'not-allowed' : 'pointer', transition: 'opacity 0.2s' }}>
              {loading ? 'Running 3-model AI pipeline: Gemini → Claude → GPT-4…' : 'Generate My Portfolio →'}
            </button>
          </form>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20, maxWidth: 900, margin: '0 auto', padding: '60px 40px' }}>
        {[
          { icon: '🤖', title: '3-Model AI Pipeline', desc: 'Gemini extracts, Claude writes, GPT-4 polishes' },
          { icon: '⚡', title: '60-Second Build', desc: 'From CV paste to live portfolio instantly' },
          { icon: '🎨', title: '5 Pro Themes', desc: 'Minimal, Dark, Glass, Bold, Neon' },
          { icon: '📊', title: 'Analytics', desc: 'Track who views your portfolio (Pro)' },
        ].map((f, i) => (
          <div key={i} style={{ background: '#13131f', border: '1px solid #2a2a40', borderRadius: 16, padding: 24 }}>
            <div style={{ fontSize: 28, marginBottom: 10 }}>{f.icon}</div>
            <div style={{ fontWeight: 600, marginBottom: 6 }}>{f.title}</div>
            <div style={{ color: '#606080', fontSize: 13, lineHeight: 1.5 }}>{f.desc}</div>
          </div>
        ))}
      </div>

      <footer style={{ textAlign: 'center', padding: '40px 20px', borderTop: '1px solid #1a1a2e', color: '#404060', fontSize: 13 }}>
        PortfolioAI · Built with Claude, Gemini & GPT-4
      </footer>
    </div>
  )
}
