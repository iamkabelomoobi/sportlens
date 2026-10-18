export interface SportLensConfig {
  databaseUrl: string
  redisUrl: string
  payloadSecret: string
  apiPort: number
  cmsPort: number
  corsOrigins: string[]
  mailProvider: string
  smtpHost: string
  smtpPort: number
  emailFrom: string
  resendApiKey?: string
  storageProvider: string
  s3Endpoint?: string
  s3Region: string
  s3Bucket: string
  s3AccessKey?: string
  s3SecretKey?: string
  r2Endpoint?: string
  r2Bucket?: string
  r2AccessKeyId?: string
  r2SecretAccessKey?: string
  storagePublicUrl?: string
  supabaseS3Endpoint?: string
  supabaseS3Region?: string
  supabaseS3Bucket?: string
  supabaseS3AccessKeyId?: string
  supabaseS3SecretAccessKey?: string
}
export const loadConfig = (env: Record<string, string | undefined> = {}): SportLensConfig => ({
  databaseUrl: env.DATABASE_URL ?? 'postgres://sportlens:sportlens@localhost:5433/sportlens',
  redisUrl: env.REDIS_URL ?? 'redis://localhost:6380',
  payloadSecret: env.PAYLOAD_SECRET ?? 'local-development-secret-change-me',
  apiPort: Number(env.API_PORT ?? 3001),
  cmsPort: Number(env.CMS_PORT ?? 3000),
  corsOrigins: (env.CORS_ORIGINS ?? 'http://localhost:3000')
    .split(',')
    .map((value: string) => value.trim())
    .filter(Boolean),
  mailProvider: env.MAIL_PROVIDER ?? 'mailhog',
  smtpHost: env.SMTP_HOST ?? 'localhost',
  smtpPort: Number(env.SMTP_PORT ?? 1025),
  emailFrom: env.EMAIL_FROM ?? 'noreply@sportlens.local',
  resendApiKey: env.RESEND_API_KEY,
  storageProvider: env.STORAGE_PROVIDER ?? 'minio',
  s3Endpoint: env.S3_ENDPOINT,
  s3Region: env.S3_REGION ?? 'us-east-1',
  s3Bucket: env.S3_BUCKET ?? 'sportlens',
  s3AccessKey: env.S3_ACCESS_KEY,
  s3SecretKey: env.S3_SECRET_KEY,
  r2Endpoint: env.R2_ENDPOINT,
  r2Bucket: env.R2_BUCKET,
  r2AccessKeyId: env.R2_ACCESS_KEY_ID,
  r2SecretAccessKey: env.R2_SECRET_ACCESS_KEY,
  storagePublicUrl: env.S3_PUBLIC_URL ?? env.R2_PUBLIC_URL,
  supabaseS3Endpoint: env.SUPABASE_S3_ENDPOINT,
  supabaseS3Region: env.SUPABASE_S3_REGION,
  supabaseS3Bucket: env.SUPABASE_S3_BUCKET,
  supabaseS3AccessKeyId: env.SUPABASE_S3_ACCESS_KEY_ID,
  supabaseS3SecretAccessKey: env.SUPABASE_S3_SECRET_ACCESS_KEY,
})
