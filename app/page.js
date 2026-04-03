'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useUser, SignInButton } from '@clerk/nextjs'

export default function HomePage() {
  const { isSignedIn } = useUser()
  const router = useRouter()

  const [name, setName]             = useState('')
  const [title, setTitle]           = useState('')
  const [cvText, setCvText]         = useState('')
  const [theme, setTheme]           = useState('minimal')
  const [file, setFile]             = useState(null)
  const [uploadMode, setUploadMode] = useState('text')
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState('')
  const fileInputRef                = useRef()

  const themes = [
    { id: 'minimal',   label: 'Minimal Dark', icon: '◻' },
    { id: 'bold',      label: 'Bold Type',    icon: '◼' },
    { id: 'editorial', label: 'Editorial',    icon: '◈' },
  ]

  function handleFileChange(e) {
    const f = e.target.files?.[0]
    if (!f) return
    const allowed = ['application/pdf','image/jpeg','image/jpg','image/png','image/webp','image/heic']
    if (!allowed.includes(f.type)) {
      setError('Please upload a PDF or image (JPG, PNG, WEBP).')
      return
    }
    if (f.size > 10 * 1024 * 1024) {
      setError('File must be under 10MB.')
      return
    }
    setFile(f)
    setError('')
  }

  async function handleGenerate() {
    setError('')
    if (!name) { setError('Please enter your name.'); return }
    if (uploadMode === 'text' && !cvText) { setError('Please paste your CV text.'); return }
    if (uploadMode === 'file' && !file)   { setError('Please upload a file.'); return }
    setLoading(true)

    try {
      let res, data

      if (uploadMode === 'file' && file) {
        const formData = new FormData()
        formData.append('name', name)
        formData.append('title', title)
        formData.append('cvText', cvText)
        formData.append('theme', theme)
        formData.append('file', file)
        res  = await fetch('/api/generate', { method: 'POST', body: formData })
        data = await res.json()
      } else {
        res = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, title, cvText, theme }),
        })
        data = await res.json()
      }

      if (!res.ok) {
        if (data.limitReached) {
          setError(data.error + ' Upgrade to Pro →')
        } else {
          throw new Error(data.error || 'Something went wrong.')
        }
        return
      }

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
      <div style={{ fontFamily: 'var(--font-fraunces)', fontSize: 22, fontWeight: 900, fontStyle: 'italic', marginBottom: 52 }}>
        Portfolio<span style={{ color: '#7c6dfa' }}>AI</span>
      </div>

      <div style={{ fontFamily: 'var(--font-fraunces)', fontSize: 'clamp(36px,7vw,64px)', fontWeight: 900, lineHeight: 1.05, textAlign: 'center', marginBottom: 16, letterSpacing: '-0.03em' }}>
        Your portfolio,<br /><em style={{ color: '#7c6dfa' }}>built in 60 seconds.</em>
      </div>
      <p style={{ color: '#606090', fontSize: 15, textAlign: 'center', maxWidth: 420, marginBottom: 52, lineHeight: 1.7 }}>
        Paste your CV or upload a PDF — AI writes your bio, organizes your work, and publishes your portfolio instantly.
      </p>

      <div style={{ width: '100%', maxWidth: 600, background: '#13131f', border: '1px solid #2a2a40', borderRadius: 20, padding: 36 }}>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
          <InputField label="Full Name *" value={name} onChange={setName} placeholder="e.g. Ibrahim Al-Naseri" />
          <InputField label="Job Title" value={title} onChange={setTitle} placeholder="e.g. Interior Architect" />
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          {[
            { id: 'text', label: '✍ Paste CV Text' },
            { id: 'file', label: '📎 Upload PDF / Image' },
          ].map(m => (
            <button
              key={m.id}
              onClick={() => setUploadMode(m.id)}
              style={{
                flex: 1, padding: '10px 14px',
                border: `1px solid ${uploadMode === m.id ? '#7c6dfa' : '#2a2a40'}`,
                borderRadius: 10,
                background: uploadMode === m.id ? 'rgba(124,109,250,0.12)' : 'transparent',
                color: uploadMode === m.id ? '#7c6dfa' : '#606080',
                cursor: 'pointer', fontSize: 13, fontWeight: 500, fontFamily: 'inherit', transition: 'all 0.15s',
              }}
            >
              {m.label}
            </button>
          ))}
        </div>

        {uploadMode === 'text' && (
          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>Your CV / Background *</label>
            <textarea
              value={cvText}
              onChange={e => setCvText(e.target.value)}
              placeholder="Paste anything: your CV, LinkedIn summary, experience, education, projects, skills. The more you share, the better your portfolio."
              rows={6}
              style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }}
            />
          </div>
        )}

        {uploadMode === 'file' && (
          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>Upload Your CV *</label>
            <div
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: `2px dashed ${file ? '#7c6dfa' : '#2a2a40'}`,
                borderRadius: 12, padding: '32px 20px', textAlign: 'center', cursor: 'pointer',
                background: file ? 'rgba(124,109,250,0.06)' : '#0f0f1a', transition: 'all 0.15s',
              }}
            >
              <div style={{ fontSize: 32, marginBottom: 8 }}>{file ? '✅' : '📁'}</div>
              <div style={{ color: file ? '#7c6dfa' : '#606080', fontSize: 14 }}>
                {file ? file.name : 'Click to upload PDF, JPG, or PNG'}
              </div>
              {!file && <div style={{ color: '#404060', fontSize: 12, marginTop: 6 }}>Supports: PDF, JPG, PNG, WEBP · Max 10MB</div>}
              {file && (
                <button onClick={e => { e.stopPropagation(); setFile(null) }}
                  style={{ marginTop: 8, background: 'none', border: 'none', color: '#606080', fontSize: 12, cursor: 'pointer' }}>
                  Remove file
                </button>
              )}
            </div>
            <input ref={fileInputRef} type="file" accept=".pdf,.jpg,.jpeg,.png,.webp,.heic"
              onChange={handleFileChange} style={{ display: 'none' }} />
          </div>
        )}

        <div style={{ marginBottom: 28 }}>
          <label style={labelStyle}>Choose Your Style</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
            {themes.map(t => (
              <button key={t.id} onClick={() => setTheme(t.id)} style={{
                padding: '12px 10px',
                border: `1px solid ${theme === t.id ? '#7c6dfa' : '#2a2a40'}`,
                borderRadius: 10,
                background: theme === t.id ? 'rgba(124,109,250,0.12)' : 'transparent',
                color: theme === t.id ? '#7c6dfa' : '#aaaacc',
                cursor: 'pointer', fontSize: 13, fontFamily: 'inherit', transition: 'all 0.15s',
              }}>
                <div style={{ fontSize: 20, marginBottom: 4 }}>{t.icon}</div>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {isSignedIn ? (
          <button onClick={handleGenerate} disabled={loading} style={{
            width: '100%', padding: 16,
            background: loading ? '#333350' : 'linear-gradient(135deg, #7c6dfa, #9c8dff)',
            border: 'none', borderRadius: 12, color: 'white', fontSize: 16, fontWeight: 600,
            cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', transition: 'all 0.2s',
          }}>
            {loading ? '⏳ Generating your portfolio…' : '✦ Generate My Portfolio'}
          </button>
        ) : (
          <SignInButton mode="modal">
            <button style={{
              width: '100%', padding: 16,
              background: 'linear-gradient(135deg, #7c6dfa, #9c8dff)',
              border: 'none', borderRadius: 12, color: 'white', fontSize: 16, fontWeight: 600,
              cursor: 'pointer', fontFamily: 'inherit',
            }}>
              Sign in to Generate Your Portfolio →
            </button>
          </SignInButton>
        )}

        {loading && (
          <div style={{ marginTop: 16, textAlign: 'center', color: '#505070', fontSize: 12, fontFamily: 'monospace' }}>
            Running 3-model AI pipeline: Gemini → Claude → GPT-4…
          </div>
        )}

        {error && (
          <div style={{
            marginTop: 16, padding: '14px 18px',
            background: 'rgba(250,109,154,0.08)', border: '1px solid rgba(250,109,154,0.3)',
            borderRadius: 10, color: '#fa6d9a', fontSize: 13, fontFamily: 'monospace',
          }}>
            ⚠ {error}
          </div>
        )}
      </div>

      <p style={{ marginTop: 24, fontSize: 12, color: '#404060', fontFamily: 'monospace' }}>
        Free forever · No credit card required · Pro from TRY 400/mo
      </p>
    </main>
  )
}

function InputField({ label, value, onChange, placeholder }) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <input type="text" value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder} style={inputStyle} />
    </div>
  )
}

const labelStyle = {
  display: 'block', fontFamily: 'monospace', fontSize: 10,
  letterSpacing: '0.2em', textTransform: 'uppercase', color: '#7070a0', marginBottom: 8,
}

const inputStyle = {
  width: '100%', background: '#0f0f1a', border: '1px solid #2a2a40',
  borderRadius: 10, padding: '13px 16px', color: '#e8e8f0',
  fontFamily: 'inherit', fontSize: 15, outline: 'none', boxSizing: 'border-box',
}
