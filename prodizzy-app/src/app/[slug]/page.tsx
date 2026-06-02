import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

const PRI_LABELS: Record<string, string> = {
  raise: 'Fundraising', hire: 'Hiring', partner: 'Partnerships',
  distro: 'Distribution', cust: 'Customers'
}

interface Priority { id: string; type: string; details: string }

export default async function PublicPage({ params }: { params: { slug: string } }) {
  const supabase = createClient()

  const { data: company } = await supabase
    .from('companies')
    .select('*')
    .eq('slug', params.slug)
    .single()

  if (!company) notFound()

  const { data: priorities } = await supabase
    .from('priorities')
    .select('*')
    .eq('company_id', company.id)

  const pris: Priority[] = priorities || []
  const firstName = company.name.split(' ')[0]

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      {/* Nav */}
      <div className="pub-nav">
        <Link href="/">
          <button className="pub-nav-back">
            <svg width="14" height="10" viewBox="0 0 14 10" fill="none">
              <path d="M13 5H1M5 1L1 5l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Back
          </button>
        </Link>
        <span className="pub-powered">Powered by <strong>Prodizzy</strong></span>
      </div>

      <div className="pub-canvas">
        {/* Eyebrow */}
        <div className="pub-eyebrow">
          <span className="pub-dot" />
          <span>prodizzy.ai/{params.slug}</span>
        </div>

        {/* Company name */}
        <h1 className="grad-head pub-company-name">{company.name}</h1>
        <p className="pub-tagline">
          We&apos;re building something worth knowing about. Reach us through this page and Prodizzy will make sure the right opportunities get our attention.
        </p>

        {/* Focus pills */}
        <div className="pub-section-label">Currently focused on</div>
        <div className="pub-focus-pills">
          {pris.length > 0
            ? pris.map(p => (
                <div key={p.id} className="pub-focus-pill">
                  <span className="pub-pill-dot" />
                  {PRI_LABELS[p.type] || p.type}
                </div>
              ))
            : ['Fundraising', 'Hiring'].map(l => (
                <div key={l} className="pub-focus-pill">
                  <span className="pub-pill-dot" />{l}
                </div>
              ))}
        </div>

        <div className="pub-divider" />

        {/* Connect section */}
        <div>
          <h2 className="grad-head pub-connect-head">
            Want to connect<br />with {firstName}?
          </h2>
          <p className="pub-connect-sub">
            Instead of cold emails and scattered DMs, submit your details here. Prodizzy surfaces the right opportunities to our team — ranked by what actually matters.
          </p>
          <div className="pub-cat-row">
            {['Investor', 'Candidate', 'Partner', 'Creator', 'Media', 'Other'].map(c => (
              <span key={c} className="pub-cat-tag">{c}</span>
            ))}
          </div>
          <Link href={`/${params.slug}/submit`}>
            <button className="pub-cta-btn">
              Continue
              <svg width="13" height="10" viewBox="0 0 13 10" fill="none">
                <path d="M1.5 5h10M7 1l4 4-4 4" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </Link>
        </div>
      </div>
    </div>
  )
}
