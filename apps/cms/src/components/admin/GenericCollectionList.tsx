import type { ListViewServerProps } from 'payload'

type Row = Record<string, any>
const labels: Record<string, { title: string; description: string; columns: string[] }> = {
  users: { title: 'Users', description: 'Manage platform users and roles.', columns: ['email', 'role', 'status', 'createdAt'] },
  media: { title: 'Media', description: 'Manage images, videos and files.', columns: ['filename', 'alt', 'createdAt'] },
  teams: { title: 'Teams', description: 'Manage clubs and national football teams.', columns: ['name', 'country', 'city', 'status', 'createdAt'] },
  players: { title: 'Players', description: 'Manage player profiles and information.', columns: ['displayName', 'position', 'nationality', 'status', 'createdAt'] },
  venues: { title: 'Venues', description: 'Manage stadiums and match venues.', columns: ['name', 'city', 'country', 'capacity', 'createdAt'] },
  fixtures: { title: 'Fixtures', description: 'Manage matches, schedules and results.', columns: ['slug', 'status', 'kickoffAt', 'round', 'createdAt'] },
  'match-events': { title: 'Match Events', description: 'Manage goals, cards, substitutions and match events.', columns: ['eventType', 'minute', 'fixture', 'team', 'createdAt'] },
  'player-match-statistics': { title: 'Player Match Statistics', description: 'Manage player performance data and match metrics.', columns: ['player', 'fixture', 'goals', 'assists', 'minutesPlayed'] },
  'team-match-statistics': { title: 'Team Match Statistics', description: 'Manage team performance data and match metrics.', columns: ['team', 'fixture', 'possession', 'shots', 'shotsOnTarget'] },
}

function display(value: unknown) {
  if (value && typeof value === 'object') return String((value as Row).name ?? (value as Row).displayName ?? (value as Row).email ?? '—')
  if (!value) return '—'
  return String(value)
}

export default async function GenericCollectionList({ collectionSlug, data, payload, searchParams }: ListViewServerProps) {
  const meta = labels[collectionSlug] ?? { title: collectionSlug, description: 'Manage SportLens data.', columns: ['id', 'createdAt'] }
  const search = typeof searchParams?.search === 'string' ? searchParams.search : ''
  const docs = (data.docs as Row[]) ?? []
  let total = data.totalDocs ?? docs.length
  try { total = (await payload.count({ collection: collectionSlug })).totalDocs } catch { /* database may be unavailable during local setup */ }
  return <main className="sportlens-api-page sportlens-generic-page"><div className="sportlens-api-breadcrumb"><span>▦</span><span>/</span><span>{meta.title}</span></div><header className="sportlens-api-page-heading"><div><h1>{meta.title}</h1><p>{meta.description}</p></div><a className="sportlens-api-primary-button" href={`/admin/collections/${collectionSlug}/create`}>＋ Create {meta.title.replace(/s$/, '')}</a></header><section className="sportlens-api-kpis"><Kpi value={total} label={`Total ${meta.title}`} icon="▦" /><Kpi value={docs.length} label="Records on page" icon="◉" tone="blue" /><Kpi value="—" label="Active this month" icon="↗" /><Kpi value="—" label="Last updated" icon="◷" tone="gold" /></section><section className="sportlens-api-table-panel"><form method="get" className="sportlens-api-filters"><label>⌕ <input name="search" defaultValue={search} placeholder={`Search ${meta.title.toLowerCase()}...`} /></label><select name="status" defaultValue=""><option value="">All statuses</option><option value="active">Active</option><option value="inactive">Inactive</option><option value="completed">Completed</option></select><button type="submit" className="sportlens-clear-filter">Apply filters</button></form><div className="sportlens-api-table-wrap"><table className="sportlens-api-table"><thead><tr><th></th>{meta.columns.map((column) => <th key={column}>{column.replace(/([A-Z])/g, ' $1')}</th>)}<th>Actions</th></tr></thead><tbody>{docs.map((doc) => <tr key={String(doc.id)}><td><input type="checkbox" aria-label="Select record" /></td>{meta.columns.map((column) => <td key={column}>{column === meta.columns[0] ? <a className="sportlens-consumer-name" href={`/admin/collections/${collectionSlug}/${doc.id}`}><span className="sportlens-consumer-icon">{display(doc[column]).slice(0, 1).toUpperCase()}</span><span><b>{display(doc[column])}</b><small>{doc.slug ?? doc.email ?? 'SportLens record'}</small></span></a> : <span className="sportlens-generic-value">{column.includes('At') || column.includes('Date') ? (doc[column] ? new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(new Date(doc[column])) : '—') : display(doc[column])}</span>}</td>)}<td><a className="sportlens-row-menu" href={`/admin/collections/${collectionSlug}/${doc.id}`}>•••</a></td></tr>)}{docs.length === 0 && <tr><td colSpan={meta.columns.length + 2} className="sportlens-api-empty">No records found.</td></tr>}</tbody></table></div><footer className="sportlens-api-table-footer"><span>Showing {docs.length ? 1 : 0} to {docs.length} of {total} results</span><nav><a href="#">‹</a><a className="active" href="#">1</a><a href="#">2</a><a href="#">›</a></nav></footer></section></main>
}

function Kpi({ value, label, icon, tone = 'mint' }: { value: string | number; label: string; icon: string; tone?: string }) { return <article className="sportlens-api-kpi"><span className={`sportlens-api-kpi-icon sportlens-api-kpi-icon--${tone}`}>{icon}</span><span><b>{value}</b><small>{label}</small></span><em>↗ <small>vs last month</small></em></article> }
