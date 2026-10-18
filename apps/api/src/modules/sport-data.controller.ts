import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common'
import { ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger'
import { SportDataService } from './sport-data.service.js'
import { ApiKeyGuard } from '../common/auth/api-key.guard.js'
import { RateLimitGuard } from '../common/rate-limit/rate-limit.guard.js'
@ApiTags('sport-data')
@Controller()
@UseGuards(ApiKeyGuard, RateLimitGuard)
export class SportDataController {
  constructor(private readonly service: SportDataService) {}
  @Get('competitions')
  @ApiOperation({ summary: 'List competitions' })
  competitions() {
    return { data: this.service.competitions() }
  }
  @Get('competitions/:slug') @ApiParam({ name: 'slug' }) competition(@Param('slug') slug: string) {
    const value = this.service.competitions().find((item) => item.slug === slug)
    return { data: value ?? null }
  }
  @Get('competitions/:slug/seasons') seasons(@Param('slug') slug: string) {
    void slug
    return { data: this.service.seasons() }
  }
  @Get('competitions/:competitionSlug/seasons/:seasonSlug/standings') standings(
    @Param('competitionSlug') competitionSlug: string,
    @Param('seasonSlug') seasonSlug: string,
  ) {
    return this.service.standings(competitionSlug, seasonSlug).then((data) => ({ data }))
  }
  @Get('teams')
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  teams(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.service.listTeams(Number(page ?? 1), Number(limit ?? 25))
  }
  @Get('teams/:slug') team(@Param('slug') slug: string) {
    return { data: this.service.team(slug) }
  }
  @Get('teams/:slug/fixtures') teamFixtures(@Param('slug') slug: string) {
    return { data: this.service.teamFixtures(slug) }
  }
  @Get('teams/:slug/results') teamResults(@Param('slug') slug: string) {
    return { data: this.service.teamFixtures(slug, true) }
  }
  @Get('teams/:slug/stats') teamStats(@Param('slug') slug: string) {
    return {
      data: {
        team: this.service.team(slug),
        matches: this.service.teamFixtures(slug, true).length,
      },
    }
  }
  @Get('players') players(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.service.listPlayers(Number(page ?? 1), Number(limit ?? 25))
  }
  @Get('players/:slug') player(@Param('slug') slug: string) {
    return { data: this.service.player(slug) }
  }
  @Get('players/:slug/stats') playerStats(@Param('slug') slug: string) {
    return { data: { player: this.service.player(slug), matches: 1 } }
  }
  @Get('fixtures') fixtures() {
    return { data: this.service.allFixtures() }
  }
  @Get('fixtures/:id') fixture(@Param('id') id: string) {
    return { data: this.service.fixture(id) }
  }
  @Get('stats/top-scorers') topScorers() {
    return { data: this.service.stats().topScorers }
  }
  @Get('stats/top-assists') topAssists() {
    return { data: this.service.stats().topAssists }
  }
  @Get('stats/clean-sheets') cleanSheets() {
    return { data: this.service.stats().cleanSheets }
  }
}
