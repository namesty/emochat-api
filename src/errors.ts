
const errorCodes = {
  NotFound: 404,
  Internal: 500,
  BadParameters: 422,
  Forbidden: 403
}

type errorType = keyof typeof errorCodes

export class CustomError extends Error {
  type: errorType
  code: number
  clientMessage: string

  constructor(type: errorType, clientMessage = 'An error has ocurred', ...params: any) {
    super(...params)

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, CustomError)
    }

    this.type = type
    this.code = errorCodes[type]
    this.message = clientMessage
    this.clientMessage = clientMessage
  }
}