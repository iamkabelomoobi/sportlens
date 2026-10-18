import type { CollectionConfig } from 'payload'
import { publicReadEditorsWrite } from '../access'
export const MatchEvents: CollectionConfig = {
  slug: 'match-events',
  access: publicReadEditorsWrite,
  admin: { useAsTitle: 'eventType', group: 'Football', components: { views: { list: { Component: '@/components/admin/GenericCollectionList' }, create: { Component: '@/components/admin/GenericCreateView', path: '/create', exact: true } } } },
  fields: [
    { name: 'fixture', type: 'relationship', relationTo: 'fixtures', required: true, index: true },
    { name: 'team', type: 'relationship', relationTo: 'teams', required: true },
    { name: 'player', type: 'relationship', relationTo: 'players' },
    { name: 'relatedPlayer', type: 'relationship', relationTo: 'players' },
    { name: 'minute', type: 'number', min: 0, max: 120 },
    { name: 'additionalTime', type: 'number', min: 0 },
    {
      name: 'eventType',
      type: 'select',
      required: true,
      options: [
        'goal',
        'own_goal',
        'penalty_goal',
        'penalty_missed',
        'yellow_card',
        'red_card',
        'second_yellow',
        'substitution',
      ],
    },
    { name: 'metadata', type: 'json' },
  ],
}
