'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { mkSlug } from '@/lib/utils'
import { confetti } from '@/lib/confetti'

const TOTAL = 6

const PRI_OPTS = [
  { id: 'raise',   e: '💰', t: 'Fundraising', d: 'Raise capital and meet investors' },
  { id: 'hire',    e: '👥', t: 'Hiring',       d: 'Find great people for your team' },
  { id: 'partner', e: '🤝', t: 'Partnerships', d: 'Build strategic relationships' },
  { id: 'distro',  e: '📣', t: 'Distribution', d: 'Grow reach and brand awareness' },
  { id: 'cust',    e: '🎯', t: 'Customers',    d: 'Acquire users and early revenue' },
]

const STAGES = ['Idea', 'Pre-seed', 'Seed', 'Series A', 'Growth']

const SVCS = [
  { id: 'gmail',    name: 'Gmail',           desc: 'Surface important conversations', color: '#E8382A',
    icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="2" y="4" width="16" height="13" rx="2" stroke="#E8382A" strokeWidth="1.5"/><path d="M2 7l8 6 8-6" stroke="#E8382A" strokeWidth="1.5" strokeLinecap="round"/></svg> },
  { id: 'calendly', name: 'Calendly',        desc: 'Sync meetings and scheduling',    color: '#16A34A',
    icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="2" y="3" width="16" height="15" rx="2" stroke="#16A34A" strokeWidth="1.5"/><path d="M2 8h16M7 1v4M13 1v4" stroke="#16A34A" strokeWidth="1.5" strokeLinecap="round"/></svg> },
  { id: 'gcal',     name: 'Google Calendar', desc: 'Meeting context and history',     color: '#1D4ED8',
    icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="2" y="3" width="16" height="15" rx="2" stroke="#1D4ED8" strokeWidth="1.5"/><path d="M2 8h16M7 1v4M13 1v4" stroke="#1D4ED8" strokeWidth="1.5" strokeLinecap="round"/></svg> },
]

export default function OnboardingPage() {
  const router = useRouter()
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const [slide, setSlide]           = useState(1)
  const [name, setName]             = useState('')
  const [url, setUrl]               = useState('')
  const [stage, setStage]           = useState('')
  const [priorities, setPriorities] = useState<Set<string>>(new Set())
  const [priDetails, setPriDetails] = useState<Record<string, string>>({})
  const [connections, setConnections] = useState<Set<string>>(new Set())
  const [connecting, setConnecting] = useState<Record<string, boolean>>({})
  const [slug, setSlug]             = useState('your-company')
  const [saving, setSaving]         = useState(false)
  const [nudgeHidden, setNudgeHidden] = useState(false)

  // Redirect if already onboarded
  useEffect(() => {
    if (localStorage.getItem('prodizzy_slug')) router.replace('/dashboard')
  }, [router])

  // Keyboard navigation
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.target as HTMLElement)?.classList.contains('pri-detail-input')) return
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); advance() }
      if (e.key === 'Escape') prev()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  function goSlide(n: number) {
    if (n < 1 || n > TOTAL) return
    setSlide(n)
    if (n === 6) {
      const s = mkSlug(name)
      setSlug(s)
      setTimeout(() => confetti(canvasRef.current), 350)
    }
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function prev() { goSlide(slide - 1) }

  function advance() {
    if (slide === 1 && name.length < 2) return
    if (slide === 2 && url.length < 3) return
    if (slide === 3 && !stage) return
    if (slide === 4 && priorities.size === 0) return
    goSlide(slide + 1)
  }

  function togglePri(id: string) {
    setPriorities(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  async function connectSvc(id: string) {
    setConnecting(c => ({ ...c, [id]: true }))
    await new Promise(r => setTimeout(r, 1300))
    setConnections(c => { const n = new Set(c); n.add(id); return n })
    setConnecting(c => ({ ...c, [id]: false }))
  }

  async function openDash() {
    setSaving(true)
    const s = mkSlug(name)
    try {
      const supabase = createClient()
      const { data: co, error } = await supabase
        .from('companies')
        .insert({ name, website: url, stage, slug: s })
        .select('id')
        .single()
      if (!error && co) {
        const rows = [...priorities].map(type => ({
          company_id: co.id, type, details: priDetails[type] || ''
        }))
        if (rows.length) await supabase.from('priorities').insert(rows)
      }
    } catch {}
    localStorage.setItem('prodizzy_slug', s)
    localStorage.setItem('prodizzy_company', name)
    router.push('/dashboard')
  }

  const pct = (slide / TOTAL) * 100

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', position: 'relative' }}>
      <canvas ref={canvasRef} id="cfx" />

      {/* Top bar */}
      <div className="tf-topbar">
        <Image src="/bgremovedlogo.png" alt="Prodizzy" width={130} height={36}
          style={{ objectFit: 'cover', objectPosition: 'center 48%' }} />
        <span className="tf-step-label">{slide} / {TOTAL}</span>
      </div>

      {/* Slides */}
      <div className="tf-slides">

        {/* Slide 1 — Company name */}
        <div className={`tf-slide${slide === 1 ? ' active' : ''}`}>
          <div className="tf-content">
            <div className="tf-step-badge">
              <div className="tf-step-badge-num">1</div><StepArrow />
            </div>
            <h2 className="grad-head tf-q">What&apos;s your company<br />called?</h2>
            <input className="input-line" type="text" placeholder="Acme Inc."
              autoComplete="organization" autoFocus={slide === 1}
              value={name} onChange={e => setName(e.target.value)} />
            <div className="tf-actions">
              <button className="btn-red" onClick={() => goSlide(2)} disabled={name.length < 2}>
                OK <OkArrow />
              </button>
              <span className="tf-enter-hint">press <kbd>Enter ↵</kbd></span>
            </div>
          </div>
        </div>

        {/* Slide 2 — Website */}
        <div className={`tf-slide${slide === 2 ? ' active' : ''}`}>
          <div className="tf-content">
            <div className="tf-step-badge"><div className="tf-step-badge-num">2</div><StepArrow /></div>
            <h2 className="grad-head tf-q">What&apos;s your website?</h2>
            <input className="input-line" type="text" placeholder="acme.com"
              value={url} onChange={e => setUrl(e.target.value)} />
            <div className="tf-actions">
              <button className="btn-red" onClick={() => goSlide(3)} disabled={url.length < 3}>
                OK <OkArrow />
              </button>
              <span className="tf-enter-hint">press <kbd>Enter ↵</kbd></span>
            </div>
          </div>
        </div>

        {/* Slide 3 — Stage */}
        <div className={`tf-slide${slide === 3 ? ' active' : ''}`}>
          <div className="tf-content">
            <div className="tf-step-badge"><div className="tf-step-badge-num">3</div><StepArrow /></div>
            <h2 className="grad-head tf-q">What stage is<br />your company?</h2>
            <div className="pill-options">
              {STAGES.map((s, i) => (
                <div key={s}
                  className={`pill-opt${stage === s ? ' sel' : ''}`}
                  onClick={() => { setStage(s); setTimeout(() => goSlide(4), 320) }}>
                  <span className="pill-opt-letter">{String.fromCharCode(65 + i)}</span>{s}
                </div>
              ))}
            </div>
            <div className="tf-actions" style={{ marginTop: 32 }}>
              <button className="btn-red" onClick={() => goSlide(4)} disabled={!stage}>
                OK <OkArrow />
              </button>
            </div>
          </div>
        </div>

        {/* Slide 4 — Priorities */}
        <div className={`tf-slide${slide === 4 ? ' active' : ''}`}>
          <div className="tf-content">
            <div className="tf-step-badge"><div className="tf-step-badge-num">4</div><StepArrow /></div>
            <h2 className="grad-head tf-q">What matters most<br />right now?</h2>
            <p style={{ fontSize: 14, color: 'var(--text-60)', marginBottom: 28, marginTop: -20 }}>Pick all that apply.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 4 }}>
              {PRI_OPTS.map(o => (
                <div key={o.id}>
                  <div className={`pill-opt${priorities.has(o.id) ? ' sel' : ''}`}
                    onClick={() => togglePri(o.id)}>
                    <span style={{ fontSize: 18, lineHeight: 1 }}>{o.e}</span>
                    <span style={{ flex: 1 }}>{o.t}</span>
                    <span style={{ fontSize: 12, color: 'var(--text-40)', fontWeight: 400 }}>{o.d}</span>
                  </div>
                  <div className={`pri-detail${priorities.has(o.id) ? ' open' : ''}`}>
                    <div style={{ padding: '0 4px' }}>
                      <input className="pri-detail-input" type="text" placeholder="Any specifics?"
                        onClick={e => e.stopPropagation()}
                        value={priDetails[o.id] || ''}
                        onChange={e => setPriDetails(d => ({ ...d, [o.id]: e.target.value }))} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="tf-actions" style={{ marginTop: 28 }}>
              <button className="btn-red" onClick={() => goSlide(5)} disabled={priorities.size === 0}>
                OK <OkArrow />
              </button>
              <span className="tf-enter-hint">press <kbd>Enter ↵</kbd></span>
            </div>
          </div>
        </div>

        {/* Slide 5 — Connections */}
        <div className={`tf-slide${slide === 5 ? ' active' : ''}`}>
          <div className="tf-content">
            <div className="tf-step-badge"><div className="tf-step-badge-num">5</div><StepArrow /></div>
            <h2 className="grad-head tf-q">Connect your<br />workflows</h2>
            <p style={{ fontSize: 14, color: 'var(--text-60)', marginBottom: 28, marginTop: -20 }}>Optional — add later anytime.</p>
            <div className="conn-list">
              {SVCS.map(svc => (
                <div key={svc.id} className={`conn-card${connections.has(svc.id) ? ' connected' : ''}`}>
                  <div className="conn-left">
                    <div className="conn-icon" style={{ background: svc.color + '12' }}>{svc.icon}</div>
                    <div>
                      <div className="conn-name">{svc.name}</div>
                      <div className="conn-desc">{svc.desc}</div>
                    </div>
                  </div>
                  {connections.has(svc.id)
                    ? <button className="conn-btn done" disabled>✓ Connected</button>
                    : <button className="conn-btn" disabled={connecting[svc.id]}
                        onClick={() => connectSvc(svc.id)}>
                        {connecting[svc.id] ? 'Connecting…' : 'Connect'}
                      </button>}
                </div>
              ))}
              <div className="conn-card">
                <div className="conn-left">
                  <div className="conn-icon" style={{ background: 'rgba(29,78,216,.07)' }}>
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <rect x="1.5" y="1.5" width="17" height="17" rx="3" stroke="#1D4ED8" strokeWidth="1.5"/>
                      <path d="M5.5 8.5v6M5.5 5.5v.5M9 14.5v-3.5c0-1.1.9-2 2-2s2 .9 2 2v3.5M9 8.5v6" stroke="#1D4ED8" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <div>
                    <div className="conn-name">LinkedIn</div>
                    <div className="conn-desc">Relationship context and signals</div>
                  </div>
                </div>
                <span className="badge-soon">Coming soon</span>
              </div>
            </div>
            <div className="tf-actions">
              <button className="btn-red" onClick={() => goSlide(6)}>Continue <OkArrow /></button>
              <span className="tf-skip" onClick={() => goSlide(6)}>Skip for now</span>
            </div>
          </div>
        </div>

        {/* Slide 6 — Success */}
        <div className={`tf-slide${slide === 6 ? ' active' : ''}`}>
          <div className="tf-content" style={{ textAlign: 'center' }}>
            <div className="ob-success-icon">🎯</div>
            <h2 className="grad-head tf-q" style={{ textAlign: 'center' }}>
              Your Prodizzy page<br />is ready
            </h2>
            <p style={{ fontSize: 14, color: 'var(--text-60)', lineHeight: 1.6, marginBottom: 0, marginTop: -16 }}>
              Share this instead of scattered DMs.<br />Every inbound gets ranked automatically.
            </p>
            <div className="url-row">
              <div className="url-text">prodizzy.ai/<span style={{ color: 'var(--red)' }}>{slug}</span></div>
              <button className="copy-btn"
                onClick={() => navigator.clipboard?.writeText(`prodizzy.ai/${slug}`)}>Copy</button>
            </div>
            <div className="inbound-box" style={{ textAlign: 'left' }}>
              <div className="inbound-label">People can reach you as</div>
              <div className="pill-row">
                {['Investor', 'Candidate', 'Partner', 'Creator', 'Other'].map(p => (
                  <span key={p} className="pill">{p}</span>
                ))}
              </div>
            </div>
            <button className="btn-red" style={{ width: '100%', justifyContent: 'center' }}
              onClick={openDash} disabled={saving}>
              {saving ? 'Saving…' : <><span>Open Dashboard</span> <OkArrow /></>}
            </button>
          </div>
        </div>

      </div>

      {/* Footer progress */}
      <div className="tf-footer">
        <div className="tf-footer-track">
          <div className="tf-footer-fill" style={{ width: `${pct}%` }} />
        </div>
        <div className="tf-arrows">
          <button className="tf-arrow" onClick={prev} disabled={slide === 1}>↑</button>
          <button className="tf-arrow" onClick={advance} disabled={slide === TOTAL}>↓</button>
        </div>
      </div>
    </div>
  )
}

function StepArrow() {
  return (
    <svg width="14" height="10" viewBox="0 0 14 10" fill="none">
      <path d="M1 5h12M8 1l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function OkArrow() {
  return (
    <svg width="13" height="10" viewBox="0 0 13 10" fill="none">
      <path d="M1.5 5h10M7 1l4 4-4 4" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
