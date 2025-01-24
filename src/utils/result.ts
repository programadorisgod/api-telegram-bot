import { IFailure, ISuccess } from '@interfaces/result.interface'

export const Success = <T>(value: T): ISuccess<T> => ({
  success: true,
  value
})

export const Failure = <E>(error: E): IFailure<E> => ({
  success: false,
  error
})

export type ResultResponse<T, E> =
  | ReturnType<typeof Success<T>>
  | ReturnType<typeof Failure<E>>
