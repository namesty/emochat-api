import mongoose from 'mongoose'
import { IUser } from '../user'

export interface IMessage {
  from: IUser | string,
  to: IUser | string,
  content: string,
  date: string
}

interface MongooseMessage extends mongoose.Document {
  from: IUser | string,
  to: IUser | string,
  content: string,
  date: string
}

const MessageSchema = new mongoose.Schema({
  from: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  to: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  date: {
    type: String,
    default: Date.now(),
  }
})

export const Message = mongoose.model<MongooseMessage>('Message', MessageSchema)