import type { ServerProps } from 'payload'

export default function AdminHeader({ user }: ServerProps) {
  const displayName = user?.email?.split('@')[0] ?? 'Administrator'
  return <header className="sportlens-admin-header"><button className="sportlens-menu-button" aria-label="Open navigation">☰</button><div className="sportlens-search"><span>⌕</span><input aria-label="Search collections" placeholder="Search collections, teams, players, competitions..." /><kbd>⌘K</kbd></div><a className="sportlens-create-button" href="/admin/collections/fixtures/create">＋ <span>Create</span>⌄</a><button className="sportlens-header-icon" aria-label="Notifications">♧<i /></button><button className="sportlens-header-icon" aria-label="Settings">☼</button><a className="sportlens-user" href="/admin/account"><b>{displayName.slice(0, 2).toUpperCase()}</b><span><strong>{displayName}</strong><small>Administrator</small></span><em>⌄</em></a></header>
}
