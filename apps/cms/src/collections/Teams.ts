import type { CollectionConfig } from 'payload'
import { publicReadEditorsWrite } from '../access'
export const Teams: CollectionConfig = {
  slug: 'teams',
  access: publicReadEditorsWrite,
  admin: { useAsTitle: 'name', group: 'Football', components: { views: { list: { Component: '@/components/admin/GenericCollectionList' }, create: { Component: '@/components/admin/GenericCreateView', path: '/create', exact: true } } } },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true, index: true },
    { name: 'shortName', type: 'text' },
    { name: 'logo', type: 'upload', relationTo: 'media' },
    { name: 'country', type: 'text' },
    { name: 'city', type: 'text' },
    { name: 'stadium', type: 'text' },
    { name: 'foundedYear', type: 'number', min: 1800 },
    { name: 'website', type: 'text' },
    { name: 'primaryColour', type: 'text' },
    { name: 'secondaryColour', type: 'text' },
    { name: 'status', type: 'select', options: ['active', 'inactive'], defaultValue: 'active' },
  ],
}
