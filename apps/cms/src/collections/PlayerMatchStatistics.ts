import type { CollectionConfig } from 'payload'
import { publicReadEditorsWrite } from '../access'
export const PlayerMatchStatistics: CollectionConfig = {
  slug: 'player-match-statistics',
  access: publicReadEditorsWrite,
  admin: { group: 'Football', components: { views: { list: { Component: '@/components/admin/GenericCollectionList' }, create: { Component: '@/components/admin/GenericCreateView', path: '/create', exact: true } } } },
  fields: [
    { name: 'fixture', type: 'relationship', relationTo: 'fixtures', required: true, index: true },
    { name: 'player', type: 'relationship', relationTo: 'players', required: true, index: true },
    ...['minutesPlayed', 'goals', 'assists', 'shots', 'shotsOnTarget', 'yellowCards', 'redCards', 'fouls', 'saves'].map(
      (name) => ({ name, type: 'number' as const, min: 0, defaultValue: 0 }),
    ),
    { name: 'cleanSheet', type: 'checkbox', defaultValue: false },
  ],
}
