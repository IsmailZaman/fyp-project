const router = require('express').Router()
const User = require('../../models/user')
const studentData = require('../../models/student/studentData')
const Request = require('../../models/Enrollment/Request')
const auth = require('../../middleware/auth').auth
const authrole = require('../../middleware/auth').authrole

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
    request["student"] = req.user._id
    request["courses"] = req.body.courses
    try{
        const data = await studentData.findById(req.user.studentData)
        if(!data){
            throw new Error('Student data not found')
        }
        request["batch"]=data.batch
        await request.save()
        res.send(request)

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

//add courses to request. 

//remove courses from a request






module.exports = router


