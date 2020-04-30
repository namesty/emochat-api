import mongoose from 'mongoose'
import { IUser } from '../user'
import { IMessage, MessageSchema } from '../message'
import { IEmotion } from '../emotion'
import { EmotionSchema } from '../emotion/model'

export interface IConversation {
  user1: IUser | string,
  user2: IUser | string,
  messages: IMessage[],
  emotions: IEmotion[],
  date: string,
  active: boolean
}

interface MongooseConversation extends mongoose.Document {
  user1: IUser | string,
  user2: IUser | string,
  messages: IMessage[],
  emotions: IEmotion[],
  date: string,
  active: boolean
}

const ConversationSchema = new mongoose.Schema({
  user1: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  user2: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  messages: {
    type: [MessageSchema],
    default: []
  },
  emotions: {
    type: [EmotionSchema],
    default: []
  },
  date: {
    type: String,
    default: Date.now(),
  },
  active: {
    type: Boolean,
    default: true
  }
})

export const Conversation = mongoose.model<MongooseConversation>('Conversation', ConversationSchema)