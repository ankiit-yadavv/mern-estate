import User from "../models/user.model.js";
import bcryptjs from 'bcryptjs';
import { errorHandler } from "../utils/error.js";
import jwt from 'jsonwebtoken';


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

export const sigin = async (req,res,next) => {
  const { email , password } = req.body;
  try{
    const validUser = await User.findOne({ email}) ;
    if(!validUser) return  next(errorHandler(404 , 'USer not found!'));
    const validPassword = bcryptjs.compareSync(password , validUser.password);
    if(!validPassword) return next(errorHandler(401,'Wrong credentials'));
    const token = jwt.sign({id : validUser._id} , process.env.JWT_SECRET );
    const { password : pass , ...rest} = validUser._doc; 
    res
        .cookie('access_token' , token , {htttpOnly :true})
        .status(200)
        .json(rest);
  } catch(error){
    next(error);
  }
}