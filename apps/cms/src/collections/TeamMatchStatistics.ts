import type { CollectionConfig } from 'payload'
import { publicReadEditorsWrite } from '../access'
export const TeamMatchStatistics: CollectionConfig = {
  slug: 'team-match-statistics',
  access: publicReadEditorsWrite,
  admin: { group: 'Football', components: { views: { list: { Component: '@/components/admin/GenericCollectionList' }, create: { Component: '@/components/admin/GenericCreateView', path: '/create', exact: true } } } },
  fields: [
    { name: 'fixture', type: 'relationship', relationTo: 'fixtures', required: true, index: true },
    { name: 'team', type: 'relationship', relationTo: 'teams', required: true, index: true },
    ...['possession', 'shots', 'shotsOnTarget', 'corners', 'fouls', 'offsides', 'yellowCards', 'redCards'].map(
      (name) => ({ name, type: 'number' as const, min: 0, defaultValue: 0 }),
    ),
  ],
}
