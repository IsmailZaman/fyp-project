const router = require('express').Router()
const User = require('../../models/user')
const advisorData = require('../../models/advisor/advisor')
const Session = require('../../models/Enrollment/session')
const Batch = require('../../models/administration/batch')
const Request = require('../../models/Enrollment/Request')
const auth = require('../../middleware/auth').auth
const authrole = require('../../middleware/auth').authrole


//fetches advisor's complete data
router.get('/data', auth, authrole('advisor'), async(req,res)=>{
    try{
        const data = await advisorData.findOne({_id: req.user.advisorData}).populate([{
            path: 'batches',
            populate: [
                {path: 'batch'},
                {path: 'Session'}
            ]
        },])
        if(!data) throw new Error('Advisor data not found')


        const currentSession = await Session.findOne({status: true})
        if(!currentSession) throw new Error('Active session not found')

        res.send(data ? data : 'hi')


    }catch(e){
        res.status(404).send(e.message ? e.message : 'unable to fetch advisor data')
    }
})

//fetches advisor's current session data
router.get('/sessiondata', auth, authrole('advisor'), async(req,res)=>{
    try{
        const currentSession = await Session.findOne({"status": true})
        if(!currentSession) throw new Error('Active session not found.')

        let data = await advisorData.findOne({_id: req.user.advisorData}).populate({
            path: 'sessionList',
            populate: [
                {path: 'batch'}
            ]
        })
        if(!data) throw new Error('data not found')

        data = data?.sessionList?.filter((record)=> record?.Session?._id.toString() === currentSession._id.toString())
        
        if(data.length > 0){
            res.send(data[0])
        }
        else{
            throw new Error('Session data not found')
        }
        

    }catch(e){
        res.status(404).send(e.message ? e.message : 'unable to fetch advisors data currently')
    }

})


//fetches list of students who have placed in requests
router.get('/student/requests', auth, authrole(['advisor']), async(req,res)=>{
    try{
        const activeSession = await Session.findOne({status: 'true'})
        if(!activeSession) throw new Error('No active session found.')


        let batchesAdvising = await advisorData.findOne({_id: req.user?.advisorData}).populate({
            path:'sessionList',
            populate: [
                {path: 'batch'}
            ]
        })
        if(!batchesAdvising) throw new Error('No batches found.')

        batchesAdvising = batchesAdvising?.sessionList?.filter((sessionData)=> sessionData.Session?.toString() === activeSession._id?.toString())
        if(batchesAdvising.size <= 0 ) throw new Error('No batches found.')

        const searchArray = batchesAdvising[0]?.batch?.map((batchData)=>batchData.name)
        console.log(searchArray)
        let students = await Request.find({batch: {$in: searchArray}, session: activeSession?.name}).populate({
            path: 'student',
            populate: {
                path: 'studentData'
            }
        })
        if(students.length < 0)throw new Error('students not found.')

        students = students.map((record)=>{
            return {
                email: record?.student?.email,
                rollNumber: record?.student?.studentData?.rollNumber,
                batch: record?.student?.studentData?.batch,
                department: record?.student?.studentData?.department,
                id: record?._id
            }
        })
        

        



        res.send(students)

    }catch(e){
        console.log(e)
        res.status(404).send(e.message)
    }







})

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

        const batch = await Batch.findOne({name: req?.body?.batch})
        if(!batch){
            throw new Error('Batch not found')
        }
        
        if(!advisorInfo.sessionList) advisorInfo['sessionList'] = []

        let createNewSession = true

        advisorInfo?.sessionList?.forEach((session)=> {
            if(session?.Session?.toString() === currentSession._id.toString()){
                session['batch'].forEach((batchId)=>{
                    if(batchId.toString() === batch._id.toString()){
                        throw new Error('Advisor has already been assigned to this batch')
                    }
                })
                session['batch'].push(batch._id)
                createNewSession = false
            }
        })

        if(createNewSession){
            console.log('created new Session')
            advisorInfo['sessionList'].push({
                batch: [batch._id],
                Session: currentSession._id
            })
        }

        await advisorInfo.save()
       
        
        

        res.send(`Assigned advisor ${advisor?.name} to ${batch.name}`)


    }catch(e){
        res.status(400).send(e.message)
    }





})





module.exports = router

