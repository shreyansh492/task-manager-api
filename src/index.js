const express= require('express')

const path = require("path");
const User= require('./models/user')
const Task = require('./models/task')
const userRouter = require('./router/user')
const taskRouter = require('./router/task')
const dotenv = require('dotenv');
dotenv.config();
require('./db/mongoose')

const app= express()

// require("dotenv").config({ path: path.join(__dirname, "../config/dev.env") });

const port= process.env.PORT 


app.use(express.json())
app.use(userRouter)
app.use(taskRouter)

app.listen(port,()=>{
    console.log('Server is up on port: '+ port);
})
