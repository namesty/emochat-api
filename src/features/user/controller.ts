import { User } from "./model"

export const findAllUsers = async () => {
  return await User.find({}, { password: 0, date: 0, __v: 0 })
}