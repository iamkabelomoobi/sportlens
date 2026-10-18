import type { ListViewServerProps } from 'payload'

type Competition = Record<string, any>

export default async function CompetitionsList({ data, payload, searchParams }: ListViewServerProps) {
  const search = typeof searchParams?.search === 'string' ? searchParams.search : ''
  const docs = (data.docs as Competition[]) ?? []
  let total = data.totalDocs ?? docs.length
  let active = 0
  let cups = 0
  let seasons = 0
  try {
    const [all, activeCount, cupCount, seasonCount] = await Promise.all([
      payload.count({ collection: 'competitions' }),
      payload.count({ collection: 'competitions', where: { status: { equals: 'active' } } }),
      payload.count({ collection: 'competitions', where: { type: { in: ['cup', 'tournament'] } } }),
      payload.count({ collection: 'seasons' }),
    ])
    total = all.totalDocs; active = activeCount.totalDocs; cups = cupCount.totalDocs; seasons = seasonCount.totalDocs
  } catch {
    active = docs.filter((doc) => doc.status === 'active').length
    cups = docs.filter((doc) => doc.type === 'cup' || doc.type === 'tournament').length
  }
  return <main className="sportlens-api-page sportlens-competition-page">
    <div className="sportlens-api-breadcrumb"><span>♜</span><span>/</span><span>Competitions</span></div>
    <header className="sportlens-api-page-heading"><div><h1>Competitions</h1><p>Manage football competitions, leagues, cups and tournaments.</p></div><a className="sportlens-api-primary-button" href="/admin/collections/competitions/create">＋ Create Competition</a></header>
    <section className="sportlens-api-kpis"><Kpi icon="♜" value={total} label="Total Competitions" trend="+12%" tone="mint" /><Kpi icon="◉" value={active} label="Active Competitions" trend="+6%" tone="blue" /><Kpi icon="▣" value={seasons} label="Upcoming Seasons" trend="+27%" tone="mint" /><Kpi icon="♜" value={cups} label="Cups & Tournaments" trend="+0%" tone="gold" /></section>
    <section className="sportlens-api-table-panel"><form className="sportlens-api-filters sportlens-competition-filters" method="get"><label>⌕ <input name="search" defaultValue={search} placeholder="Search competitions by name, country or type..." /></label><span className="sportlens-filter-label">Type</span><select name="type" defaultValue=""><option value="">All types</option><option value="league">League</option><option value="cup">Cup</option><option value="tournament">Tournament</option></select><span className="sportlens-filter-label">Country</span><select name="country" defaultValue=""><option value="">All countries</option><option value="England">England</option><option value="Spain">Spain</option><option value="Germany">Germany</option></select><span className="sportlens-filter-label">Status</span><select name="status" defaultValue=""><option value="">All statuses</option><option value="active">Active</option><option value="inactive">Inactive</option></select><button type="submit" className="sportlens-clear-filter">Clear filters</button></form><div className="sportlens-api-table-wrap"><table className="sportlens-api-table sportlens-competition-table"><thead><tr><th></th><th>Logo</th><th>Name ↕</th><th>Country</th><th>Type</th><th>Status</th><th>Teams</th><th>Seasons</th><th>Created At</th><th>Actions</th></tr></thead><tbody>{docs.map((doc) => { const type = String(doc.type ?? 'league'); const status = String(doc.status ?? 'inactive'); return <tr key={String(doc.id)}><td><input type="checkbox" aria-label={`Select ${doc.name ?? 'competition'}`} /></td><td><span className="sportlens-competition-logo">{type === 'cup' ? '♜' : '◉'}</span></td><td><a className="sportlens-consumer-name" href={`/admin/collections/competitions/${doc.id}`}><span><b>{String(doc.name ?? 'Unnamed competition')}</b><small>{String(doc.slug ?? '')}</small></span></a></td><td><span className="sportlens-country">{String(doc.country ?? '—')}</span></td><td><span className={`sportlens-table-badge sportlens-table-badge--${type}`}>{type[0].toUpperCase() + type.slice(1)}</span></td><td><span className={`sportlens-status sportlens-status--${status}`}><i />{status[0].toUpperCase() + status.slice(1)}</span></td><td>{doc.teamCount ?? '—'}</td><td>{doc.seasonCount ?? '—'}</td><td>{doc.createdAt ? new Intl.DateTimeFormat('en', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(doc.createdAt)) : '—'}</td><td><a href={`/admin/collections/competitions/${doc.id}`} className="sportlens-row-menu">•••</a></td></tr> })}{docs.length === 0 && <tr><td colSpan={10} className="sportlens-api-empty">No competitions found.</td></tr>}</tbody></table></div><footer className="sportlens-api-table-footer"><span>Showing {docs.length ? 1 : 0} to {docs.length} of {total} results</span><nav><a href="#">‹</a><a className="active" href="#">1</a><a href="#">2</a><a href="#">3</a><a href="#">4</a><a href="#">5</a><a href="#">›</a></nav></footer></section>
  </main>
}

function Kpi({ icon, value, label, trend, tone }: { icon: string; value: string | number; label: string; trend: string; tone: string }) { return <article className="sportlens-api-kpi"><span className={`sportlens-api-kpi-icon sportlens-api-kpi-icon--${tone}`}>{icon}</span><span><b>{value}</b><small>{label}</small></span><em>↗ {trend}<small>vs last month</small></em></article> }
