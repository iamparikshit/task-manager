const mongoose = require('mongoose')
const validate = require('validator')
const bcryptjs = require('bcryptjs')
const jwt = require('jsonwebtoken')
const task = require('./tasks')

const userSchema = new mongoose.Schema({
    name :{
        type : String,
        required : true,
        trim : true,

    },
    email : {
        type : String,
        unique : true,
        trim : true,
        validate(value){
            if(!validate.isEmail(value)){
                throw new Error
            }
        }
    },
    age :{
        type : Number,
        validate(value){
            if(value < 0){
                throw new Error('age should not be less than zero')
            }
        }
    },
    password : {
        type : String,
        trim : true,
        required : true,
        validate(value){
            if(value.includes('password')){
                throw new Error('Password should not be password')
            }
            if(value.length<6)
            {
                throw new Error('Password legth should be greater than 6')
            }
        }
    },
    tokens : [{
        token : {
            type : String,
            required :true
        }
    }],
    avatar:{
        type : Buffer
    }
},{
    timestamps:true
})

userSchema.virtual('tasks',{
    ref : "Tasks",
    localField : '_id',
    foreignField : 'owner' 
})

userSchema.methods.toJSON = function(){
    const nUser = this

    const publicUser = nUser.toObject()
    delete publicUser.tokens
    delete publicUser.password
    delete publicUser.avatar
    return publicUser
}

userSchema.methods.getAuthToken = async function(){
    const Nuser = this
    const token = jwt.sign({_id : Nuser._id.toString()}, process.env.JWT_SECRET)
    Nuser.tokens = Nuser.tokens.concat({token})
    await Nuser.save()

    return token
}

userSchema.statics.findByCredential = async (email, password) =>{
    const Nuser = await user.findOne({email})
    if(!Nuser){
        throw new Error('Unable to login')
    }
    const isMatched = await bcryptjs.compare(password, Nuser.password)
    if(!isMatched){
        throw new Error('Unable to login')
    }
    return Nuser;
}
//this will hash the passwod before saving the user
userSchema.pre('save', async function(next){
    const user = this
    if(user.isModified('password')){
            user.password = await bcryptjs.hash(user.password, 8)
    }
    console.log('call has came')
    next()
})
//delete task user is removed
userSchema.pre('remove', async function(next){
    const nUser = this

    await task.deleteMany({owner : nUser._id})
    next()
})

const user = mongoose.model('Users', userSchema)

module.exports = user;