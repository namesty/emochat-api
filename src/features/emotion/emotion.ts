import { IUser } from "../user";

export interface IEmotion {
  user: IUser | string
  Happy: number,
  Angry: number,
  Fear: number,
  Bored: number,
  Excited: number,
  Sad: number
  date?: string
}

export interface IEmotionDTO {
  emotion: IEmotion[]
}