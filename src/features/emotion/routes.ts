import express from 'express'
import { analyzeLastNMessages } from './controller';
import { CustomError } from '../../errors';

const router = express.Router();

router.post("/last/:n", async (req, res) => {
  const n = parseInt(req.params.n)
  const { conversationId } = req.body

  try{
    const emotion = await analyzeLastNMessages(n, conversationId)

    res.status(200).json(emotion)
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