const express = require('express')
const router = new express.Router()
const task = require('../models/tasks')
const auth = require('../middleaware/auth')

router.post('/tasks', auth, async(req, res)=>{
    try{
        //const nTask = new task(req.body)
        const nTask = new task ({...req.body, owner : req.user._id  })
        await nTask.save()

        res.status(201).send(nTask)
    }catch(error){
        res.status(500).send(error)
    }
    
})
//route /tasks?completed=true
// route /task?limit
router.get('/tasks', auth, async(req, res)=>{
    const match ={}
    const sort = {}
    if(req.query.completed){
        match.completed = req.query.completed === 'true'
    }

    if(req.query.sortBy){
        const parts = req.query.sortBy.split(':')
        sort[parts[0]] = parts[1] === 'desc' ? 1 : -1
    }

    try{
        //const tasks = await task.find({owner : req.user._id})
        await req.user.populate({
            path : 'tasks',
            match,
            options:{
                limit : parseInt(req.query.limit),
                skip : parseInt(req.query.skip),
                sort
            },
            
        }).execPopulate()
        console.log()
        res.send(req.user.tasks)
    }catch(error)
    {
        res.status(500).send(error)
    }
})
router.get('/tasks/:id', auth, async(req, res)=>{
    try{
        const _id = req.params.id
        const tasks = await task.findOne({_id, owner : req.user._id})
        if(!tasks)
        {
            return res.status(404).send()
        }
        res.send(tasks)
    }catch(error)
    {
        res.status(500).send(error)
    }
    
})
router.patch('/tasks/:id', auth, async(req, res)=>{
    const updates = Object.keys(req.body)
    const allowedUpdates = ['description', 'completed']
    const isAllowed = updates.every((x)=> allowedUpdates.includes(x))
    if(!isAllowed)
    {
        return res.status(400).send('not allowed to update')
    }

    try{
        const nTask = await task.findOne({_id : req.params.id, owner: req.user._id})
        //const nTask = await task.findById(req.params.id)
        updates.forEach((update)=>{
            nTask[update] = req.body[update]
        })
        await nTask.save()
        //const nTask = await task.findByIdAndUpdate(req.params.id, req.body, {new : true, runValidators: true})
        if(!nTask){
            res.status(404).send()
        }
        res.status(200).send(nTask)
    }catch(error){
        res.status(500).send()
    }
})
router.delete('/tasks/:id', auth,  async(req, res)=>{

    try{
        const ntask = await task.findOne({_id : req.params.id, owner : req.user._id})

        //const nUser = await task.findByIdAndDelete(req.params.id)
        if(!ntask){
            return res.status(404).send()
        }
        await ntask.remove()
        res.status(200).send(ntask)
    }
    catch(error){
        res.status(400).send(error)
    }
})

module.exports = router