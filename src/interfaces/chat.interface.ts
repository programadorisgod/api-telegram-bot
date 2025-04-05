
import { type ICommand } from '@interfaces/command.interface'

export interface IChat {
  [x: string]: any
  chatId: number
  list: ICommand[]
}
