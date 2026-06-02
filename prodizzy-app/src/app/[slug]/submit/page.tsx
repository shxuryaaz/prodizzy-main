'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

const CATS = ['Investor', 'Candidate', 'Partner', 'Creator', 'Media', 'Other']

export default function SubmitPage() {
  const router = useRouter()
  const params = useParams()
  const slug = params.slug as string

  const [step, setStep]         = useState(1)
  const [ibName, setIbName]     = useState('')
  const [ibCo, setIbCo]         = useState('')
  const [ibLi, setIbLi]         = useState('')
  const [ibWeb, setIbWeb]       = useState('')
  const [category, setCategory] = useState('')
  const [why, setWhy]           = useState('')
  const [relevant, setRelevant] = useState('')
  const [submitting, setSubmitting] = useState(false)

  function goStep(n: number) {
    setStep(n)
    window.scrollTo({ top: 0, behavior: 'instant' })
  }

  function dotClass(i: number) {
    if (i < step) return 'ib-prog-dot done'
    if (i === step) return 'ib-prog-dot active'
    return 'ib-prog-dot'
  }

  async function submit() {
    setSubmitting(true)
    try {
      const supabase = createClient()
      const { data: co } = await supabase
        .from('companies').select('id').eq('slug', slug).single()
      if (co) {
        await supabase.from('inbound').insert({
          company_id: co.id,
          name: ibName, company: ibCo,
          linkedin: ibLi, website: ibWeb,
          category, why, relevant
        })
      }
    } catch {}
    router.push(`/${slug}/submit/success`)
  }

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      {/* Nav */}
      <div className="ib-nav">
        <button className="ib-back" onClick={() => step === 1 ? router.back() : goStep(step - 1)}>
          <svg width="14" height="10" viewBox="0 0 14 10" fill="none">
            <path d="M13 5H1M5 1L1 5l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back
        </button>
        <div className="ib-prog">
          {[1, 2, 3].map(i => <div key={i} className={dotClass(i)} />)}
        </div>
      </div>

      <div className="ib-canvas">

        {/* Step 1 — Identity */}
        <div className={`ib-step${step === 1 ? ' active' : ''}`}>
          <h2 className="grad-head ib-q">Who are you?</h2>
          <p className="ib-hint">A few details so we can put your submission in context.</p>
          <div className="ib-fields">
            <div>
              <label className="ib-field-label">Your name</label>
              <input className="ib-input" type="text" placeholder="Alex Johnson"
                autoComplete="name" value={ibName} onChange={e => setIbName(e.target.value)} />
            </div>
            <div>
              <label className="ib-field-label">Company</label>
              <input className="ib-input" type="text" placeholder="Acme Ventures"
                autoComplete="organization" value={ibCo} onChange={e => setIbCo(e.target.value)} />
            </div>
            <div>
              <label className="ib-field-label">LinkedIn URL</label>
              <input className="ib-input" type="url" placeholder="linkedin.com/in/alexjohnson"
                value={ibLi} onChange={e => setIbLi(e.target.value)} />
            </div>
            <div>
              <label className="ib-field-label">
                Website{' '}
                <span style={{ fontSize: 10, color: 'var(--text-25)', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>optional</span>
              </label>
              <input className="ib-input" type="url" placeholder="acme.vc"
                value={ibWeb} onChange={e => setIbWeb(e.target.value)} />
            </div>
          </div>
          <button className="ib-btn" onClick={() => goStep(2)}
            disabled={ibName.length < 2 || ibCo.length < 1}>
            Continue
            <svg width="13" height="10" viewBox="0 0 13 10" fill="none">
              <path d="M1.5 5h10M7 1l4 4-4 4" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {/* Step 2 — Category */}
        <div className={`ib-step${step === 2 ? ' active' : ''}`}>
          <h2 className="grad-head ib-q">How can you help?</h2>
          <p className="ib-hint">This helps Prodizzy route your submission to the right priority.</p>
          <div className="cat-grid">
            {CATS.map(c => (
              <div key={c}
                className={`cat-pill${category === c ? ' sel' : ''}`}
                onClick={() => { setCategory(c); setTimeout(() => goStep(3), 220) }}>
                {c}
              </div>
            ))}
          </div>
          <button className="ib-btn" onClick={() => goStep(3)} disabled={!category}>
            Continue
            <svg width="13" height="10" viewBox="0 0 13 10" fill="none">
              <path d="M1.5 5h10M7 1l4 4-4 4" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {/* Step 3 — Message */}
        <div className={`ib-step${step === 3 ? ' active' : ''}`}>
          <h2 className="grad-head ib-q">Tell us more.</h2>
          <p className="ib-hint">Be direct. What do you want and why are you the right person for it?</p>
          <div className="ib-fields">
            <div>
              <label className="ib-field-label">Why are you reaching out?</label>
              <textarea className="ib-textarea"
                placeholder="Be specific — what do you want from this conversation?"
                value={why} onChange={e => setWhy(e.target.value)} />
            </div>
            <div>
              <label className="ib-field-label">Why are you relevant?</label>
              <textarea className="ib-textarea"
                placeholder="What makes you the right person? Credentials, connections, track record."
                value={relevant} onChange={e => setRelevant(e.target.value)} />
            </div>
          </div>
          <button className="ib-btn" onClick={submit}
            disabled={why.length < 10 || relevant.length < 10 || submitting}>
            {submitting
              ? <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,.25)', borderTopColor: 'rgba(255,255,255,.9)', borderRadius: '50%', animation: 'spin .7s linear infinite', display: 'inline-block' }} />
                  Submitting…
                </span>
              : <>Submit <svg width="13" height="10" viewBox="0 0 13 10" fill="none"><path d="M1.5 5h10M7 1l4 4-4 4" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg></>}
          </button>
        </div>

      </div>
    </div>
  )
}
