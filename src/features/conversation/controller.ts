import { Conversation, IConversation } from "./model";
import { IMessage } from "../message";
import { IUser } from "../user";

export const createConversation = async (userId1: string, userId2: string) => {
  let conversation = await Conversation.findOne({
    $or: [
      {
        user1: userId1,
        user2: userId2,
        active: true,
      },
      {
        user1: userId2,
        user2: userId1,
        active: true,
      },
    ],
  })
    .populate("user1")
    .populate("user2")
    .exec();

  if (!conversation) {
    conversation = await Conversation.create({
      user1: userId1,
      user2: userId2,
    });
  }

  return {
    id: conversation.id,
    user1: conversation.user1 as IUser,
    user2: conversation.user2 as IUser,
    date: conversation.date,
    messages: conversation.messages,
    emotions: conversation.emotions,
    active: conversation.active,
  } as IConversation;
};

export const addMessage = async (conversationId: string, message: IMessage) => {
  const conversation = await Conversation.findOne({
    id: conversationId,
    active: true,
  });

  if (!conversation) throw new Error("No conversation found with this id");

  conversation.messages = [...conversation.messages, message];

  await conversation.save();
};

export const getConversations = async (userId: string) => {
  const conversations = await Conversation.find({
    $or: [
      {
        user1: userId,
        active: true,
      },
      {
        user2: userId,
        active: true,
      },
    ],
  })
    .populate("user1")
    .populate("user2");

  return conversations.map((c) => {
    return {
      id: c.id,
      user1: c.user1 as IUser,
      user2: c.user2 as IUser,
      date: c.date,
      messages: c.messages,
      emotions: c.emotions,
      active: c.active,
    } as IConversation;
  });
};

export const deleteConversation = async (conversationId: string) => {
  const conversation = await Conversation.findOne({
    id: conversationId,
    active: true,
  });

  if (!conversation) throw new Error("No conversation found with this id");

  conversation.active = false;
  await conversation.save();
};
