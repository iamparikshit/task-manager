const jwt = require('jsonwebtoken')
const user = require('../models/user')

const auth = async (req, res, next)=>{
    try{
        console.log('req'+req)
        debugger
        const token = req.header('Authorization').replace('Bearer ', '')
        console.log('token', token)
        const decode = jwt.verify(token, process.env.JWT_SECRET)
        console.log(decode)
        const nUser = await user.findOne({_id:decode._id, 'tokens.token':token })

        if(!nUser){
            throw new Error()
        }
        req.token = token
        req.user = nUser
        next()
    }
    catch(e){
        res.status(400).send(e)
    }
}

module.exports = auth