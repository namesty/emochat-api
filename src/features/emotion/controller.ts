import axios from 'axios'
import FormData from 'form-data'
import { IMessage, messageMapper, MongooseMessage } from '../message'
import { IEmotionDTO } from './emotion'
import { Conversation } from '../conversation/model'

export const analyze = async (messages: IMessage[]) => {
  const messagesString = messages.reduce((prev, current, i) => {
    if(messages[i+1]) {
      return prev + `"${current.content}",`
    } else {
      return prev + `"${current.content}"]`
    }
  }, '[')

  const formData = new FormData()
  formData.append('api_key', process.env.API_KEY)
  formData.append('text', messagesString)

  const { data: { emotion: emotions } } = await axios.post<IEmotionDTO>(
    process.env.API_URL,
    formData,
    { headers: formData.getHeaders()}
  )

  const emotion = {
    Happy: 0,
    Angry: 0,
    Fear: 0,
    Bored: 0,
    Excited: 0,
    Sad: 0
  }

  type keys = 'Happy' | 'Angry' | 'Fear' | 'Bored' | 'Excited' | 'Sad'

  emotions.forEach(emotionDTO => {
    Object.keys(emotionDTO).forEach((key: keys) => {
      emotion[key] += emotionDTO[key]
    })
  })

  Object.keys(emotion).forEach((key: keys) => {
    emotion[key] = emotion[key] / emotions.length
  })

  return emotion
}

export const analyzeLastNMessages = async (n: number, conversationId:string) => {
  const conversation = await Conversation.findById(conversationId)
  .populate("users")
  .populate({ path: "messages", 
    populate: {
      path: "from",
      model: 'User'
    }
  })
  .exec()

  const messages: IMessage[] = (conversation.messages as MongooseMessage[])
    .map(messageMapper)
    .slice(-n)

  const reading = await analyze(messages)
  console.log(reading)
  conversation.emotions.push(reading)
  await conversation.save()

  return reading
}

export const analyzeMessages = async (messages: IMessage[], conversationId: string) => {
  const conversation = await Conversation.findById(conversationId)
  .populate("users")
  .populate({ path: "messages", 
    populate: {
      path: "from",
      model: 'User'
    }
  })
  .exec()

  const reading = await analyze(messages)
  conversation.emotions.push(reading)
  await conversation.save()

  return reading
}
