const router = require('express').Router()
const auth = require('../../middleware/auth').auth
const authrole = require('../../middleware/auth').authrole
const offeredCourse = require('../../models/Enrollment/offeredCourse')
const courseData =require('../../models/courseData')
const Session = require('../../models/Enrollment/session')





//Creates a new offeredCourse. The offered course must have a valid session and should already exsist in the courseData table

router.post('/',auth,authrole('admin'), async(req,res)=>{
    
    
    const newCourse = new offeredCourse()

    newCourse["createdBy"] = req.user._id
    newCourse["name"] = req.body.name
    newCourse["Session"] = req.body.session
    
    //Validating the course name
    try{

        const courseVerify = await courseData.findOne({"name": newCourse.name})
       
        if(!courseVerify){
            throw new Error("Course not found")
        }
     
        
        const sessionVerify = await Session.findOne({"name": newCourse.Session})

        sessionVerify["coursesOffered"].push(newCourse._id)

        try{
            await sessionVerify.save()
        }catch(e){
            res.status(404).send("Failed to update courses offered list")
        }
        


        if(!sessionVerify){
            throw new Error("Session not found")
        }

        const course = await newCourse.save()
        if(!course){
            throw new Error("Couldn't save course")
        }

        res.send(course)



    }catch(e){
        res.status(404).send(e)
    }

})



//Deleting an offeredCourse. Should also be removed from the sessions list of courses.

router.delete('/',auth, authrole('admin'), async(req,res)=>{
    try{
        console.log("hello")
        const deleteCourse = await offeredCourse.findOne({"name": req.body.name, "Session": req.body.session})

        if(!deleteCourse){
            throw new Error("Course not found")
        }   
        console.log(deleteCourse)

        //Delete the references from the session list of courses.
        const courseSession = await Session.findOne({"name": deleteCourse.Session})

        console.log(deleteCourse._id)
        console.log(courseSession.coursesOffered)

        //FIND THE COURSE AND DELETE IT FROM COURSES OFFERED LIST
        let newCourseArr = courseSession.coursesOffered.filter((value)=>!deleteCourse._id.equals(value))

        courseSession.coursesOffered = newCourseArr


        await courseSession.save()

        await deleteCourse.delete()

        console.log("Deleted")
        res.send("DELETED")
    }catch(e){
        res.status(404).send(e)
    }
})









module.exports = router
