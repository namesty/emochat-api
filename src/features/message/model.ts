import mongoose from 'mongoose'
import { IUser, MongooseUser, userMapper } from '../user'

export interface IMessage {
  id: string,
  from: IUser,
  content: string,
  date: string
}

export interface MongooseMessage extends mongoose.Document {
  id: string
  from: MongooseUser | string,
  content: string,
  date: string
}

export const messageMapper = (mongoMessage: MongooseMessage): IMessage => {
  if(typeof mongoMessage.from === 'string') {
    throw new Error('Users in messages were not populated')
  }

  return {
    id: mongoMessage.id,
    from: userMapper(mongoMessage.from),
    content: mongoMessage.content,
    date: mongoMessage.date
  }
}

export const MessageSchema = new mongoose.Schema({
  from: {
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