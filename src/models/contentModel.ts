import mongoose, { Types } from "mongoose";

const ContentSchema = new mongoose.Schema(
  {
    title: { 
      type: String, 
    },
    type: { 
      type: String, 
      required: true 
    },
    link: { 
      type: String 
    },
    content: { 
      type: String 
    },
    imageUrl: { 
      type: String 
    },
    tag: [{ 
      type: String 
    }],
    userId: { 
      type: Types.ObjectId, 
      ref: "User", 
      required: true 
    }
  },
  { timestamps: true }
);

export const ContentModel = mongoose.model("Content", ContentSchema);