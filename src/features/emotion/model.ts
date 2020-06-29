import mongoose from 'mongoose'

/**
 * @swagger
 * definitions:
 *  Emotion:
 *    type: object
 *    properties:
 *      user:
 *        $ref: '#/definitions/User'
 *        type: User
 *      Happy:
 *        type: number
 *      Angry:
 *        type: number
 *      Fear:
 *        type: number
 *      Bored:
 *        type: number
 *      Excited:
 *        type: number
 *      Sad:
 *        type: number
 *      date:
 *        type: string
 */

export const EmotionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  Happy: {
    type: Number,
    required: true,
  },
  Angry: {
    type: Number,
    required: true,
  },
  Fear: {
    type: Number,
    required: true,
  },
  Bored: {
    type: Number,
    required: true,
  },
  Excited: {
    type: Number,
    required: true,
  },
  Sad: {
    type: Number,
    required: true,
  },
  date: {
    type: String,
    default: Date.now(),
  }
})