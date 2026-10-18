import type { CollectionConfig } from 'payload'
import { publicReadEditorsWrite } from '../access'
export const Players: CollectionConfig = {
  slug: 'players',
  access: publicReadEditorsWrite,
  admin: { useAsTitle: 'displayName', group: 'Football', components: { views: { list: { Component: '@/components/admin/GenericCollectionList' }, create: { Component: '@/components/admin/GenericCreateView', path: '/create', exact: true } } } },
  fields: [
    { name: 'firstName', type: 'text', required: true },
    { name: 'lastName', type: 'text', required: true },
    { name: 'displayName', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true, index: true },
    { name: 'dateOfBirth', type: 'date' },
    { name: 'nationality', type: 'text' },
    { name: 'position', type: 'select', options: ['goalkeeper', 'defender', 'midfielder', 'forward'] },
    { name: 'shirtNumber', type: 'number', min: 1 },
    { name: 'photo', type: 'upload', relationTo: 'media' },
    { name: 'team', type: 'relationship', relationTo: 'teams', index: true },
    { name: 'status', type: 'select', options: ['active', 'inactive'], defaultValue: 'active' },
  ],
}
