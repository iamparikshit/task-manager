const mongoose = require('mongoose')

const taskSchema = new mongoose.Schema({
    description : {
        type: String,
        trim : true,
        required : true,
        validate(value){
            if(value.length < 6){
                throw new Error('Description should be greater than 6 letters')
            }
        }
        
    },
    completed : {
        type : Boolean,
        required : true,
        
    },
    owner:{
        type : mongoose.Schema.Types.ObjectId,
        required : true,
        ref : 'Users'
    }
},{
    timestamps : true
})

const task = mongoose.model('Tasks', taskSchema)

module.exports = task;