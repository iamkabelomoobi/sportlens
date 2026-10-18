import { createAccessControl } from 'better-auth/plugins/access'

export const sportlensStatements = {
  organization: ['read', 'update', 'delete'],
  member: ['read', 'create', 'update', 'delete'],
  invitation: ['read', 'create', 'cancel'],
  application: ['read', 'create', 'update', 'delete'],
  apiKey: ['read', 'create', 'update', 'delete', 'rotate'],
  usage: ['read'],
} as const

export const sportlensAccessControl = createAccessControl(sportlensStatements)

export const sportlensRoles = {
  owner: sportlensAccessControl.newRole({
    organization: ['read', 'update', 'delete'],
    member: ['read', 'create', 'update', 'delete'],
    invitation: ['read', 'create', 'cancel'],
    application: ['read', 'create', 'update', 'delete'],
    apiKey: ['read', 'create', 'update', 'delete', 'rotate'],
    usage: ['read'],
  }),
  admin: sportlensAccessControl.newRole({
    organization: ['read', 'update'],
    member: ['read', 'create', 'update', 'delete'],
    invitation: ['read', 'create', 'cancel'],
    application: ['read', 'create', 'update', 'delete'],
    apiKey: ['read', 'create', 'update', 'delete', 'rotate'],
    usage: ['read'],
  }),
  developer: sportlensAccessControl.newRole({
    organization: ['read'],
    member: ['read'],
    invitation: ['read'],
    application: ['read', 'create', 'update'],
    apiKey: ['read', 'create', 'update', 'delete', 'rotate'],
    usage: ['read'],
  }),
  viewer: sportlensAccessControl.newRole({
    organization: ['read'],
    member: ['read'],
    application: ['read'],
    usage: ['read'],
  }),
}

export type SportLensRole = keyof typeof sportlensRoles

export const roleCan = (role: string, resource: keyof typeof sportlensStatements, action: string) => {
  const selectedRole = sportlensRoles[role as SportLensRole]
  if (!selectedRole) return false
  return selectedRole.authorize({ [resource]: [action] }).success
}

export const canManageOrganization = (role: string) => roleCan(role, 'organization', 'update') && role === 'owner'
export const canManageMembers = (role: string) => roleCan(role, 'member', 'update')
export const canCreateApplication = (role: string) => roleCan(role, 'application', 'create')
export const canManageApiKeys = (role: string) => roleCan(role, 'apiKey', 'create')
export const canViewUsage = (role: string) => roleCan(role, 'usage', 'read')

export const canPerformSensitiveAction = (role: string, twoFactorEnabled: boolean) =>
  twoFactorEnabled && (role === 'owner' || role === 'admin')
