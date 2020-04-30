import { Message, IMessage } from "./model";
import { User } from "../user";

interface CreateProps {
  fromId: string;
  toEmail: string;
  content: string;
}

export const createMessage = async ({
  fromId,
  toEmail,
  content,
}: CreateProps) => {
  const toUser = await User.findOne({ email: toEmail });

  if (!content) throw new Error("Message body cannot be empty");
  if (!toUser) throw new Error("User not found with email: " + toEmail);

  const message = await Message.create({
    from: fromId,
    to: toUser._id,
    content,
  });

  return await message.execPopulate();
};

export const getMessageByUser = async (
  myUserId: string,
  otherUserId: string
) => {
  const messagesFromMe = await Message.find({ from: myUserId, to: otherUserId })
    .populate("from")
    .populate("to")
    .exec();

  const messagesToMe = await Message.find({ to: myUserId, from: otherUserId })
    .populate("from")
    .populate("to")
    .exec();

  return {
    msgsFromMyUser: messagesFromMe,
    msgsToMyUser: messagesToMe,
  };
};
