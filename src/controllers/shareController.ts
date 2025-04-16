import { Request, Response } from "express";
import { AuthRequest } from "../types";
import { LinkModel, ContentModel, UserModel } from "../models";
import { v4 as uuidv4 } from "uuid";
import { shareSchema } from "../utils/validation";

export const shareBrain = async (req: AuthRequest, res: Response): Promise<void> => {
  const validation = shareSchema.safeParse(req.body);
  if (!validation.success) {
    res.status(400).json({ message: "Invalid share parameter" });
    return;
  }

  const { share } = req.body;
  
  if (share) {
    const content = await LinkModel.findOne({ userId: req.userId });
    if (content) {
      res.json({ hash: content.hash });
      return;
    }
    const hash = uuidv4().slice(0, 15);
    await LinkModel.create({
      userId: req.userId,
      hash: hash,
    });

    res.json({
      hash,
    });
  } else {
    await LinkModel.deleteOne({
      userId: req.userId,
    });

    res.json({
      message: "Removed link",
    });
  }
};

export const getBrainByShareLink = async (req: Request, res: Response): Promise<void> => {
  const hash = req.params.shareLink;

  const link = await LinkModel.findOne({
    hash,
  });

  if (!link) {
    res.status(411).json({
      message: "Sorry incorrect input",
    });
    return;
  }

  const content = await ContentModel.find({
    userId: link.userId,
  });

  const user = await UserModel.findOne({
    _id: link.userId,
  });

  if (!user) {
    res.status(411).json({
      message: "user not found, error should ideally not happen",
    });
    return;
  }

  res.json({
    username: user.username,
    content: content,
  });
};