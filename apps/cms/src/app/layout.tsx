import type { ServerFunctionClient } from 'payload'
import '@payloadcms/next/css'
import config from '@payload-config'
import { handleServerFunctions, RootLayout as PayloadRootLayout } from '@payloadcms/next/layouts'
import type { ReactNode } from 'react'
import { importMap } from './(payload)/admin/importMap.js'
import '../styles/admin.css'

const serverFunction: ServerFunctionClient = async function (args) {
  'use server'

  return handleServerFunctions({
    ...args,
    config,
    importMap,
  })
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <PayloadRootLayout config={config} importMap={importMap} serverFunction={serverFunction}>
      {children}
    </PayloadRootLayout>
  )
}
