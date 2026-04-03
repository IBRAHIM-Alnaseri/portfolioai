'use client'

import { useEffect, useState } from 'react'
import { useUser, UserButton } from '@clerk/nextjs'
import Link from 'next/link'

export default function DashboardPage() {
  const { isSignedIn, user } = useUser()
  const [portfolio, setPortfolio] = useState(null)
  const [loading, setLoading] = useState(true)
  const [usage, setUsage] = useState(null)

  useEffect(() => {
    if (!isSignedIn) return
    // Fetch portfolio and usage in parallel
    Promise.all([
      fetch('/api/my-portfolio').then(r => r.json()),
      fetch('/api/usage').then(r => r.json()),
    ]).then(([portfolioData, usageData]) => {
      setPortfolio(portfolioData.portfolio || null)
      setUsage(usageData)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [isSignedIn])

  if (!isSignedIn) {
    return (
      <div style={{ minHeight: '100vh', background: '#080810', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#e8e8f0', fontFamily: 'system-ui, sans-serif' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 20, marginBottom: 16 }}>Please sign in to view your dashboard.</div>
          <Link href="/" style={{ color: '#7c6dfa', textDecoration: 'none' }}>← Back to Home</Link>
        </div>
      </div>
    )
  }

  const usedCount = usage?.used ?? 0
  const limit = usage?.limit ?? 3
  const isPro = usage?.isPro ?? false
  const pct = Math.min(100, Math.round((usedCount / limit) * 100))
  const barColor = pct >= 100 ? '#fa6464' : pct >= 75 ? '#faa064' : '#7c6dfa'

  return (
    <div style={{ minHeight: '100vh', background: '#080810', color: '#e8e8f0', fontFamily: 'system-ui, sans-serif' }}>
      {/* Nav */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 40px', borderBottom: '1px solid #1a1a2e' }}>
        <Link href="/" style={{ fontFamily: 'serif', fontSize: 20, fontWeight: 900, fontStyle: 'italic', textDecoration: 'none', color: '#e8e8f0' }}>
          Portfolio<span style={{ color: '#7c6dfa' }}>AI</span>
        </Link>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <span style={{ color: '#606080', fontSize: 14 }}>{user?.primaryEmailAddress?.emailAddress}</span>
          <UserButton afterSignOutUrl="/" />
        </div>
      </nav>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '48px 24px' }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Your Dashboard</h1>
        <p style={{ color: '#606080', marginBottom: 40, fontSize: 15 }}>Manage your portfolio and track usage.</p>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20, marginBottom: 40 }}>
          {/* Usage card */}
          <div style={{ background: '#13131f', border: '1px solid #2a2a40', borderRadius: 16, padding: 24 }}>
            <div style={{ fontSize: 12, color: '#7070a0', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10 }}>Today’s Generations</div>
            <div style={{ fontSize: 32, fontWeight: 800, marginBottom: 12 }}>
              {loading ? '…' : usedCount}
              <span style={{ fontSize: 16, color: '#606080', fontWeight: 400 }}> / {limit}</span>
            </div>
            {/* Progress bar */}
            <div style={{ background: '#1a1a2e', borderRadius: 6, height: 6, marginBottom: 10, overflow: 'hidden' }}>
              <div style={{ width: pct + '%', height: '100%', background: barColor, borderRadius: 6, transition: 'width 0.5s' }} />
            </div>
            <div style={{ fontSize: 12, color: isPro ? '#7c6dfa' : '#606080' }}>
              {isPro ? '⭐ Pro Plan — 10 generations/day' : 'Free Plan — 3 generations/day'}
            </div>
          </div>

          {/* Plan card */}
          <div style={{ background: '#13131f', border: '1px solid #2a2a40', borderRadius: 16, padding: 24 }}>
            <div style={{ fontSize: 12, color: '#7070a0', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10 }}>Current Plan</div>
            <div style={{ fontSize: 24, fontWeight: 800, marginBottom: 8, color: isPro ? '#7c6dfa' : '#e8e8f0' }}>
              {isPro ? '⭐ Pro' : 'Free'}
            </div>
            <div style={{ color: '#606080', fontSize: 13, marginBottom: 16 }}>
              {isPro ? 'Full access to all themes and features.' : 'Upgrade to Pro for 10 generations/day and priority AI.'}
            </div>
            {!isPro && (
              <Link href="/api/create-checkout" style={{ display: 'inline-block', padding: '8px 18px', background: 'linear-gradient(135deg, #7c6dfa, #fa6d9a)', borderRadius: 8, color: 'white', textDecoration: 'none', fontWeight: 600, fontSize: 13 }}>
                Upgrade to Pro →
              </Link>
            )}
          </div>

          {/* Portfolio card */}
          <div style={{ background: '#13131f', border: '1px solid #2a2a40', borderRadius: 16, padding: 24 }}>
            <div style={{ fontSize: 12, color: '#7070a0', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10 }}>Your Portfolio</div>
            {loading ? (
              <div style={{ color: '#606080', fontSize: 14 }}>Loading…</div>
            ) : portfolio ? (
              <>
                <div style={{ fontWeight: 700, marginBottom: 4 }}>{portfolio.portfolio_data?.name || 'Portfolio'}</div>
                <div style={{ color: '#606080', fontSize: 13, marginBottom: 16 }}>/{portfolio.slug}</div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <a href={'/' + portfolio.slug} target="_blank" rel="noopener noreferrer" style={{ padding: '7px 14px', background: 'rgba(124,109,250,0.15)', border: '1px solid rgba(124,109,250,0.3)', borderRadius: 8, color: '#7c6dfa', textDecoration: 'none', fontSize: 13 }}>
                    View Live ↗
                  </a>
                  <Link href="/" style={{ padding: '7px 14px', background: '#1a1a2e', border: '1px solid #2a2a40', borderRadius: 8, color: '#e8e8f0', textDecoration: 'none', fontSize: 13 }}>
                    Regenerate
                  </Link>
                </div>
              </>
            ) : (
              <>
                <div style={{ color: '#606080', fontSize: 13, marginBottom: 16 }}>No portfolio yet. Generate your first one!</div>
                <Link href="/" style={{ display: 'inline-block', padding: '8px 18px', background: 'linear-gradient(135deg, #7c6dfa, #fa6d9a)', borderRadius: 8, color: 'white', textDecoration: 'none', fontWeight: 600, fontSize: 13 }}>
                  Create Portfolio →
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Usage warning if at limit */}
        {!loading && usedCount >= limit && (
          <div style={{ background: 'rgba(250,100,100,0.1)', border: '1px solid rgba(250,100,100,0.3)', borderRadius: 12, padding: '16px 20px', marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#fa9090', fontSize: 14 }}>
              ⚠️ You’ve reached your daily limit of {limit} generations.
              {!isPro && ' Upgrade to Pro for more.'}
            </span>
            {!isPro && (
              <Link href="/api/create-checkout" style={{ padding: '7px 16px', background: 'linear-gradient(135deg, #7c6dfa, #fa6d9a)', borderRadius: 8, color: 'white', textDecoration: 'none', fontWeight: 600, fontSize: 13, whiteSpace: 'nowrap' }}>
                Upgrade →
              </Link>
            )}
          </div>
        )}

        {/* Quick actions */}
        <div style={{ background: '#13131f', border: '1px solid #2a2a40', borderRadius: 16, padding: 24 }}>
          <div style={{ fontWeight: 700, marginBottom: 16, fontSize: 16 }}>Quick Actions</div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Link href="/" style={{ padding: '10px 20px', background: 'linear-gradient(135deg, #7c6dfa, #fa6d9a)', borderRadius: 10, color: 'white', textDecoration: 'none', fontWeight: 600, fontSize: 14 }}>
              ⊕ Generate New Portfolio
            </Link>
            {portfolio && (
              <a href={'/' + portfolio.slug} target="_blank" rel="noopener noreferrer" style={{ padding: '10px 20px', background: '#1a1a2e', border: '1px solid #2a2a40', borderRadius: 10, color: '#e8e8f0', textDecoration: 'none', fontSize: 14 }}>
                🔗 View My Portfolio
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
