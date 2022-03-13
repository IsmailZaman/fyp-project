const Session = require('../../models/Enrollment/session')
const router = require('express').Router()
const auth = require('../../middleware/auth').auth
const authrole = require('../../middleware/auth').authrole
const courseData = require('../../models/courseData')

//Allows the admin to instantiate a new Enrollment session

router.post('/',auth,authrole('admin'), async (req,res)=>{

    req.body["createdBy"] = req.user._id
    req.body["enrollmentPeriod"] = new Date(req.body["enrollmentPeriod"])
    req.body["status"] = true
    newSession = new Session(req.body)

    try{
        await newSession.save()
        res.send(newSession)
    }catch(e){
        console.log(e)
        res.status(400).send()
    }
})


router.get('/', auth,authrole('admin'), async(req,res)=>{


    try{    
        const session = await Session.findOne({"name": req.body.name})
        if(!session){
            throw new Error("Session not found")
        }
        res.send(session)

    }catch(e){

        res.status(404).send(e)


    }

})





module.exports = router