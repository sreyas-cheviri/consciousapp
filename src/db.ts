import mongoose, { Types, Schema } from "mongoose";
// import from 'mongoose';

const UserSchema = new Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, require: true },
});


export const UserModel = mongoose.model("User", UserSchema);