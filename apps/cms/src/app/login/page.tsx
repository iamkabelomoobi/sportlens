'use client'

import { FormEvent, useState } from 'react'
import './login.css'

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

function BallMark() {
  return (
    <svg className="ball-mark" viewBox="0 0 64 64" aria-hidden="true">
      <circle cx="32" cy="32" r="28" fill="#071217" stroke="#53e59a" strokeWidth="2.5" />
      <path d="m32 17 8 6-3 10h-10l-3-10 8-6Z" fill="#f5f7f6" />
      <path d="m17 22 7 1m23-1-7 1M19 45l9-6m26 6-9-6M25 56l2-10m12 10-2-10" stroke="#53e59a" strokeWidth="3" strokeLinecap="round" />
      <path d="m24 23-7 8 2 10m21-18 7 8-2 10M29 39l-2 7 5 5 5-5-2-7" fill="none" stroke="#53e59a" strokeWidth="2.5" strokeLinejoin="round" />
    </svg>
  )
}

function Icon({ name }: { name: 'calendar' | 'bars' | 'trend' | 'users' }) {
  const paths = {
    calendar: <><rect x="4" y="6" width="16" height="15" rx="2" /><path d="M8 3v6M16 3v6M4 11h16" /></>,
    bars: <><path d="M5 20v-6M12 20V7M19 20V3" /></>,
    trend: <><path d="m4 17 6-6 4 3 6-8" /><path d="M16 6h4v4" /></>,
    users: <><circle cx="9" cy="8" r="3" /><circle cx="17" cy="9" r="2.5" /><path d="M3 20c.7-4 2.7-6 6-6s5.3 2 6 6M15 15c3.6-.1 5.6 1.6 6 5" /></>,
  }
  return <svg className="feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>
}

function FieldIcon({ type }: { type: 'mail' | 'lock' }) {
  return type === 'mail' ? (
    <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m4 7 8 6 8-6" /></svg>
  ) : (
    <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="10" width="14" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3M12 15v2" /></svg>
  )
}

function EyeIcon({ open }: { open: boolean }) {
  return <svg viewBox="0 0 24 24" aria-hidden="true">{open ? <><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" /><circle cx="12" cy="12" r="2.5" /></> : <><path d="m3 3 18 18M10.6 6.2A9.8 9.8 0 0 1 12 6c6.5 0 10 6 10 6a17 17 0 0 1-3.1 3.7M6.2 6.2C3.5 8.1 2 12 2 12s3.5 6 10 6c1.3 0 2.5-.3 3.5-.7" /></>}</svg>
}

export default function LoginPage() {
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true)
    setError('')
    const form = new FormData(event.currentTarget)
    const isAdminLogin = window.location.pathname.startsWith('/admin')

    try {
      const response = await fetch(isAdminLogin ? '/api/users/login' : `${apiUrl}/api/auth/sign-in/email`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: form.get('email'), password: form.get('password') }),
      })
      if (response.ok) window.location.assign(isAdminLogin ? '/admin' : '/dashboard')
      else setError('Unable to sign in. Check your details and verify your email.')
    } catch {
      setError('The sign-in service is unavailable. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  function social(provider: 'google' | 'github') {
    window.location.assign(`${apiUrl}/api/auth/sign-in/social?provider=${provider}&callbackURL=${encodeURIComponent('/dashboard')}`)
  }

  return (
    <main className="login-page">
      <section className="intro-panel" aria-label="About SportLens">
        <div className="intro-wash" />
        <div className="intro-content">
          <div className="brand-lockup brand-lockup-large"><BallMark /><span>Sport<span>Lens</span></span></div>
          <p className="intro-copy">Football data, fixtures, standings and<br className="desktop-break" /> statistics through one platform.</p>
          <div className="feature-grid">
            {[
              ['calendar', 'Fixtures', 'Never miss\na match'],
              ['bars', 'Standings', 'Track every\nleague'],
              ['trend', 'Statistics', 'In-depth\ninsights'],
              ['users', 'Teams & Players', 'All the data\nin one place'],
            ].map(([icon, title, copy]) => (
              <div className="feature" key={title}>
                <div className="feature-icon-box"><Icon name={icon as 'calendar' | 'bars' | 'trend' | 'users'} /></div>
                <strong>{title}</strong>
                <span>{copy.split('\n').map((line) => <span key={line}>{line}<br /></span>)}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="intro-footer">The game is always changing. Stay in the know.</p>
      </section>

      <section className="form-panel">
        <div className="login-card">
          <div className="card-brand"><BallMark /><span>Sport<span>Lens</span></span></div>
          <div className="welcome"><h1>Welcome back</h1><p>Sign in to continue to SportLens.</p></div>
          <form onSubmit={submit}>
            <label htmlFor="email">Email address</label>
            <div className="input-wrap"><FieldIcon type="mail" /><input id="email" name="email" type="email" placeholder="you@example.com" required autoComplete="email" /></div>
            <div className="field-heading"><label htmlFor="password">Password</label><a href="/admin/forgot">Forgot password?</a></div>
            <div className="input-wrap"><FieldIcon type="lock" /><input id="password" name="password" type={showPassword ? 'text' : 'password'} placeholder="Enter your password" required autoComplete="current-password" /><button className="icon-button" type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? 'Hide password' : 'Show password'}><EyeIcon open={showPassword} /></button></div>
            {error && <p className="error-message" role="alert">{error}</p>}
            <button className="submit-button" type="submit" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
          </form>
          <div className="or-divider"><span>or continue with</span></div>
          <div className="social-row"><button type="button" onClick={() => social('google')}><span className="google-g">G</span>Google</button><button type="button" onClick={() => social('github')}><span className="apple">●</span>Apple</button><button type="button" onClick={() => social('google')}><span className="microsoft"><i /><i /><i /><i /></span>Microsoft</button></div>
          <p className="signup">Don’t have an account? <a href="/register">Sign up</a></p>
        </div>
      </section>
    </main>
  )
}
