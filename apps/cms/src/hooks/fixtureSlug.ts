import type { CollectionBeforeValidateHook } from 'payload'
export const fixtureSlug: CollectionBeforeValidateHook = ({ data, originalDoc }) => {
  if (!data) return data
  if (originalDoc?.slug) return { ...data, slug: originalDoc.slug }
  if (data.slug) return data
  const home = typeof data.homeTeam === 'object' ? data.homeTeam.id : data.homeTeam
  const away = typeof data.awayTeam === 'object' ? data.awayTeam.id : data.awayTeam
  const kickoff = new Date(String(data.kickoffAt ?? ''))
  return {
    ...data,
    slug: `${String(home ?? 'home')}-vs-${String(away ?? 'away')}-${Number.isNaN(kickoff.getTime()) ? 'fixture' : kickoff.toISOString().slice(0, 10)}`,
  }
}
