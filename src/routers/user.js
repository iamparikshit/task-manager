const express = require('express')
const multer = require('multer')
const sharp = require('sharp')
const router = new express.Router()
const auth = require('../middleaware/auth')
const user = require('../models/user')
const {sendWelcomeEmail, sendQuitMail} = require('../emails/account')


const avatar = multer({
    limits:{
        fileSize : 1000000 //1mb
    },
    fileFilter(req, file, cb)
    {
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
            return cb(new Error('please provide the given file format'))
        }
        cb(undefined, true)
    }

})

router.post('/users', async(req, res)=>{
    try
    {
        const nUser = new user(req.body);
        await nUser.save()
        sendWelcomeEmail(nUser.email, nUser.name)
        const token =await nUser.getAuthToken()
        console.log(token)
        res.status(201).send({nUser, token})
    }
    catch(e){
        res.status(500).send(e)
    }
    //below one is using chaining promises & upper one is using async and await

    // const nUser = new user(req.body);

    // nUser.save().then(()=>{
    //     res.send(nUser)
    // }).catch((error)=>{
    //     res.status(400);
    //     res.send(error) 

    // })
})

router.post('/users/login', async(req, res)=>{
    try{
        const Nuser = await user.findByCredential(req.body.email, req.body.password)
        const token = await Nuser.getAuthToken()
        console.log(token)
        res.status(200).send({Nuser, token})
    }catch(e){
        res.status(400).send(e)
    }
})
router.get('/users/me', auth,async(req, res)=>{

    // try{
    //    const users=  await user.find({})
    //    res.status(200).send(users)
    // }catch(e){
    //     res.status(500).send(e)
    // }
    //as in middlwware we have check using jwt if user is valid,so we have also updated req.boyd
    //thats why we are sending back user body.
    res.send(req.user)
})
router.post('/users/logout', auth, async(req, res)=>{
    try {
            req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        })
        await req.user.save()
        res.send()
    } catch (error) {
        res.status(500).send(error)
    }
})
router.post('/users/logoutall', auth, async(req, res)=>{
    try{
        req.user.tokens = []
        await req.user.save()

        res.send()
    }
    catch(e){
        res.send(e)
    }
})
// router.get('/users/:id', async(req, res)=>{
//     try{
//         const id = req.params.id
//         const nUser = await user.findById(id)
//         if(!nUser){
//            return res.status(404).send()
//         }
//         res.status(200).send(nUser)
//     }catch(error){
//         res.status(500).send(error)
//     }
   
// })
router.patch('/users/me', auth,  async(req, res)=>{
    const updates = Object.keys(req.body)
    const allowedUpdate = ['name', 'email', 'age', 'password']
    const isalloweToUpdate = updates.every((x)=> allowedUpdate.includes(x))
    if(!isalloweToUpdate)
    {
        return res.status(500).send('not allowd to update')
    }

    try{
        const Nuser = req.user
        //const Nuser = await user.findById(req.params.id)
        //above will return the obj if it gets found
        updates.forEach((update)=>{
                console.log('update'+update)
                console.log('req body update'+req.body[update])
                Nuser[update] = req.body[update]
        })
        //updates for each will go for each property that we are going to update.
        //and will set those new values to user.

        await Nuser.save()

        //const rsltUser = await user.findByIdAndUpdate(req.params.id, req.body, {new : true, runValidators: true})

        if(!Nuser)
        {
            return res.status(404).send()
        }
        res.status(200).send(Nuser)
    }
    catch(error){
        res.status(500).send(error)
    }
})
router.delete('/users/me', auth,  async(req, res)=>{

    try{
        await req.user.remove()
        sendQuitMail(req.user.email, req.user.name)
        res.status(200).send(req.user)
        // const nUser = await user.findByIdAndDelete(req.params.id)
        // if(!nUser){
        //     return res.status(404).send()
        // }

        // res.status(200).send(nUser)
    }
    catch(error){
        res.status(400).send(error)
    }
})

router.post('/users/me/avatar', auth, avatar.single('upload') , async(req,res)=>{
    const buffer = await sharp(req.file.buffer).resize({width : 250, height:250}).png().toBuffer()
    req.user.avatar = buffer
    await req.user.save()
    res.send()
},(error, req, res, next)=>{
    res.status(400).send({error : error.message})
})

router.delete('/users/me/avatar', auth, async(req,res)=>{
    req.user.avatar = undefined
    await req.user.save()
    res.send()
},(error, req, res, next)=>{
    res.status(400).send({error : error.message})
})

router.get('/users/:id/avatar', async(req, res)=>{
    try{
        const Nuser = await user.findById(req.params.id)
        console.log(Nuser)
        if(!Nuser || !Nuser.avatar){
            throw new Error('avatar not found')
        }

        res.set('Content-Type','image/png')
        res.send(Nuser.avatar)
    }
    catch(error){
        res.status(400).send(error)
    }
})

module.exports = router;