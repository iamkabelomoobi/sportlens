import { Injectable } from '@nestjs/common'
import { randomBytes } from 'node:crypto'

export type ApplicationEnvironment = 'test' | 'production'
export interface SportLensApplication {
  id: string
  name: string
  slug: string
  description?: string
  website?: string
  organizationId: string
  environment: ApplicationEnvironment
  status: 'active' | 'archived'
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

@Injectable()
export class ApplicationService {
  private readonly applications = new Map<string, SportLensApplication>()

  create(input: Omit<SportLensApplication, 'id' | 'slug' | 'status' | 'createdAt' | 'updatedAt'>) {
    const now = new Date()
    const base =
      input.name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '') || 'application'
    const slug = `${base}-${randomBytes(3).toString('hex')}`
    const application: SportLensApplication = {
      ...input,
      id: randomBytes(16).toString('hex'),
      slug,
      status: 'active',
      createdAt: now,
      updatedAt: now,
    }
    this.applications.set(application.id, application)
    return application
  }

  list(organizationId: string) {
    return [...this.applications.values()].filter(
      (application) => application.organizationId === organizationId && application.status === 'active',
    )
  }

  get(id: string) {
    return this.applications.get(id)
  }

  update(id: string, changes: Partial<Pick<SportLensApplication, 'name' | 'description' | 'website' | 'environment'>>) {
    const application = this.applications.get(id)
    if (!application || application.status !== 'active') return undefined
    Object.assign(application, changes, { updatedAt: new Date() })
    return application
  }

  archive(id: string) {
    const application = this.applications.get(id)
    if (!application) return false
    application.status = 'archived'
    application.updatedAt = new Date()
    return true
  }
}
