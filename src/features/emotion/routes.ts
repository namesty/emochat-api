import express from 'express'
import { analyzeLastNMessages } from './controller';

const router = express.Router();

router.post("/last/:n", async (req, res) => {
  const n = parseInt(req.params.n)
  const { conversationId } = req.body

  const emotion = await analyzeLastNMessages(n, conversationId)

  res.status(200).json(emotion)
})

export { router }