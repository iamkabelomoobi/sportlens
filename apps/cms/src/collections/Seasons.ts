import type { CollectionConfig } from 'payload'
import { publicReadEditorsWrite } from '../access'
export const Seasons: CollectionConfig = {
  slug: 'seasons',
  access: publicReadEditorsWrite,
  admin: {
    useAsTitle: 'name',
    group: 'Football',
    components: {
      views: {
        list: { Component: '@/components/admin/SeasonsList' },
        create: { Component: '@/components/admin/CreateSeason', path: '/create', exact: true },
      },
    },
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true, index: true },
    { name: 'competition', type: 'relationship', relationTo: 'competitions', required: true, index: true },
    { name: 'startDate', type: 'date', required: true },
    { name: 'endDate', type: 'date', required: true },
    { name: 'status', type: 'select', options: ['upcoming', 'active', 'completed'], defaultValue: 'upcoming' },
  ],
}
