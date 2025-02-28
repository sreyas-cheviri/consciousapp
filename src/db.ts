import mongoose, { Types } from "mongoose";
// import from 'mongoose';

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, require: true },
});

const ContentSchema = new mongoose.Schema({
  title: {type: String , require: true},
  type: {type: String , require: true},
  link: {type: String },
  content: {type :String},
  tags:[ {type: Types.ObjectId, ref: "Tag"}],
  userId: { type: Types.ObjectId , ref: "User" , require: true},
}, { timestamps: true })


// new mongoose.Schema({ is when u take schema from mongoose and create a new schema
//  and new Schema({ when u import schema speartely
// same for Types and Types.ObjectId
// ref is used to refer to the other schema


const LinkSchema = new mongoose.Schema({
  hash: { type: String , require: true},
  userId :{type: mongoose.Types.ObjectId, ref:'User', require : true}
}) 

export const UserModel = mongoose.model("User", UserSchema);
export const ContentModel = mongoose.model("content", ContentSchema);
export const LinkModel = mongoose.model("share", LinkSchema);