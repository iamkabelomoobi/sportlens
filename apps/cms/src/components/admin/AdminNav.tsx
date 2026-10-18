import { DefaultNav } from '@payloadcms/next/rsc'
import type { ComponentProps } from 'react'

type NavProps = ComponentProps<typeof DefaultNav>

function BallMark() {
  return <svg className="sportlens-admin-mark" viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="28" fill="#071217" stroke="#53e59a" strokeWidth="2.5" /><path d="m32 17 8 6-3 10h-10l-3-10 8-6Z" fill="#f5f7f6" /><path d="m17 22 7 1m23-1-7 1M19 45l9-6m26 6-9-6M25 56l2-10m12 10-2-10" stroke="#53e59a" strokeWidth="3" strokeLinecap="round" /><path d="m24 23-7 8 2 10m21-18 7 8-2 10M29 39l-2 7 5 5 5-5-2-7" fill="none" stroke="#53e59a" strokeWidth="2.5" strokeLinejoin="round" /></svg>
}

export default async function AdminNav(props: NavProps) {
  return <><div className="sportlens-admin-brand"><BallMark /><span>Sport<span>Lens</span></span><button className="sportlens-nav-collapse" aria-label="Toggle navigation">‹</button></div><DefaultNav {...props} /><div className="sportlens-api-card"><span className="sportlens-api-dot">⌁</span><span><strong>SportLens API</strong><small>Give access to your data</small></span><a href="/admin/collections/api-consumers/create" aria-label="Create API consumer">→</a></div></>
}
