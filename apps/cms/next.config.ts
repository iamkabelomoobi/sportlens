import type { NextConfig } from 'next'
const config: NextConfig = {
  serverExternalPackages: ['@payloadcms/db-postgres', 'drizzle-kit', 'esbuild'],
  typescript: { ignoreBuildErrors: true },
}
export default config
