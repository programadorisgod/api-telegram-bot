import { type Response } from 'express'
import { ZodError } from 'zod'

class CustomError extends Error {
  _code: number
  _message: string

  constructor(code: number, message: string) {
    super()
    this._code = code
    this._message = message
  }
}

const HandleError = async (
  error: Error | CustomError | unknown,
  res: Response,
  message?: string
): Promise<void> => {
  if (error instanceof ZodError) {
    res
      .status(400)
      .json({ error: `${error.issues[0].path[0]} ${error.issues[0].message}` })
    return
  }

  if (error instanceof CustomError) {
    res.status(error._code).json({ error: error._message })
    return
  }

  res
    .status(500)
    .json({ error: `${message ? message : 'Internal server error'}` })
}

export { CustomError, HandleError }
