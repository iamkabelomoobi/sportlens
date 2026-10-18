import type { ListViewServerProps } from 'payload'

type Consumer = Record<string, any>

function ownerName(owner: unknown) {
  if (owner && typeof owner === 'object') {
    const item = owner as Consumer
    return item.name ?? item.email ?? 'Unassigned'
  }
  return 'Unassigned'
}

function ownerEmail(owner: unknown) {
  if (owner && typeof owner === 'object') return (owner as Consumer).email ?? ''
  return ''
}

function badgeClass(value: string) {
  return value.toLowerCase().replace(/\s+/g, '-')
}

export default async function ApiConsumersList({ data, payload, searchParams }: ListViewServerProps) {
  const search = typeof searchParams?.search === 'string' ? searchParams.search : ''
  const docs = (data.docs as Consumer[]) ?? []
  let total = data.totalDocs ?? docs.length
  let active = 0

  try {
    const [all, activeCount, inactiveCount] = await Promise.all([
      payload.count({ collection: 'api-consumers' }),
      payload.count({ collection: 'api-consumers', where: { status: { equals: 'active' } } }),
      payload.count({ collection: 'api-consumers', where: { status: { equals: 'inactive' } } }),
    ])
    total = all.totalDocs
    active = activeCount.totalDocs
    void inactiveCount
  } catch {
    active = docs.filter((doc) => doc.status === 'active').length
  }

  return <main className="sportlens-api-page sportlens-api-list-page">
    <div className="sportlens-api-breadcrumb"><span>⬡</span><span>/</span><span>API Consumers</span></div>
    <header className="sportlens-api-page-heading"><div><h1>API Consumers</h1><p>Manage API keys and external access to SportLens data.</p></div><a className="sportlens-api-primary-button" href="/admin/collections/api-consumers/create">＋ Create API Consumer</a></header>
    <section className="sportlens-api-kpis">
      <Kpi icon="⬡" value={total} label="Total Consumers" trend="+20%" tone="mint" />
      <Kpi icon="⌕" value={active} label="Active Consumers" trend="+14%" tone="blue" />
      <Kpi icon="▥" value="—" label="Total Requests" trend="+32%" tone="mint" />
      <Kpi icon="◷" value="—" label="Uptime" trend="+0.1%" tone="blue" />
    </section>
    <section className="sportlens-api-table-panel">
      <form className="sportlens-api-filters" method="get"><label>⌕ <input name="search" defaultValue={search} placeholder="Search API consumers..." /></label><select name="status" defaultValue=""><option value="">All statuses</option><option value="active">Active</option><option value="inactive">Inactive</option></select><select name="plan" defaultValue=""><option value="">All plans</option><option value="free">Free</option><option value="developer">Developer</option><option value="business">Business</option></select><select name="role" defaultValue=""><option value="">All roles</option><option value="customer">Customer</option><option value="admin">Admin</option></select><button type="submit" className="sportlens-filter-button">Apply</button></form>
      <div className="sportlens-api-table-wrap"><table className="sportlens-api-table"><thead><tr><th></th><th>Name</th><th>Owner</th><th>Role</th><th>Status</th><th>Plan</th><th>Requests (24h)</th><th>Last Used</th><th>Created At</th><th>Actions</th></tr></thead><tbody>{docs.map((doc) => { const status = String(doc.status ?? 'inactive'); const role = String(doc.role ?? 'customer'); const plan = String(doc.plan ?? 'free'); return <tr key={String(doc.id)}><td><input type="checkbox" aria-label={`Select ${doc.name ?? 'consumer'}`} /></td><td><a href={`/admin/collections/api-consumers/${doc.id}`} className="sportlens-consumer-name"><span className="sportlens-consumer-icon">{String(doc.name ?? 'A').slice(0, 1).toUpperCase()}</span><span><b>{String(doc.name ?? 'Unnamed consumer')}</b><small>{String(doc.description ?? 'API integration')}</small></span></a></td><td><span className="sportlens-owner"><b>{ownerName(doc.owner)}</b><small>{ownerEmail(doc.owner)}</small></span></td><td><span className={`sportlens-table-badge sportlens-table-badge--${badgeClass(role)}`}>{role[0].toUpperCase() + role.slice(1)}</span></td><td><span className={`sportlens-status sportlens-status--${status}`}><i />{status[0].toUpperCase() + status.slice(1)}</span></td><td><span className={`sportlens-plan sportlens-plan--${badgeClass(plan)}`}>{plan[0].toUpperCase() + plan.slice(1)}</span></td><td>{doc.requests24h ?? '—'}</td><td>{doc.lastUsedAt ? new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(new Date(doc.lastUsedAt)) : 'Never'}</td><td>{doc.createdAt ? new Intl.DateTimeFormat('en', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(doc.createdAt)) : '—'}</td><td><a href={`/admin/collections/api-consumers/${doc.id}`} aria-label={`Open ${doc.name ?? 'consumer'}`} className="sportlens-row-menu">•••</a></td></tr> })}{docs.length === 0 && <tr><td colSpan={10} className="sportlens-api-empty">No API consumers found.</td></tr>}</tbody></table></div>
      <footer className="sportlens-api-table-footer"><span>Showing {docs.length ? 1 : 0} to {docs.length} of {total} results</span><nav><a href="#" aria-label="Previous page">‹</a><a className="active" href="#">1</a><a href="#">2</a><a href="#" aria-label="Next page">›</a></nav></footer>
    </section>
  </main>
}

function Kpi({ icon, value, label, trend, tone }: { icon: string; value: string | number; label: string; trend: string; tone: string }) {
  return <article className="sportlens-api-kpi"><span className={`sportlens-api-kpi-icon sportlens-api-kpi-icon--${tone}`}>{icon}</span><span><b>{value}</b><small>{label}</small></span><em>↗ {trend}<small>vs last month</small></em></article>
}
