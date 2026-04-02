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
        </div>
      ) : (
        <div style={{ background: '#13131f', border: '1px dashed #2a2a40', borderRadius: 16, padding: 40, textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: 18, fontWeight: 500, marginBottom: 8 }}>No portfolio yet</div>
          <Link href="/" style={{ padding: '12px 28px', background: '#7c6dfa', borderRadius: 10, color: 'white', fontWeight: 600, fontSize: 14, textDecoration: 'none' }}>Create My Portfolio →</Link>
        </div>
      )}
    </div>
  )
}
