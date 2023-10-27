import express from 'express';
import mongoose  from 'mongoose';
import dotenv from 'dotenv';
import userRouter from './routes/user.route.js'
import authRouter from './routes/auth.route.js'
import cookieParser from 'cookie-parser';
dotenv.config();



mongoose
.connect(process.env.MONGO)
.then(()=>{  
    console.log('connected to MongoDB!!!');
})
.catch((err)=>{
    console.log(err);
});

const app = express();

app.use(express.json()); //this will allow JSON s the input of the server ...
app.use(cookieParser());

app.listen(3000 , ()=>{
    console.log('listening on port no 3000 ');
});

app.use('/api/user',userRouter);
app.use('/api/auth',authRouter);


//This is error handling
app.use((err , req , res , next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    return res.status(statusCode).json({
        success: false,
        statusCode,
        message,
    });

});