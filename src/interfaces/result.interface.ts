export interface ISuccess<T> {
  success: true
  value: T
}

export interface IFailure<E> {
  success: false
  error: E
}

export interface IResponse {
  message: string
}
