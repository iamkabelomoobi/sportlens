import type { Access } from 'payload'
type User = { role?: 'admin' | 'editor' | 'viewer'; status?: 'active' | 'inactive' }
const active = (value: unknown) => Boolean(value && typeof value === 'object' && (value as User).status !== 'inactive')
export const anyone: Access = () => true
export const editors: Access = ({ req }) =>
  active(req.user) && ['admin', 'editor'].includes((req.user as User).role ?? '')
export const publicReadEditorsWrite = { create: editors, read: anyone, update: editors, delete: editors }
