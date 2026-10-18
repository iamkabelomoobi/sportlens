import type { CollectionConfig } from 'payload'
import { editors } from '../access'
export const ApiConsumers: CollectionConfig = {
  slug: 'api-consumers',
  access: { create: editors, read: editors, update: editors, delete: editors },
  admin: {
    useAsTitle: 'name',
    group: 'Platform',
    components: {
      views: {
        list: { Component: '@/components/admin/ApiConsumersList' },
        create: { Component: '@/components/admin/CreateApiConsumer', path: '/create', exact: true },
      },
    },
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'owner', type: 'relationship', relationTo: 'users', required: true, index: true },
    { name: 'role', type: 'select', options: ['admin', 'customer'], defaultValue: 'customer', required: true },
    { name: 'description', type: 'textarea' },
    { name: 'website', type: 'text' },
    { name: 'apiKeyHash', type: 'text', required: true, admin: { readOnly: true } },
    { name: 'status', type: 'select', options: ['active', 'inactive'], defaultValue: 'active' },
    { name: 'rateLimit', type: 'number', min: 1, max: 100, defaultValue: 100 },
    { name: 'plan', type: 'select', options: ['free', 'developer', 'business', 'enterprise'], defaultValue: 'free' },
    { name: 'lastUsedAt', type: 'date' },
  ],
}
