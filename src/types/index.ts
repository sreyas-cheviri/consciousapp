import mongoose from "mongoose";
import { Request } from "express";

export interface User {
  _id: mongoose.Types.ObjectId;
  username: string;
  password: string;
}

export interface Content {
  _id: mongoose.Types.ObjectId;
  title: string;
  link?: string;
  type: string;
  content: string;
  tag: string[];
  userId: mongoose.Types.ObjectId;
  imageUrl?: string;
}

export interface Link {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  hash: string;
}

export interface AuthRequest extends Request {
  userId?: string;
}

export interface SearchQuery {
  query: string;
}

export interface ScrapedData {
  title: string;
  content: string;
  imageUrl?: string | null;
}