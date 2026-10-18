'use client'

import { useEffect, useState } from 'react'

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

export default function DashboardPage() {
  const [ready, setReady] = useState(false)
  useEffect(() => {
    fetch(`${apiUrl}/api/auth/get-session`, { credentials: 'include' })
      .then((response) => {
        if (!response.ok) window.location.assign('/login')
        else setReady(true)
      })
      .catch(() => window.location.assign('/login'))
  }, [])
  if (!ready) return <main style={{ padding: 24, fontFamily: 'system-ui' }}>Loading…</main>
  return (
    <main style={{ maxWidth: 900, margin: '8vh auto', padding: 24, fontFamily: 'system-ui' }}>
      <p style={{ color: '#64748b', letterSpacing: 1 }}>SPORTLENS DEVELOPER DASHBOARD</p>
      <h1>Welcome to your workspace</h1>
      <p>Choose an organization to manage applications, API keys, usage, and security.</p>
    </main>
  )
}
