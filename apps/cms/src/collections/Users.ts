import type { CollectionConfig } from 'payload'
export const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  admin: { components: { views: { list: { Component: '@/components/admin/GenericCollectionList' }, create: { Component: '@/components/admin/GenericCreateView', path: '/create', exact: true } } } },
  fields: [
    { name: 'role', type: 'select', options: ['admin', 'editor', 'viewer', 'customer'], defaultValue: 'editor' },
    { name: 'status', type: 'select', options: ['active', 'inactive'], defaultValue: 'active' },
  ],
}
