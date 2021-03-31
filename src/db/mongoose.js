const mongoose = require('mongoose')
const path = require("path");


require("dotenv").config({
    path: path.resolve(__dirname, "../../config/dev.env"),
  });
mongoose.connect(process.env.mongodb_url, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
})

