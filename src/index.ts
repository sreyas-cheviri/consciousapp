import express from 'express';
import jwt from 'jsonwebtoken';
import z from 'zod';
import bcrypt from 'bcrypt';
import { UserModel } from './db';
const app = express();

// -------------------signup-------------------

app.post('/api/v1/signup', async (req,res) => {

    const inputzod = z.object({
        username: z.string().min(3,{message: "username must be atleast 3 characters long"}).max(9,{message: "username must be atmost 20 characters long"}),
        password: z.string().min(6,{message: "password must be atleast 8 characters long"}).max(10,{message: "password must be atmost 20 characters long"})
        .regex(/\W/,{message: "password must contain atleast one special character"})
    })
    const validInput = inputzod.safeParse(req.body);
    if(!validInput.success){
        const errormessage = validInput.error.errors.map((e)=>e.message);
        res.status(411).json({message:"invalid format",
            error : errormessage,
        }); 
        return;
    }

    const {username, password} = req.body;
    const hashpassword  = await bcrypt.hash(password, 10);
    try{
        const user = await UserModel.findOne({username});
        if(!user){
            await UserModel.create({username,password:hashpassword});
        }
        res.status(200).json({message: 'User created successfully'});
    }
    catch(err){
        res.status(500).json({message: 'Internal server error'});
    }
    });    

// -------------------signup-------------------



app.post('/api/v1/signin', (req,res) => {

})
app.post('/api/v1/content', (req,res) => {

})
app.get('/api/v1/content', (req,res) => {

})
app.delete('/api/v1/content', (req,res) => {

})
app.get('/api/v1/brain/:shareLink', (req,res) => {

})
app.post('/api/v1/brain/share', (req,res) => {

})