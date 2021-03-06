import axios from "axios";
import FormData from "form-data";
import { IMessage, messageMapper, MongooseMessage } from "../message";
import { IEmotionDTO } from "./emotion";
import { Conversation, IConversation } from "../conversation/model";
import { MongooseUser, userMapper } from "../user";
import { CustomError } from '../../errors';

export const analyze = async (messages: IMessage[]) => {
  const messagesString = messages.reduce((prev, current, i) => {
    if (messages[i + 1]) {
      return prev + `"${current.content}",`;
    } else {
      return prev + `"${current.content}"]`;
    }
  }, "[");

  const formData = new FormData();
  formData.append("api_key", process.env.API_KEY);
  formData.append("text", messagesString);

  const {
    data: { emotion: emotions },
  } = await axios.post<IEmotionDTO>(process.env.API_URL, formData, {
    headers: formData.getHeaders(),
  });

  const emotion = {
    Happy: 0,
    Angry: 0,
    Fear: 0,
    Bored: 0,
    Excited: 0,
    Sad: 0,
  };

  type keys = "Happy" | "Angry" | "Fear" | "Bored" | "Excited" | "Sad";

  emotions.forEach((emotionDTO) => {
    Object.keys(emotionDTO).forEach((key: keys) => {
      emotion[key] += emotionDTO[key];
    });
  });

  Object.keys(emotion).forEach((key: keys) => {
    emotion[key] = emotion[key] / emotions.length;
  });

  return emotion;
};

export const analyzeLastNMessages = async (
  n: number,
  conversationId: string
) => {
  if (!conversationId)
    throw new CustomError("BadParameters", "Conversation ID was not provided");

  if (n < 1)
    throw new CustomError(
      "BadParameters",
      "N must be a natural number greater than 0"
    );

  const conversation = await Conversation.findById(conversationId)
    .populate("users")
    .populate({
      path: "messages",
      populate: {
        path: "from",
        model: "User",
      },
    })
    .exec();

  const users = (conversation.users as MongooseUser[]).map(userMapper);

  await Promise.all(
    users.map(async (user) => {
      const messages = (conversation.messages as MongooseMessage[])
        .map(messageMapper)
        .filter((m) => m.from.email === user.email)
        .slice(-n);

      if (messages.length > 0) {
        const reading = await analyze(messages);
        conversation.emotions.push({
          user: user.id,
          ...reading,
        });
      }
    })
  );

  const modifiedConversation = await conversation.save();

  const resultingConversation: IConversation = await Conversation.populate(
    modifiedConversation,
    {
      path: "emotions.user",
      model: "User",
    }
  );

  return resultingConversation.emotions;
};
