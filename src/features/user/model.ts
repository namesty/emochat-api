import mongoose from 'mongoose'

/**
 * @swagger
 * definitions:
 *  User:
 *    type: object
 *    properties:
 *      id:
 *        type: string
 *      name:
 *        type: string
 *      lastName:
 *        type: string
 *      email:
 *        type: string
 *      password:
 *        type: string
 *        format: password
 *      date:
 *        type: string
 */

export interface IUser {
  id: string
  name: string
  lastName: string
  email: string
}

export interface MongooseUser extends mongoose.Document {
  id: string
  name: string
  lastName: string
  email: string,
  password: string,
  date: string
}

export function userMapper(mongoUser: MongooseUser): IUser {
  return {
    id: mongoUser.id,
    name: mongoUser.name,
    lastName: mongoUser.lastName,
    email: mongoUser.email
  }
}

export const UserSchema = new mongoose.Schema({
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