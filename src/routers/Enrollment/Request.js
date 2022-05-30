const router = require('express').Router()
const User = require('../../models/user')
const studentData = require('../../models/student/studentData')
const Request = require('../../models/Enrollment/Request')
const auth = require('../../middleware/auth').auth
const authrole = require('../../middleware/auth').authrole
const Session = require('../../models/Enrollment/session')
const mongoose = require('mongoose')

//get all requests for a batch

router.get('/:batch',auth,authrole(['admin','advisor']),async(req,res)=>{

    try{    
        const batchRequests = await Request.find({batch: req.params.batch})
        if(!batchRequests){
            throw new Error('No batch requests found.')
        }
        res.send(batchRequests)

    }catch{
        res.status(404).send()
    }
})

//get all the pending requests for a batch
router.get('/pending/:batch', auth, authrole(['admin','advisor']), async(req,res)=>{
    try{    
        const batchRequests = await Request.find({batch: req.params.batch})
        if(!batchRequests){
            throw new Error('No batch requests found.')
        }
        const pending = batchRequests.filter((request)=>{
            return request.closed === false
        })
        res.send(pending)

    }catch{
        res.status(404).send()
    }

})



//enrollment request by a student
router.post('/create', auth,async(req,res)=>{
    
    const request =new Request()
    try{
        const session = await Session.findOne({status: true})
        if(!session){
            throw new Error("Session not found")
        }
        const student = await User.findById(req.user._id).populate('studentData')
        if(!student){
            throw new Error('student not found')
        }


        const existingRequest = await Request.findOne({session: session.name,student:req.user._id})
        if(!existingRequest){
            
            request['student'] = req.user._id
            request['session'] = session.name
            request['courses'] = req?.body?.courses
            request['batch'] = student?.studentData?.batch
        }
        if(existingRequest){
            
            const coursesToAdd = []
            let add = true
            req?.body?.courses.forEach((course)=>{
                add = true
                for(let i =0; i< existingRequest?.courses?.length; i++){
                    if(existingRequest?.courses[i]?.course.toString() === course.course){
                        add = false
                    }
                }
                if(add){
                    coursesToAdd.push(course)
                }
            })           
            existingRequest.courses = [...existingRequest.courses,...coursesToAdd]                                                                                                                                                                                                                                                                                                            
        }                                                                                                               
        
        if(!existingRequest){
            await request.save()
            return res.send(request)
        }
        if(existingRequest){
            await existingRequest.save()
            return res.send(existingRequest)
        }


    }catch(e){
        console.log(e)
        res.status(400).send()
    }

})





//approve request enrollments
router.patch('/approve/:id', auth,authrole('advisor'), async(req,res)=>{
    let modified = true
    let idx = 0
    try{
        const request = await Request.findById(req.params.id)
        if(!request){
            throw new Error('request not found')
        }

    }catch(e){
        res.status(400).send()
    }
})



//remove courses from a request






module.exports = router


