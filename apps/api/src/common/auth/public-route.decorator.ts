import { SetMetadata } from '@nestjs/common'
export const PUBLIC_ROUTE = 'sportlens_public_route'
export const PublicRoute = () => SetMetadata(PUBLIC_ROUTE, true)
