const router = require('express').Router()
const User = require('../../models/user')
const studentData = require('../../models/student/studentData')
const requests = require('../../models/Enrollment/requests')
const auth = require('../../middleware/auth').auth
const authrole = require('../../middleware/auth').authrole

//enrollment request by a student
router.post('/create', auth,async(req,res)=>{

    const request =new requests(req.body.requests)
    request["batch"]=req.user.batch
    request["student"] = req.user._id

    try{
        await request.save()
        res.send(request)

    }catch(e){
        res.status(400).send(e)
    }

})





module.exports = router


