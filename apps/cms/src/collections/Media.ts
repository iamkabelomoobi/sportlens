import type { CollectionConfig } from 'payload'
export const Media: CollectionConfig = {
  slug: 'media',
  upload: { mimeTypes: ['image/*'] },
  admin: { components: { views: { list: { Component: '@/components/admin/GenericCollectionList' }, create: { Component: '@/components/admin/GenericCreateView', path: '/create', exact: true } } } },
  fields: [{ name: 'alt', type: 'text' }],
}
