import mongoose from 'mongoose'

export const EmotionSchema = new mongoose.Schema({
  happiness: {
    type: Number,
    required: true,
  },
  anger: {
    type: Number,
    required: true,
  },
  fear: {
    type: Number,
    required: true,
  },
  boredom: {
    type: Number,
    required: true,
  },
  excitement: {
    type: Number,
    required: true,
  },
  sadness: {
    type: Number,
    required: true,
  },
  date: {
    type: String,
    default: Date.now(),
  }
})