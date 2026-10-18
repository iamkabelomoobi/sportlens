import type { CollectionConfig } from 'payload'
import { publicReadEditorsWrite } from '../access'
export const Venues: CollectionConfig = {
  slug: 'venues',
  access: publicReadEditorsWrite,
  admin: { useAsTitle: 'name', group: 'Football', components: { views: { list: { Component: '@/components/admin/GenericCollectionList' }, create: { Component: '@/components/admin/GenericCreateView', path: '/create', exact: true } } } },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true },
    { name: 'city', type: 'text' },
    { name: 'province', type: 'text' },
    { name: 'country', type: 'text' },
    { name: 'capacity', type: 'number', min: 0 },
    { name: 'address', type: 'textarea' },
    { name: 'latitude', type: 'number' },
    { name: 'longitude', type: 'number' },
  ],
}
