import { User, userMapper } from "./model"

export const findAllUsers = async () => {
  return (await User.find({}, { password: 0, date: 0, __v: 0 })).map(userMapper)
}

export const findUser = async (id: string) => {
  return await User.findById(id, { password: 0, date: 0, __v: 0 })
}