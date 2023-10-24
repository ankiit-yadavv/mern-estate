import User from "../models/user.model.js";
import bcryptjs from 'bcryptjs';
import { errorHandler } from "../utils/error.js";


export const signup = async (req, res ,next) =>{
    const {username , email , password} = req.body;
    const hashedPassword = bcryptjs.hashSync(password , 10); //10 is a hash number which get combined with your password to salt the password && we re not writing await because we already wrote on the top of function
    const newUser = new User({username , email , password: hashedPassword});
    try {
        await newUser.save();
        res.status(201).json("User created successfully");   
    } catch (error) {
        next(error);
    }   
   
};