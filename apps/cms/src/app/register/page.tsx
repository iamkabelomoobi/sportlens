'use client'

import { FormEvent, useState } from 'react'
import { RecoveryFrame } from '../login/recovery'

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [busy, setBusy] = useState(false)
  const [complete, setComplete] = useState(false)
  const [error, setError] = useState('')

  function update(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    if (form.password.length < 12) return setError('Use at least 12 characters for your password.')
    if (form.password !== form.confirm) return setError('The passwords do not match.')
    setBusy(true)
    try {
      const response = await fetch(`${apiUrl}/api/auth/sign-up/email`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ name: form.name, email: form.email, password: form.password }),
      })
      if (!response.ok) throw new Error('registration failed')
      setComplete(true)
    } catch {
      setError('We could not create your account. The email may already be in use.')
    } finally {
      setBusy(false)
    }
  }

  return <RecoveryFrame><div className="welcome"><h1>{complete ? 'Account created' : 'Create your account'}</h1><p>{complete ? 'Check your email to verify your SportLens account.' : 'Join SportLens and keep your football data in one place.'}</p></div>{complete ? <a className="submit-button recovery-link" href="/login">Continue to sign in</a> : <form onSubmit={submit}><label htmlFor="name">Full name</label><div className="input-wrap"><input id="name" name="name" type="text" value={form.name} onChange={(event) => update('name', event.target.value)} placeholder="Your name" required autoComplete="name" /></div><label className="recovery-label" htmlFor="register-email">Email address</label><div className="input-wrap"><input id="register-email" name="email" type="email" value={form.email} onChange={(event) => update('email', event.target.value)} placeholder="you@example.com" required autoComplete="email" /></div><label className="recovery-label" htmlFor="register-password">Password</label><div className="input-wrap"><input id="register-password" name="password" type="password" value={form.password} onChange={(event) => update('password', event.target.value)} placeholder="At least 12 characters" required autoComplete="new-password" /></div><label className="recovery-label" htmlFor="register-confirm">Confirm password</label><div className="input-wrap"><input id="register-confirm" name="confirm" type="password" value={form.confirm} onChange={(event) => update('confirm', event.target.value)} placeholder="Re-enter your password" required autoComplete="new-password" /></div>{error && <p className="error-message" role="alert">{error}</p>}<button className="submit-button" type="submit" disabled={busy}>{busy ? 'Creating account…' : 'Create account'}</button></form>}<p className="signup recovery-back">Already have an account? <a href="/login">Sign in</a></p></RecoveryFrame>
}
