const express = require('express')
require('./db/mongoose')

const userRouter = require('./routers/user')
const taskRouter = require('./routers/task')
const app = express();
const port = process.env.PORT;

// app.use((req, res, next)=>{
//     if(req.method === "GET")
//     {
//         res.send('Get Requests are disable')
//     }
//     else{
//         next()
//     }
    
// })

// app.use((req, res, next)=>{
//     res.status(503).send('server is in under maintaince')

// })

app.use(express.json())
app.use(userRouter)
app.use(taskRouter)
const jwt = require('jsonwebtoken')
const myfunction = () =>{
    const token = jwt.sign({_id :'iamparikshit' }, 'thisissomematchingline',{expiresIn: '3 seconds'})
    console.log('toke'+token)

    const dt =jwt.verify(token, 'thisissomematchingline' )
    console.log(dt)
}

myfunction()

app.listen(port, ()=>{
    console.log('server is up'+ port)
})

