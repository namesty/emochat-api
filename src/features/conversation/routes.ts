import express from 'express'
import { createConversation, getConversations, addMessage, deleteConversation, getAvgEmotionsProvokedByMeInOthers, getAvgEmotionsProvokedByMeInUser, getAvgEmotionsProvokedInMe } from './controller';
import { IUser } from '../user';
import { IMessage } from '../message';

const router = express.Router();

router.post("/", async (req, res) => {
  const { userIds }: { userIds: string[] } = req.body
  const user = req.user as IUser

  userIds.push(user.id)

  const conversation = await createConversation(userIds)

  res.status(200).json(conversation)
})

router.get("/", async (req, res) => {
  const user = req.user as any
  const conversations = await getConversations(user._id)

  res.status(200).json(conversations)

})

router.get("/stats/others", async (req, res) => {
  const user = req.user as any
  const readings = await getAvgEmotionsProvokedByMeInOthers(user._id)

  res.status(200).json(readings)

})

router.get("/stats/me", async (req, res) => {
  const user = req.user as any
  const readings = await getAvgEmotionsProvokedInMe(user._id)

  res.status(200).json(readings)

})

router.get("/stats/user/:id", async (req, res) => {
  const user = req.user as any
  const otherUserId = req.params.id
  const readings = await getAvgEmotionsProvokedByMeInUser(user._id, otherUserId)

  res.status(200).json(readings)

})


router.put("/:id", async (req, res) => {
  const { id } = req.params
  const { message }: {message: IMessage} = req.body

  const conversation = await addMessage(id, message)

  res.status(200).json(conversation)

})

router.delete("/:id", async (req, res) => {
  const { id } = req.params

  const conversation = await deleteConversation(id)

  res.status(200).json(conversation)

})

export { router }