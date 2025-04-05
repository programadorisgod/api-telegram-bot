/* eslint-disable @typescript-eslint/no-misused-promises */
import {
  addCommandBot,
  deleteCommandBot,
  editCommandAllBot,
  editCommandBot,
  getCommandByNameBot
} from '@controllers/command/command'

import {
  validateData,
  validateDeleteCommand,
  validateEditData,
  validateEditDataCommandAll
} from '@middlewares/validation/validateBody'

import { Router } from 'express'

const RouterCommand = Router()

const path = '/api/v1/command'

RouterCommand.get(`${path}/:id_chat/:name_command`, getCommandByNameBot)

RouterCommand.post(`${path}/:id_chat`, validateData, addCommandBot)

RouterCommand.put(`${path}/:id_chat`, validateEditData, editCommandBot)

RouterCommand.put(
  `${path}/:id_chat/:name/:username`,
  validateEditDataCommandAll,
  editCommandAllBot
)

RouterCommand.delete(
  `${path}/:id_chat/:username/:role`,
  validateDeleteCommand,
  deleteCommandBot
)

export default RouterCommand

/**
 * GET /api/v1/command/:id_chat/:name_command
 * @swagger
 * /api/v1/command/{id_chat}/{name_command}:
 *  get:
 *   tags:
 *    - Command
 *   summary: Get command by name
 *   description: Get command by name
 *   parameters:
 *     - in: path
 *       name: id_chat
 *       required: true
 *       schema:
 *         type: number
 *       description: chat id
 *     - in: path
 *       name: name_command
 *       required: true
 *       schema:
 *         type: string
 *       description: command name
 *   responses:
 *    200:
 *     description: Returns the command with the specified name.
 *     content:
 *       application/json:
 *         schema:
 *           $ref: '#/components/schemas/command'
 *         example:
 *          {
 *             command: {
 *            "type": "text",
 *            "name": "all",
 *            "command": "  @Midudev @El_Bermu @Manuel",
 *            "description": " ",
 *            "creator": " ",
 *            "_id": "6625a37526df41c"
 *            }
 *         }
 *    404:
 *       description: Returns object with property "error" and value "Command not Found"
 *       content:
 *        application/json:
 *         example:
 *          {
 *            "error": "Command not Found"
 *          }
 */

/**
 * POST /api/v1/command/:id_chat
 * @swagger
 * /api/v1/command/{id_chat}:
 *   post:
 *     tags:
 *       - Command
 *     summary: Add command
 *     description: Add command
 *     parameters:
 *       - in: path
 *         name: id_chat
 *         required: true
 *         schema:
 *           type: number
 *         description: chat id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/command'
 *           example:
 *             name: "prueba"
 *             description: " "
 *             type: " "
 *             command: " "
 *             creator: " "
 *     responses:
 *       200:
 *         description: Returns the chat with the new command added.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/chat'
 *             example:
 *               {
 *                   "message": "Command Created"
 *               }
 *       404:
 *         description: Chat not found
 *         content:
 *          application/json:
 *           example:
 *              {
 *                 "error": "Chat not found"
 *              }
 *       409:
 *         description: Command already exists
 *         content:
 *          application/json:
 *            example:
 *                 {
 *                     "error": "The command already exists"
 *                 }
 *       500:
 *         description: Error to create chat
 *         content:
 *          application/json:
 *            example:
 *              {
 *                 "error": "Error to create chat"
 *              }
 */

/**
 * PUT /api/v1/command/:id_chat
 * @swagger
 * /api/v1/command/{id_chat}:
 *   put:
 *     tags:
 *       - Command
 *     summary: Edit command
 *     description: Edit command
 *     parameters:
 *       - in: path
 *         name: id_chat
 *         required: true
 *         schema:
 *           type: number
 *         description: chat id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/command'
 *           example:
 *             name: "start"
 *             description: "new description"
 *     responses:
 *       200:
 *         description: Returns the chat with the command edited.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/chat'
 *             example:
 *                   {
 *                     "chat": {
 *                       "_id": "65cf77a40b5fe876a63330ac",
 *                       "chatId": 23235,
 *                       "list": [
 *                         {
 *                           "type": "text",
 *                           "name": "all",
 *                           "command": "perez pepito pepitox",
 *                           "description": "perez pepito pepitox iwi",
 *                           "creator": " ",
 *                           "_id": "65cf77a40b5fe876a63330b3"
 *                         }
 *                       ],
 *                       "__v": 10
 *                     }
 *                   }
 *       404:
 *         description: Command not found or chat not found
 *         content:
 *          application/json:
 *           example:
 *              {
 *                 "error": "Command not found"
 *              }
 *       500:
 *         description: Internal server error
 *         content:
 *            application/json:
 *             example:
 *              {
 *                "error": "Internal server error"
 *             }
 *
 */

/**
 * PUT /api/v1/command/:id_chat/:name/:username
 * @swagger
 * /api/v1/command/{id_chat}/{name}/{username}:
 *   put:
 *     tags:
 *       - Command
 *     summary: Edit command all
 *     description: Edit command all
 *     parameters:
 *       - in: path
 *         name: id_chat
 *         required: true
 *         schema:
 *           type: number
 *         description: chat id
 *       - in: path
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *         description: command name
 *       - in: path
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *         description: username
 *     responses:
 *       200:
 *         description: Returns the chat with the command edited.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/chat'
 *             example:
 *               message: username added
 *       404:
 *         description: Chat not found
 *         content:
 *          application/json:
 *           example:
 *             {
 *                "error": "Chat not found"
 *             }
 *       403:
 *         description: Command not allowed
 *         content:
 *           application/json:
 *            example:
 *             {
 *              "error": "Command not allowed"
 *             }
 *
 *       400:
 *         description: Command not valid or username not added
 *         content:
 *            application/json:
 *              example:
 *               {
 *                 "error": "Command not valid or username not added"
 *               }
 *
 *
 */
/**
 * DELETE /api/v1/command/:id_chat/:username/:role
 * @swagger
 * /api/v1/command/{id_chat}/{username}/{role}:
 *   delete:
 *     tags:
 *       - Command
 *     summary: Delete command
 *     description: Delete command
 *     parameters:
 *       - in: path
 *         name: id_chat
 *         required: true
 *         schema:
 *           type: number
 *         description: chat id
 *       - in: path
 *         name: role
 *         required: true
 *         schema:
 *            type: string
 *         description: role user
 *       - in: path
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *         description: username
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/command'
 *           example:
 *             name: "start"
 *     responses:
 *       200:
 *         description: Returns the chat with the command deleted.
 *         content:
 *           application/json:
 *             example:
 *               message: "Command deleted"
 *       404:
 *         description: Command not found or chat not found
 *         content:
 *           application/json:
 *             example:
 *              {
 *               "error": "Command not found or Chat not found"
 *             }
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *            example:
 *             {
 *             "error": "Internal server error"
 *            }
 *
 *       403:
 *        description: User not allowed
 *        content:
 *         application/json:
 *          example:
 *            {
 *               "error": "You dont have authorization to delete the command: commandName"
 *            }
 *
 */
