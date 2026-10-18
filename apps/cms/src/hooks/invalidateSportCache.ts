import type { CollectionAfterChangeHook } from 'payload'
export const invalidateSportCache: CollectionAfterChangeHook = async ({ doc, req }) => {
  req.payload.logger.info(`SportLens cache invalidation requested for ${String(doc.id)}`)
  return doc
}
