import mongoose from 'mongoose';

const collection = "Users";

const UserSchema = new mongoose.Schema({
    name:String,
    username:String,
    email:String,
    company:String,
    hireable:String,
})
export const users = mongoose.model(collection,UserSchema);