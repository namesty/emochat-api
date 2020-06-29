import express from 'express'
import { createConversation, getConversations, addMessage, deleteConversation, getAvgEmotionsProvokedByMeInOthers, getAvgEmotionsProvokedByMeInUser, getAvgEmotionsProvokedInMe } from './controller';
import { IUser } from '../user';
import { IMessage } from '../message';
import { CustomError } from '../../errors'

/**
 * @swagger
 * tags:
 *   name: Conversation
 *   description: Conversation control
 */

/**
 * @swagger
 * path:
 *  /conversation/:
 *    post:
 *      tags: [Conversation]
 *      description: Creates new conversation
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *        - name: body
 *          in: body
 *          required: true
 *          schema:
 *            type: object
 *            properties:
 *              userIds:
 *                type: array
 *                items:
 *                  type: string
 *      responses:
 *        '200': 
 *          description: Succesful
 *          schema:
 *            type: Conversation
 *            $ref: '#/definitions/Conversation'
 *        '422':
 *          description: At least two user IDs must be provided to create a conversation
 *        '500': 
 *          description: Internal server error
 *    get:
  *      tags: [Conversation]
  *      security:
  *        - bearerAuth: []
  *      description: Get all conversations of authenticated user
  *      responses:
  *        '200':
  *          description: Succesful
  *          schema:
  *            type: array
  *            items:
  *              type: Conversation
  *              $ref: '#/definitions/Conversation'
  *        '500':
  *          description: Internal server error
  *    put:
  *      tags: [Conversation]
  *      parameters:
  *      - in: body
  *        name: body
  *        required: true
  *        schema:
  *           type: object
  *           properties:
  *             content:
  *               type: string
  *      - in: path
  *        name: id
  *        type: string
  *        required: true
  *        description: ID of conversation where message will be added
  *      security:
  *        - bearerAuth: []
  *      description: Add message to conversation
  *      responses:
  *        '200':
  *          description: Succesful
  *          schema:
  *            type: Conversation
  *            $ref: '#/definitions/Conversation'
  *        '404':
  *          description: No conversation found with this ID
  *        '422':
  *          description: Message sender ID or content not found
  *        '500':
  *          description: Internal server error
  *    delete:
  *      tags: [Conversation]
  *      security:
  *        - bearerAuth: []
  *      parameters:
  *      - in: path
  *        name: id
  *        type: string
  *        required: true
  *        description: ID of conversation to soft delete
  *      description: Soft delete conversation
  *      responses:
  *        '200':
  *          description: Succesful
  *          schema:
  *            type: Conversation
  *            $ref: '#/definitions/Conversation'
  *        '404':
  *          description: No conversation found with this id
  *        '422':
  *          description: Conversation ID not provided
  *        '500':
  *          description: Internal server error
  * 
  *  /conversation/stats/others/:
  *    get:
  *      tags: [Conversation]
  *      security:
  *        - bearerAuth: []
  *      description: Get list of average emotions authenticated user has provoked in others
  *      responses:
  *        '200':
  *          description: Succesful
  *          schema:
  *            type: array
  *            items:
  *              type: Emotion
  *              $ref: '#/definitions/Emotion'
  *        '422':
  *          description: User ID not provided
  *        '500':
  *          description: Internal server error

  *  /conversation/stats/me/:
  *    get:
  *      tags: [Conversation]
  *      security:
  *        - bearerAuth: []
  *      description: Get list of average emotions authenticated user has felt
  *      responses:
  *        '200':
  *          description: Succesful
  *          schema:
  *            type: array
  *            items:
  *              type: Emotion
  *              $ref: '#/definitions/Emotion'
  *        '422':
  *          description: User ID not provided
  *        '500':
  *          description: Internal server error 
  */


const router = express.Router();

router.post("/", async (req, res) => {
  const { userIds }: { userIds: string[] } = req.body
  const user = req.user as IUser

  userIds.push(user.id)

  try{
    const conversation = await createConversation(userIds)

    res.status(200).json(conversation)
  } catch(e) {
    console.log(e.stack)

    if(e instanceof CustomError) {
      res.status(e.code).json({error: e.clientMessage})
    } else {
      res.status(500).json({error: 'Internal server error'})
    }
  }
})

router.get("/", async (req, res) => {
  const user = req.user as any

  try {
    const conversations = await getConversations(user._id)

    res.status(200).json(conversations)
  } catch(e) {
    console.log(e.stack)

    if(e instanceof CustomError) {
      res.status(e.code).json({error: e.clientMessage})
    } else {
      res.status(500).json({error: 'Internal server error'})
    }
  }

})

router.get("/stats/others", async (req, res) => {
  const user = req.user as any

  try {
    const readings = await getAvgEmotionsProvokedByMeInOthers(user._id)

    res.status(200).json(readings)
  } catch(e) {
    console.log(e.stack)

    if(e instanceof CustomError) {
      res.status(e.code).json({error: e.clientMessage})
    } else {
      res.status(500).json({error: 'Internal server error'})
    }
  }

})

router.get("/stats/me", async (req, res) => {
  const user = req.user as any

  try{
    const readings = await getAvgEmotionsProvokedInMe(user._id)

    res.status(200).json(readings)
  } catch(e) {
    console.log(e.stack)

    if(e instanceof CustomError) {
      res.status(e.code).json({error: e.clientMessage})
    } else {
      res.status(500).json({error: 'Internal server error'})
    }
  }

})

router.put("/:id", async (req, res) => {
  const { id } = req.params
  const { message }: {message: IMessage} = req.body

  try {
    const conversation = await addMessage(id, message)

    res.status(200).json(conversation)
  }
  catch(e) {
    console.log(e.stack)

    if(e instanceof CustomError) {
      res.status(e.code).json({error: e.clientMessage})
    } else {
      res.status(500).json({error: 'Internal server error'})
    }
  }

})

router.delete("/:id", async (req, res) => {
  const { id } = req.params

  try {
    const conversation = await deleteConversation(id)

    res.status(200).json(conversation)
  } catch(e) {
    console.log(e.stack)

    if(e instanceof CustomError) {
      res.status(e.code).json({error: e.clientMessage})
    } else {
      res.status(500).json({error: 'Internal server error'})
    }
  }

})

export { router }