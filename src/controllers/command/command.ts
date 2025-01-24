/* eslint-disable @typescript-eslint/naming-convention */
import { IChat } from '@interfaces/chat.interface'
import { type ICommand } from '@interfaces/command.interface'
import { IResponse } from '@interfaces/result.interface'
import {
  addCommand,
  deleteCommand,
  editCommand,
  editCommandAll,
  getCommandByName
} from '@services/command/command'
import { HandleError } from '@utils/httpError'
import { ResultResponse } from '@utils/result'

import { type Request, type Response } from 'express'

type Params = {
  id_chat: string
  name_command: string
  username: string
  name: string
  role: string
}

type Body = {
  description: string
  name: string
}

const getCommandByNameBot = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id_chat, name_command } = req.params as Params

    const command: ResultResponse<ICommand, Error> = await getCommandByName(
      id_chat,
      name_command
    )

    if (!command.success) {
      await HandleError(command.error, res)
      return
    }

    res.status(200).json({ command: command.value })
  } catch (error: unknown) {
    await HandleError(error, res)
  }
}

const addCommandBot = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id_chat } = req.params as Params

    const command: ICommand = req.body

    const chatEdited: ResultResponse<IResponse, Error> = await addCommand(
      String(id_chat),
      command
    )

    if (!chatEdited.success) {
      await HandleError(chatEdited.error, res)
      return
    }

    res.status(200).json(chatEdited.value)
  } catch (error: unknown) {
    await HandleError(error, res)
  }
}
const editCommandBot = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id_chat } = req.params as Params
    const { description, name } = req.body as Body

    const chat: ResultResponse<IChat, Error> = await editCommand(
      id_chat,
      description,
      name
    )

    if (!chat.success) {
      return await HandleError(chat.error, res)
    }

    res.status(200).json({ chat: chat.value })
  } catch (error: unknown) {
    await HandleError(error, res)
  }
}

const editCommandAllBot = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id_chat, name, username } = req.params as Params

    const chat: ResultResponse<IResponse, Error> = await editCommandAll(
      id_chat,
      name,
      username
    )

    if (!chat.success) {
      await HandleError(chat.error, res)
      return
    }

    res.status(201).json(chat.value)
  } catch (error: unknown) {
    await HandleError(error, res)
  }
}

const deleteCommandBot = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id_chat, username, role } = req.params as Params

    const { name } = req.body as Body

    const commandDeleted: ResultResponse<IResponse, Error> =
      await deleteCommand(id_chat, name, username, role)

    if (!commandDeleted.success) {
      await HandleError(commandDeleted.error, res)
      return
    }

    res.status(200).json(commandDeleted.value)
  } catch (error: unknown) {
    await HandleError(error, res)
  }
}

export {
  editCommandBot,
  addCommandBot,
  deleteCommandBot,
  editCommandAllBot,
  getCommandByNameBot
}
