'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser, SignInButton } from '@clerk/nextjs'

export default function HomePage() {
  const { isSignedIn, user } = useUser()
  const router = useRouter()

  const [name, setName] = useState('')
  const [title, setTitle] = useState('')
  const [cvText, setCvText] = useState('')
  const [theme, setTheme] = useState('minimal')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const themes = [
    { id: 'minimal', label: 'Minimal Dark', icon: '◻' },
    { id: 'bold',    label: 'Bold Type',    icon: '◼' },
    { id: 'editorial', label: 'Editorial',  icon: '◈' },
  ]

  async function handleGenerate() {
    setError('')

    if (!name || !title || !cvText) {
      setError('Please fill in your name, job title, and CV details.')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, title, cvText, theme }),
      })

      const data = await res.json()

      if (!res.ok) throw new Error(data.error || 'Something went wrong.')

      // Redirect to the live portfolio
      router.push(`/${data.slug}?new=1`)

    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '48px 24px',
      background: 'linear-gradient(135deg, #080810 0%, #0f0f1a 100%)',
    }}>
      {/* Logo */}
      <div style={{ fontFamily: 'var(--font-fraunces)', fontSize: 22, fontWeight: 900, fontStyle: 'italic', marginBottom: 52 }}>
        Portfolio<span style={{ color: '#7c6dfa' }}>AI</span>
      </div>

      {/* Hero */}
      <div style={{ fontFamily: 'var(--font-fraunces)', fontSize: 'clamp(36px,7vw,64px)', fontWeight: 900, lineHeight: 1.05, textAlign: 'center', marginBottom: 16, letterSpacing: '-0.03em' }}>
        Your portfolio,<br /><em style={{ color: '#7c6dfa' }}>built in 60 seconds.</em>
      </div>
      <p style={{ color: '#606090', fontSize: 15, textAlign: 'center', maxWidth: 420, marginBottom: 52, lineHeight: 1.7 }}>
        Paste your CV — AI writes your bio, organizes your work, and generates a live portfolio instantly.
      </p>

      {/* Input Card */}
      <div style={{
        width: '100%', maxWidth: 600,
        background: '#13131f',
        border: '1px solid #2a2a40',
        borderRadius: 20,
        padding: 36,
      }}>

        {/* Name + Title */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
          <InputField label="Full Name" value={name} onChange={setName} placeholder="e.g. Ibrahim Al-Naseri" />
          <InputField label="Job Title" value={title} onChange={setTitle} placeholder="e.g. Interior Architect" />
        </div>

        {/* CV Text */}
        <div style={{ marginBottom: 20 }}>
          <label style={labelStyle}>Your CV / Background</label>
          <textarea
            value={cvText}
            onChange={e => setCvText(e.target.value)}
            placeholder="Paste anything: your CV, LinkedIn summary, experience, education, projects, skills. The more you share, the better your portfolio."
            rows={6}
            style={{ ...inputStyle, resize: 'none', lineHeight: 1.6 }}
          />
        </div>

        {/* Theme Selector */}
        <div style={{ marginBottom: 28 }}>
          <label style={labelStyle}>Choose Your Style</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
            {themes.map(t => (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                style={{
                  padding: '12px 10px',
                  border: `1px solid ${theme === t.id ? '#7c6dfa' : '#2a2a40'}`,
                  borderRadius: 10,
                  background: theme === t.id ? 'rgba(124,109,250,0.12)' : 'transparent',
                  color: theme === t.id ? '#7c6dfa' : '#aaaacc',
                  cursor: 'pointer',
                  fontSize: 13,
                  fontFamily: 'inherit',
                  transition: 'all 0.15s',
                }}
              >
                <div style={{ fontSize: 20, marginBottom: 4 }}>{t.icon}</div>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Generate Button */}
        {isSignedIn ? (
          <button
            onClick={handleGenerate}
            disabled={loading}
            style={{
              width: '100%', padding: 16,
              background: loading ? '#333350' : '#7c6dfa',
              border: 'none', borderRadius: 12,
              color: 'white', fontSize: 16, fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit',
              transition: 'all 0.2s',
            }}
          >
            {loading ? '⏳ Generating your portfolio…' : '✦ Generate My Portfolio'}
          </button>
        ) : (
          // Not signed in → show Clerk sign-in button
          <SignInButton mode="modal">
            <button style={{
              width: '100%', padding: 16,
              background: '#7c6dfa',
              border: 'none', borderRadius: 12,
              color: 'white', fontSize: 16, fontWeight: 600,
              cursor: 'pointer', fontFamily: 'inherit',
            }}>
              Sign in to Generate Your Portfolio →
            </button>
          </SignInButton>
        )}

        {/* Error */}
        {error && (
          <div style={{
            marginTop: 16, padding: '14px 18px',
            background: 'rgba(250,109,154,0.08)',
            border: '1px solid rgba(250,109,154,0.3)',
            borderRadius: 10, color: '#fa6d9a',
            fontSize: 13, fontFamily: 'monospace',
          }}>
            ⚠ {error}
          </div>
        )}
      </div>

      <p style={{ marginTop: 24, fontSize: 12, color: '#404060', fontFamily: 'monospace' }}>
        Free forever · No credit card required · Pro from $9/mo
      </p>
    </main>
  )
}

function InputField({ label, value, onChange, placeholder }) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={inputStyle}
      />
    </div>
  )
}

const labelStyle = {
  display: 'block',
  fontFamily: 'monospace',
  fontSize: 10,
  letterSpacing: '0.2em',
  textTransform: 'uppercase',
  color: '#7070a0',
  marginBottom: 8,
}

const inputStyle = {
  width: '100%',
  background: '#0f0f1a',
  border: '1px solid #2a2a40',
  borderRadius: 10,
  padding: '13px 16px',
  color: '#e8e8f0',
  fontFamily: 'inherit',
  fontSize: 15,
  outline: 'none',
}
