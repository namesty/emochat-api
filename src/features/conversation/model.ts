import mongoose from 'mongoose'
import { IUser, MongooseUser, userMapper } from '../user'
import { IMessage, MessageSchema, messageMapper, MongooseMessage } from '../message'
import { IEmotion } from '../emotion'
import { EmotionSchema } from '../emotion/model'

//TODO: la parte de mongoose va en infastructure. Las interfaces no se prefijan con 'I'

export interface IConversation {
  id: string
  users: IUser[]
  messages: IMessage[],
  emotions: IEmotion[],
  date: string,
  active: boolean
}

interface MongooseConversation extends mongoose.Document {
  users: MongooseUser[] | string[],
  messages: MongooseMessage[] | string[],
  emotions: IEmotion[],
  date: string,
  active: boolean
}

export function conversationMapper (mongoConv: MongooseConversation): IConversation {

  if(mongoConv.users[0] === 'string') {
    throw new Error("Conversations query did not populate users")
  }

  if(typeof mongoConv.messages[0] === 'string') {
    throw new Error("Conversations query did not populate messages")
  }

  return {
    id: mongoConv.id,
    users: (mongoConv.users as MongooseUser[]).map(userMapper),
    messages: (mongoConv.messages as MongooseMessage[]).map(messageMapper),
    emotions: mongoConv.emotions,
    date: mongoConv.date,
    active: mongoConv.active
  }
}

const ConversationSchema = new mongoose.Schema({
  users: {
    type: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    required: true,
  },
  messages: {
    type: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message'
    }],
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