const Session = require('../../models/Enrollment/session')
const router = require('express').Router()
const auth = require('../../middleware/auth').auth
const authrole = require('../../middleware/auth').authrole
const courseData = require('../../models/courseData')

//Allows the admin to instantiate a new Enrollment session

router.post('/',auth,authrole('admin'), async (req,res)=>{

    req.body["createdBy"] = req.user._id
    newSession = new Session(req.body)
    


    try{
        await newSession.save()
        res.send(newSession)
    }catch(e){
        console.log(e)
        res.status(400).send()
    }
})





module.exports = router