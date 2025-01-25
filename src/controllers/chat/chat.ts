import { type Request, type Response } from 'express'
import { createChat, findChatById } from '@services/chat/createChat'
import { HandleError } from '@utils/httpError'
import { type IChat } from '@interfaces/chat.interface'
import { logger } from '@utils/logger'

const createChatBot = async (req: Request, res: Response): Promise<void> => {
  try {
    const chat: IChat = req.body

    const chatCreated = await createChat(chat)

    res.status(201).json({ chatCreated })
  } catch (error: unknown) {
    logger.error(`Error catch in createChatBot: ${error}`, {
      stack: error instanceof Error ? error.stack : null,
      path: req.originalUrl,
      method: req.method
    })
    await HandleError(error, res, 'Error to create chat, try again')
  }
}

const findChatByIdBot = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params

    const chat = await findChatById(id)

    res.status(200).json(chat)
  } catch (error: unknown) {
    logger.error(`Error catch in findChatByIdBot: ${error}`, {
      stack: error instanceof Error ? error.stack : null,
      path: req.originalUrl,
      method: req.method
    })
    await HandleError(error, res, 'Error to find chat')
  }
}

export { createChatBot, findChatByIdBot }
