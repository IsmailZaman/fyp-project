const Session = require('../../models/Enrollment/session')
const router = require('express').Router()
const auth = require('../../middleware/auth').auth
const authrole = require('../../middleware/auth').authrole
const courseData = require('../../models/administration/courseData')
const studentSemester = require('../../models/student/studentSemester')

//Allows the admin to instantiate a new Enrollment session

router.post('/',auth,authrole('admin'), async (req,res)=>{

    req.body["createdBy"] = req.user._id
    req.body["enrollmentPeriod"] = new Date(req.body["enrollmentPeriod"])
    req.body["status"] = true
    const newSession = new Session(req.body)

    try{
        //first check if there is an active session. If there is, then throw an error. Otherwise allow user to create a new session
        const sessionCheck = await Session.findOne({"status": true})
        if(sessionCheck){
            throw new Error("A session is already in progress")
        }



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

        res.status(404).send()


    }
})


//This request will finish a particular session. We will also update all the semesters that correspond to this session.

router.patch('/finish/:name',auth,authrole('admin'), async(req,res)=>{
    try{   
        const sessionName = req.params.name
        const session = await Session.findOne({"name": sessionName, "status": true})
        if(!session){
            throw new Error("Session not found")
        }
        //Update all the semester's status to finish/inactive.
        const semesterUpdate = await studentSemester.updateMany({"Session": session.name}, {"$set":{"active": false}});
        console.log("sem update ",semesterUpdate)

        //Update the session status
        session.status = false;
        await session.save()

        console.log("Here")
        res.send("Successfully finishes the session")
    }catch(e){
        res.status(404).send()
    }


})





module.exports = router