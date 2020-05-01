import express from 'express'
import { createConversation, getConversations, addMessage, deleteConversation } from './controller';
import { IUser } from '../user';
import { IMessage } from '../message';

const router = express.Router();

router.post("/", async (req, res) => {
  const { toId }: { toId: string } = req.body
  const user = req.user as IUser

  const conversation = await createConversation(user.id, toId)

  res.status(200).json(conversation)
})

router.get("/", async (req, res) => {
  const user = req.user as any
  console.log(user._id)
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