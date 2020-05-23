import mongoose from 'mongoose'

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