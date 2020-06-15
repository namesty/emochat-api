import { Conversation, IConversation, conversationMapper } from "./model";
import { IMessage, Message } from "../message";
import { CustomError } from '../../errors';

export async function createConversation(
  userIds: string[]
): Promise<IConversation> {
  if (userIds.length < 2)
    throw new CustomError(
      "BadParameters",
      "At least two user IDs must be provided to create a conversation"
    );

  let conversation = await Conversation.findOne({
    users: {
      $all: userIds.map((uid) => {
        return {
          _id: uid,
        };
      }),
      $size: userIds.length,
    },
    active: true,
  })
    .populate("users")
    .populate({
      path: "messages",
      populate: {
        path: "from",
        model: "User",
      },
    })
    .populate({
      path: "emotions.user",
      model: "User",
    })
    .exec();

  if (!conversation) {
    conversation = await Conversation.create({
      users: userIds,
    });

    conversation = await conversation.populate("users").execPopulate();
  }

  return conversationMapper(conversation);
}

export const findConversation = async (id: string) => {
  if (!id)
    throw new CustomError("BadParameters", "Conversation ID not provided");

  return await Conversation.findOne({
    _id: id,
    active: true,
  })
    .populate("users")
    .populate({
      path: "messages",
      populate: {
        path: "from",
        model: "User",
      },
    })
    .populate({
      path: "emotions.user",
      model: "User",
    })
    .exec();
};

export const addMessage = async (conversationId: string, message: IMessage) => {
  if (!message.from.id || !message.content)
    throw new CustomError(
      "BadParameters",
      "Message sender ID or content not found"
    );

  const createdMessage = await Message.create({
    from: message.from.id,
    content: message.content,
    date: message.date,
  });

  const populatedMessage = await createdMessage.populate("from").execPopulate();

  await Conversation.findByIdAndUpdate(conversationId, {
    $push: {
      messages: populatedMessage,
    },
    active: true,
  });

  const conversation = await Conversation.findById(conversationId)
    .populate("users")
    .populate({
      path: "messages",
      populate: {
        path: "from",
        model: "User",
      },
    })
    .populate({
      path: "emotions.user",
      model: "User",
    })
    .exec();

  if (!conversation)
    throw new CustomError("NotFound", "No conversation found with this id");

  return conversationMapper(conversation);
};

export const getConversations = async (userId: string) => {
  if (!userId) throw new CustomError("BadParameters", "User ID not provided");

  const conversations = await Conversation.find({
    users: userId,
    active: true,
  })
    .populate("users")
    .populate({
      path: "messages",
      populate: {
        path: "from",
        model: "User",
      },
    })
    .populate({
      path: "emotions.user",
      model: "User",
    })
    .exec();

  return conversations.map(conversationMapper);
};

export const deleteConversation = async (conversationId: string) => {
  if (!conversationId)
    throw new CustomError("BadParameters", "Conversation ID not provided");

  const conversation = await Conversation.findOne({
    _id: conversationId,
  })
    .populate("users")
    .populate({
      path: "messages",
      populate: {
        path: "from",
        model: "User",
      },
    })
    .populate({
      path: "emotions.user",
      model: "User",
    })
    .exec();

  if (!conversation) throw new Error("No conversation found with this id");

  conversation.active = false;
  const deletedConv = await conversation.save();

  return conversationMapper(deletedConv);
};

export const getAvgEmotionsProvokedByMeInOthers = async (userId: string) => {
  if (!userId) throw new CustomError("BadParameters", "User ID not provided");

  const averages = await Conversation.aggregate([
    { $unwind: "$emotions" },
    {
      $match: {
        users: {
          $in: [userId],
        },
      },
    },
    {
      $group: {
        _id: "$emotions.user",
        user: { $first: "$emotions.user" },
        date: { $first: "$date" },
        active: { $first: "$active" },
        Happy: { $avg: "$emotions.Happy" },
        Fear: { $avg: "$emotions.Fear" },
        Bored: { $avg: "$emotions.Bored" },
        Excited: { $avg: "$emotions.Excited" },
        Angry: { $avg: "$emotions.Angry" },
        Sad: { $avg: "$emotions.Sad" },
      },
    },
    {
      $match: {
        user: {
          $ne: userId,
        },
      },
    },
  ]);

  return await populateAverages(averages);
};

export const getAvgEmotionsProvokedInMe = async (userId: string) => {
  if (!userId) throw new CustomError("BadParameters", "User ID not provided");

  const averages = await Conversation.aggregate([
    { $unwind: "$emotions" },
    {
      $match: {
        users: {
          $in: [userId],
        },
      },
    },
    {
      $group: {
        _id: "$emotions.user",
        user: { $first: "$emotions.user" },
        date: { $first: "$date" },
        active: { $first: "$active" },
        Happy: { $avg: "$emotions.Happy" },
        Fear: { $avg: "$emotions.Fear" },
        Bored: { $avg: "$emotions.Bored" },
        Excited: { $avg: "$emotions.Excited" },
        Angry: { $avg: "$emotions.Angry" },
        Sad: { $avg: "$emotions.Sad" },
      },
    },
    {
      $match: {
        user: {
          $eq: userId,
        },
      },
    },
  ]);

  return await populateAverages(averages);
};

export const getAvgEmotionsProvokedByMeInUser = async (
  userId: string,
  otherUserId: string
) => {
  if (!userId || !otherUserId)
    throw new CustomError("BadParameters", "2 user IDs must be provided");

  const averages = await Conversation.aggregate([
    { $unwind: "$emotions" },
    {
      $match: {
        users: {
          $in: [userId],
        },
      },
    },
    {
      $group: {
        _id: "$emotions.user",
        user: { $first: "$emotions.user" },
        date: { $first: "$date" },
        active: { $first: "$active" },
        Happy: { $avg: "$emotions.Happy" },
        Fear: { $avg: "$emotions.Fear" },
        Bored: { $avg: "$emotions.Bored" },
        Excited: { $avg: "$emotions.Excited" },
        Angry: { $avg: "$emotions.Angry" },
        Sad: { $avg: "$emotions.Sad" },
      },
    },
    {
      $match: {
        user: {
          $eq: otherUserId,
        },
      },
    },
  ]);

  return await populateAverages(averages);
};

async function populateAverages(averages: any[]) {
  return await Conversation.populate(averages, {
    path: "user",
    model: "User",
  });
}
