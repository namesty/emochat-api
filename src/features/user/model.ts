import mongoose from 'mongoose'

export interface IUser {
  id: string
  name: string
  lastName: string
  email: string
}

interface MongooseUser extends mongoose.Document {
  id: string
  name: string
  lastName: string
  email: string,
  password: string,
  date: string
}

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  date: {
    type: String,
    default: Date.now(),
  }
})

export const User = mongoose.model<MongooseUser>('User', UserSchema)