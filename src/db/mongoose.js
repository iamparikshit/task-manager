const mongoose = require('mongoose')
const validate = require('validator')

mongoose.connect(process.env.MONGODB_URL,{
    useNewUrlParser : true,
    useCreateIndex : true
})
