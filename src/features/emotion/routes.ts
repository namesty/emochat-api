import express from 'express'
import { analyzeLastNMessages } from './controller';
import { CustomError } from '../../errors';

const router = express.Router();
/**
 * @swagger
 * tags:
 *   name: Emotions
 *   description: Emotions management
 */

/**
 * @swagger
 * path:
 *  /emotion/last/:
 *    post:
 *      tags: [Emotions]
 *      description: Analyzes last n messages
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *        - name: body
 *          in: body
 *          required: true
 *          schema:
 *            type: object
 *            properties:
 *              conversationId:
 *                type: string
 *        - name: n
 *          in: path
 *          required: true
 *          description: Quantity of messages to analyze
 *      responses:
 *        '200': 
 *          description: Succesful
 *          schema:
 *            $ref: '#/definitions/Emotion'
 *            type: Emotion
 *        '403':
 *          description: No bearer token provided in request header
 *        '422':
 *          description: Conversation ID was not provided | N must be a natural number greater than 0
 *        '500': 
 *          description: Internal server error
 */

router.post("/last/:n", async (req, res) => {
  const n = parseInt(req.params.n)
  const { conversationId } = req.body

  try{
    const emotion = await analyzeLastNMessages(n, conversationId)

    res.status(200).json(emotion)
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