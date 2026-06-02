import Link from 'next/link'

export default function SuccessPage() {
  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <div className="suc-canvas">
        <div className="suc-check">
          <svg width="18" height="14" viewBox="0 0 18 14" fill="none">
            <path d="M1.5 7l5 5L16.5 1.5" stroke="#16A34A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h1 className="grad-head suc-headline">You&apos;re in.</h1>
        <p className="suc-sub">
          Prodizzy will make sure the right context reaches the team. If there&apos;s a fit, you&apos;ll hear back.
        </p>
        <div className="suc-divider" />
        <div className="suc-aside">Want your own page?</div>
        <div className="suc-card">
          <div>
            <div className="suc-card-title">Get your own Prodizzy page</div>
            <div className="suc-card-sub">Stop missing the people who matter. One link. Every opportunity ranked.</div>
          </div>
          <Link href="/">
            <button className="suc-card-btn">Get started</button>
          </Link>
        </div>
      </div>
    </div>
  )
}
