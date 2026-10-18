import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { s3Storage } from '@payloadcms/storage-s3'
import { buildConfig } from 'payload'
import sharp from 'sharp'
import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Competitions } from './collections/Competitions'
import { Seasons } from './collections/Seasons'
import { Teams } from './collections/Teams'
import { Players } from './collections/Players'
import { Venues } from './collections/Venues'
import { Fixtures } from './collections/Fixtures'
import { MatchEvents } from './collections/MatchEvents'
import { PlayerMatchStatistics } from './collections/PlayerMatchStatistics'
import { TeamMatchStatistics } from './collections/TeamMatchStatistics'
import { ApiConsumers } from './collections/ApiConsumers'
const dirname = path.dirname(fileURLToPath(import.meta.url))
const isProduction = process.env.NODE_ENV === 'production'
const storageProvider = process.env.STORAGE_PROVIDER ?? (isProduction ? 'supabase' : 'minio')
const storageEndpoint = storageProvider === 'supabase' ? process.env.SUPABASE_S3_ENDPOINT : process.env.S3_ENDPOINT
const storageBucket = storageProvider === 'supabase' ? process.env.SUPABASE_S3_BUCKET : process.env.S3_BUCKET
const storageRegion = storageProvider === 'supabase' ? process.env.SUPABASE_S3_REGION : process.env.S3_REGION
const storageAccessKeyId =
  storageProvider === 'supabase' ? process.env.SUPABASE_S3_ACCESS_KEY_ID : process.env.S3_ACCESS_KEY
const storageSecretAccessKey =
  storageProvider === 'supabase' ? process.env.SUPABASE_S3_SECRET_ACCESS_KEY : process.env.S3_SECRET_KEY

if (isProduction && storageProvider === 'supabase') {
  const missing = [
    ['SUPABASE_S3_ENDPOINT', storageEndpoint],
    ['SUPABASE_S3_BUCKET', storageBucket],
    ['SUPABASE_S3_REGION', storageRegion],
    ['SUPABASE_S3_ACCESS_KEY_ID', storageAccessKeyId],
    ['SUPABASE_S3_SECRET_ACCESS_KEY', storageSecretAccessKey],
  ]
    .filter(([, value]) => !value)
    .map(([name]) => name)
  if (missing.length) throw new Error(`Missing Supabase Storage environment variables: ${missing.join(', ')}`)
}

const storagePlugin =
  storageEndpoint && storageBucket && storageRegion && storageAccessKeyId && storageSecretAccessKey
    ? s3Storage({
        bucket: storageBucket,
        collections: { media: true },
        config: {
          endpoint: storageEndpoint,
          region: storageRegion,
          forcePathStyle: storageProvider === 'minio',
          credentials: { accessKeyId: storageAccessKeyId, secretAccessKey: storageSecretAccessKey },
        },
      })
    : undefined
export default buildConfig({
  admin: {
    user: Users.slug,
    meta: { titleSuffix: ' | SportLens' },
    components: {
      Nav: '@/components/admin/AdminNav',
      header: ['@/components/admin/AdminHeader'],
      // Payload's admin login is `/admin/login`; point it at the same branded
      // login view used by the standalone route so there is one source of truth.
      views: {
        dashboard: {
          Component: '@/components/admin/AdminDashboard',
        },
        login: {
          path: '/login',
          exact: true,
          Component: '@/app/login/page',
        },
        forgot: {
          Component: '@/app/login/recovery#ForgotPasswordPage',
        },
        reset: {
          path: '/reset/:token',
          Component: '@/app/login/recovery#ResetPasswordPage',
        },
      },
    },
  },
  collections: [
    Users,
    Media,
    Competitions,
    Seasons,
    Teams,
    Players,
    Venues,
    Fixtures,
    MatchEvents,
    PlayerMatchStatistics,
    TeamMatchStatistics,
    ApiConsumers,
  ],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET ?? 'local-development-secret-change-me',
  db: postgresAdapter({
    idType: 'uuid',
    // Payload and Better Auth share this database. Schema push can drop tables
    // owned by Better Auth, so migrations/schema sync must be an explicit action.
    push: process.env.PAYLOAD_SCHEMA_PUSH === 'true',
    pool: { connectionString: process.env.DATABASE_URL ?? 'postgres://sportlens:sportlens@localhost:5433/sportlens' },
  }),
  sharp,
  typescript: { outputFile: path.resolve(dirname, 'payload-types.ts') },
  plugins: storagePlugin ? [storagePlugin] : [],
})
