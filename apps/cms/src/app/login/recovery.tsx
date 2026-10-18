'use client'

import { FormEvent, useState } from 'react'
import './login.css'

const userSlug = 'users'

export function BallMark() {
  return (
    <svg className="ball-mark" viewBox="0 0 64 64" aria-hidden="true">
      <circle cx="32" cy="32" r="28" fill="#071217" stroke="#53e59a" strokeWidth="2.5" />
      <path d="m32 17 8 6-3 10h-10l-3-10 8-6Z" fill="#f5f7f6" />
      <path d="m17 22 7 1m23-1-7 1M19 45l9-6m26 6-9-6M25 56l2-10m12 10-2-10" stroke="#53e59a" strokeWidth="3" strokeLinecap="round" />
      <path d="m24 23-7 8 2 10m21-18 7 8-2 10M29 39l-2 7 5 5 5-5-2-7" fill="none" stroke="#53e59a" strokeWidth="2.5" strokeLinejoin="round" />
    </svg>
  )
}

function FeatureIcon({ name }: { name: 'calendar' | 'bars' | 'trend' | 'users' }) {
  const paths = {
    calendar: <><rect x="4" y="6" width="16" height="15" rx="2" /><path d="M8 3v6M16 3v6M4 11h16" /></>,
    bars: <><path d="M5 20v-6M12 20V7M19 20V3" /></>,
    trend: <><path d="m4 17 6-6 4 3 6-8" /><path d="M16 6h4v4" /></>,
    users: <><circle cx="9" cy="8" r="3" /><circle cx="17" cy="9" r="2.5" /><path d="M3 20c.7-4 2.7-6 6-6s5.3 2 6 6M15 15c3.6-.1 5.6 1.6 6 5" /></>,
  }
  return <svg className="feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>
}

export function IntroPanel() {
  return (
    <section className="intro-panel" aria-label="About SportLens">
      <div className="intro-wash" />
      <div className="intro-content">
        <div className="brand-lockup brand-lockup-large"><BallMark /><span>Sport<span>Lens</span></span></div>
        <p className="intro-copy">Football data, fixtures, standings and<br className="desktop-break" /> statistics through one platform.</p>
        <div className="feature-grid">
          {(['calendar', 'bars', 'trend', 'users'] as const).map((icon, index) => { const title = ['Fixtures', 'Standings', 'Statistics', 'Teams & Players'][index]; return <div className="feature" key={title}><div className="feature-icon-box"><FeatureIcon name={icon} /></div><strong>{title}</strong></div> })}
        </div>
      </div>
      <p className="intro-footer">The game is always changing. Stay in the know.</p>
    </section>
  )
}

export function RecoveryFrame({ children }: { children: React.ReactNode }) {
  return <main className="login-page recovery-page"><IntroPanel /><section className="form-panel"><div className="login-card recovery-card"><div className="card-brand"><BallMark /><span>Sport<span>Lens</span></span></div>{children}</div></section></main>
}

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [busy, setBusy] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      const response = await fetch(`/api/${userSlug}/forgot-password`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email }) })
      if (!response.ok) throw new Error('reset request failed')
      setSent(true)
    } catch {
      setError('We could not process that request. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  return <RecoveryFrame><div className="welcome"><h1>{sent ? 'Check your email' : 'Reset your password'}</h1><p>{sent ? 'If an account exists for that address, we sent a reset link.' : 'Enter your email and we’ll send you a secure reset link.'}</p></div>{sent ? <a className="submit-button recovery-link" href="/admin/login">Back to sign in</a> : <form onSubmit={submit}><label htmlFor="recovery-email">Email address</label><div className="input-wrap"><input id="recovery-email" name="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" required autoComplete="email" /></div>{error && <p className="error-message" role="alert">{error}</p>}<button className="submit-button" type="submit" disabled={busy}>{busy ? 'Sending…' : 'Send reset link'}</button></form>}<p className="signup recovery-back"><a href="/admin/login">Back to sign in</a></p></RecoveryFrame>
}

export function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [busy, setBusy] = useState(false)
  const [complete, setComplete] = useState(false)
  const [error, setError] = useState('')

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (password.length < 12) return setError('Use at least 12 characters for your password.')
    if (password !== confirm) return setError('The passwords do not match.')
    const token = new URLSearchParams(window.location.search).get('token') ?? window.location.pathname.split('/').pop()
    if (!token) return setError('This reset link is missing its token. Request a new one.')
    setBusy(true)
    setError('')
    try {
      const response = await fetch(`/api/${userSlug}/reset-password`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ token, password }) })
      if (!response.ok) throw new Error('reset failed')
      setComplete(true)
    } catch {
      setError('This reset link is invalid or expired. Request a new one and try again.')
    } finally {
      setBusy(false)
    }
  }

  return <RecoveryFrame><div className="welcome"><h1>{complete ? 'Password updated' : 'Create a new password'}</h1><p>{complete ? 'Your password has been changed securely.' : 'Choose a new password for your SportLens account.'}</p></div>{complete ? <a className="submit-button recovery-link" href="/admin/login">Continue to sign in</a> : <form onSubmit={submit}><label htmlFor="new-password">New password</label><div className="input-wrap"><input id="new-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 12 characters" required autoComplete="new-password" /></div><label className="recovery-label" htmlFor="confirm-password">Confirm password</label><div className="input-wrap"><input id="confirm-password" type="password" value={confirm} onChange={(event) => setConfirm(event.target.value)} placeholder="Re-enter your password" required autoComplete="new-password" /></div>{error && <p className="error-message" role="alert">{error}</p>}<button className="submit-button" type="submit" disabled={busy}>{busy ? 'Updating…' : 'Update password'}</button></form>}<p className="signup recovery-back"><a href="/admin/login">Back to sign in</a></p></RecoveryFrame>
}
