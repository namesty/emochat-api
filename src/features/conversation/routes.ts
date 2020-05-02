import express from 'express'
import { createConversation, getConversations, addMessage, deleteConversation } from './controller';
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