import type { CollectionConfig } from 'payload'
import { publicReadEditorsWrite } from '../access'
export const Competitions: CollectionConfig = {
  slug: 'competitions',
  access: publicReadEditorsWrite,
  admin: {
    useAsTitle: 'name',
    group: 'Football',
    components: {
      views: {
        list: { Component: '@/components/admin/CompetitionsList' },
        create: { Component: '@/components/admin/CreateCompetition', path: '/create', exact: true },
      },
    },
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true, index: true },
    { name: 'shortName', type: 'text' },
    { name: 'type', type: 'select', required: true, options: ['league', 'cup', 'tournament', 'friendly'] },
    { name: 'logo', type: 'upload', relationTo: 'media' },
    { name: 'country', type: 'text' },
    { name: 'description', type: 'textarea' },
    { name: 'status', type: 'select', options: ['active', 'inactive'], defaultValue: 'active' },
  ],
}
