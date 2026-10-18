import { getPayload, type CollectionSlug } from 'payload'
import config from './payload.config.js'
import { seedData } from './seed/data.js'

type SeedAccount = {
  email: string
  password: string
  role: 'admin' | 'customer'
}

const seedAccounts: SeedAccount[] = [
  {
    email: process.env.SEED_ADMIN_EMAIL ?? 'admin@sportlens.local',
    password: process.env.SEED_ADMIN_PASSWORD ?? 'SportLensAdmin-2026!',
    role: 'admin',
  },
  {
    email: process.env.SEED_CUSTOMER_EMAIL ?? 'customer@sportlens.local',
    password: process.env.SEED_CUSTOMER_PASSWORD ?? 'SportLensCustomer-2026!',
    role: 'customer',
  },
]

const findOrCreate = async (
  payload: Awaited<ReturnType<typeof getPayload>>,
  collection: CollectionSlug,
  slug: string,
  data: Record<string, unknown>,
): Promise<{ id: string; slug: string }> => {
  const found = await payload.find({ collection, where: { slug: { equals: slug } }, limit: 1, depth: 0 })
  return (
    (found.docs[0] as { id: string; slug: string } | undefined) ??
    ((await payload.create({ collection, data })) as { id: string; slug: string })
  )
}

const findOrCreateUser = async (
  payload: Awaited<ReturnType<typeof getPayload>>,
  account: SeedAccount,
) => {
  const found = await payload.find({
    collection: 'users',
    where: { email: { equals: account.email } },
    limit: 1,
    depth: 0,
  })

  if (found.docs[0]) return found.docs[0]

  return payload.create({
    collection: 'users',
    data: {
      email: account.email,
      password: account.password,
      role: account.role,
      status: 'active',
    },
  })
}

export const seedSportLens = async () => {
  const payload = await getPayload({ config })
  try {
    for (const account of seedAccounts) await findOrCreateUser(payload, account)

    const competition = await findOrCreate(payload, 'competitions', seedData.competition.slug, seedData.competition)
    const season = await findOrCreate(payload, 'seasons', seedData.season.slug, {
      ...seedData.season,
      competition: competition.id,
    })
    const teams = []
    for (const teamData of seedData.teams) teams.push(await findOrCreate(payload, 'teams', teamData.slug, teamData))
    for (const [index, playerData] of seedData.players.entries())
      await findOrCreate(payload, 'players', playerData.slug, { ...playerData, team: teams[index % teams.length].id })
    for (const fixtureData of seedData.fixtures) {
      const home = teams.find((team) => team.slug === fixtureData.slug.split('-vs-')[0]) ?? teams[0]
      const away = teams.find((team) => fixtureData.slug.includes(`${team.slug}-`)) ?? teams[1]
      const found = await payload.find({
        collection: 'fixtures',
        where: { slug: { equals: fixtureData.slug } },
        limit: 1,
        depth: 0,
      })
      if (!found.docs[0])
        await payload.create({
          collection: 'fixtures',
          data: { ...fixtureData, competition: competition.id, season: season.id, homeTeam: home.id, awayTeam: away.id },
        })
    }
    payload.logger.info('Seeded SportLens admin/customer accounts and demo football data.')
  } finally {
    await payload.destroy()
  }
}
if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    await seedSportLens()
    process.exit(0)
  } catch (error) {
    console.error(error)
    process.exit(1)
  }
}
