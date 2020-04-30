import express from 'express'
import { getMessageByUser, createMessage } from './controller';
import { IUser } from '../user';

const router = express.Router();

router.post("/", async (req, res) => {
  const { to, content }: {to: string, content: string} = req.body
  const user = req.user as IUser

  const message = await createMessage({fromId: user.id, toEmail: to, content})

  res.status(200).json({ message })
})

router.get("user/:id", async (req, res) => {
  const { id } = req.params
  const user = req.user as IUser

  const messages = await getMessageByUser(user.id, id)

  res.status(200).json({
    ...messages
  })

})

export { router }