import { type IChat } from '@interfaces/chat.interface'
import { ICommand } from '@interfaces/command.interface'
import { IResponse } from '@interfaces/result.interface'
import Chat from '@models/chat'
import { findChatById } from '@services/chat/createChat'
import canDelete from '@utils/canDelete'
import { CustomError } from '@utils/httpError'
import { listCommandsDefault } from '@utils/listCommands'
import { Failure, ResultResponse, Success } from '@utils/result'

const getCommandByName = async (
  idChat: string,
  nameCommand: string
): Promise<ResultResponse<ICommand, Error>> => {
  const chat: IChat | Error = await findChatById(idChat)

  if (chat instanceof Error) {
    return Failure<Error>(chat)
  }

  const command: ICommand | undefined = chat.list.find((c: ICommand) =>
    c.name.isToEquals(nameCommand)
  )

  if (!command) {
    return Failure<CustomError>(new CustomError(404, 'Command not Found'))
  }

  return Success<ICommand>(command)
}

const addCommand = async (
  id: string,
  command: ICommand
): Promise<ResultResponse<IResponse, Error>> => {
  try {
    const chat: IChat | Error = await findChatById(id)

    if (chat instanceof Error) return Failure<Error>(chat)

    const findCommand: ICommand | undefined = chat.list.find((c: ICommand) =>
      c.name.isToEquals(command.name)
    )
    if (findCommand !== undefined) {
      throw new CustomError(409, 'The command already exists')
    }

    chat.list.push(command)

    chat.save()

    return Success({ message: 'Command Created' })
  } catch (error) {
    if (error instanceof CustomError && [409].includes(error._code)) {
      return Failure<Error>(error)
    }

    if (error instanceof CustomError && error._message === 'Chat not found') {
      const newChat: IChat = {
        chatId: parseInt(id),
        list: listCommandsDefault
      }

      const newChatCreated = await Chat.create(newChat)

      newChatCreated.list.push(command)

      await newChatCreated.save()

      return Success<IResponse>({ message: 'Command Created' })
    }

    return Failure<CustomError>(new CustomError(500, 'Error to create chat'))
  }
}

const editCommand = async (
  id: string,
  description: string,
  name: string
): Promise<ResultResponse<IChat, Error>> => {
  const chat = await findChatById(id)

  if (chat instanceof Error) {
    return Failure<Error>(chat)
  }

  const command: ICommand | undefined = chat.list.find((command: ICommand) =>
    command.name.isToEquals(name)
  )

  if (!command) {
    return Failure<CustomError>(new CustomError(404, 'Command not found'))
  }

  command.description = description

  await chat?.save()

  return Success<IChat>(chat)
}

const editCommandAll = async (
  id: string,
  nameCommand: string,
  username: string
): Promise<ResultResponse<IResponse, Error>> => {
  const chat: IChat | Error = await findChatById(id)

  if (chat instanceof Error) {
    return Failure<Error>(chat)
  }

  if (nameCommand !== 'all') {
    return Failure<CustomError>(new CustomError(400, 'Command not valid'))
  }

  const command: ICommand | undefined = chat?.list.find((c: ICommand) =>
    c.name.isToEquals(nameCommand)
  )

  if (!command) {
    return Failure<CustomError>(new CustomError(403, 'Command not allowed'))
  }

  const usersCommandAll: Array<string> = command.command.split(' ')

  const userFind: number = usersCommandAll.findIndex(
    (u: string) => u === username
  )

  if (userFind !== -1) {
    return Failure<CustomError>(new CustomError(400, 'username not added'))
  }

  usersCommandAll.push(username)

  command.command = usersCommandAll.join(' ')

  await chat?.save()

  return Success<IResponse>({ message: 'username added' })
}

const deleteCommand = async (
  id: string,
  name: string,
  username: string,
  role: string
): Promise<ResultResponse<IResponse, Error>> => {
  const chat: IChat | Error = await findChatById(id)

  if (chat instanceof Error) return Failure<Error>(chat)

  const command: ICommand | undefined = chat.list.find((command: ICommand) =>
    command.name.isToEquals(name)
  )

  if (!command) {
    return Failure<CustomError>(new CustomError(404, 'Command not found'))
  }

  if (!canDelete(role, command, username)) {
    return Failure<CustomError>(
      new CustomError(
        403,
        `You dont have authorization to delete the command: ${name}`
      )
    )
  }

  const UpdateList: Array<ICommand> = chat.list.filter(
    (command: ICommand) => !command.name.isToEquals(name)
  )

  chat.list = UpdateList

  await chat.save()

  return Success<IResponse>({ message: 'Command deleted' })
}

export {
  editCommand,
  addCommand,
  deleteCommand,
  editCommandAll,
  getCommandByName
}
