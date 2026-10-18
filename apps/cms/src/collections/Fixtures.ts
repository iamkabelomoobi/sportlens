import type { CollectionConfig } from 'payload'
import { publicReadEditorsWrite } from '../access'
import { fixtureSlug } from '../hooks/fixtureSlug'
export const Fixtures: CollectionConfig = {
  slug: 'fixtures',
  access: publicReadEditorsWrite,
  hooks: { beforeValidate: [fixtureSlug] },
  admin: { useAsTitle: 'slug', group: 'Football', components: { views: { list: { Component: '@/components/admin/GenericCollectionList' }, create: { Component: '@/components/admin/GenericCreateView', path: '/create', exact: true } } } },
  fields: [
    { name: 'slug', type: 'text', required: true, unique: true, index: true, admin: { readOnly: true } },
    { name: 'competition', type: 'relationship', relationTo: 'competitions', required: true, index: true },
    { name: 'season', type: 'relationship', relationTo: 'seasons', required: true, index: true },
    { name: 'homeTeam', type: 'relationship', relationTo: 'teams', required: true, index: true },
    { name: 'awayTeam', type: 'relationship', relationTo: 'teams', required: true, index: true },
    { name: 'venue', type: 'relationship', relationTo: 'venues' },
    { name: 'kickoffAt', type: 'date', required: true, index: true },
    { name: 'round', type: 'text' },
    { name: 'matchWeek', type: 'number', min: 1 },
    {
      name: 'status',
      type: 'select',
      required: true,
      options: ['scheduled', 'postponed', 'cancelled', 'live', 'halftime', 'completed', 'abandoned'],
      defaultValue: 'scheduled',
      index: true,
    },
    { name: 'homeScore', type: 'number', min: 0 },
    { name: 'awayScore', type: 'number', min: 0 },
    { name: 'attendance', type: 'number', min: 0 },
    { name: 'referee', type: 'text' },
  ],
}
