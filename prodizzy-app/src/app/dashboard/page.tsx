'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { getGreeting, formatDate, mkSlug } from '@/lib/utils'

interface Company { id: string; name: string; slug: string; stage: string; website: string }

const MOCK_CARDS = [
  { id: 0, name: 'Sarah Chen',          org: 'Sequoia Capital',  badge: 'investor',  stripe: 'high',
    why: '<strong>Warm intro through David Tisch</strong> — aligned with your Series A goal. Actively deploying in B2B SaaS. No reply sent in 5 days.',
    actions: ['Schedule meeting', 'Draft reply'], meta: '5 days since contact', prio: 'High priority', dot: 'high' },
  { id: 1, name: 'Marcus Rivera',       org: 'Senior Engineer',  badge: 'candidate', stripe: 'high',
    why: '<strong>Referred by your CTO</strong> — full-stack, 6 years exp. Interviewing elsewhere. Open to offers for ~2 more weeks.',
    actions: ['Send intro email', 'Schedule call'], meta: 'Referred · Window closing soon', prio: 'High priority', dot: 'high' },
  { id: 2, name: 'Partnership Request', org: 'Notion',           badge: 'partner',   stripe: 'med',
    why: '<strong>2M+ user overlap with your ICP</strong> — submitted via your Prodizzy page 2 days ago. Potential integration or co-marketing play.',
    actions: ['Review request'], meta: 'Via Prodizzy page · 2 days ago', prio: 'Medium', dot: 'med' },
  { id: 3, name: 'James Willard',       org: 'Angel Investor',   badge: 'investor',  stripe: 'med',
    why: '<strong>Met at YC Demo Day</strong> — $50K–$250K checks, 8 days since meeting. No follow-up sent. Momentum window closing.',
    actions: ['Follow up now', 'Remind me tomorrow'], meta: '8 days since meeting', prio: 'Medium', dot: 'med' },
  { id: 4, name: 'Product Roundup',     org: 'Creator DM',       badge: 'creator',   stripe: 'low',
    why: '<strong>50K-follower creator, B2B SaaS focus</strong> — wants to feature you in weekly roundup. Easy win if you reply today.',
    actions: ['Respond to DM'], meta: 'Inbound · Today', prio: 'New', dot: 'low' },
]

const SECTION_LABELS = [
  { label: 'High priority', count: 2, indices: [0, 1] },
  { label: 'Medium priority', count: 2, indices: [2, 3] },
  { label: 'New this week', count: 1, indices: [4] },
]

export default function DashboardPage() {
  const router = useRouter()
  const [company, setCompany] = useState<Company | null>(null)
  const [loaded, setLoaded] = useState(false)
  const [expandedCard, setExpandedCard] = useState<number | null>(null)
  const [doneActions, setDoneActions] = useState<Record<string, string>>({})
  const [dismissed, setDismissed] = useState<Set<number>>(new Set())
  const [nudgeHidden, setNudgeHidden] = useState(false)
  const [copyLabel, setCopyLabel] = useState('Copy link')

  useEffect(() => {
    const slug = localStorage.getItem('prodizzy_slug') ?? ''
    const coName = localStorage.getItem('prodizzy_company') ?? 'Founder'
    if (!slug) { router.replace('/onboarding'); return }

    async function load() {
      try {
        const supabase = createClient()
        const { data } = await supabase.from('companies').select('*').eq('slug', slug).single()
        if (data) setCompany(data)
        else setCompany({ id: '', name: coName, slug, stage: '', website: '' })
      } catch {
        setCompany({ id: '', name: coName, slug, stage: '', website: '' })
      }
      setLoaded(true)
    }
    load()
  }, [router])

  function toggleCard(id: number) {
    setExpandedCard(prev => prev === id ? null : id)
  }

  function actDone(cardId: number, action: string) {
    setDoneActions(d => ({ ...d, [cardId + '_' + action]: action }))
    setTimeout(() => setDismissed(s => { const n = new Set(s); n.add(cardId); return n }), 700)
  }

  function dismissCard(id: number) {
    setDismissed(s => { const n = new Set(s); n.add(id); return n })
  }

  function copyLink() {
    const slug = company?.slug || localStorage.getItem('prodizzy_slug') || ''
    navigator.clipboard?.writeText(`prodizzy.ai/${slug}`)
    setCopyLabel('Copied!')
    setTimeout(() => setCopyLabel('Copy link'), 2000)
  }

  if (!loaded) {
    return <div style={{ background: 'var(--bg)', minHeight: '100vh' }} />
  }

  const name = company?.name || 'Founder'
  const slug = company?.slug || ''
  const init = name.trim().split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2) || 'P'
  const greeting = getGreeting()
  const dateStr = formatDate()

  return (
    <div style={{ background: 'var(--bg)' }}>
      {/* Nav */}
      <div className="nav-outer">
        <div className="nav-inner">
          <Image src="/bgremovedlogo.png" alt="Prodizzy" width={130} height={36}
            style={{ objectFit: 'cover', objectPosition: 'center 48%' }} />
          <div className="nav-dash-links">
            <span className="nav-dash-link active">Dashboard</span>
            <span className="nav-dash-link">
              Inbound <span style={{ marginLeft: 3, background: 'rgba(232,56,42,.1)', color: 'var(--red)', padding: '1px 6px', borderRadius: 100, fontSize: 10, fontWeight: 700 }}>3</span>
            </span>
            <span className="nav-dash-link">Contacts</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Link href={`/${slug}`}>
              <button className="btn-outline" style={{ fontSize: 13, padding: '8px 16px' }}>View your page</button>
            </Link>
            <div className="nav-avatar">{init}</div>
          </div>
        </div>
      </div>

      <div className="dash-canvas">
        {/* Nudge */}
        {!nudgeHidden && (
          <div className="nudge">
            <div className="nudge-text">
              <strong>Share your Prodizzy page</strong> — let investors, candidates, and partners reach you in one place.
            </div>
            <div className="nudge-right">
              <button className="nudge-btn" onClick={copyLink}>{copyLabel}</button>
              <Link href={`/${slug}`}>
                <button className="nudge-btn-ghost">View page</button>
              </Link>
              <button className="nudge-close" onClick={() => setNudgeHidden(true)}>×</button>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="dash-header">
          <div className="dash-greeting">{greeting}, {name}</div>
          <h1 className="grad-head dash-title">Today&apos;s Priorities</h1>
          <div className="dash-meta">{dateStr} · 5 items need your attention</div>
        </div>

        {/* Priority sections */}
        {SECTION_LABELS.map(sec => (
          <div key={sec.label}>
            <div className="section-head" style={{ marginTop: sec.indices[0] === 0 ? 0 : 40 }}>
              <span className="section-label">{sec.label}</span>
              <span className="section-count">{sec.indices.filter(i => !dismissed.has(i)).length}</span>
            </div>
            <div className="p-list">
              {MOCK_CARDS.filter(c => sec.indices.includes(c.id) && !dismissed.has(c.id)).map(card => (
                <div key={card.id}
                  className={`p-card${expandedCard === card.id ? ' expanded' : ''}`}
                  onClick={() => toggleCard(card.id)}>
                  <div className={`p-stripe ${card.stripe}`} />
                  <div className="p-body">
                    <div className="p-top">
                      <div className="p-who">
                        <span className="p-name">{card.name}</span>
                        <span className="p-org">· {card.org}</span>
                      </div>
                      <div className="p-top-right">
                        <span className={`p-badge ${card.badge}`}>{card.badge.charAt(0).toUpperCase() + card.badge.slice(1)}</span>
                        <span className="p-chevron">
                          <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
                            <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </span>
                      </div>
                    </div>
                    <p className="p-why" dangerouslySetInnerHTML={{ __html: card.why }} />
                    <div className="p-expand">
                      <div className="p-expand-inner">
                        <div className="p-actions">
                          {card.actions.map((action, i) => {
                            const key = card.id + '_' + action
                            const isDone = !!doneActions[key]
                            return (
                              <button key={action}
                                className={`p-act-btn ${isDone ? 'done-state' : i === 0 ? 'primary' : 'secondary'}`}
                                onClick={e => { e.stopPropagation(); if (!isDone) actDone(card.id, action) }}
                                disabled={isDone}>
                                {isDone ? `✓ ${doneActions[key]}` : action}
                              </button>
                            )
                          })}
                          <button className="p-act-btn ghost"
                            onClick={e => { e.stopPropagation(); dismissCard(card.id) }}>
                            Dismiss
                          </button>
                        </div>
                        <div className="p-meta">
                          <div className="p-prio">
                            <span className={`p-dot ${card.dot}`} />{card.prio}
                          </div>
                          <span>{card.meta}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Checklist */}
        <div className="checklist-card">
          <div className="checklist-title">Setup checklist</div>
          <div className="check-items">
            <div className="check-item done">
              <div className="check-icon done">
                <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                  <path d="M2 5.5l2.5 2.5L9 3" stroke="#16A34A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              Company setup complete
            </div>
            <div className="check-item done">
              <div className="check-icon done">
                <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                  <path d="M2 5.5l2.5 2.5L9 3" stroke="#16A34A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              Priorities set
            </div>
            <Link href={`/${slug}`} style={{ textDecoration: 'none' }}>
              <div className="check-item todo">
                <div className="check-icon todo" />
                Share your Prodizzy page
              </div>
            </Link>
            <div className="check-item todo">
              <div className="check-icon todo" />
              Connect Gmail to surface more
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
