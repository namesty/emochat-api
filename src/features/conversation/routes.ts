import express from 'express'
import { createConversation, getConversations, addMessage, deleteConversation, getAvgEmotionsProvokedByMeInOthers, getAvgEmotionsProvokedByMeInUser, getAvgEmotionsProvokedInMe } from './controller';
import { IUser } from '../user';
import { IMessage } from '../message';
import { CustomError } from '../../errors'

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
      res.status(e.code).json(e.clientMessage)
    } else {
      res.status(500).json('Internal server error')
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
      res.status(e.code).json(e.clientMessage)
    } else {
      res.status(500).json('Internal server error')
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
      res.status(e.code).json(e.clientMessage)
    } else {
      res.status(500).json('Internal server error')
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
      res.status(e.code).json(e.clientMessage)
    } else {
      res.status(500).json('Internal server error')
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
      res.status(e.code).json(e.clientMessage)
    } else {
      res.status(500).json('Internal server error')
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
      res.status(e.code).json(e.clientMessage)
    } else {
      res.status(500).json('Internal server error')
    }
  }

})

export { router }