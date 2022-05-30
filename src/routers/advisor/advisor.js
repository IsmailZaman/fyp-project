const router = require('express').Router()
const User = require('../../models/user')
const advisorData = require('../../models/advisor/advisor')
const studentData = require('../../models/student/studentData')
const Session = require('../../models/Enrollment/session')
const auth = require('../../middleware/auth').auth
const authrole = require('../../middleware/auth').authrole

//Get all advisors
router.get('/',auth,authrole('admin') ,async(req,res)=>{
    try{

        const users = await User.find({roles: 'advisor'}).populate("advisorData")
        
        if(!users){
            throw new error('users not found')
        }
        

        res.send(users)
    }catch(e){
        res.sendStatus(404)
    }
})

//get advisor by id
router.get('/:id', auth,authrole('admin'),async(req,res)=>{
    const _id = req.params.id 
    console.log( _id)
    
    try{
        const user = await User.findById(_id).populate('advisorData')
        if(!user){
          return res.status(404).send()
       }

       res.send(user)
    }
    catch(e)
    {
        console.log(req.params)
    }
   
})


//assign batch to advisor
router.patch('/assign/:id',auth,authrole('admin'),async(req,res)=>{
    const advisorID = req.params.id
    const batch = req.body.batch
    
    try{
        const advisor = await User.findById(advisorID)
        if(!advisor){
            throw new Error('Advisor not found')
        }
        
        const advisorInfo = await advisorData.findById(advisor?.advisorData)
        if(!advisorInfo){
            throw new Error('Advisor data not found')
        }

        const currentSession = await Session.findOne({status: true})
        if(!currentSession){
            throw new Error('Session not found')
        }

        const batchInfo = {
            batch, 
            session: currentSession.name
        }
        console.log(batchInfo)
        //Finally, assign the batch to advisor
        advisorInfo['batches'].push(batchInfo)
        console.log(advisorInfo)

        await advisorInfo.save()

        res.send({advisor,advisorInfo})


    }catch(e){
        res.status(400).send()
    }





})

module.exports = router

