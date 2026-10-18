import type { ListViewServerProps } from 'payload'

type Season = Record<string, any>

function competitionName(value: unknown) {
  return value && typeof value === 'object' ? String((value as Season).name ?? 'Competition') : 'Competition'
}

function date(value: unknown) {
  if (!value) return '—'
  return new Intl.DateTimeFormat('en', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(String(value)))
}

export default async function SeasonsList({ data, payload, searchParams }: ListViewServerProps) {
  const search = typeof searchParams?.search === 'string' ? searchParams.search : ''
  const docs = (data.docs as Season[]) ?? []
  let total = data.totalDocs ?? docs.length
  let active = 0
  let upcoming = 0
  let completed = 0
  try {
    const [all, activeCount, upcomingCount, completedCount] = await Promise.all([
      payload.count({ collection: 'seasons' }),
      payload.count({ collection: 'seasons', where: { status: { equals: 'active' } } }),
      payload.count({ collection: 'seasons', where: { status: { equals: 'upcoming' } } }),
      payload.count({ collection: 'seasons', where: { status: { equals: 'completed' } } }),
    ])
    total = all.totalDocs; active = activeCount.totalDocs; upcoming = upcomingCount.totalDocs; completed = completedCount.totalDocs
  } catch {
    active = docs.filter((doc) => doc.status === 'active').length
    upcoming = docs.filter((doc) => doc.status === 'upcoming').length
    completed = docs.filter((doc) => doc.status === 'completed').length
  }
  return <main className="sportlens-api-page sportlens-season-page"><div className="sportlens-api-breadcrumb"><span>▣</span><span>/</span><span>Seasons</span></div><header className="sportlens-api-page-heading"><div><h1>Seasons</h1><p>Manage competition seasons, dates and current football campaigns.</p></div><a className="sportlens-api-primary-button" href="/admin/collections/seasons/create">＋ Create Season</a></header><section className="sportlens-api-kpis"><Kpi icon="▣" value={total} label="Total Seasons" trend="+18%" tone="mint" /><Kpi icon="◉" value={active} label="Active Seasons" trend="+12%" tone="blue" /><Kpi icon="◷" value={upcoming} label="Upcoming Seasons" trend="+27%" tone="mint" /><Kpi icon="✓" value={completed} label="Completed Seasons" trend="+8%" tone="gold" /></section><section className="sportlens-api-table-panel"><form className="sportlens-api-filters sportlens-competition-filters" method="get"><label>⌕ <input name="search" defaultValue={search} placeholder="Search seasons by name or competition..." /></label><span className="sportlens-filter-label">Competition</span><select name="competition" defaultValue=""><option value="">All competitions</option></select><span className="sportlens-filter-label">Status</span><select name="status" defaultValue=""><option value="">All statuses</option><option value="upcoming">Upcoming</option><option value="active">Active</option><option value="completed">Completed</option></select><button type="submit" className="sportlens-clear-filter">Clear filters</button></form><div className="sportlens-api-table-wrap"><table className="sportlens-api-table"><thead><tr><th></th><th>Name</th><th>Competition</th><th>Start Date</th><th>End Date</th><th>Status</th><th>Teams</th><th>Fixtures</th><th>Created At</th><th>Actions</th></tr></thead><tbody>{docs.map((doc) => { const status = String(doc.status ?? 'upcoming'); return <tr key={String(doc.id)}><td><input type="checkbox" aria-label={`Select ${doc.name ?? 'season'}`} /></td><td><a href={`/admin/collections/seasons/${doc.id}`} className="sportlens-consumer-name"><span className="sportlens-season-icon">▣</span><span><b>{String(doc.name ?? 'Unnamed season')}</b><small>{String(doc.slug ?? '')}</small></span></a></td><td><span className="sportlens-country">{competitionName(doc.competition)}</span></td><td>{date(doc.startDate)}</td><td>{date(doc.endDate)}</td><td><span className={`sportlens-status sportlens-status--${status}`}><i />{status[0].toUpperCase() + status.slice(1)}</span></td><td>{doc.teamCount ?? '—'}</td><td>{doc.fixtureCount ?? '—'}</td><td>{date(doc.createdAt)}</td><td><a href={`/admin/collections/seasons/${doc.id}`} className="sportlens-row-menu">•••</a></td></tr> })}{docs.length === 0 && <tr><td colSpan={10} className="sportlens-api-empty">No seasons found.</td></tr>}</tbody></table></div><footer className="sportlens-api-table-footer"><span>Showing {docs.length ? 1 : 0} to {docs.length} of {total} results</span><nav><a href="#">‹</a><a className="active" href="#">1</a><a href="#">2</a><a href="#">3</a><a href="#">4</a><a href="#">›</a></nav></footer></section></main>
}

function Kpi({ icon, value, label, trend, tone }: { icon: string; value: string | number; label: string; trend: string; tone: string }) { return <article className="sportlens-api-kpi"><span className={`sportlens-api-kpi-icon sportlens-api-kpi-icon--${tone}`}>{icon}</span><span><b>{value}</b><small>{label}</small></span><em>↗ {trend}<small>vs last month</small></em></article> }
