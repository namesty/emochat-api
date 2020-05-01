import { User } from "./model"

export const findAllUsers = async () => {
  const users = await User.find({}, { password: 0, date: 0, __v: 0 })
}

export const findUser = async (id: string) => {
  return await User.findById(id, { password: 0, date: 0, __v: 0 })
}