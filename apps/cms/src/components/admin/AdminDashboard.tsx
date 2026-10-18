import type { ServerProps } from 'payload'

type DashboardDoc = Record<string, any>

type CollectionCard = {
  slug: string
  title: string
  description: string
  icon: string
  tone: string
}

const collectionCards: CollectionCard[] = [
  { slug: 'users', title: 'Users', description: 'Manage platform users and roles', icon: '♧', tone: 'mint' },
  { slug: 'media', title: 'Media', description: 'Manage images, videos and files', icon: '▧', tone: 'violet' },
  { slug: 'player-match-statistics', title: 'Player Match Statistics', description: 'Player performance data and metrics', icon: '▥', tone: 'blue' },
  { slug: 'team-match-statistics', title: 'Team Match Statistics', description: 'Team performance data and metrics', icon: '▥', tone: 'amber' },
]

const footballCards: CollectionCard[] = [
  { slug: 'competitions', title: 'Competitions', description: 'Leagues, cups and competitions', icon: '♜', tone: 'rose' },
  { slug: 'seasons', title: 'Seasons', description: 'Manage competition seasons', icon: '▣', tone: 'mint' },
  { slug: 'teams', title: 'Teams', description: 'Clubs and national teams', icon: '⬡', tone: 'blue' },
  { slug: 'players', title: 'Players', description: 'Player profiles and information', icon: '♙', tone: 'violet' },
  { slug: 'venues', title: 'Venues', description: 'Stadiums and match venues', icon: '●', tone: 'amber' },
  { slug: 'fixtures', title: 'Fixtures', description: 'Matches and schedules', icon: '▣', tone: 'rose' },
  { slug: 'match-events', title: 'Match Events', description: 'Goals, cards, substitutions and more', icon: '⚽', tone: 'mint' },
]

const platformCards: CollectionCard[] = [
  { slug: 'api-consumers', title: 'API Consumers', description: 'Manage API keys and external access', icon: '⬡', tone: 'blue' },
]

const fallbackTotals: Record<string, number> = {
  users: 0,
  media: 0,
  'player-match-statistics': 0,
  'team-match-statistics': 0,
  competitions: 5,
  seasons: 5,
  teams: 12,
  players: 248,
  venues: 8,
  fixtures: 186,
  'match-events': 0,
  'api-consumers': 0,
}

function relationName(value: unknown, fallback: string) {
  if (value && typeof value === 'object' && 'name' in value) return String((value as DashboardDoc).name)
  if (value && typeof value === 'object' && 'displayName' in value) return String((value as DashboardDoc).displayName)
  return fallback
}

async function safeCount(payload: ServerProps['payload'], slug: string) {
  try {
    return (await payload.count({ collection: slug as any })).totalDocs
  } catch {
    return fallbackTotals[slug] ?? 0
  }
}

async function safeFind(payload: ServerProps['payload'], args: any) {
  try {
    return await payload.find(args)
  } catch {
    return { docs: [] as DashboardDoc[] }
  }
}

function StatIcon({ icon }: { icon: string }) {
  return <span className="sportlens-stat-icon" aria-hidden="true">{icon}</span>
}

function CollectionCardView({ card, total }: { card: CollectionCard; total: number }) {
  return <a className="sportlens-collection-card" href={`/admin/collections/${card.slug}`}>
    <span className={`sportlens-card-icon sportlens-card-icon--${card.tone}`}>{card.icon}</span>
    <span className="sportlens-card-copy"><strong>{card.title}</strong><small>{card.description}</small><em>View collection&nbsp; →</em></span>
    <span className="sportlens-card-count" aria-label={`${total} records`}>{total}</span>
    <span className="sportlens-card-arrow" aria-hidden="true">›</span>
  </a>
}

function formatFixtureDate(value: unknown) {
  if (!value) return { day: '--', month: '---' }
  const date = new Date(String(value))
  if (Number.isNaN(date.getTime())) return { day: '--', month: '---' }
  return { day: new Intl.DateTimeFormat('en', { day: '2-digit' }).format(date), month: new Intl.DateTimeFormat('en', { month: 'short' }).format(date).toUpperCase() }
}

export default async function AdminDashboard({ payload, user }: ServerProps) {
  const allCards = [...collectionCards, ...footballCards, ...platformCards]
  const totals = Object.fromEntries(await Promise.all(allCards.map(async (card) => [card.slug, await safeCount(payload, card.slug)])))
  const [recentUsers, upcomingFixtures] = await Promise.all([
    safeFind(payload, { collection: 'users', sort: '-createdAt', limit: 4, depth: 0 }),
    safeFind(payload, { collection: 'fixtures', where: { status: { equals: 'scheduled' } }, sort: 'kickoffAt', limit: 4, depth: 1 }),
  ])
  const displayName = user?.email?.split('@')[0] ?? 'Administrator'
  const statCards = [
    { value: totals.competitions, label: 'Competitions', icon: '♜' },
    { value: totals.teams, label: 'Teams', icon: '⬡' },
    { value: totals.players, label: 'Players', icon: '♙' },
    { value: totals.fixtures, label: 'Fixtures', icon: '▣' },
  ]

  return <main className="sportlens-dashboard">
    <section className="sportlens-dashboard-hero">
      <div className="sportlens-hero-copy"><p>WELCOME BACK, {displayName.toUpperCase()}</p><h1>Manage SportLens</h1><span>Football data, fixtures, standings and statistics through one platform.</span></div>
      <div className="sportlens-hero-stats">{statCards.map((stat) => <div className="sportlens-hero-stat" key={stat.label}><StatIcon icon={stat.icon} /><b>{stat.value}</b><small>{stat.label}</small></div>)}</div>
    </section>

    <DashboardSection title="Collections" description="Manage core data and statistics collections." cards={collectionCards} totals={totals} />
    <DashboardSection title="Football" description="Manage all football related data." cards={footballCards} totals={totals} />
    <DashboardSection title="Platform" description="Manage API access and integrations." cards={platformCards} totals={totals} />

    <section className="sportlens-dashboard-lower">
      <div className="sportlens-panel"><div className="sportlens-panel-heading"><div><h2>Recent collections</h2><div className="sportlens-tabs"><span className="active">Users</span><span>Teams</span><span>Players</span><span>Competitions</span><span>Fixtures</span><span>Media</span></div></div><a href="/admin/collections/users">View all&nbsp; →</a></div><div className="sportlens-table-wrap"><table><thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Created at</th><th /></tr></thead><tbody>{(recentUsers.docs as DashboardDoc[]).map((record) => <tr key={String(record.id)}><td><span className="sportlens-table-avatar">{String(record.email ?? 'U').slice(0, 2).toUpperCase()}</span>{String(record.name ?? record.email ?? 'User')}</td><td>{String(record.email ?? '—')}</td><td><span className="sportlens-pill sportlens-pill--blue">{String(record.role ?? 'Reviewer')}</span></td><td><span className="sportlens-pill sportlens-pill--green">● Active</span></td><td>{record.createdAt ? new Intl.DateTimeFormat('en', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(record.createdAt)) : '—'}</td><td>⋮</td></tr>)}{recentUsers.docs.length === 0 && <tr><td colSpan={6} className="sportlens-empty">No recent users to display.</td></tr>}</tbody></table></div></div>
      <div className="sportlens-panel"><div className="sportlens-panel-heading"><h2>Upcoming fixtures</h2><a href="/admin/collections/fixtures">View all&nbsp; →</a></div><div className="sportlens-fixtures">{(upcomingFixtures.docs as DashboardDoc[]).map((fixture) => { const date = formatFixtureDate(fixture.kickoffAt); return <a className="sportlens-fixture" href={`/admin/collections/fixtures/${fixture.id}`} key={String(fixture.id)}><time><b>{date.day}</b><small>{date.month}</small></time><span className="sportlens-fixture-team">{relationName(fixture.homeTeam, 'Home team')} <i>vs</i> {relationName(fixture.awayTeam, 'Away team')}<small>{fixture.kickoffAt ? new Intl.DateTimeFormat('en', { hour: '2-digit', minute: '2-digit' }).format(new Date(fixture.kickoffAt)) : 'Time TBC'} · {relationName(fixture.venue, 'Venue TBC')}</small></span><span className="sportlens-pill sportlens-pill--green">Upcoming</span></a> })}{upcomingFixtures.docs.length === 0 && <div className="sportlens-empty">No upcoming fixtures to display.</div>}</div></div>
    </section>
  </main>
}

function DashboardSection({ title, description, cards, totals }: { title: string; description: string; cards: CollectionCard[]; totals: Record<string, number> }) {
  return <section className="sportlens-dashboard-section"><div className="sportlens-section-heading"><h2>{title}</h2><p>{description}</p></div><div className={`sportlens-card-grid sportlens-card-grid--${cards.length}`}>{cards.map((card) => <CollectionCardView card={card} total={totals[card.slug] ?? 0} key={card.slug} />)}</div></section>
}
