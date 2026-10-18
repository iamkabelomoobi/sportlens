import { Pool } from 'pg'
import { PostgresDialect } from 'kysely'
import { betterAuth } from 'better-auth'
import { organization, twoFactor } from 'better-auth/plugins'
import { sportlensAccessControl, sportlensRoles } from './access-control.js'
import { sendPlatformEmail } from './email.service.js'

const authSecret = process.env.BETTER_AUTH_SECRET
if (process.env.NODE_ENV === 'production' && (!authSecret || authSecret.length < 32)) {
  throw new Error('BETTER_AUTH_SECRET must be at least 32 characters in production.')
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL ?? 'postgres://sportlens:sportlens@localhost:5433/sportlens',
})

const socialProviders = {
  ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
    ? { google: { clientId: process.env.GOOGLE_CLIENT_ID, clientSecret: process.env.GOOGLE_CLIENT_SECRET } }
    : {}),
  ...(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET
    ? { github: { clientId: process.env.GITHUB_CLIENT_ID, clientSecret: process.env.GITHUB_CLIENT_SECRET } }
    : {}),
}

export const authOptions = {
  appName: 'SportLens',
  database: {
    dialect: new PostgresDialect({ pool }),
    type: 'postgres' as const,
  },
  baseURL: process.env.BETTER_AUTH_URL ?? 'http://localhost:3001',
  basePath: '/api/auth',
  secret: authSecret ?? 'sportlens-local-development-secret-change-me',
  trustedOrigins: (process.env.BETTER_AUTH_TRUSTED_ORIGINS ?? 'http://localhost:3000,http://localhost:3001')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    minPasswordLength: 12,
    maxPasswordLength: 256,
    revokeSessionsOnPasswordReset: true,
    sendResetPassword: async ({ user, url }: { user: { email: string }; url: string }) => {
      await sendPlatformEmail({
        to: user.email,
        subject: 'Reset your SportLens password',
        text: `Reset your password: ${url}`,
      })
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    sendOnSignIn: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }: { user: { email: string }; url: string }) => {
      await sendPlatformEmail({
        to: user.email,
        subject: 'Verify your SportLens email',
        text: `Verify your email: ${url}`,
      })
    },
  },
  socialProviders,
  account: { encryptOAuthTokens: true, storeStateStrategy: 'cookie' as const },
  session: { expiresIn: 60 * 60 * 24 * 7, updateAge: 60 * 60 * 24, freshAge: 60 * 60, cookieCache: { enabled: false } },
  rateLimit: {
    enabled: true,
    storage: (process.env.REDIS_URL ? 'secondary-storage' : 'database') as 'secondary-storage' | 'database',
    customRules: {
      '/sign-in/email': { window: 60, max: 5 },
      '/sign-up/email': { window: 60, max: 3 },
      '/forget-password': { window: 60, max: 3 },
    },
  },
  plugins: [
    organization({
      allowUserToCreateOrganization: async (user) => user.emailVerified,
      creatorRole: 'owner',
      ac: sportlensAccessControl,
      roles: sportlensRoles,
      sendInvitationEmail: async ({ email, organization: org, inviter }) => {
        await sendPlatformEmail({
          to: email,
          subject: `Join ${org.name} on SportLens`,
          text: `${inviter.user.name} invited you to join ${org.name}: ${process.env.BETTER_AUTH_URL ?? 'http://localhost:3001'}/dashboard/organizations/${org.slug}`,
        })
      },
    }),
    twoFactor({
      issuer: 'SportLens',
      backupCodeOptions: { storeBackupCodes: 'encrypted' },
      accountLockout: { enabled: true },
    }),
  ],
  advanced: {
    useSecureCookies: process.env.NODE_ENV === 'production',
    defaultCookieAttributes: {
      httpOnly: true,
      sameSite: 'lax' as const,
      secure: process.env.NODE_ENV === 'production',
    },
    ipAddress: { ipAddressHeaders: ['x-forwarded-for', 'x-real-ip'] },
  },
}

export const auth = betterAuth(authOptions)

export type SportLensAuth = typeof auth
