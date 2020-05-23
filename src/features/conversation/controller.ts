import { Conversation, IConversation, conversationMapper } from "./model";
import { IMessage, Message } from "../message";

export async function createConversation(
  userIds: string[]
): Promise<IConversation> {
  let conversation = await Conversation.findOne({
    users: {
      $all: userIds.map((uid) => {
        return {
          _id: uid,
        };
      }),
    },
    active: true,
  })
    .populate("users")
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
    .exec();
};

export const addMessage = async (conversationId: string, message: IMessage) => {
  const createdMessage = await Message.create({
    from: message.from.id,
    content: message.content,
  });

  const populatedMessage = await createdMessage.populate("from").execPopulate();

  const conversation = await Conversation.findByIdAndUpdate(conversationId, {
    $push: {
      messages: populatedMessage,
    },
  })
    .populate("users")
    .populate({
      path: "messages",
      populate: {
        path: "from",
        model: "User",
      },
    })
    .exec();

  if (!conversation) throw new Error("No conversation found with this id");

  return conversationMapper(conversation);
};

export const getConversations = async (userId: string) => {
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
    .exec();

  return conversations.map(conversationMapper);
};

export const deleteConversation = async (conversationId: string) => {
  const conversation = await Conversation.findOne({
    _id: conversationId,
    active: true,
  });

  if (!conversation) throw new Error("No conversation found with this id");

  conversation.active = false;
  const deletedConv = await conversation.save();

  return conversationMapper(deletedConv);
};

export const getAvgEmotionsProvokedByMeInOthers = async (userId: string) => {
  const averages = await Conversation.aggregate([
    { $unwind: "$emotions" },
    {
      $match: {
        users: {
          $in: [userId]
        }
      }
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
          $ne: userId
        }
      }
    }
  ])

  return await populateAverages(averages)

};

export const getAvgEmotionsProvokedInMe = async (userId: string) => {
  const averages = await Conversation.aggregate([
    { $unwind: "$emotions" },
    {
      $match: {
        users: {
          $in: [userId]
        }
      }
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
          $eq: userId
        }
      }
    }
  ])

  return await populateAverages(averages)

};

export const getAvgEmotionsProvokedByMeInUser = async (userId: string, otherUserId: string) => {
  
  console.log(otherUserId)
  const averages = await Conversation.aggregate([
    { $unwind: "$emotions" },
    {
      $match: {
        users: {
          $in: [userId]
        }
      }
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
          $eq: otherUserId
        }
      }
    }
  ])

  return await populateAverages(averages)

};

async function populateAverages(averages: any[]) {
  return await Conversation.populate(
    averages,
    {
      path: "user",
      model: "User",
    }
  )
}