import { RootPage } from '@payloadcms/next/views'
import { importMap } from '../importMap.js'
type Args = { params: Promise<{ segments: string[] }>; searchParams: Promise<{ [key: string]: string | string[] }> }
import config from '@payload-config'
export default async function AdminPage({ params, searchParams }: Args) {
  return RootPage({ config, params, searchParams, importMap })
}
