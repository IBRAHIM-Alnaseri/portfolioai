'use client'

import { useEffect, useState } from 'react'
import { useUser, UserButton } from '@clerk/nextjs'
import Link from 'next/link'

export default function DashboardPage() {
  const { isSignedIn, user } = useUser()
  const [portfolio, setPortfolio] = useState(null)
  const [loading, setLoading] = useState(true)
  const [upgraded, setUpgraded] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      if (params.get('upgraded') === 'true') setUpgraded(true)
    }
  }, [])

  useEffect(() => {
    if (!isSignedIn) return
    fetch('/api/my-portfolio')
      .then(r => r.json())
      .then(data => { setPortfolio(data.portfolio); setLoading(false) })
      .catch(() => setLoading(false))
  }, [isSignedIn])

  if (!isSignedIn) return null

  return (
    <div style={{ minHeight: '100vh', background: '#080810', color: '#e8e8f0', padding: '32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 48 }}>
        <div style={{ fontFamily: 'serif', fontSize: 20, fontWeight: 900, fontStyle: 'italic' }}>
          Portfolio<span style={{ color: '#7c6dfa' }}>AI</span>
        </div>
        <UserButton afterSignOutUrl="/" />
      </div>
      {upgraded && (
        <div style={{ background: 'rgba(63,207,142,0.1)', border: '1px solid rgba(63,207,142,0.3)', borderRadius: 12, padding: '16px 20px', color: '#3fcf8e', marginBottom: 32, fontFamily: 'monospace', fontSize: 14 }}>
          🎉 Welcome to Pro! Your features are now unlocked.
        </div>
      )}
      <h1 style={{ fontFamily: 'serif', fontSize: 36, fontWeight: 900, marginBottom: 8 }}>
        Hey, {user.firstName || 'there'} 👋
      </h1>
      <p style={{ color: '#606080', marginBottom: 40 }}>Here's your PortfolioAI dashboard.</p>
      {loading ? (
        <div style={{ color: '#606080' }}>Loading...</div>
      ) : portfolio ? (
        <div style={{ background: '#13131f', border: '1px solid #2a2a40', borderRadius: 16, padding: 28, marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <div style={{ fontSize: 20, fontWeight: 600, marginBottom: 4 }}>{portfolio.portfolio_data?.name}</div>
              <div style={{ fontSize: 14, color: '#7c6dfa', fontFamily: 'monospace' }}>portfolioai.vercel.app/{portfolio.slug}</div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <Link href={`/${portfolio.slug}`} style={{ padding: '10px 20px', border: '1px solid #2a2a40', borderRadius: 8, color: '#e8e8f0', fontSize: 13, textDecoration: 'none' }}>View Live →</Link>
              <Link href="/" style={{ padding: '10px 20px', background: '#7c6dfa', borderRadius: 8, color: 'white', fontSize: 13, textDecoration: 'none' }}>Regenerate</Link>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginTop: 24 }}>
            {[
              { label: 'Views', value: portfolio.views || 0 },
              { label: 'Plan', value: portfolio.is_pro ? 'Pro ⭐' : 'Free' },
              { label: 'Theme', value: portfolio.theme },
            ].map((stat, i) => (
              <div key={i} style={{ background: '#0f0f1a', borderRadius: 10, padding: '16px 18px' }}>
                <div style={{ fontFamily: 'monospace', fontSize: 10, color: '#7070a0', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 6 }}>{stat.label}</div>
                <div style={{ fontSize: 18, fontWeight: 600 }}>{stat.value}</div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div style={{ background: '#13131f', border: '1px dashed #2a2a40', borderRadius: 16, padding: 40, textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: 18, fontWeight: 500, marginBottom: 8 }}>No portfolio yet</div>
          <p style={{ color: '#606080', marginBottom: 24 }}>Generate your first portfolio in 60 seconds.</p>
          <Link href="/" style={{ padding: '12px 28px', background: '#7c6dfa', borderRadius: 10, color: 'white', fontWeight: 600, fontSize: 14, textDecoration: 'none' }}>Create My Portfolio →</Link>
        </div>
      )}
      {portfolio && !portfolio.is_pro && (
        <div style={{ background: 'linear-gradient(135deg, rgba(124,109,250,0.1), rgba(250,109,154,0.08))', border: '1px solid rgba(124,109,250,0.2)', borderRadius: 16, padding: 28 }}>
          <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Upgrade to Pro — TRY 400/mo</div>
          <div style={{ color: '#606080', fontSize: 14, marginBottom: 20 }}>Remove watermark · Analytics · 5 themes · Contact form</div>
          <button onClick={async () => {
            const res = await fetch('/api/create-checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ plan: 'pro' }) })
            const { url } = await res.json()
            window.location.href = url
          }} style={{ padding: '12px 28px', background: 'linear-gradient(135deg, #7c6dfa, #fa6d9a)', border: 'none', borderRadius: 10, color: 'white', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
            Upgrade to Pro →
          </button>
        </div>
      )}
    </div>
  )
}
