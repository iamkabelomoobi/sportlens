export class SportLensError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string,
  ) {
    super(message)
  }
}
export const notFound = (resource: string, code: string) =>
  new SportLensError(404, code, `The requested ${resource} could not be found.`)
