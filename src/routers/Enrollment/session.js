const Session = require('../../models/Enrollment/session')
const router = require('express').Router()
const auth = require('../../middleware/auth').auth
const authrole = require('../../middleware/auth').authrole
const courseData = require('../../models/administration/courseData')
const studentSemester = require('../../models/student/studentSemester')

//Allows the admin to instantiate a new Enrollment session

router.post('/',auth,authrole('admin'), async (req,res)=>{

    req.body["createdBy"] = req.user._id
    console.log(req.body["enrollmentPeriod"])
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
        res.status(400).send('Unable to add Session')
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

//This request will return all the sessions:
router.get('/all', auth,authrole('admin'), async(req,res)=>{

    try{    
        const sessions = await Session.find({})
        if(!sessions){
            throw new Error("Session not found")
        }
        res.send(sessions)
    }catch(e){

        res.status(404).send("Session not found")
    }
})

//This request will return an active session if it exists
router.get('/active',auth, async(req,res)=>{
    try{
        const session = await Session.findOne({"status":true})
        
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
        res.status(400).send('Unable to finish the session')
    }


})


//This request allows updating the deadline
router.patch('/update', auth, authrole('admin'), async(req,res)=>{
    try{
        const session = await Session.findOne({"status":true})
        
        if(!session){
            throw new Error("Session not found")
        }
        const newDeadline = new Date(req?.body?.enrollmentPeriod)
        newDeadline.setHours(newDeadline.getHours() + 5)
        console.log(req?.body?.enrollmentPeriod)
        session["enrollmentPeriod"] = newDeadline
        console.log(session)
        await session.save()

        console.log('Updated enrollment period')

        res.send('Deadline Updated')

    }catch(e){
        res.status(400).send(e.message)

    }






})




module.exports = router
