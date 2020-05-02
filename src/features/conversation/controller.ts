import { Conversation, IConversation, conversationMapper } from "./model";
import { IMessage, Message } from "../message";

export async function createConversation(
  userIds: string[],
): Promise<IConversation> {
  let conversation = await Conversation.findOne({
    users: {
      $all: userIds.map(uid => {
        return {
          _id: uid
        }
      })
    },
    active: true
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
    .populate({ path: "messages", 
      populate: {
        path: "from",
        model: 'User'
      }
    })
    .exec();
};

export const addMessage = async (conversationId: string, message: IMessage) => {
  const createdMessage = await Message.create({
    from: message.from.id,
    content: message.content,
  })

  const populatedMessage = await createdMessage.populate('from').execPopulate()

  const conversation = await Conversation.findByIdAndUpdate(conversationId, {
    $push: {
      messages: populatedMessage,
    },
  })
    .populate("users")
    .populate({ path: "messages", 
      populate: {
        path: "from",
        model: 'User'
      }
    })
    .exec();

  if (!conversation) throw new Error("No conversation found with this id");

  return conversationMapper(conversation);
};

export const getConversations = async (userId: string) => {
  const conversations = await Conversation.find({
    users: userId,
  })
    .populate("users")
    .populate({ path: "messages", 
      populate: {
        path: "from",
        model: 'User'
      }
    })
    .exec();

  return conversations.map(conversationMapper);
};

export const deleteConversation = async (conversationId: string) => {
  const conversation = await Conversation.findOne({
    id: conversationId,
    active: true,
  });

  if (!conversation) throw new Error("No conversation found with this id");

  conversation.active = false;
  const deletedConv = await conversation.save();

  return conversationMapper(deletedConv);
};
